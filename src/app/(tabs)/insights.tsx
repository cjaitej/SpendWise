import { useTransaction } from "@/context/FinanceContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";

const FILTERS = ["This Month", "Last Month", "Last 6 Months"] as const;
type FilterType = (typeof FILTERS)[number];

const CATEGORIES = [
  "Food",
  "Shopping",
  "Travel",
  "Education",
  "Finance",
  "Others",
];

const CATEGORY_HEX: Record<string, string> = {
  food: "#FF9F43",
  shopping: "#00CFE8",
  travel: "#28C76F",
  education: "#EA5455",
  finance: "#7367F0",
  others: "#F59E0B",
};

// ─── Insight Types ────────────────────────────────────────────────────────────
type TrendDirection = "up" | "down" | "neutral";

interface Insight {
  id: string;
  icon: string;
  accentColor: string;
  title: string;
  subtitle: string;
  trendDirection?: TrendDirection;
  trendLabel?: string;
  barPercent?: number;
  barColor?: string;
}

function TrendBadge({
  direction,
  label,
}: {
  direction: TrendDirection;
  label: string;
}) {
  const isPositive = direction === "down";
  const isNeutral = direction === "neutral";
  const bg = isNeutral ? "#F1F5F9" : isPositive ? "#D1FAE5" : "#FFE4E6";
  const fg = isNeutral ? "#64748B" : isPositive ? "#059669" : "#E11D48";
  const arrow = isNeutral ? "→" : isPositive ? "↓" : "↑";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: bg,
        borderRadius: 99,
        paddingHorizontal: 7,
        paddingVertical: 3,
        alignSelf: "flex-start",
        marginTop: 6,
        gap: 2,
      }}
    >
      <Text style={{ color: fg, fontSize: 11, fontWeight: "800" }}>
        {arrow} {label}
      </Text>
    </View>
  );
}

function MiniBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <View
      style={{
        height: 4,
        backgroundColor: "#F1F5F9",
        borderRadius: 99,
        marginTop: 8,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 99,
        }}
      />
    </View>
  );
}

export default function Insights() {
  const { transactions } = useTransaction();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(FILTERS[0]);

  const dates = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const lastMonthDays = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    ).getDate();
    const compareDay = Math.min(currentDay, lastMonthDays);

    return {
      now,
      currentMonthStart: new Date(now.getFullYear(), now.getMonth(), 1),
      lastMonthStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      lastMonthFullEnd: new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      ),
      lastMonthMTDEnd: new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        compareDay,
        23,
        59,
        59,
        999,
      ),
      twoMonthsAgoStart: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      twoMonthsAgoEnd: new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        0,
        23,
        59,
        59,
        999,
      ),
      last6MonthsStart: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      previous6MonthsStart: new Date(now.getFullYear(), now.getMonth() - 11, 1),
      previous6MonthsEnd: new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        0,
        23,
        59,
        59,
        999,
      ),
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      if (selectedFilter === "This Month")
        return date >= dates.currentMonthStart && date <= dates.now;
      if (selectedFilter === "Last Month")
        return date >= dates.lastMonthStart && date <= dates.lastMonthFullEnd;
      if (selectedFilter === "Last 6 Months")
        return date >= dates.last6MonthsStart && date <= dates.now;
      return false;
    });
  }, [transactions, selectedFilter, dates]);

  const debitTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.transaction_type === "debit"),
    [filteredTransactions],
  );

  const creditTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.transaction_type === "credit"),
    [filteredTransactions],
  );

  const totalSpent = useMemo(
    () => debitTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [debitTransactions],
  );

  const totalEarned = useMemo(
    () => creditTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [creditTransactions],
  );

  const netBalance = totalEarned - totalSpent;
  const totalTxns = filteredTransactions.length;
  const flowTotal = totalEarned + totalSpent;
  const earnedPercent = flowTotal > 0 ? (totalEarned / flowTotal) * 100 : 50;
  const spentPercent = flowTotal > 0 ? (totalSpent / flowTotal) * 100 : 50;

  const categoryData = useMemo(() => {
    const totalsMap = debitTransactions.reduce<Record<string, number>>(
      (acc, t) => {
        const txCategory = (t.category || "others").toLowerCase();
        acc[
          CATEGORIES.map((c) => c.toLowerCase()).includes(txCategory)
            ? txCategory
            : "others"
        ] += Number(t.amount || 0);
        return acc;
      },
      Object.fromEntries(CATEGORIES.map((c) => [c.toLowerCase(), 0])),
    );

    let runningOffset = 0;

    return CATEGORIES.map((category) => {
      const amount = totalsMap[category.toLowerCase()] || 0;
      const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
      const rotationAngle = (runningOffset / 100) * 360;
      runningOffset += percentage;

      return {
        category,
        amount,
        percentage: Math.round(percentage),
        rotationAngle,
      };
    })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [debitTransactions, totalSpent]);

  // ─── INSIGHTS ENGINE ──────────────────────────────────────────────────────
  const calculatedInsights = useMemo((): Insight[] => {
    if (!debitTransactions || debitTransactions.length === 0) return [];

    const previousDebits = transactions.filter((t) => {
      if (t.transaction_type !== "debit") return false;
      const d = new Date(t.transaction_date);
      if (selectedFilter === "This Month")
        return d >= dates.lastMonthStart && d <= dates.lastMonthFullEnd;
      if (selectedFilter === "Last Month")
        return d >= dates.twoMonthsAgoStart && d <= dates.twoMonthsAgoEnd;
      if (selectedFilter === "Last 6 Months")
        return d >= dates.previous6MonthsStart && d <= dates.previous6MonthsEnd;
      return false;
    });

    const previousCredits = transactions.filter((t) => {
      if (t.transaction_type !== "credit") return false;
      const d = new Date(t.transaction_date);
      if (selectedFilter === "This Month")
        return d >= dates.lastMonthStart && d <= dates.lastMonthFullEnd;
      if (selectedFilter === "Last Month")
        return d >= dates.twoMonthsAgoStart && d <= dates.twoMonthsAgoEnd;
      if (selectedFilter === "Last 6 Months")
        return d >= dates.previous6MonthsStart && d <= dates.previous6MonthsEnd;
      return false;
    });

    const prevTotalSpent = previousDebits.reduce(
      (s, t) => s + Number(t.amount || 0),
      0,
    );
    const prevTotalEarned = previousCredits.reduce(
      (s, t) => s + Number(t.amount || 0),
      0,
    );

    const vsText =
      selectedFilter === "Last 6 Months"
        ? "vs prev 6 months"
        : selectedFilter === "Last Month"
          ? "vs 2 months ago"
          : "vs last month";

    const periodText =
      selectedFilter === "Last 6 Months"
        ? "this 6-month period"
        : selectedFilter === "Last Month"
          ? "last month"
          : "this month";

    const pctChange = (curr: number, prev: number) =>
      prev > 0 ? Math.round(((curr - prev) / prev) * 10000) / 100 : null;

    const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

    const insights: Insight[] = [];

    // ── 1. Top Category Trend ─────────────────────────────────────────────
    const currentCatMap = debitTransactions.reduce<Record<string, number>>(
      (acc, t) => {
        const cat = t.category || "Others";
        acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
        return acc;
      },
      {},
    );

    const topCat = Object.keys(currentCatMap).sort(
      (a, b) => currentCatMap[b] - currentCatMap[a],
    )[0];

    if (topCat) {
      const curr = currentCatMap[topCat];
      const prev = previousDebits
        .filter((t) => (t.category || "Others") === topCat)
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      const pct = pctChange(curr, prev);

      let iconName: any = "grid-outline";
      if (topCat.toLowerCase() === "food") iconName = "fast-food-outline";
      if (topCat.toLowerCase() === "travel") iconName = "airplane-outline";
      if (topCat.toLowerCase() === "shopping") iconName = "cart-outline";
      if (topCat.toLowerCase() === "education") iconName = "book-outline";
      if (topCat.toLowerCase() === "finance") iconName = "trending-up-outline";
      if (topCat.toLowerCase() === "others") iconName = "apps-outline";

      const catHex = CATEGORY_HEX[topCat.toLowerCase()] || "#94A3B8";

      insights.push({
        id: "cat_trend",
        icon: iconName,
        accentColor: catHex,
        title: `${topCat} is your biggest expense`,
        subtitle:
          pct !== null
            ? `You spent ${fmt(curr)} on ${topCat} — ${pct > 0 ? "up" : "down"} ${Math.abs(pct).toFixed(0)}% ${vsText}`
            : `You spent ${fmt(curr)} on ${topCat} ${periodText}`,
        trendDirection: pct === null ? "neutral" : pct > 0 ? "up" : "down",
        trendLabel:
          pct !== null
            ? `${pct > 0 ? "+" : "−"}${Math.abs(pct).toFixed(0)}%`
            : fmt(curr),
        barPercent: totalSpent > 0 ? (curr / totalSpent) * 100 : 0,
        barColor: catHex,
      });
    }

    // ── 2. Savings Rate ───────────────────────────────────────────────────
    if (totalEarned > 0) {
      const savingsRate = Math.round(
        ((totalEarned - totalSpent) / totalEarned) * 100,
      );
      const prevSavingsRate =
        prevTotalEarned > 0
          ? Math.round(
              ((prevTotalEarned - prevTotalSpent) / prevTotalEarned) * 100,
            )
          : null;
      const rateDelta =
        prevSavingsRate !== null ? savingsRate - prevSavingsRate : null;

      const savingsAmt = totalEarned - totalSpent;

      insights.push({
        id: "savings_rate",
        icon: "shield-checkmark-outline",
        accentColor: "#10B981",
        title: `You saved ${Math.max(0, savingsRate)}% of your income`,
        subtitle:
          savingsAmt > 0
            ? `${fmt(savingsAmt)} saved out of ${fmt(totalEarned)} earned${savingsRate >= 20 ? " — great job!" : savingsRate >= 10 ? " — try to reach 20%" : " — aim to save more"}`
            : `You spent more than you earned by ${fmt(Math.abs(savingsAmt))}`,
        trendDirection:
          rateDelta === null ? "neutral" : rateDelta >= 0 ? "down" : "up",
        trendLabel:
          rateDelta === null
            ? `${Math.max(0, savingsRate)}%`
            : rateDelta === 0
              ? "Same as before"
              : rateDelta > 0
                ? `+${rateDelta}pp vs before`
                : `${rateDelta}pp vs before`,
        barPercent: Math.max(0, Math.min(100, savingsRate)),
        barColor:
          savingsRate >= 20
            ? "#10B981"
            : savingsRate >= 10
              ? "#F59E0B"
              : "#F43F5E",
      });
    }

    // ── 3. Avg Transaction Size ───────────────────────────────────────────
    const avgTxn =
      debitTransactions.length > 0 ? totalSpent / debitTransactions.length : 0;
    const prevAvgTxn =
      previousDebits.length > 0
        ? previousDebits.reduce((s, t) => s + Number(t.amount || 0), 0) /
          previousDebits.length
        : 0;
    const avgPct = pctChange(avgTxn, prevAvgTxn);

    if (avgTxn > 0) {
      insights.push({
        id: "avg_txn",
        icon: "receipt-outline",
        accentColor: "#7367F0",
        title: `Avg spend per transaction: ${fmt(Math.round(avgTxn))}`,
        subtitle:
          avgPct !== null
            ? `Based on ${debitTransactions.length} transactions — ${avgPct > 0 ? "higher" : "lower"} than before`
            : `Based on ${debitTransactions.length} transactions ${periodText}`,
        trendDirection:
          avgPct === null ? "neutral" : avgPct > 0 ? "up" : "down",
        trendLabel:
          avgPct !== null
            ? `${avgPct > 0 ? "+" : "−"}${Math.abs(avgPct).toFixed(0)}%`
            : `${debitTransactions.length} txns`,
        barPercent:
          prevAvgTxn > 0
            ? Math.min(100, (avgTxn / (prevAvgTxn * 1.5)) * 100)
            : 50,
        barColor: "#7367F0",
      });
    }

    // ── 4. Highest Single-Day Spend ───────────────────────────────────────
    const daySpendMap = debitTransactions.reduce<Record<string, number>>(
      (acc, t) => {
        const key = t.transaction_date.slice(0, 10);
        acc[key] = (acc[key] || 0) + Number(t.amount || 0);
        return acc;
      },
      {},
    );

    const topDayKey = Object.keys(daySpendMap).sort(
      (a, b) => daySpendMap[b] - daySpendMap[a],
    )[0];
    if (topDayKey) {
      const topDayAmt = daySpendMap[topDayKey];
      const topDayDate = new Date(topDayKey).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      const topDayShare =
        totalSpent > 0 ? Math.round((topDayAmt / totalSpent) * 100) : 0;

      insights.push({
        id: "top_day",
        icon: "flame-outline",
        accentColor: "#F43F5E",
        title: `Your biggest day: ${fmt(Math.round(topDayAmt))}`,
        subtitle: `On ${topDayDate} you spent ${topDayShare}% of your total — the highest single day`,
        barPercent: topDayShare,
        barColor: "#F43F5E",
      });
    }

    // ── 5. Weekend vs Weekday ─────────────────────────────────────────────
    let weekdaySpend = 0,
      weekendSpend = 0;
    debitTransactions.forEach((t) => {
      const day = new Date(t.transaction_date).getDay();
      if (day === 0 || day === 6) weekendSpend += Number(t.amount || 0);
      else weekdaySpend += Number(t.amount || 0);
    });

    if (weekdaySpend > 0 || weekendSpend > 0) {
      const weekendPct = Math.round(
        (weekendSpend / (weekendSpend + weekdaySpend)) * 100,
      );
      const isWeekendHeavy = weekendPct > 50;

      insights.push({
        id: "weekend_vs_weekday",
        icon: isWeekendHeavy ? "partly-sunny-outline" : "briefcase-outline",
        accentColor: "#00CFE8",
        title: isWeekendHeavy
          ? `Most spending happens on weekends`
          : `Most spending happens on weekdays`,
        subtitle: isWeekendHeavy
          ? `${weekendPct}% of your money goes on Sat/Sun vs ${100 - weekendPct}% on Mon–Fri`
          : `${100 - weekendPct}% of your money goes on Mon–Fri vs ${weekendPct}% on weekends`,
        barPercent: weekendPct,
        barColor: "#00CFE8",
      });
    }

    // ── 6. Late-Night Spending ────────────────────────────────────────────
    const isLateNight = (dateStr: string) => {
      const h = new Date(dateStr).getHours();
      return h >= 22 || h <= 4;
    };

    const currentLateNight = debitTransactions
      .filter((t) => isLateNight(t.transaction_date))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const prevLateNight = previousDebits
      .filter((t) => isLateNight(t.transaction_date))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    if (currentLateNight > 0) {
      const lnPct = pctChange(currentLateNight, prevLateNight);
      const lnShare =
        totalSpent > 0 ? Math.round((currentLateNight / totalSpent) * 100) : 0;

      insights.push({
        id: "night_spend",
        icon: "moon-outline",
        accentColor: "#A855F7",
        title: `${lnShare}% of spending happens after 10pm`,
        subtitle: `You spent ${fmt(Math.round(currentLateNight))} in late-night transactions`,
        trendDirection: lnPct === null ? "neutral" : lnPct > 0 ? "up" : "down",
        trendLabel:
          lnPct !== null
            ? `${lnPct > 0 ? "+" : "−"}${Math.abs(lnPct).toFixed(0)}% ${vsText}`
            : vsText,
        barPercent: lnShare,
        barColor: "#A855F7",
      });
    }

    // ── 7. Longest No-Spend Streak ────────────────────────────────────────
    {
      const spendDates = new Set(
        debitTransactions.map((t) => t.transaction_date.slice(0, 10)),
      );

      const rangeStart = new Date(
        selectedFilter === "This Month"
          ? dates.currentMonthStart
          : selectedFilter === "Last Month"
            ? dates.lastMonthStart
            : dates.last6MonthsStart,
      );
      const rangeEnd = new Date(
        selectedFilter === "Last Month" ? dates.lastMonthFullEnd : dates.now,
      );

      let maxStreak = 0;
      let currentStreak = 0;

      const cursor = new Date(rangeStart);
      while (cursor <= rangeEnd) {
        const key = cursor.toISOString().slice(0, 10);
        if (!spendDates.has(key)) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      if (maxStreak >= 2) {
        insights.push({
          id: "no_spend_streak",
          icon: "trophy-outline",
          accentColor: "#F59E0B",
          title: `${maxStreak} days in a row without spending`,
          subtitle:
            maxStreak >= 7
              ? "Incredible self-control — keep it up!"
              : maxStreak >= 4
                ? "Great restraint — try to beat it!"
                : "Good start — can you go longer?",
          barPercent: Math.min(100, (maxStreak / 14) * 100),
          barColor: "#F59E0B",
        });
      }
    }

    // ── 8. Current Spend Streak ───────────────────────────────────────────
    {
      const spendDates = new Set(
        debitTransactions.map((t) => t.transaction_date.slice(0, 10)),
      );

      const streakEnd =
        selectedFilter === "Last Month"
          ? new Date(dates.lastMonthFullEnd)
          : new Date(dates.now);

      let streak = 0;
      const cursor = new Date(streakEnd);
      cursor.setHours(0, 0, 0, 0);

      while (true) {
        const key = cursor.toISOString().slice(0, 10);
        if (spendDates.has(key)) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }

      if (streak >= 3) {
        insights.push({
          id: "spend_streak",
          icon: "flash-outline",
          accentColor: "#EF4444",
          title: `Spending every day for ${streak} days straight`,
          subtitle:
            streak >= 7
              ? "You haven't had a no-spend day in over a week — time for a break?"
              : "You've made a purchase on each of the last " +
                streak +
                " days",
          trendDirection: "up",
          trendLabel: `${streak} days`,
          barPercent: Math.min(100, (streak / 14) * 100),
          barColor: "#EF4444",
        });
      }
    }

    // ── 9. Most Consistent Spend Day ─────────────────────────────────────
    {
      const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const FULL_DAY_NAMES = [
        "Sundays",
        "Mondays",
        "Tuesdays",
        "Wednesdays",
        "Thursdays",
        "Fridays",
        "Saturdays",
      ];

      const weekDayHitMap: Record<number, Set<string>> = {};
      for (let i = 0; i < 7; i++) weekDayHitMap[i] = new Set();

      debitTransactions.forEach((t) => {
        const d = new Date(t.transaction_date);
        const dow = d.getDay();
        const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 10) / 7)}`;
        weekDayHitMap[dow].add(weekKey);
      });

      const periodDays = Math.ceil(
        (dates.now.getTime() -
          (selectedFilter === "This Month"
            ? dates.currentMonthStart
            : selectedFilter === "Last Month"
              ? dates.lastMonthStart
              : dates.last6MonthsStart
          ).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const totalWeeks = Math.max(1, Math.round(periodDays / 7));

      const consistentDay = [0, 1, 2, 3, 4, 5, 6]
        .map((d) => ({ day: d, hits: weekDayHitMap[d].size }))
        .sort((a, b) => b.hits - a.hits)[0];

      if (consistentDay && consistentDay.hits >= 2) {
        const consistencyPct = Math.round(
          (consistentDay.hits / totalWeeks) * 100,
        );
        insights.push({
          id: "consistent_day",
          icon: "repeat-outline",
          accentColor: "#06B6D4",
          title: `You almost always spend on ${FULL_DAY_NAMES[consistentDay.day]}`,
          subtitle: `${consistentDay.hits} out of ${totalWeeks} weeks had a transaction on ${DAY_NAMES[consistentDay.day]} (${consistencyPct}% of the time)`,
          barPercent: Math.min(100, consistencyPct),
          barColor: "#06B6D4",
        });
      }
    }

    // ── 10. Impulse Buy Ratio ─────────────────────────────────────────────
    {
      const IMPULSE_THRESHOLD = 200;
      const impulseTxns = debitTransactions.filter(
        (t) => Number(t.amount || 0) <= IMPULSE_THRESHOLD,
      );
      const impulseTotal = impulseTxns.reduce(
        (s, t) => s + Number(t.amount || 0),
        0,
      );
      const impulseRatio =
        debitTransactions.length > 0
          ? Math.round((impulseTxns.length / debitTransactions.length) * 100)
          : 0;

      const prevImpulseTxns = previousDebits.filter(
        (t) => Number(t.amount || 0) <= IMPULSE_THRESHOLD,
      );
      const prevImpulseRatio =
        previousDebits.length > 0
          ? Math.round((prevImpulseTxns.length / previousDebits.length) * 100)
          : 0;
      const impulseDelta =
        previousDebits.length > 0 ? impulseRatio - prevImpulseRatio : null;

      if (impulseTxns.length >= 2) {
        insights.push({
          id: "impulse_ratio",
          icon: "storefront-outline",
          accentColor: "#F97316",
          title: `${impulseRatio}% of transactions are under ₹200`,
          subtitle: `${impulseTxns.length} small purchases totalling ${fmt(Math.round(impulseTotal))}`,
          trendDirection:
            impulseDelta === null
              ? "neutral"
              : impulseDelta > 0
                ? "up"
                : "down",
          trendLabel:
            impulseDelta !== null
              ? `${impulseDelta > 0 ? "+" : "−"}${Math.abs(impulseDelta).toFixed(0)}% ${vsText}`
              : `${impulseTxns.length} txns`,
          barPercent: impulseRatio,
          barColor:
            impulseRatio > 60
              ? "#EF4444"
              : impulseRatio > 40
                ? "#F97316"
                : "#10B981",
        });
      }
    }

    // ── 11. Morning vs Afternoon Spender ──────────────────────────────────
    {
      let morningSpend = 0,
        eveningSpend = 0;
      debitTransactions.forEach((t) => {
        const h = new Date(t.transaction_date).getHours();
        if (h >= 6 && h < 14) morningSpend += Number(t.amount || 0);
        else if (h >= 14 && h < 22) eveningSpend += Number(t.amount || 0);
      });

      const timeTotal = morningSpend + eveningSpend;
      if (timeTotal > 0) {
        const morningPct = Math.round((morningSpend / timeTotal) * 100);
        const isMorningHeavy = morningPct >= 50;

        insights.push({
          id: "time_of_day",
          icon: isMorningHeavy ? "sunny-outline" : "partly-sunny-outline",
          accentColor: isMorningHeavy ? "#FBBF24" : "#8B5CF6",
          title: isMorningHeavy
            ? `You spend more in the morning`
            : `You spend more in the afternoon`,
          subtitle: isMorningHeavy
            ? `${morningPct}% of your spending happens before 2pm`
            : `${100 - morningPct}% of your spending happens after 2pm`,
          barPercent: isMorningHeavy ? morningPct : 100 - morningPct,
          barColor: isMorningHeavy ? "#FBBF24" : "#8B5CF6",
        });
      }
    }

    // ── 12. Biggest Spending Week of Month ────────────────────────────────
    {
      const weekBuckets: Record<number, { total: number; dateRange: string }> =
        {
          1: { total: 0, dateRange: "1st–7th" },
          2: { total: 0, dateRange: "8th–14th" },
          3: { total: 0, dateRange: "15th–21st" },
          4: { total: 0, dateRange: "22nd onward" },
        };

      debitTransactions.forEach((t) => {
        const dayOfMonth = new Date(t.transaction_date).getDate();
        const weekNum = Math.min(4, Math.ceil(dayOfMonth / 7));
        weekBuckets[weekNum].total += Number(t.amount || 0);
      });

      const topWeek = Object.entries(weekBuckets)
        .filter(([, v]) => v.total > 0)
        .sort(([, a], [, b]) => b.total - a.total)[0];

      if (topWeek) {
        const [weekNum, weekData] = topWeek;
        const weekShare =
          totalSpent > 0 ? Math.round((weekData.total / totalSpent) * 100) : 0;

        insights.push({
          id: "top_week",
          icon: "calendar-number-outline",
          accentColor: "#14B8A6",
          title: `You spent the most in days ${weekBuckets[Number(weekNum)].dateRange}`,
          subtitle: `${fmt(Math.round(weekData.total))} spent — that's ${weekShare}% of your total for the period`,
          barPercent: weekShare,
          barColor: "#14B8A6",
        });
      }
    }

    return insights;
  }, [
    debitTransactions,
    creditTransactions,
    transactions,
    dates,
    selectedFilter,
    totalSpent,
    totalEarned,
  ]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-2 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Insights
            </Text>
            <View className="bg-slate-200/60 p-2 rounded-full">
              <Ionicons name="pie-chart-outline" size={20} color="#64748b" />
            </View>
          </View>

          {/* Filter Tabs */}
          <View className="flex-row bg-slate-200/60 p-1.5 rounded-2xl">
            {FILTERS.map((item) => (
              <TouchableOpacity
                key={item}
                className={`flex-1 py-2.5 rounded-xl ${item === selectedFilter ? "bg-white shadow-sm border border-slate-100" : ""}`}
                onPress={() => setSelectedFilter(item)}
              >
                <Text
                  className={`text-center text-sm ${item === selectedFilter ? "font-bold text-slate-900" : "font-medium text-slate-500"}`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Net Cashflow Card */}
          <View className="bg-slate-900 rounded-3xl p-6 shadow-md shadow-slate-900/10">
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                  Net Cashflow
                </Text>
                <Text
                  className="text-3xl text-white font-black tracking-tight"
                  numberOfLines={1}
                >
                  {netBalance >= 0 ? "+" : "-"}₹
                  {Math.abs(netBalance).toLocaleString("en-IN")}
                </Text>
              </View>
              <View className="bg-slate-800 p-2 rounded-xl">
                <Ionicons name="swap-vertical" size={20} color="#94A3B8" />
              </View>
            </View>

            <View className="h-2 w-full flex-row rounded-full overflow-hidden bg-slate-800 mb-5 gap-[2px]">
              {flowTotal > 0 ? (
                <>
                  <View
                    style={{
                      width: `${earnedPercent}%`,
                      backgroundColor: "#10B981",
                    }}
                  />
                  <View
                    style={{
                      width: `${spentPercent}%`,
                      backgroundColor: "#F43F5E",
                    }}
                  />
                </>
              ) : (
                <View className="flex-1 bg-slate-700" />
              )}
            </View>

            <View className="flex-row justify-between">
              <View>
                <View className="flex-row items-center gap-1.5 mb-1">
                  <View className="w-2 h-2 rounded-full bg-emerald-500" />
                  <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    Earned
                  </Text>
                </View>
                <Text className="text-lg text-white font-bold tracking-tight">
                  ₹{totalEarned.toLocaleString("en-IN")}
                </Text>
              </View>
              <View className="items-end">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    Spent
                  </Text>
                  <View className="w-2 h-2 rounded-full bg-rose-500" />
                </View>
                <Text className="text-lg text-white font-bold tracking-tight">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-lg font-bold text-slate-900">
            Expense Breakdown
          </Text>

          {/* Donut Chart + Breakdown */}
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex-row items-center">
            <View
              style={{ width: 120, height: 120 }}
              className="relative justify-center items-center"
            >
              <Svg width={120} height={120} viewBox="0 0 120 120">
                <G transform="rotate(-90 60 60)">
                  <Circle
                    cx={60}
                    cy={60}
                    r={50}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth={11}
                  />
                  {categoryData.map((item) => {
                    const r = 50;
                    const circ = 2 * Math.PI * r;
                    const sliceLen = (item.percentage / 100) * circ;
                    const gap =
                      item.percentage > 0 && item.percentage < 100 ? 5 : 0;
                    return (
                      <Circle
                        key={item.category}
                        cx={60}
                        cy={60}
                        r={r}
                        fill="transparent"
                        stroke={
                          CATEGORY_HEX[item.category.toLowerCase()] || "#94A3B8"
                        }
                        strokeWidth={11}
                        strokeDasharray={`${Math.max(0, sliceLen - gap)} ${circ}`}
                        strokeLinecap="round"
                        transform={`rotate(${item.rotationAngle} 60 60)`}
                      />
                    );
                  })}
                </G>
              </Svg>
              <View
                className="absolute inset-0 justify-center items-center"
                pointerEvents="none"
              >
                <Text
                  className="text-2xl font-black text-slate-900 tracking-tighter"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {totalTxns}
                </Text>
                <Text className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
                  Txns
                </Text>
              </View>
            </View>

            <View className="w-[1px] h-[80%] bg-slate-100 mx-5" />

            <View className="flex-1 gap-4">
              {categoryData.length > 0 ? (
                categoryData.map((item) => (
                  <View
                    key={item.category}
                    className="flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className="w-3 h-3 rounded-full mr-2.5 items-center justify-center opacity-80"
                        style={{
                          backgroundColor:
                            `${CATEGORY_HEX[item.category.toLowerCase()]}33` ||
                            "#E2E8F0",
                        }}
                      >
                        <View
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_HEX[item.category.toLowerCase()] ||
                              "#94A3B8",
                          }}
                        />
                      </View>
                      <Text
                        className="text-slate-700 font-bold text-xs uppercase tracking-wide"
                        numberOfLines={1}
                      >
                        {item.category}
                      </Text>
                    </View>
                    <Text className="text-slate-900 font-extrabold text-sm tracking-tight">
                      {item.percentage}%
                    </Text>
                  </View>
                ))
              ) : (
                <View className="items-center justify-center py-4">
                  <Ionicons name="receipt-outline" size={24} color="#CBD5E1" />
                  <Text className="text-slate-400 text-xs font-medium text-center mt-1">
                    No expenses
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── TOP INSIGHTS ──────────────────────────────────────────── */}
          {calculatedInsights.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-slate-900">
                  Top Insights
                </Text>
                <View
                  style={{
                    backgroundColor: "#EEF2FF",
                    borderRadius: 99,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      color: "#7367F0",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {calculatedInsights.length} insights
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -20 }}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingRight: 20,
                }}
              >
                {calculatedInsights.map((insight, index) => (
                  <View
                    key={insight.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 20,
                      padding: 16,
                      width: 168,
                      marginRight:
                        index !== calculatedInsights.length - 1 ? 12 : 0,
                      borderWidth: 1,
                      borderColor: "#F1F5F9",
                      borderTopWidth: 3,
                      borderTopColor: insight.accentColor,
                      shadowColor: insight.accentColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    {/* Icon */}
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: `${insight.accentColor}18`,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Ionicons
                        name={insight.icon as any}
                        size={18}
                        color={insight.accentColor}
                      />
                    </View>

                    {/* Title */}
                    <Text
                      style={{
                        color: "#0F172A",
                        fontWeight: "700",
                        fontSize: 13,
                        lineHeight: 18,
                        marginBottom: 2,
                      }}
                      numberOfLines={2}
                    >
                      {insight.title}
                    </Text>

                    {/* Subtitle */}
                    <Text
                      style={{
                        color: "#94A3B8",
                        fontSize: 11,
                        fontWeight: "500",
                        lineHeight: 15,
                      }}
                      numberOfLines={2}
                    >
                      {insight.subtitle}
                    </Text>

                    {/* Mini progress bar */}
                    {insight.barPercent !== undefined && (
                      <MiniBar
                        percent={insight.barPercent}
                        color={insight.barColor ?? insight.accentColor}
                      />
                    )}

                    {/* Trend badge */}
                    {insight.trendDirection && insight.trendLabel && (
                      <TrendBadge
                        direction={insight.trendDirection}
                        label={insight.trendLabel}
                      />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

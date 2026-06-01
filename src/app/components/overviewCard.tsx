import { useTransaction } from "@/context/FinanceContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

const currency = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 1,
});

const compactCurrency = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  notation: "compact",
  compactDisplay: "short",
});

export default function OverviewCard() {
  const { transactions, budgets } = useTransaction();

  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [waveAnim]);

  const spinForward = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinBackward = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentDay = now.getDate();
  const lastMonthDays = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
  ).getDate();
  const compareDay = Math.min(currentDay, lastMonthDays);
  const lastMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    compareDay,
    23,
    59,
    59,
    999,
  );

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.transaction_date);
      return date >= currentMonthStart && date <= now;
    });
  }, [transactions, currentMonthStart, now]);

  const lastMonthTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.transaction_date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
  }, [transactions, lastMonthStart, lastMonthEnd]);

  const totalSpent = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.transaction_type === "debit")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [currentMonthTransactions]);

  const lastMonthSpent = useMemo(() => {
    return lastMonthTransactions
      .filter((t) => t.transaction_type === "debit")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [lastMonthTransactions]);

  const percentageChange =
    lastMonthSpent > 0
      ? ((totalSpent - lastMonthSpent) / lastMonthSpent) * 100
      : null;

  const currentDayOfMonth = now.getDate();
  const dailyAverageSpent =
    currentDayOfMonth > 0 ? totalSpent / currentDayOfMonth : 0;

  const overallBudget = budgets.find(
    (b) => b.category === "overall" && b.period_type === "monthly",
  );
  const totalBudget = Number(overallBudget?.amount || 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetUtilizationDisplay =
    totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0;

  const isOverBudget = remainingBudget < 0;

  return (
    <View className="bg-primary rounded-3xl overflow-hidden border border-content-white/10 shadow-sm relative">
      <View className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Animated.View
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            borderRadius: 350,
            top: "40%",
            left: -200,
            transform: [{ rotate: spinForward }],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            backgroundColor: "rgba(0, 0, 0, 0.08)",
            borderRadius: 420,
            top: "50%",
            left: -200,
            transform: [{ rotate: spinBackward }],
          }}
        />
      </View>

      <View className="p-5 relative z-10">
        <View className="flex-row justify-between items-center mb-5">
          <View className="flex-row items-center gap-2 bg-content-main/30 px-3 py-1.5 rounded-full border border-content-white/10 mt-1">
            <View className="w-1.5 h-1.5 rounded-full bg-primary-light shadow-sm" />
            <Text className="text-content-white font-bold text-[10px] tracking-widest uppercase">
              Current Month
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between w-full mb-5 mt-1">
          {/* Centered Spent Column */}
          <View className="flex-1 items-center px-1">
            <Text
              className="text-content-white/70 font-semibold text-[10px] uppercase tracking-widest mb-1.5"
              numberOfLines={1}
            >
              Spent
            </Text>
            <View className="flex-row items-baseline w-full justify-center">
              <Text className="text-xs text-content-white/70 font-bold mr-0.5">
                ₹
              </Text>
              <Text
                className="text-content-white font-black text-2xl tracking-tighter shrink"
                numberOfLines={1}
              >
                {compactCurrency.format(totalSpent)}
              </Text>
            </View>
          </View>

          <View className="w-px h-6 bg-content-white/10 rounded-full" />

          {/* Centered Avg/Day Column */}
          <View className="flex-1 items-center px-1">
            <Text
              className="text-content-white/70 font-semibold text-[10px] uppercase tracking-widest mb-1.5"
              numberOfLines={1}
            >
              Avg/Day
            </Text>
            <View className="flex-row items-baseline w-full justify-center">
              <Text className="text-xs text-content-white/70 font-bold mr-0.5">
                ₹
              </Text>
              <Text
                className="text-content-white font-black text-2xl tracking-tighter shrink"
                numberOfLines={1}
              >
                {compactCurrency.format(dailyAverageSpent)}
              </Text>
            </View>
          </View>

          <View className="w-px h-6 bg-content-white/10 rounded-full" />

          {/* Centered Trend Column */}
          <View className="flex-1 items-center px-1">
            <Text
              className="text-content-white/70 font-semibold text-[10px] uppercase tracking-widest mb-1.5"
              numberOfLines={1}
            >
              Trend
            </Text>
            <View className="flex-row items-center justify-center gap-1 bg-content-main/20 border border-content-white/5 px-2 py-1 rounded-md w-auto">
              <Ionicons
                name={
                  percentageChange === null
                    ? "remove"
                    : (percentageChange ?? 0) > 0
                      ? "trending-up"
                      : "trending-down"
                }
                size={12}
                className={
                  percentageChange === null
                    ? "text-content-white/50 shrink-0"
                    : (percentageChange ?? 0) > 0
                      ? "text-danger shrink-0"
                      : "text-primary-light shrink-0"
                }
              />
              <Text
                className="text-content-white font-bold text-base tracking-tight shrink"
                numberOfLines={1}
              >
                {percentageChange === null
                  ? "--"
                  : `${Math.abs(percentageChange).toFixed(1)}%`}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          className="bg-content-main/20 rounded-2xl p-4 border-t border-l border-content-white/20 mt-1 shadow-md"
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-1.5 mb-1.5">
                <Ionicons
                  name={isOverBudget ? "warning" : "checkmark-circle"}
                  size={14}
                  className={
                    isOverBudget ? "text-danger" : "text-primary-light"
                  }
                />
                <Text
                  className="text-content-white/90 font-bold text-xs tracking-wide"
                  numberOfLines={1}
                >
                  {isOverBudget ? "Over Budget By" : "Remaining Budget"}
                </Text>
              </View>
              <View className="flex-row items-baseline w-full">
                <Text className="text-sm text-content-white/70 font-bold mr-1">
                  ₹
                </Text>
                <Text
                  className="text-content-white font-black text-xl tracking-tight shrink"
                  numberOfLines={1}
                >
                  {currency.format(Math.abs(remainingBudget))}
                </Text>
              </View>
            </View>
            <View className="bg-content-white/10 p-2 rounded-full shrink-0 border border-content-white/10">
              <Ionicons
                name="chevron-forward"
                size={14}
                className="text-content-white/90"
              />
            </View>
          </View>

          <View>
            <View className="h-1.5 w-full bg-content-main/50 rounded-full overflow-hidden mb-2.5">
              <View
                className={`h-full rounded-full ${isOverBudget ? "bg-danger" : "bg-content-white"}`}
                style={{ width: `${Math.max(budgetUtilizationDisplay, 2)}%` }}
              />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-content-white/70 text-[10px] font-bold uppercase tracking-widest">
                {budgetUtilizationDisplay}% Used
              </Text>
              <Text
                className="text-content-white/70 text-[10px] font-bold uppercase tracking-widest"
                numberOfLines={1}
              >
                of ₹{currency.format(totalBudget)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

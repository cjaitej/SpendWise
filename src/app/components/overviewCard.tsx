import { useTransaction } from "@/context/FinanceContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export default function OverviewCard() {
  const { transactions, budgets } = useTransaction();
  const now = new Date();

  //Transaction KPIs
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((transaction) => {
      const date = new Date(transaction.transaction_date);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [transactions]);

  const lastMonthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.transaction_date);
    const now = new Date();

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return (
      date.getMonth() === lastMonth.getMonth() &&
      date.getFullYear() === lastMonth.getFullYear()
    );
  });

  const totalSpent = currentMonthTransactions
    .filter((t) => t.transaction_type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const lastMonthSpent = transactions
    .filter((transaction) => {
      const date = new Date(transaction.transaction_date);

      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      return (
        date.getMonth() === lastMonth.getMonth() &&
        date.getFullYear() === lastMonth.getFullYear() &&
        date.getDate() <= now.getDate()
      );
    })
    .filter((t) => t.transaction_type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const percentageChange =
    ((totalSpent - lastMonthSpent) / (lastMonthSpent + 1.5)) * 100;

  const displayPercentage = Math.abs(percentageChange).toFixed(1);

  //Budget KPIs
  const overallBudget = budgets.find(
    (b) => b.category === "overall" && b.period_type == "monthly",
  );
  const totalBudget = overallBudget?.amount ?? 0;
  const remainingBudget = Math.max(totalBudget - totalSpent, 0);

  const budgetUtilizationDisplay = Math.min(
    100,
    Math.round((totalSpent / totalBudget) * 100),
  );

  return (
    <View className="flex bg-primary rounded-2xl p-5 gap-3">
      {/* Top Section */}

      <Text className="text-content-white font-medium  text-base">
        This Month Overview
      </Text>

      <View className="flex-row justify-between items-center">
        <View>
          <View className="flex gap-2">
            <Text className="text-content-white font-medium text-base">
              Spent
            </Text>

            <Text className="text-content-white font-bold text-4xl">
              ₹ {totalSpent.toLocaleString("INR")}
            </Text>

            <View className="flex-row items-center gap-1 bg-primary-dark rounded-2xl p-2">
              <Ionicons
                name={percentageChange > 0 ? "trending-up" : "trending-down"}
                size={14}
                color="white"
              />
              <Text className="text-content-white text-sm font-medium">
                {displayPercentage}% vs last month
              </Text>
            </View>
          </View>
        </View>

        {/* Circular Progress */}

        <AnimatedCircularProgress
          size={115}
          width={10}
          fill={budgetUtilizationDisplay}
          tintColor="#ffffff"
          backgroundColor="rgba(255,255,255,0.2)"
          rotation={0}
          arcSweepAngle={360}
          lineCap="round"
        >
          {() => (
            <View className="flex items-center">
              <Text className="text-content-white">
                {budgetUtilizationDisplay}%
              </Text>

              <Text className="text-content-white">
                of ₹{totalBudget.toLocaleString()}
              </Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      {/* Bottom Section */}

      <View className="flex-row justify-between items-end border-t border-background/20 pt-3">
        <View>
          <Text className="text-content-white font-medium text-base">
            Budget Left
          </Text>

          <Text className="text-content-white font-semibold text-3xl">
            ₹ {remainingBudget.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity className="flex-row gap-1 items-center ">
          <Text className="text-content-white font-medium text-base">
            View details
          </Text>

          <Ionicons name="chevron-forward" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

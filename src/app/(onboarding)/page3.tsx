import { useAuth } from "@/context/AuthContext";
import { useTransaction } from "@/context/FinanceContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface Budget {
  id: string;
  user_id: string;
  category: string | null;
  amount: number;
  period_type: "weekly" | "monthly" | "yearly";
  start_date: string;
  created_at: string;
  updated_at: string;
}

interface BudgetAllocationModalProps {
  visible: boolean;
}

export default function BudgetAllocationModal({
  visible,
}: BudgetAllocationModalProps) {
  const { user } = useAuth();
  const { createBudget } = useTransaction();
  const router = useRouter();

  const [budget, setBudget] = useState(10000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocations, setAllocations] = useState([
    { id: "food", name: "Food", icon: "fast-food", percentage: 20 },
    { id: "travel", name: "Travel", icon: "car", percentage: 20 },
    { id: "shopping", name: "Shopping", icon: "bag", percentage: 20 },
    { id: "education", name: "Education", icon: "school", percentage: 20 },
    { id: "others", name: "Others", icon: "apps", percentage: 20 },
  ]);

  const remaining =
    100 - allocations.reduce((sum, item) => sum + item.percentage, 0);

  const adjustPercentage = (id: string, amount: number) => {
    setAllocations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newPercentage = item.percentage + amount;
          if (
            newPercentage >= 0 &&
            newPercentage <= 100 &&
            remaining - amount >= 0
          ) {
            return { ...item, percentage: newPercentage };
          }
        }
        return item;
      }),
    );
  };

  const handleBudgetChange = (text: string) => {
    const numeric = parseInt(text.replace(/[^0-9]/g, ""), 10);
    setBudget(isNaN(numeric) ? 0 : numeric);
  };

  const handleContinue = async () => {
    if (isSubmitting) return;
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      const startDate = new Date().toISOString();

      // Save overall budget to DB
      await createBudget({
        user_id: user.id,
        amount: budget,
        category: null,
        period_type: "monthly",
        start_date: startDate,
      });

      // Save category allocations (only if allocated > 0%)
      await Promise.all(
        allocations.map((item) => {
          if (item.percentage > 0) {
            return createBudget({
              user_id: user.id,
              amount: Math.round((budget * item.percentage) / 100),
              category: item.id,
              period_type: "monthly",
              start_date: startDate,
            });
          }
          return Promise.resolve();
        }),
      );

      router.push({
        pathname: "/(onboarding)/page4",
        params: { budget: budget },
      });
    } catch (error) {
      console.error("Failed to save budget:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header (X button removed) */}
        <View className="flex-row justify-between items-center px-5 pt-4">
          <Text className="text-2xl font-semibold text-content-main">
            Allocate your <Text className="text-primary font-bold">budget</Text>
          </Text>
        </View>
        <Text className="px-5 mt-1 text-sm text-content-sub">
          Tell us how you usually spend your money.
        </Text>

        <ScrollView
          className="flex-1 mt-2"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Budget Input */}
          <View className="mt-4 bg-card border border-border rounded-2xl px-4 py-3 flex-row items-center">
            <Text className="text-xl font-bold text-primary mr-1">₹</Text>
            <TextInput
              value={budget.toLocaleString()}
              onChangeText={handleBudgetChange}
              keyboardType="numeric"
              placeholder="Enter monthly budget"
              placeholderTextColor="#9aaab8"
              className="flex-1 text-xl font-bold text-content-main"
              style={{ paddingVertical: 0 }}
            />
            <Text className="text-xs text-content-muted ml-2">/ month</Text>
          </View>

          {/* Remaining Allocation Indicator */}
          <View className="mt-4 flex-row justify-between items-center bg-primary-light px-4 py-3 rounded-xl">
            <Text className="text-sm font-semibold text-content-main">
              Left to allocate:
            </Text>
            <Text
              className={`text-base font-bold ${
                remaining === 0 ? "text-primary" : "text-orange-500"
              }`}
            >
              {remaining}%
            </Text>
          </View>

          {/* Categories */}
          <View className="mt-4 gap-2">
            {allocations.map((item) => {
              const categoryAmount = (budget * item.percentage) / 100;

              return (
                <View
                  key={item.id}
                  className="bg-card border border-border rounded-2xl px-3 py-3 flex-row justify-between items-center"
                >
                  <View className="flex-row items-center gap-2 flex-1">
                    <View className="bg-primary-light p-2 rounded-full">
                      <Ionicons
                        name={item.icon as any}
                        size={16}
                        color="#00a878"
                      />
                    </View>
                    <View>
                      <Text className="font-semibold text-sm text-content-main">
                        {item.name}
                      </Text>
                      <Text className="text-xs text-content-sub">
                        ₹{categoryAmount.toLocaleString("en-IN")}
                      </Text>
                    </View>
                  </View>

                  {/* Stepper Controls */}
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => adjustPercentage(item.id, -5)}
                      disabled={item.percentage === 0 || isSubmitting}
                      className={`p-1.5 rounded-full ${
                        item.percentage === 0
                          ? "bg-gray-100"
                          : "bg-primary-light"
                      }`}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={item.percentage === 0 ? "#9aaab8" : "#00a878"}
                      />
                    </TouchableOpacity>

                    <Text className="text-base font-bold w-10 text-center text-content-main">
                      {item.percentage}%
                    </Text>

                    <TouchableOpacity
                      onPress={() => adjustPercentage(item.id, 5)}
                      disabled={remaining < 5 || isSubmitting}
                      className={`p-1.5 rounded-full ${
                        remaining < 5 ? "bg-gray-100" : "bg-primary-light"
                      }`}
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color={remaining < 5 ? "#9aaab8" : "#00a878"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Action Button */}
        <View className="px-5 pb-4 pt-2 bg-background border-t border-border">
          <TouchableOpacity
            className={`py-4 rounded-2xl items-center justify-center ${
              remaining === 0 && !isSubmitting
                ? "bg-primary-dark"
                : "bg-gray-300"
            }`}
            onPress={handleContinue}
            disabled={remaining !== 0 || isSubmitting}
          >
            <Text
              className={`text-base font-semibold ${
                remaining === 0 && !isSubmitting
                  ? "text-content-white"
                  : "text-gray-500"
              }`}
            >
              {isSubmitting ? "Uploading..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

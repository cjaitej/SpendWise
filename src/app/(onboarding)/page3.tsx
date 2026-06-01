import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
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

export default function OnBoardPage4Screen() {
  const router = useRouter();
  const { user, createBudget, updateUser } = useAuth();

  const [budget, setBudget] = useState(10000);

  const [allocations, setAllocations] = useState([
    { id: "food", name: "Food", icon: "fast-food", percentage: 25 },
    { id: "travel", name: "Travel", icon: "car", percentage: 25 },
    { id: "shopping", name: "Shopping", icon: "bag", percentage: 25 },
    { id: "education", name: "Education", icon: "school", percentage: 15 },
    { id: "others", name: "Others", icon: "apps", percentage: 10 },
  ]);

  const updatePercentage = (id: string, newValue: number) => {
    if (id === "others") return;

    setAllocations((prev) => {
      const updatedValue = Math.round(newValue);
      const current = prev.find((item) => item.id === id);
      const others = prev.find((item) => item.id === "others");

      if (!current || !others) return prev;

      const diff = updatedValue - current.percentage;
      const newOthersPercentage = others.percentage - diff;

      if (newOthersPercentage < 0) return prev;

      return prev.map((item) => {
        if (item.id === id) return { ...item, percentage: updatedValue };
        if (item.id === "others")
          return { ...item, percentage: newOthersPercentage };
        return item;
      });
    });
  };

  const handleBudgetChange = (text: string) => {
    const numeric = parseInt(text.replace(/[^0-9]/g, ""), 10);
    setBudget(isNaN(numeric) ? 0 : numeric);
  };

  const handleContinue = async () => {
    try {
      const startDate = new Date().toISOString();

      // 1. Create the overall budget (no category)
      await createBudget({
        user_id: user?.id,
        amount: budget,
        category: null,
        period_type: "monthly",
        start_date: startDate,
      });

      // 2. Create a budget entry for each category allocation
      await Promise.all(
        allocations.map((item) =>
          createBudget({
            user_id: user?.id,
            amount: Math.round((budget * item.percentage) / 100),
            category: item.id,
            period_type: "monthly",
            start_date: startDate,
          }),
        ),
      );
      router.push({
        pathname: "/(onboarding)/page4",
        params: {
          budget: budget,
        },
      });
    } catch (error) {
      console.error("Failed to save budget:", error);
      // TODO: show error toast / alert
    }
  };

  const othersPercentage =
    allocations.find((a) => a.id === "others")?.percentage ?? 0;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress */}
          <View className="flex-row gap-2 mt-4">
            <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
            <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
            <View className="border-4 w-10 rounded-2xl border-primary-dark" />
            <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
          </View>

          {/* Header */}
          <View className="mt-5">
            <Text className="text-2xl font-semibold text-content-main">
              Allocate your{" "}
              <Text className="text-primary font-bold">budget</Text>
            </Text>
            <Text className="mt-1 text-sm text-content-sub">
              Tell us how you usually spend your money.
            </Text>
          </View>

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

          {/* Categories */}
          <View className="mt-3 gap-2">
            {allocations.map((item) => {
              const categoryAmount = (budget * item.percentage) / 100;

              return (
                <View
                  key={item.id}
                  className="bg-card border border-border rounded-2xl px-3 pt-3 pb-2"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
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
                    <Text className="text-sm font-bold text-primary">
                      {item.percentage}%
                    </Text>
                  </View>

                  {item.id !== "others" ? (
                    <Slider
                      style={{ width: "100%", height: 32, marginTop: 4 }}
                      minimumValue={0}
                      maximumValue={item.percentage + othersPercentage}
                      step={1}
                      value={item.percentage}
                      minimumTrackTintColor="#00a878"
                      maximumTrackTintColor="#e4e9f0"
                      thumbTintColor="#00875f"
                      onSlidingComplete={(value) =>
                        updatePercentage(item.id, value)
                      }
                    />
                  ) : (
                    <View className="mt-2 mb-1">
                      <View className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <View
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </View>
                      <Text className="text-xs text-content-muted mt-1">
                        Automatically adjusted
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Tip */}
          <View className="mt-3 bg-primary-light px-5 py-5 rounded-2xl gap-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="analytics" size={24} color="#00a878" />
              <Text className="text-base font-semibold text-primary">
                Smart Tracking
              </Text>
            </View>
            <Text className="text-sm text-content-sub leading-6">
              We'll track your spending across all categories and alert you
              before you exceed each category's allocated limit.
            </Text>
          </View>
        </ScrollView>

        {/* Continue */}
        <View className="px-5 pb-4 pt-2 bg-background">
          <TouchableOpacity
            className="py-4 rounded-2xl items-center justify-center bg-primary-dark"
            onPress={handleContinue}
          >
            <Text className="text-content-white text-base font-semibold">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

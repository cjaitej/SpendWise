import { useAuth } from "@/context/AuthContext";
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

export default function OnBoardPage3Screen() {
  const router = useRouter();
  const { user } = useAuth();

  const [budget, setBudget] = useState(10000);

  const [allocations, setAllocations] = useState([
    { id: "food", name: "Food", icon: "fast-food", percentage: 20 },
    { id: "travel", name: "Travel", icon: "car", percentage: 20 },
    { id: "shopping", name: "Shopping", icon: "bag", percentage: 20 },
    { id: "education", name: "Education", icon: "school", percentage: 20 },
    { id: "others", name: "Others", icon: "apps", percentage: 20 },
  ]);

  // Calculate remaining pool
  const remaining =
    100 - allocations.reduce((sum, item) => sum + item.percentage, 0);

  const adjustPercentage = (id: string, amount: number) => {
    setAllocations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newPercentage = item.percentage + amount;
          // Ensure it doesn't go below 0, above 100, or exceed the remaining pool
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

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/page4",
      params: {
        budget: budget,
        allocations: JSON.stringify(allocations), // Pass allocations to the next screen if needed
      },
    });
  };

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
          <View className="flex-row gap-2 mt-4">
            <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
            <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
            <View className="border-4 w-10 rounded-2xl border-primary-dark" />
            <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
          </View>

          <View className="mt-5">
            <Text className="text-2xl font-semibold text-content-main">
              Allocate your{" "}
              <Text className="text-primary font-bold">budget</Text>
            </Text>
            <Text className="mt-1 text-sm text-content-sub">
              Tell us how you usually spend your money.
            </Text>
          </View>

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

          <View className="mt-3 gap-2">
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
                      disabled={item.percentage === 0}
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
                      disabled={remaining < 5}
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

          {/* Tip */}
          <View className="mt-4 bg-primary-light px-5 py-5 rounded-2xl gap-3">
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

        {/* Continue Button */}
        <View className="px-5 pb-4 pt-2 bg-background">
          <TouchableOpacity
            className={`py-4 rounded-2xl items-center justify-center ${
              remaining === 0 ? "bg-primary-dark" : "bg-gray-300"
            }`}
            onPress={handleContinue}
            disabled={remaining !== 0} // Optional: Force exactly 100% before moving forward
          >
            <Text
              className={`text-base font-semibold ${
                remaining === 0 ? "text-content-white" : "text-gray-500"
              }`}
            >
              {remaining === 0
                ? "Continue"
                : `Allocate remaining ${remaining}%`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

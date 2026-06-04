import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnBoardScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-5 gap-10">
        <View className="flex-row gap-2">
          <View className="border-4 w-12 rounded-2xl border-primary-dark"></View>
          <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
          <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
          <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
        </View>
        <View className="flex-1 flex-row items-center">
          <View className="flex-1 gap-2">
            <Text className="text-content-main text-4xl font-semibold">
              Welcome to
            </Text>

            <Text className="text-2xl text-primary font-extrabold">
              SpendWise
            </Text>

            <Text className="text-sm text-content-sub leading-6">
              Your AI-powered finance partner to track, analyze and grow your
              money smarter.
            </Text>
          </View>

          <Image
            source={require("../../../assets/images/boardingPage/started.png")}
            style={{ width: 200, height: 200 }}
            contentFit="contain"
          />
        </View>
        <View className="flex-2 gap-3">
          <View className="flex-row items-center gap-4 rounded-3xl bg-primary/5 p-4">
            <View className="w-12 h-12 rounded-full bg-primary/15 items-center justify-center">
              <Ionicons name="trending-up" size={22} className="text-primary" />
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-content-main">
                Track Expenses Automatically
              </Text>

              <Text className="text-content-sub text-xs mt-1">
                Every transaction organized in one place.
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 rounded-3xl bg-entertainment/5 p-4">
            <View className="w-12 h-12 rounded-full bg-entertainment/15 items-center justify-center">
              <Ionicons
                name="sparkles"
                size={22}
                className="text-entertainment"
              />
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-content-main">
                Get AI-powered insights
              </Text>

              <Text className="text-content-sub text-xs mt-1">
                Let AI uncover hidden trends in your daily spending habits.
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 rounded-3xl bg-travel/5 p-4">
            <View className="w-12 h-12 rounded-full bg-travel/15 items-center justify-center">
              <Ionicons name="wallet" size={22} className="text-travel" />
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-content-main">
                Stay on top of your budget
              </Text>

              <Text className="text-content-sub text-xs mt-1">
                Set monthly limits and monitor your budget with ease.
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 rounded-3xl bg-shopping/5 p-4">
            <View className="w-12 h-12 rounded-full bg-shopping/15 items-center justify-center">
              <Ionicons
                name="shield-checkmark"
                size={22}
                className="text-shopping"
              />
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-content-main">
                Your data is safe and secure
              </Text>

              <Text className="text-content-sub text-xs mt-1">
                Your financial data stays protected and under your control.
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="bg-primary-dark justify-center items-center py-5 rounded-2xl"
          onPress={() => {
            router.push("/(onboarding)/page2");
          }}
        >
          <Text className="text-xl text-content-white font-semibold">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

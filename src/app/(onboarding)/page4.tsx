import { useAuth } from "@/context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnBoardPage4Screen() {
  const { user, updateUser, updateStoragePreference } = useAuth();
  const [cloudEnabled, setCloudEnabled] = useState(true); // Default to recommended

  const userName = user?.username;
  const { budget } = useLocalSearchParams();

  const handleGetStarted = async () => {
    try {
      await updateStoragePreference(cloudEnabled ? "cloud" : "device");
      await updateUser({
        onboardingCompleted: true,
      });
    } catch (err) {
      console.error("error: ", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1">
        {/* Full Screen Background Animation */}
        <LottieView
          source={require("@/assets/images/boardingPage/celeb.json")}
          autoPlay
          loop={false}
          resizeMode="center"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Overlay Content */}
        <View className="flex-1 px-5">
          <View className="flex-1 justify-center">
            {/* Header */}
            <View className="items-center">
              <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
                <Ionicons name="checkmark" size={56} className="text-primary" />
              </View>

              <Text className="text-4xl font-bold text-content-main mt-6">
                You're all set!
              </Text>

              <Text className="text-content-sub text-center mt-3 leading-6">
                Your account is ready.
                {"\n"}
                Let's take control of your finances.
              </Text>
            </View>

            {/* Summary Card */}
            <View className="mt-10 rounded-3xl border border-border bg-white overflow-hidden">
              <View className="flex-row items-center justify-between px-5 py-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                    <Ionicons name="person" size={18} color="#8B5CF6" />
                  </View>
                  <Text className="text-content-main font-medium">Profile</Text>
                </View>

                <Text className="text-primary font-medium">{userName}</Text>
              </View>

              <View className="h-px bg-border" />

              <View className="flex-row items-center justify-between px-5 py-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                    <Ionicons name="wallet" size={18} color="#10B981" />
                  </View>

                  <Text className="text-content-main font-medium">
                    Monthly Budget
                  </Text>
                </View>

                {/* Pro-tip: Added Number() to prevent crash if 'budget' is a string from search params */}
                <Text className="text-primary font-semibold">
                  ₹{Number(budget || 0).toLocaleString("en-IN")}
                </Text>
              </View>

              <View className="h-px bg-border" />

              <View className="flex-row items-center justify-between px-5 py-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#F59E0B"
                    />
                  </View>

                  <Text className="text-content-main font-medium">
                    Onboarding
                  </Text>
                </View>

                <Text className="text-primary font-semibold">Complete</Text>
              </View>
            </View>

            <View className="mt-6 rounded-3xl border border-primary/30 bg-primary/5 p-5">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                    <Ionicons name="cloud-upload" size={20} color="#00a878" />
                  </View>
                  <Text className="text-content-main font-bold text-base">
                    Cloud Backup
                  </Text>
                </View>
                <Switch
                  value={cloudEnabled}
                  onValueChange={setCloudEnabled}
                  trackColor={{ false: "#e4e9f0", true: "#00a87860" }}
                  thumbColor={cloudEnabled ? "#00a878" : "#9aaab8"}
                />
              </View>

              <Text
                className={`text-sm leading-5 ${cloudEnabled ? "text-content-sub" : "text-red-500"}`}
              >
                {cloudEnabled ? (
                  <>
                    <Text className="font-bold text-primary">Recommended:</Text>{" "}
                    Keep this enabled to securely back up your data. If you ever
                    lose your device or reinstall the app, your transaction
                    history is safely restored.
                  </>
                ) : (
                  <>
                    <Text className="font-bold">Warning:</Text> If cloud backup
                    is turned off, your data will be completely lost if you
                    uninstall or reinstall the app.
                  </>
                )}
              </Text>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            className="bg-primary-dark justify-center items-center py-5 rounded-2xl mb-4"
            onPress={handleGetStarted}
          >
            <Text className="text-xl text-content-white font-semibold">
              Go to Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

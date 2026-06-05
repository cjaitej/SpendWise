import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnBoardPage2Screen() {
  const router = useRouter();
  const { userNameAvailability, updateUser } = useAuth();

  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isTooShort, setIsTooShort] = useState<boolean>(false);

  useEffect(() => {
    const trimmed = username.trim();

    if (trimmed.length > 0 && trimmed.length < 5) {
      setIsAvailable(null);
      setIsTooShort(true);
      return;
    }

    setIsTooShort(false);

    if (trimmed.length === 0) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);

      const available = await userNameAvailability(username);

      setIsAvailable(available);
      setIsChecking(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [username]);

  const handleContinue = async () => {
    try {
      await updateUser({
        name: name.trim(),
        username: username.trim(),
      });
    } catch (err) {
      console.error("error: ", err);
    }
    router.push("/(onboarding)/page3");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-5 gap-10">
        <View className="flex-row gap-2">
          <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
          <View className="border-4 w-12 rounded-2xl border-primary-dark"></View>
          <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
          <View className="border-4 w-12 rounded-2xl border-gray-300"></View>
        </View>
        <View className="flex-1 flex-row items-center">
          <View className="flex-1 gap-2">
            <Text className="text-content-main text-4xl font-semibold">
              Create your
            </Text>

            <Text className="text-4xl text-primary font-extrabold">
              Profile
            </Text>

            <Text className="text-sm text-content-sub leading-6">
              Your AI-powered finance partner to track, analyze and grow your
              money smarter.
            </Text>
          </View>

          <Image
            source={require("../../../assets/images/boardingPage/profile.png")}
            style={{ width: 200, height: 200 }}
            contentFit="contain"
          />
        </View>
        <View className="flex-2 gap-3">
          <View className="flex-row items-center rounded-2xl border border-gray-200 px-5 py-4">
            <Ionicons
              name="person-outline"
              size={22}
              className="text-content-main"
            />

            <View className="ml-4 flex-1">
              <Text className="text-sm font-medium text-content-main">
                Full Name
              </Text>

              <TextInput
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                className="mt-1 text-base text-black p-0 placeholder:text-content-muted"
              />
            </View>
          </View>

          <View className="flex-row items-center rounded-2xl border border-gray-200 px-5 py-4">
            <Ionicons
              name="at-outline"
              size={22}
              className="text-content-main"
            />

            <View className="ml-4 flex-1">
              <Text className="text-sm font-medium text-content-main">
                Username
              </Text>

              <TextInput
                placeholder="Choose a unique username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                className="mt-1 text-base text-black p-0 placeholder:text-content-muted"
              />

              {isChecking && (
                <Text className="text-xs text-content-sub mt-1">
                  Checking...
                </Text>
              )}

              {/* Show the length warning message */}
              {isTooShort && (
                <Text className="text-xs text-red-500 mt-1">
                  Username must be at least 5 characters
                </Text>
              )}

              {isAvailable === true && (
                <Text className="text-xs text-green-600 mt-1">
                  ✓ Username available
                </Text>
              )}

              {isAvailable === false && !isTooShort && (
                <Text className="text-xs text-red-500 mt-1">
                  ✗ Username already taken
                </Text>
              )}
            </View>
          </View>
          <Text className="text-xs text-gray-500">
            This will be your unique identity in the app
          </Text>
        </View>
        <TouchableOpacity
          className={`justify-center items-center py-5 rounded-2xl ${
            isAvailable && name.trim().length > 0
              ? "bg-primary-dark"
              : "bg-gray-300"
          }`}
          onPress={handleContinue}
          disabled={!isAvailable || name.trim().length === 0}
        >
          <Text className="text-xl text-content-white font-semibold">
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

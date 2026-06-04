import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Ensure sendPasswordResetEmail is exported from your AuthContext
  const { sendPasswordResetEmail } = useAuth();

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);
      Alert.alert(
        "Link Sent!",
        "Please check your inbox for password reset instructions.",
        [{ text: "Back to Login", onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert("Reset Failed", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-5">
            <View className="mt-12 gap-2 mb-10">
              <Text className="mt-1 font-semibold text-4xl">
                Reset Password
              </Text>
              <Text className="text-sm text-content-sub mt-2">
                Enter your registered email address and we'll send you a link to
                reset your password.
              </Text>
            </View>

            <View className="mb-8">
              <View className="flex-row items-center rounded-2xl border border-gray-200 px-4 py-3">
                <Ionicons
                  name="mail-outline"
                  size={18}
                  className="text-content-main"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-xs font-medium text-content-main">
                    Email Address
                  </Text>
                  <TextInput
                    editable={!isLoading}
                    placeholder="Enter your email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    className="mt-1 text-sm text-black p-0 placeholder:text-content-muted"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              disabled={isLoading}
              className={`justify-center items-center py-4 rounded-xl ${
                isLoading ? "bg-gray-400" : "bg-primary"
              }`}
              onPress={handleReset}
            >
              <Text className="text-content-white font-semibold">
                {isLoading ? "Sending Link..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-6 justify-center items-center"
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text className="text-primary font-semibold">Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
    } catch (error: any) {
      if (error.message?.includes("Email not confirmed")) {
        Alert.alert(
          "Email not verified",
          "Please verify your email address before signing in.",
        );
      } else {
        Alert.alert(
          "Sign In Failed",
          error.message || "Invalid email or password",
        );
      }
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
            <View className="flex-row justify-between items-center mt-8 gap-2">
              <View className="flex-1 gap-2">
                <Text className="text-primary font-medium text-base">
                  Good to see you again!
                </Text>
                <Text className="mt-1 font-semibold text-4xl">
                  Welcome Back
                </Text>
                <Text className="text-sm text-content-sub">
                  Login to continue managing your finances
                </Text>
              </View>
              <Image
                source={require("../../../assets/images/auth/login.png")}
                style={{ width: 200, height: 200 }}
                contentFit="contain"
                className="flex-2"
              />
            </View>
            <View className="mt-10 flex-row border-b border-border">
              <TouchableOpacity
                disabled={true}
                className="flex-1 items-center border-b-2 border-primary pb-3"
              >
                <Text className="font-semibold text-primary">Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center pb-3"
                onPress={() => router.push("/(auth)/signup")}
              >
                <Text className="font-semibold text-content-sub">Signup</Text>
              </TouchableOpacity>
            </View>
            <View className="mb-5 mt-6 gap-3">
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
                    placeholder="Enter your email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    autoComplete="email"
                    className="mt-1 text-sm text-black p-0 placeholder:text-content-muted"
                  />
                </View>
              </View>
              <View className="flex-row items-center rounded-2xl border border-gray-200 px-4 py-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  className="text-content-main"
                />

                <View className="ml-3 flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-content-main">
                      Password
                    </Text>
                    <TextInput
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      textContentType="password" // Added for autofill
                      className="mt-1 text-sm text-black p-0 placeholder:text-content-muted"
                    />
                  </View>
                  <TouchableOpacity
                    className="mr-5"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      className="text-content-main"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-right text-primary font-semibold mt-3">
                Forgot Password?
              </Text>
            </View>

            {/* Disabled logic applied here */}
            <TouchableOpacity
              className="justify-center items-center py-4 rounded-xl bg-primary"
              onPress={handleSignIn}
            >
              <Text className="text-content-white font-semibold">Login</Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
              <View className="flex-1 border-b-2 border-border bg-border" />

              <Text className="mx-4 text-content-sub">or continue with</Text>

              <View className="flex-1 border-b-2 border-border bg-border" />
            </View>
            <TouchableOpacity className="flex-row items-center justify-center gap-3 border border-gray-300 py-4 rounded-xl">
              <Image
                source={require("../../../assets/images/auth/google.png")}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
                className="flex-2"
              />
              <Text className="text-center font-medium">
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

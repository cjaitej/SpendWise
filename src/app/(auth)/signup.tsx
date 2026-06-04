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

function PassCheck({
  showMessage,
  test,
}: {
  showMessage: string;
  test: boolean;
}) {
  return (
    <View className="flex-row gap-1 items-center">
      <Text
        className={`${test ? "text-primary" : "text-content-sub"} text-xs font-normal`}
      >
        {showMessage}
      </Text>
      <Ionicons
        name="checkmark-circle-outline"
        size={10}
        className={test ? "text-primary" : "text-content-sub"}
      />
    </View>
  );
}

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const { signUp, signInWithGoogle } = useAuth();

  const router = useRouter();
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasNoSpaces = !/\s/.test(password);
  const hasOnlyAscii = /^[\x20-\x7E]+$/.test(password);
  const passMatches = confirmPassword !== "" && confirmPassword === password;

  const isFormValid =
    email.trim() !== "" &&
    hasMinLength &&
    hasNumber &&
    hasSpecial &&
    hasNoSpaces &&
    hasOnlyAscii &&
    passMatches;

  const handleSignUp = async () => {
    setIsLoading(true); // Disable inputs
    try {
      await signUp(email, password);

      Alert.alert(
        "Verify your email",
        "We've sent a verification link to your email address. Please verify your account before logging in.",
      );
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setIsLoading(false); // Re-enable inputs
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert(
        "Google Sign-Up Failed",
        error.message || "Something went wrong",
      );
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
            <View className="flex-row justify-between items-center mt-8 gap-2">
              <View className="flex-1 gap-3">
                <Text className="mt-1 font-semibold text-4xl">
                  Create your account
                </Text>
                <Text className="text-sm text-content-sub">
                  Join SpendWise and take control of your finance
                </Text>
              </View>
              <Image
                source={require("../../../assets/images/auth/signup.png")}
                style={{ width: 200, height: 200 }}
                contentFit="contain"
                className="flex-2"
              />
            </View>
            <View className="mt-10 flex-row border-b border-border">
              <TouchableOpacity
                className="flex-1 items-center pb-3"
                onPress={() => router.back()}
              >
                <Text className="font-semibold text-content-sub">Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center pb-3 border-b-2 border-primary"
                disabled={true}
              >
                <Text className="font-semibold text-primary">Signup</Text>
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
                    editable={!isLoading}
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
                      editable={!isLoading}
                      placeholder="Create a strong password"
                      secureTextEntry={!showPassword}
                      value={password}
                      autoCapitalize="none"
                      textContentType="newPassword"
                      onChangeText={(val) => {
                        setConfirmPassword("");
                        setPassword(val);
                      }}
                      className="mt-1 text-sm text-black p-0 placeholder:text-content-muted"
                    />
                  </View>
                  <TouchableOpacity
                    className="mr-5"
                    disabled={isLoading}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={18}
                      className="text-content-main"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row flex-wrap gap-4 justify-center">
                <PassCheck showMessage="8+ characters" test={hasMinLength} />
                <PassCheck showMessage="Contains a number" test={hasNumber} />
                <PassCheck showMessage="Contains a symbol" test={hasSpecial} />
                <PassCheck showMessage="No spaces" test={hasNoSpaces} />
                <PassCheck
                  showMessage="English characters only"
                  test={hasOnlyAscii}
                />
              </View>
              <View
                className={`flex-row items-center rounded-2xl border ${passMatches ? "border-primary bg-primary/10" : "border-gray-200"}  px-4 py-3`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  className="text-content-main"
                />

                <View className="ml-3 flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-content-main">
                      Confirm Password
                    </Text>
                    <TextInput
                      editable={!isLoading}
                      placeholder="Confirm your password"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      autoCapitalize="none"
                      textContentType="newPassword"
                      onChangeText={setConfirmPassword}
                      className="mt-1 text-sm text-black p-0 placeholder:text-content-muted"
                    />
                  </View>
                  <TouchableOpacity
                    className="mr-5"
                    disabled={isLoading}
                    onPress={() => setConfirmShowPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      className="text-content-main"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              disabled={!isFormValid || isLoading}
              className={`justify-center items-center py-4 rounded-xl ${isFormValid && !isLoading ? "bg-primary" : "bg-content-sub"}`}
              onPress={handleSignUp}
            >
              <Text className="text-content-white font-semibold">
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
              <View className="flex-1 border-b-2 border-border bg-border" />

              <Text className="mx-4 text-content-sub">or continue with</Text>

              <View className="flex-1 border-b-2 border-border bg-border" />
            </View>
            <TouchableOpacity
              className="flex-row items-center justify-center gap-3 border border-gray-300 py-4 rounded-xl"
              onPress={handleGoogleSignUp}
              disabled={isLoading}
            >
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

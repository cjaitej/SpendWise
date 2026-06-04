import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Renamed to avoid clashing with context's isLoading
  const router = useRouter();

  const { updatePassword, signOut, user, isLoading } = useAuth();

  useEffect(() => {
    // Auth Guard: If the session finishes loading and there is no user,
    // they arrived here without a valid link. Kick them out.
    if (!isLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, isLoading]);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasNoSpaces = !/\s/.test(password);
  const hasOnlyAscii = /^[\x20-\x7E]+$/.test(password);
  const passMatches = confirmPassword !== "" && confirmPassword === password;

  const isFormValid =
    hasMinLength &&
    hasNumber &&
    hasSpecial &&
    hasNoSpaces &&
    hasOnlyAscii &&
    passMatches;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updatePassword(password);

      // Destroy the session so they are forced to log in with the new password.
      // This also prevents them from re-using the deep link.
      await signOut();

      Alert.alert(
        "You're all set! 🎉",
        "Your password has been updated. You can now log in with your new credentials.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  // Prevent flashing the UI before the auth guard kicks in
  if (isLoading || (!user && !isLoading)) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading secure session...</Text>
      </SafeAreaView>
    );
  }

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
              <Text className="mt-1 font-semibold text-4xl">New Password</Text>
              <Text className="text-sm text-content-sub mt-2">
                Enter your new password below to regain access to your account.
              </Text>
            </View>

            <View className="mb-5 gap-3">
              <View className="flex-row items-center rounded-2xl border border-gray-200 px-4 py-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  className="text-content-main"
                />

                <View className="ml-3 flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-content-main">
                      New Password
                    </Text>
                    <TextInput
                      editable={!isUpdating}
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
                    disabled={isUpdating}
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
                className={`flex-row items-center rounded-2xl border ${
                  passMatches
                    ? "border-primary bg-primary/10"
                    : "border-gray-200"
                }  px-4 py-3`}
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
                      editable={!isUpdating}
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
                    disabled={isUpdating}
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
              disabled={!isFormValid || isUpdating}
              className={`justify-center mt-3 items-center py-4 rounded-xl ${
                isFormValid && !isUpdating ? "bg-primary" : "bg-content-sub"
              }`}
              onPress={handleUpdate}
            >
              <Text className="text-content-white font-semibold">
                {isUpdating ? "Updating..." : "Update Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

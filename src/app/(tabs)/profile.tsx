import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { user, signOut, updateStoragePreference } = useAuth();
  const isCloud = user?.storage_preference === "cloud";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-2 gap-6">
          {/* ── Header ── */}
          <View className="mt-2">
            <Text className="text-2xl font-extrabold text-content-main tracking-tight">
              Profile
            </Text>
          </View>

          {/* ── Avatar ── */}
          <View className="items-center gap-2">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
              <Text className="text-3xl text-content-white font-extrabold">
                {user?.name[0].toUpperCase()}
              </Text>
            </View>
            <Text className="text-lg font-bold text-content-main">
              {user?.name}
            </Text>
            <View
              className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${
                isCloud ? "bg-primary-light" : "bg-surface"
              }`}
            >
              <Ionicons
                name={isCloud ? "cloud-done-outline" : "cloud-offline-outline"}
                size={13}
                color={isCloud ? "#00a878" : "#5a6a7a"}
              />
              <Text
                className={`text-xs font-semibold ${
                  isCloud ? "text-primary" : "text-content-sub"
                }`}
              >
                {isCloud ? "Backup Enabled" : "Backup Paused"}
              </Text>
            </View>
          </View>

          {/* ── Cloud Backup Settings ── */}
          <View className="gap-3 mt-2">
            <Text className="text-base font-bold text-content-main">
              Data & Backup
            </Text>

            <View className="bg-card rounded-2xl p-5 border border-border gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center ${
                      isCloud ? "bg-primary" : "bg-surface"
                    }`}
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={isCloud ? "#ffffff" : "#9aaab8"}
                    />
                  </View>
                  <View className="flex-1 pr-4">
                    <Text className="text-sm font-bold text-content-main">
                      Cloud Backup
                    </Text>
                    <Text className="text-xs text-content-muted mt-0.5">
                      Sync data across devices securely
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isCloud}
                  onValueChange={(val) =>
                    updateStoragePreference(val ? "cloud" : "device")
                  }
                  trackColor={{ false: "#e4e9f0", true: "#00a87860" }}
                  thumbColor={isCloud ? "#00a878" : "#9aaab8"}
                />
              </View>

              {!isCloud && (
                <View className="flex-row items-start gap-2 bg-danger/10 border border-danger/30 rounded-xl p-3">
                  <Ionicons
                    name="warning-outline"
                    size={15}
                    className="text-danger"
                    style={{ marginTop: 1 }}
                  />
                  <Text className="text-xs text-danger font-medium flex-1 leading-5">
                    If you uninstall the app, your transaction history will be
                    permanently lost.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Privacy Guarantee ── */}
          <View className="gap-3 mt-2">
            <Text className="text-base font-bold text-content-main">
              Privacy & Security
            </Text>

            <View className="bg-card rounded-2xl p-5 border border-border gap-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary-light items-center justify-center">
                  <Ionicons name="shield-checkmark" size={20} color="#00a878" />
                </View>
                <Text className="text-sm font-bold text-content-main flex-1">
                  Bank-Grade SMS Filtering
                </Text>
              </View>

              <Text className="text-sm text-content-sub leading-5">
                We <Text className="font-bold text-content-main">never</Text>{" "}
                store direct SMS, OTPs, or any sensitive data.
              </Text>

              <View className="flex-row items-start gap-2 bg-surface rounded-xl p-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#5a6a7a"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-xs text-content-muted flex-1 leading-5">
                  Our algorithm strictly uses government-approved patterns to
                  filter and read{" "}
                  <Text className="font-bold text-content-sub">ONLY</Text> bank
                  transaction messages. Your personal messages are completely
                  ignored and can never be read.
                </Text>
              </View>
            </View>
          </View>

          {/* ── Sign Out ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            className="bg-card rounded-2xl py-4 items-center flex-row justify-center gap-2 border border-danger/30 mt-4"
            onPress={signOut}
          >
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text className="text-danger text-sm font-bold tracking-wide">
              Sign Out
            </Text>
          </TouchableOpacity>

          {/* ── Version ── */}
          <Text className="text-center text-xs text-content-muted font-medium pb-2">
            Version 1.0.0 · Made with ♥ in India
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

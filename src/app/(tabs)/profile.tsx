import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StorageType = "cloud" | "device";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [selectedStorage, setSelectedStorage] = useState<StorageType>("cloud");
  const [smsPermission, setSmsPermission] = useState(true);

  const isCloud = selectedStorage === "cloud";

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
              className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${isCloud ? "bg-primary-light" : "bg-surface"}`}
            >
              <Ionicons
                name={isCloud ? "cloud-outline" : "phone-portrait-outline"}
                size={13}
                color={isCloud ? "#00a878" : "#5a6a7a"}
              />
              <Text
                className={`text-xs font-semibold ${isCloud ? "text-primary" : "text-content-sub"}`}
              >
                {isCloud ? "Cloud Storage" : "On-Device Storage"}
              </Text>
            </View>
          </View>

          {/* ── Storage Selection ── */}
          <View className="gap-3">
            <View>
              <Text className="text-base font-bold text-content-main">
                Data Storage
              </Text>
              <Text className="text-sm text-content-muted mt-0.5 font-medium">
                Choose how your transaction data is stored
              </Text>
            </View>

            {/* Cloud Card */}
            <TouchableOpacity
              onPress={() => setSelectedStorage("cloud")}
              activeOpacity={0.85}
              className={`rounded-2xl p-5 border-2 ${
                isCloud
                  ? "bg-primary-light border-primary"
                  : "bg-card border-border"
              }`}
            >
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center ${isCloud ? "bg-primary" : "bg-surface"}`}
                  >
                    <Ionicons
                      name="cloud-outline"
                      size={20}
                      color={isCloud ? "#ffffff" : "#9aaab8"}
                    />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-content-main">
                      Cloud Storage
                    </Text>
                    <Text className="text-xs text-content-muted font-medium mt-0.5">
                      Full features, privacy-first
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mt-0.5 ${isCloud ? "border-primary" : "border-border"}`}
                >
                  {isCloud && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </View>
              </View>

              <View className="gap-2.5">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-5 h-5 rounded-md bg-ai-light items-center justify-center mt-0.5 shrink-0">
                    <Ionicons
                      name="sparkles-outline"
                      size={12}
                      color="#7c3aed"
                    />
                  </View>
                  <Text className="text-sm font-semibold text-ai-primary flex-1 leading-5">
                    AI Assistant enabled
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-5 h-5 rounded-md bg-surface items-center justify-center mt-0.5 shrink-0">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={12}
                      color="#5a6a7a"
                    />
                  </View>
                  <Text className="text-sm text-content-sub font-medium flex-1 leading-5">
                    Only stores merchant name, amount, transaction type &
                    category
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-5 h-5 rounded-md bg-surface items-center justify-center mt-0.5 shrink-0">
                    <Ionicons
                      name="close-circle-outline"
                      size={12}
                      color="#5a6a7a"
                    />
                  </View>
                  <Text className="text-sm text-content-sub font-medium flex-1 leading-5">
                    Never reads OTPs, account numbers or any sensitive data
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-5 h-5 rounded-md bg-surface items-center justify-center mt-0.5 shrink-0">
                    <Ionicons name="sync-outline" size={12} color="#5a6a7a" />
                  </View>
                  <Text className="text-sm text-content-sub font-medium flex-1 leading-5">
                    Data stays safe even if you reinstall the app
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* On-Device Card */}
            <TouchableOpacity
              onPress={() => setSelectedStorage("device")}
              activeOpacity={0.85}
              className={`rounded-2xl p-5 border-2 ${
                !isCloud
                  ? "bg-primary-light border-primary"
                  : "bg-card border-border"
              }`}
            >
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center ${!isCloud ? "bg-primary" : "bg-surface"}`}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={20}
                      color={!isCloud ? "#ffffff" : "#9aaab8"}
                    />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-content-main">
                      On-Device Storage
                    </Text>
                    <Text className="text-xs text-content-muted font-medium mt-0.5">
                      100% offline, no AI
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mt-0.5 ${!isCloud ? "border-primary" : "border-border"}`}
                >
                  {!isCloud && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </View>
              </View>

              <View className="gap-2.5">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-5 h-5 rounded-md bg-surface items-center justify-center mt-0.5 shrink-0">
                    <Ionicons
                      name="close-circle-outline"
                      size={12}
                      color="#9aaab8"
                    />
                  </View>
                  <Text className="text-sm text-content-muted font-medium flex-1 leading-5">
                    No AI Assistant
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-5 h-5 rounded-md bg-surface items-center justify-center mt-0.5 shrink-0">
                    <Ionicons
                      name="lock-closed-outline"
                      size={12}
                      color="#5a6a7a"
                    />
                  </View>
                  <Text className="text-sm text-content-sub font-medium flex-1 leading-5">
                    Merchant name, amount, type & category stay on your phone
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-5 h-5 rounded-md bg-surface items-center justify-center mt-0.5 shrink-0">
                    <Ionicons name="wifi-outline" size={12} color="#5a6a7a" />
                  </View>
                  <Text className="text-sm text-content-sub font-medium flex-1 leading-5">
                    Works fully offline — nothing leaves your device
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <View className="w-5 h-5 rounded-md bg-surface items-center justify-center mt-0.5 shrink-0">
                    <Ionicons
                      name="warning-outline"
                      size={12}
                      color="#5a6a7a"
                    />
                  </View>
                  <Text className="text-sm text-content-sub font-medium flex-1 leading-5">
                    All data is lost if you uninstall the app
                  </Text>
                </View>
              </View>

              {!isCloud && (
                <View className="flex-row items-start gap-2 bg-danger/10 border border-danger/30 rounded-xl p-3 mt-4">
                  <Ionicons
                    name="warning-outline"
                    size={15}
                    className="text-danger"
                    style={{ marginTop: 1 }}
                  />
                  <Text className="text-xs text-danger font-medium flex-1 leading-5">
                    If you uninstall and reinstall the app, all your transaction
                    history will be permanently deleted.
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── What we collect ── */}
          <View className="bg-card rounded-2xl p-5 border border-border gap-3">
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-xl bg-primary-light items-center justify-center">
                <Ionicons name="eye-outline" size={16} color="#00a878" />
              </View>
              <Text className="text-sm font-bold text-content-main">
                What we read from your SMS
              </Text>
            </View>
            <Text className="text-xs text-content-sub font-medium leading-5">
              We only extract these 4 fields from your bank messages. OTPs,
              account numbers, and any other sensitive data are{" "}
              <Text className="text-danger font-bold">never read</Text>.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["Merchant name", "Amount", "Transaction type", "Category"].map(
                (item) => (
                  <View
                    key={item}
                    className="bg-primary-light rounded-full px-3 py-1"
                  >
                    <Text className="text-xs text-primary font-semibold">
                      {item}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>

          {/* ── App Settings ── */}
          <View className="gap-3">
            <Text className="text-base font-bold text-content-main">
              App Settings
            </Text>

            <View className="bg-card rounded-2xl px-4 py-3.5 flex-row items-center justify-between border border-border">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-xl bg-info/10 items-center justify-center">
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color="#3b82f6"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-content-main">
                    SMS Permission
                  </Text>
                  <Text className="text-xs text-content-muted mt-0.5">
                    Required to auto-detect transactions
                  </Text>
                </View>
              </View>
              <Switch
                value={smsPermission}
                onValueChange={setSmsPermission}
                trackColor={{ false: "#e4e9f0", true: "#00a87860" }}
                thumbColor={smsPermission ? "#00a878" : "#9aaab8"}
              />
            </View>
          </View>

          {/* ── Sign Out ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            className="bg-card rounded-2xl py-4 items-center flex-row justify-center gap-2 border border-danger/30"
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

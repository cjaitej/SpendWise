import { Ionicons } from "@expo/vector-icons";
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

interface Message {
  user: string;
  message: string;
}

function ChatBox({ chat }: { chat: Message[] }) {
  return (
    <View className="flex-1 gap-3 mt-5">
      {chat.map((item, index) => (
        <View
          key={index}
          className={`p-3 rounded-2xl ${
            item.user === "AI"
              ? "bg-primary self-start"
              : "bg-card border border-border self-end"
          }`}
        >
          <Text
            className={`${
              item.user === "AI" ? "text-white" : "text-content-main"
            }`}
          >
            {item.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function Aiassist() {
  const suggestions = [
    "Where did I overspend this month?",
    "How much did I spend on food?",
    "Predict my month-end balance",
    "Show my top 5 expenses",
    "Find recurring subscriptions",
  ];

  const [message, setMessage] = useState<string>("");
  const [disableSend, setDisableSend] = useState<boolean>(false);

  const [chat, setChat] = useState<Message[]>([]);

  const handleSend = (customMessage?: string) => {
    const finalMessage = customMessage || message;

    setDisableSend(true);
    if (!finalMessage.trim()) return;

    const userMessage: Message = {
      user: "user",
      message: finalMessage,
    };

    const AIMessage: Message = {
      user: "AI",
      message: "I am Offline righitnow. Please Try Again Later.",
    };

    setChat((prev) => [...prev, userMessage, AIMessage]);

    setMessage("");

    setDisableSend(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 gap-1 px-5 pt-5">
          <View className="flex-row justify-between items-center">
            <View className="flex-row gap-2 items-center">
              <Ionicons name="sparkles" size={18} color="#7c3aed" />
              <Text className="text-xl font-semibold">AI Assistant</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setChat([]);
                setDisableSend(true);
              }}
            >
              <Ionicons name="create-outline" size={16} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {chat.length > 0 ? (
              <ChatBox chat={chat} />
            ) : (
              <View className="flex-1 justify-center mt-30">
                <Text className="text-content-main text-3xl font-semibold">
                  Hi, Jaitej! 👋
                </Text>

                <Text className="text-content-main text-xl font-semibold max-w-[250px] mt-2 mb-10">
                  How can I help you with your finances today?
                </Text>

                <View className="flex gap-2">
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      className="flex-row justify-between items-center p-4 border border-border rounded-full bg-card"
                      onPress={() => handleSend(item)}
                    >
                      <Text className="text-base font-normal">{item}</Text>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        className="text-primary"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View className="pb-5 items-center gap-1 bg-card">
            <View className="flex-row justify-between items-center pl-4 pr-2 py-1 border border-border rounded-full bg-content-main/90">
              <TextInput
                placeholder="Ask anything about your finances..."
                placeholderTextColor="#9aaab8"
                className="flex-1 text-card"
                value={message}
                onChangeText={(txt) => setMessage(txt)}
              />

              <TouchableOpacity
                disabled={disableSend}
                className={`${disableSend ? "bg-content-muted" : "bg-primary"} w-11 h-11 rounded-full items-center justify-center`}
                onPress={() => handleSend()}
              >
                <Ionicons name="arrow-up" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-center">
              <Ionicons name="information-circle" size={15} color="#5a6a7a" />

              <Text className="text-sm text-content-sub ml-1">
                AI can make mistake. Verify important info.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

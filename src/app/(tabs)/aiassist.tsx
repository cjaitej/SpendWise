import { transactions } from "@/constants/transactions";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
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

function formatAIMessage(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // remove markdown bold
    .replace(/\*/g, "•") // bullets
    .replace(/\n{2,}/g, "\n\n") // clean spacing
    .trim();
}

function Dot({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.timing(translateY, {
          toValue: -6,
          duration: 250,
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay, translateY]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
      }}
      className="w-2 h-2 rounded-full bg-white"
    />
  );
}

export function ChatLoading() {
  return (
    <View className="px-4 py-5 rounded-2xl bg-primary self-start flex-row gap-2">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}

function ChatBox({ chat }: { chat: Message[] }) {
  return (
    <View className="flex-1 gap-3 mt-5">
      {chat.map((item, index) => (
        <View
          key={index}
          className={`p-3 rounded-2xl max-w-85 border ${
            item.user === "AI"
              ? "bg-primary self-start border-primary"
              : "bg-card border-border self-end"
          }`}
        >
          <Text
            className={`leading-6 text-base ${
              item.user === "AI"
                ? "text-white font-medium"
                : "text-content-main"
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
  const [aiMessageLoading, setAIMessageLoading] = useState<boolean>(false);
  const [chat, setChat] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (customMessage?: string) => {
    const finalMessage = customMessage || message;

    if (!finalMessage.trim()) return;

    setDisableSend(true);

    const userMessage: Message = {
      user: "user",
      message: finalMessage,
    };

    // instantly show user message
    setChat((prev) => [...prev, userMessage]);

    setMessage("");
    setAIMessageLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: finalMessage,
          history: chat,
          transactions: transactions,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        user: "AI",
        message: formatAIMessage(data.message),
      };

      setChat((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.log(err);

      const errorMessage: Message = {
        user: "AI",
        message: "Something went wrong.",
      };

      setChat((prev) => [...prev, errorMessage]);
    }
    setAIMessageLoading(false);
    setDisableSend(false);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({
      animated: true,
    });
  }, [chat, aiMessageLoading]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 gap-1 px-5">
          <View className="flex-row justify-between items-center">
            <View className="flex-row gap-2 items-center">
              <Ionicons name="sparkles" size={18} color="#7c3aed" />
              <Text className="text-xl font-semibold">AI Assistant</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setChat([]);
                setDisableSend(false);
              }}
            >
              <Ionicons name="duplicate-outline" size={18} className="p-2" />
            </TouchableOpacity>
          </View>
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            {chat.length > 0 ? (
              <ChatBox chat={chat} />
            ) : (
              <View className="flex-1 justify-center mt-30">
                <Text className="text-content-main text-3xl font-semibold">
                  Hi, Jaitej! 👋
                </Text>

                <Text className="text-content-main text-xl font-semibold max-w-62.5 mt-2 mb-10">
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
            {aiMessageLoading ? <ChatLoading /> : null}
          </ScrollView>

          {/* Updated Input Container */}
          <View className="pb-5 items-center gap-1 bg-card">
            <View className="flex-row justify-between items-center pl-4 pr-2 py-1 border border-border rounded-full bg-surface shadow-sm w-full">
              <TextInput
                placeholder="Ask anything..."
                placeholderTextColor="#9aaab8"
                className="flex-1 text-content-main text-base"
                value={message}
                onChangeText={(txt) => setMessage(txt)}
                onSubmitEditing={() => handleSend()}
              />

              <TouchableOpacity
                disabled={disableSend}
                className={`${disableSend ? "bg-content-muted" : "bg-primary"} w-11 h-11 rounded-full items-center justify-center`}
                onPress={() => handleSend()}
              >
                <Ionicons name="arrow-up" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-center mt-1">
              <Ionicons name="information-circle" size={15} color="#5a6a7a" />
              <Text className="text-sm text-content-sub ml-1">
                AI can make mistakes. Verify important info.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

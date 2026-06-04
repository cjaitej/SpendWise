import { useAuth } from "@/context/AuthContext";
import { useTransaction } from "@/context/FinanceContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "Food", icon: "fast-food" },
  { id: "Shopping", icon: "bag" },
  { id: "Travel", icon: "car" },
  { id: "Education", icon: "school" },
  { id: "Finance", icon: "card" },
  { id: "Others", icon: "apps" },
];

export default function AddTransactionModal({
  visible,
  onClose,
}: AddTransactionModalProps) {
  const { user } = useAuth();
  const { createTransactions } = useTransaction();

  const [amount, setAmount] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [transactionType, setTransactionType] = useState<"debit" | "credit">(
    "debit",
  );
  const [category, setCategory] = useState("Others");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setAmount("");
    setMerchantName("");
    setTransactionType("debit");
    setCategory("Others");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTransaction = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);

      const transaction = {
        user_id: user?.id,
        amount: parsedAmount,
        transaction_type: transactionType,
        category: category,
        merchant_name:
          merchantName.trim() === "" ||
          merchantName.trim().toUpperCase() === "UNK"
            ? null
            : merchantName.trim(),
        transaction_date: new Date().toISOString(), // Today's date
        source: "manual" as const, // Hardcoded as manual entry
        is_auto_detected: false,
        source_sms_id: null,
      };

      // Passed as an array containing the single transaction
      await createTransactions([transaction]);

      handleClose();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1 }} className="bg-background">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 pt-4">
            <Text className="text-2xl font-semibold text-content-main">
              Add <Text className="text-primary font-bold">Transaction</Text>
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 bg-gray-200 rounded-full"
            >
              <Ionicons name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 mt-4"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-sm font-semibold text-content-sub mb-2">
              Amount
            </Text>
            <View className="bg-card border border-border rounded-2xl px-4 py-3 flex-row items-center mb-6">
              <Text className="text-xl font-bold text-primary mr-2">₹</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#9aaab8"
                className="flex-1 text-xl font-bold text-content-main"
                style={{ paddingVertical: 0 }}
              />
            </View>

            {/* Merchant Name Input */}
            <Text className="text-sm font-semibold text-content-sub mb-2">
              Merchant Name (Optional)
            </Text>
            <View className="bg-card border border-border rounded-2xl px-4 py-3 flex-row items-center mb-6">
              <Ionicons
                name="storefront-outline"
                size={20}
                color="#9aaab8"
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={merchantName}
                onChangeText={setMerchantName}
                placeholder="e.g. Starbucks, Amazon"
                placeholderTextColor="#9aaab8"
                className="flex-1 text-base text-content-main"
                style={{ paddingVertical: 0 }}
              />
            </View>

            {/* Transaction Type Toggle */}
            <Text className="text-sm font-semibold text-content-sub mb-2">
              Type
            </Text>
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={() => setTransactionType("debit")}
                className={`flex-1 py-3 rounded-xl flex-row justify-center items-center gap-2 border ${
                  transactionType === "debit"
                    ? "bg-red-50 border-red-500"
                    : "bg-card border-border"
                }`}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={20}
                  color={transactionType === "debit" ? "#ef4444" : "#9aaab8"}
                />
                <Text
                  className={`font-semibold ${transactionType === "debit" ? "text-red-500" : "text-content-sub"}`}
                >
                  Expense (Debit)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTransactionType("credit")}
                className={`flex-1 py-3 rounded-xl flex-row justify-center items-center gap-2 border ${
                  transactionType === "credit"
                    ? "bg-green-50 border-primary"
                    : "bg-card border-border"
                }`}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={20}
                  color={transactionType === "credit" ? "#00a878" : "#9aaab8"}
                />
                <Text
                  className={`font-semibold ${transactionType === "credit" ? "text-primary" : "text-content-sub"}`}
                >
                  Income (Credit)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Categories Selection */}
            <Text className="text-sm font-semibold text-content-sub mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full border ${
                      isSelected
                        ? "bg-primary-light border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color={isSelected ? "#00a878" : "#9aaab8"}
                    />
                    <Text
                      className={`font-medium ${isSelected ? "text-primary" : "text-content-sub"}`}
                    >
                      {cat.id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Add Button */}
          <View className="px-5 pb-4 pt-2 bg-background border-t border-border">
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center justify-center ${
                amount && !isLoading ? "bg-primary-dark" : "bg-gray-300"
              }`}
              onPress={handleAddTransaction}
              disabled={!amount || isLoading}
            >
              <Text
                className={`text-base font-semibold ${
                  amount && !isLoading ? "text-content-white" : "text-gray-500"
                }`}
              >
                {isLoading ? "Saving..." : "Add Transaction"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

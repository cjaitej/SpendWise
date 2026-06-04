import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AddTransactionModal from "../components/addTransaction";
import BudgetAllocationModal from "../components/setBudget";
import WipModal from "../components/workinProgress";
import Index from "./smsModal";

interface Props {
  iconName: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
  to?: any;
  onPress?: () => void;
}

function QuickActionsCard({ iconName, text, color, to, onPress }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (to) {
      router.push(to);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-22.5 justify-center items-center bg-card py-4 rounded-2xl border border-border gap-2"
    >
      <Ionicons name={iconName} size={40} className={color} />

      <Text className="text-[9px] font-semibold text-content-main text-center">
        {text}
      </Text>
    </TouchableOpacity>
  );
}

export default function QuickActions() {
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showWipModal, setShowWipModal] = useState(false);

  return (
    <View className="gap-3">
      <Text className="text-content-main font-bold text-lg">Quick Actions</Text>

      <View className="flex-row justify-between">
        <QuickActionsCard
          iconName="sync-outline"
          text="Sync SMS"
          color="text-success"
          onPress={() => setShowSmsModal(true)}
        />

        {showSmsModal && <Index onClose={() => setShowSmsModal(false)} />}

        <QuickActionsCard
          iconName="scan-outline"
          text="Scan Receipt"
          color="text-entertainment"
          onPress={() => setShowWipModal(true)}
        />

        <QuickActionsCard
          iconName="receipt-outline"
          text="Add Expense"
          color="text-shopping"
          onPress={() => setShowAddExpenseModal(true)}
        />

        <QuickActionsCard
          iconName="wallet-outline"
          text="Set Budget"
          color="text-food"
          onPress={() => setShowBudgetModal(true)}
        />

        <AddTransactionModal
          visible={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
        />

        <BudgetAllocationModal
          visible={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
        />

        <WipModal
          visible={showWipModal}
          onClose={() => setShowWipModal(false)}
        />
      </View>
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  iconName: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
};

function QuickActionsCard({ iconName, text, color }: Props) {
  return (
    <TouchableOpacity className="w-22.5 justify-center items-center bg-card py-4 rounded-2xl border border-border gap-2">
      <Ionicons name={iconName} size={40} className={color} />

      <Text className="text-[9px] font-semibold text-content-main text-center">
        {text}
      </Text>
    </TouchableOpacity>
  );
}

export default function QuickActions() {
  return (
    <View className="gap-3">
      <Text className="text-content-main font-bold text-lg">Quick Actions</Text>

      <View className="flex-row justify-between">
        <QuickActionsCard
          iconName="chatbubble-ellipses-outline"
          text="Ask AI"
          color="text-success"
        />

        <QuickActionsCard
          iconName="scan-outline"
          text="Scan Receipt"
          color="text-entertainment"
        />

        <QuickActionsCard
          iconName="receipt-outline"
          text="Add Expense"
          color="text-shopping"
        />

        <QuickActionsCard
          iconName="wallet-outline"
          text="Set Budget"
          color="text-food"
        />
      </View>
    </View>
  );
}

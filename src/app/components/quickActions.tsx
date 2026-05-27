import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  iconName: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
  to: any;
};

function QuickActionsCard({ iconName, text, color, to }: Props) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(to)}
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
  return (
    <View className="gap-3">
      <Text className="text-content-main font-bold text-lg">Quick Actions</Text>

      <View className="flex-row justify-between">
        <QuickActionsCard
          iconName="chatbubble-ellipses-outline"
          text="Ask AI"
          color="text-success"
          to="/(tabs)/aiassist"
        />

        <QuickActionsCard
          iconName="scan-outline"
          text="Scan Receipt"
          color="text-entertainment"
          to="/(tabs)/aiassist"
        />

        <QuickActionsCard
          iconName="receipt-outline"
          text="Add Expense"
          color="text-shopping"
          to="/(tabs)/aiassist"
        />

        <QuickActionsCard
          iconName="wallet-outline"
          text="Set Budget"
          color="text-food"
          to="/(tabs)/aiassist"
        />
      </View>
    </View>
  );
}

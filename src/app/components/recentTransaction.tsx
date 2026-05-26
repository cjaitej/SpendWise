import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import TransactionCard from "./transactionCard";

export default function RecentTransactions() {
  return (
    <View>
      <View className="flex-row justify-between">
        <Text className="text-content-main font-bold text-lg">
          Recent Transaction
        </Text>

        <TouchableOpacity className="flex-row gap-1 items-center ">
          <Text className="text-content-main font-medium text-base">
            View all
          </Text>

          <Ionicons
            name="chevron-forward"
            size={14}
            classname="text-content-main"
          />
        </TouchableOpacity>
      </View>

      <TransactionCard
        title="Swiggy"
        amount={450}
        category="Food"
        time="Today, 8:45 PM"
        credited={false}
      />
      <TransactionCard
        title="Zomato"
        amount={450}
        category="Food"
        time="Today, 8:45 PM"
        credited={true}
      />
      <TransactionCard
        title="Amazon"
        amount={450}
        category="Food"
        time="Today, 8:45 PM"
        credited={true}
      />
    </View>
  );
}

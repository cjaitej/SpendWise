import { transactions } from "@/constants/transactions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import TransactionCard from "./transactionCard";

export default function RecentTransactions() {
  const router = useRouter();

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const todayTransaction = transactions.filter(
    (item) => new Date(item.date).toISOString().split("T")[0] === todayString,
  );

  function handleTime(dateString: string) {
    const time = new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
    return time;
  }

  return (
    <View>
      <View className="flex-row justify-between">
        <Text className="text-content-main font-bold text-lg">
          Recent Transaction
        </Text>

        <TouchableOpacity
          className="flex-row gap-1 items-center "
          onPress={() => {
            router.push("/(tabs)/transactions");
          }}
        >
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

      <View className="flex-1 gap-4">
        {todayTransaction.length < 1 ? (
          <Text className="text-sm mt-10 text-center">
            No Recent Transaction
          </Text>
        ) : (
          todayTransaction.map((item, index) => (
            <TransactionCard
              key={index}
              title={item.title}
              amount={item.amount}
              category={item.category}
              time={handleTime(item.date)}
              credited={item.credited}
            />
          ))
        )}
      </View>
    </View>
  );
}

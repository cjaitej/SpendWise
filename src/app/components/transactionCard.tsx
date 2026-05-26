import getIconBg from "@/constants/colors";
import { Text, View } from "react-native";

type TransactionCardProps = {
  title: string;
  amount: number;
  category: string;
  time: string;
  credited: boolean;
};

export default function TransactionCard({
  title,
  amount,
  category,
  time,
  credited,
}: TransactionCardProps) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-divider">
      <View className="flex-row items-center gap-3">
        <View
          style={{ backgroundColor: getIconBg(title) }}
          className={`w-12 h-12 rounded-2xl items-center justify-center`}
        >
          <Text className="text-content-white text-[18px] font-bold">
            {title.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View>
          <Text className="text-content-main text-[16px] font-semibold">
            {title}
          </Text>

          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-content-sub text-[13px]">{time}</Text>

            <View className="w-1 h-1 rounded-full bg-content-muted" />

            <Text className="text-content-sub text-[13px]">{category}</Text>
          </View>
        </View>
      </View>

      <Text className="text-content-main text-[17px] font-semibold">
        {credited ? "+" : "-"} ₹{amount}
      </Text>
    </View>
  );
}

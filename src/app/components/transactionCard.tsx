import getIconBg from "@/constants/colors";
import { Text, View } from "react-native";

type TransactionCardProps = {
  title: string;
  amount: number;
  category: string;
  time: string;
  credited: string;
};

export default function TransactionCard({
  title,
  amount,
  category,
  time,
  credited,
}: TransactionCardProps) {
  const isCredit = credited === "credit";
  const displayTitle = title || "Unknown";

  return (
    <View className="flex-row items-center justify-between py-4 border-b border-divider">
      {/* Added flex-1 to the left container to allow shrinking */}
      <View className="flex-row items-center gap-3 flex-1 pr-4">
        <View
          style={{ backgroundColor: getIconBg(displayTitle) }}
          className="w-12 h-12 rounded-2xl items-center justify-center shrink-0"
        >
          <Text className="text-content-white text-[18px] font-bold">
            {displayTitle.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Added flex-1 so the text container knows when to truncate */}
        <View className="flex-1">
          <Text
            className="text-content-main text-[16px] font-semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayTitle}
          </Text>

          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-content-sub text-[13px]">{time}</Text>
            <View className="w-1 h-1 rounded-full bg-content-muted" />
            <Text className="text-content-sub text-[13px]">{category}</Text>
          </View>
        </View>
      </View>

      <Text
        className={`text-[17px] font-semibold shrink-0 ${isCredit ? "text-primary" : "text-content-main"}`}
      >
        {isCredit ? "+" : "-"} ₹{amount.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}

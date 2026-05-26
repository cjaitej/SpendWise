import { transactions } from "@/constants/transactions";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionCard from "../components/transactionCard";

type Props = {
  transactions: typeof transactions;
  title: string;
  date: string;
  special: boolean;
};

function DateCard({ transactions, title, date, special }: Props) {
  if (special) {
    title =
      title +
      " - " +
      new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  }

  function handleTime(special: boolean, dateString: string) {
    if (special) {
      const time = new Date(dateString).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      });
      return time;
    }

    const date = new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return date;
  }

  return (
    <View>
      <Text className="text-content-sub font-semibold">{title}</Text>
      {transactions.map((item, index) => (
        <TransactionCard
          key={index}
          title={item.title}
          amount={item.amount}
          category={item.category}
          time={handleTime(special, item.date)}
          credited={item.credited}
        />
      ))}
    </View>
  );
}

function TransactionsList({
  selectedCategory,
  searchTransactions,
}: {
  selectedCategory: string;
  searchTransactions: string;
}) {
  // obtaining date if today and yesterday
  const today = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todayString = today.toISOString().split("T")[0];
  const yesterdayString = yesterday.toISOString().split("T")[0];

  // filtering the category and based on Date
  let filteredTransactions =
    selectedCategory === "All"
      ? transactions
      : transactions.filter((item) => item.category === selectedCategory);

  filteredTransactions =
    searchTransactions.trim() === ""
      ? filteredTransactions
      : filteredTransactions.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTransactions) ||
            item.category.toLowerCase().includes(searchTransactions),
        );

  const todayTransaction = filteredTransactions.filter(
    (item) => new Date(item.date).toISOString().split("T")[0] === todayString,
  );

  const yesterdayTransaction = filteredTransactions.filter(
    (item) =>
      new Date(item.date).toISOString().split("T")[0] === yesterdayString,
  );

  const groupedByMonth = filteredTransactions
    .filter((item) => {
      const date = new Date(item.date).toISOString().split("T")[0];

      return date !== todayString && date !== yesterdayString;
    })
    .reduce(
      (acc, transaction) => {
        const month = new Date(transaction.date).toLocaleString("en-IN", {
          month: "long",
          year: "numeric",
        });

        if (!acc[month]) {
          acc[month] = [];
        }

        acc[month].push(transaction);

        return acc;
      },
      {} as Record<string, typeof filteredTransactions>,
    );

  return (
    <ScrollView>
      <View className="flex gap-4">
        {todayTransaction.length <= 0 ? (
          ""
        ) : (
          <DateCard
            transactions={todayTransaction}
            title={"Today"}
            date={todayString}
            special={true}
          />
        )}
        {yesterdayTransaction.length <= 0 ? (
          ""
        ) : (
          <DateCard
            transactions={yesterdayTransaction}
            title={"Yesterday"}
            date={yesterdayString}
            special={true}
          />
        )}
        {Object.entries(groupedByMonth).map(([month, data]) => (
          <DateCard
            key={month}
            transactions={data}
            title={month}
            date={month}
            special={false}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export default function Transactions() {
  const uniqueCategories = [
    "All",
    ...new Set(transactions.map((item) => item.category)),
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTransactions, setSearchTransactions] = useState<string>("");

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 gap-4 px-5 pt-5">
        <View className="flex">
          <Text className="text-xl font-semibold">Transactions</Text>
        </View>
        <View className="gap-4">
          <View className="flex-row justify-between items-center border border-border rounded-3xl px-2 ">
            <TouchableOpacity className="w-11 h-11 rounded-full  items-center justify-center">
              <Ionicons name="search" size={20} className="text-content-sub" />
            </TouchableOpacity>
            <TextInput
              placeholder="Search transactions"
              placeholderTextColor="#9aaab8"
              className="flex-1 text-content-main text-xl"
              value={searchTransactions}
              onChangeText={(text) => setSearchTransactions(text)}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5"
            contentContainerStyle={{
              gap: 10,
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            {uniqueCategories.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`${item == selectedCategory ? "bg-primary" : "bg-surface"} border border-border py-2 px-4 rounded-xl`}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  className={`font-semibold ${item == selectedCategory ? "text-content-white" : "text-content-main"} `}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View className="mt-2">
          <TransactionsList
            selectedCategory={selectedCategory}
            searchTransactions={searchTransactions.toLowerCase()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

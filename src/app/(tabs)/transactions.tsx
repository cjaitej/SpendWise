import { Transaction, useTransaction } from "@/context/FinanceContext";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionCard from "../components/transactionCard";

function itemDateKey(dateStr: string | Date) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

type SectionHeader = { type: "header"; title: string };
type SectionItem = { type: "item"; transaction: Transaction; special: boolean };
type ListRow = SectionHeader | SectionItem;

function buildListData(
  transactions: Transaction[],
  selectedCategory: string,
  searchTransactions: string,
): ListRow[] {
  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      new Date(b.transaction_date).getTime() -
      new Date(a.transaction_date).getTime(),
  );

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayKey = itemDateKey(today);
  const yesterdayKey = itemDateKey(yesterday);

  let filtered =
    selectedCategory === "All"
      ? sortedTransactions
      : sortedTransactions.filter(
          (item) =>
            item.category?.toLowerCase() === selectedCategory.toLowerCase(),
        );

  if (searchTransactions.trim() !== "") {
    filtered = filtered.filter(
      (item) =>
        item.merchant_name?.toLowerCase().includes(searchTransactions) ||
        item.category?.toLowerCase().includes(searchTransactions),
    );
  }

  const todayItems = filtered.filter(
    (item) => itemDateKey(item.transaction_date) === todayKey,
  );
  const yesterdayItems = filtered.filter(
    (item) => itemDateKey(item.transaction_date) === yesterdayKey,
  );
  const olderItems = filtered.filter((item) => {
    const key = itemDateKey(item.transaction_date);
    return key !== todayKey && key !== yesterdayKey;
  });

  const groupedByMonth = olderItems.reduce((acc, transaction) => {
    const month = new Date(transaction.transaction_date).toLocaleString(
      "en-IN",
      { month: "long", year: "numeric" },
    );
    if (!acc.has(month)) acc.set(month, []);
    acc.get(month)!.push(transaction);
    return acc;
  }, new Map<string, Transaction[]>());

  const rows: ListRow[] = [];

  if (todayItems.length > 0) {
    rows.push({
      type: "header",
      title: `Today - ${today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    });
    todayItems.forEach((t) =>
      rows.push({ type: "item", transaction: t, special: true }),
    );
  }

  if (yesterdayItems.length > 0) {
    rows.push({
      type: "header",
      title: `Yesterday - ${yesterday.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    });
    yesterdayItems.forEach((t) =>
      rows.push({ type: "item", transaction: t, special: true }),
    );
  }

  groupedByMonth.forEach((items, month) => {
    rows.push({ type: "header", title: month });
    items.forEach((t) =>
      rows.push({ type: "item", transaction: t, special: false }),
    );
  });

  return rows;
}

export default function Transactions() {
  const { loadTransactions, loadBudget, transactions } = useTransaction();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTransactions, setSearchTransactions] = useState<string>("");

  const uniqueCategories = [
    "All",
    "Food",
    "Shopping",
    "Travel",
    "Education",
    "Finance",
    "Others",
  ];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTransactions(), loadBudget()]);
    setRefreshing(false);
  }, [loadTransactions, loadBudget]);

  const listData = useMemo(
    () =>
      buildListData(
        transactions,
        selectedCategory,
        searchTransactions.toLowerCase(),
      ),
    [transactions, selectedCategory, searchTransactions],
  );

  function renderRow({ item }: { item: ListRow }) {
    if (item.type === "header") {
      return (
        <Text className="text-content-sub font-semibold mb-1 mt-2">
          {item.title}
        </Text>
      );
    }

    const t = item.transaction;
    const time = item.special
      ? new Date(t.transaction_date).toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        })
      : new Date(t.transaction_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

    return (
      <TransactionCard
        title={t.merchant_name ?? "Unidentified"}
        amount={t.amount}
        category={t.category ?? "Others"}
        time={time}
        credited={t.transaction_type}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <FlatList
        data={listData}
        renderItem={renderRow}
        keyExtractor={(item, index) =>
          item.type === "header"
            ? `header-${item.title}`
            : `item-${item.transaction.id ?? index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View className="gap-4 mb-4 mt-2">
            <View className="flex">
              <Text className="text-xl font-semibold">Transactions</Text>
            </View>

            <View className="gap-4">
              {/* Search Bar */}
              <View className="flex-row justify-between items-center border border-border rounded-3xl px-2">
                <TouchableOpacity className="w-11 h-11 rounded-full items-center justify-center">
                  <Ionicons
                    name="search"
                    size={20}
                    className="text-content-sub"
                  />
                </TouchableOpacity>
                <TextInput
                  placeholder="Search transactions"
                  placeholderTextColor="#9aaab8"
                  className="flex-1 text-content-main text-xl"
                  value={searchTransactions}
                  onChangeText={setSearchTransactions}
                />
              </View>

              {/* Categories Selector */}
              <FlatList
                data={uniqueCategories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                style={{ marginHorizontal: -20 }}
                contentContainerStyle={{
                  gap: 10,
                  alignItems: "center",
                  paddingHorizontal: 20,
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`${item === selectedCategory ? "bg-primary" : "bg-surface"} border border-border py-2 px-4 rounded-xl`}
                    onPress={() => setSelectedCategory(item)}
                  >
                    <Text
                      className={`font-semibold ${item === selectedCategory ? "text-content-white" : "text-content-main"}`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

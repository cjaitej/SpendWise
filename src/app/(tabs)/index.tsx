import { useTransaction } from "@/context/FinanceContext";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/header";
import OverviewCard from "../components/overviewCard";
import QuickActions from "../components/quickActions";
import RecentTransactions from "../components/recentTransaction";
import RefreshableScrollView from "../components/refreshableScrollView"; // Adjust path if needed

export default function Home() {
  const { loadTransactions, loadBudget } = useTransaction();
  const handleRefresh = async (): Promise<void> => {
    await Promise.all([loadTransactions(), loadBudget()]);
  };

  return (
    <SafeAreaView edges={["top"]}>
      <RefreshableScrollView
        showsVerticalScrollIndicator={false}
        onRefreshAction={handleRefresh}
      >
        <View className="flex gap-5 px-5 pt-3">
          <Header />
          <OverviewCard />
          <QuickActions />
          <RecentTransactions />
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

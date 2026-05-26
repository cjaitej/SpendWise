import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/header";
import OverviewCard from "../components/overviewCard";
import QuickActions from "../components/quickActions";
import RecentTransactions from "../components/recentTransaction";

export default function Home() {
  return (
    <SafeAreaView className="flex" edges={["top"]}>
      <ScrollView>
        <View className="flex gap-5 px-5">
          {/* Overview Card */}
          <Header />
          <OverviewCard />
          <QuickActions />
          <RecentTransactions />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

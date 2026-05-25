import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="px-5">
          {/* Overview Card */}
          <View className="bg-[#18c29c] rounded-3xl p-4 mt-4 shadow-lg">
            {/* Header */}
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-base font-semibold">
                This Month Overview
              </Text>

              <Ionicons name="chevron-forward" size={20} color="white" />
            </View>

            {/* Middle */}
            <View className="flex-row justify-between items-center mt-4">
              <View>
                <Text className="text-white/80 text-sm">Spent</Text>

                <Text className="text-white text-3xl font-bold mt-2">
                  ₹24,560
                </Text>

                <View className="bg-white/20 self-start px-3 py-1 rounded-full mt-3">
                  <Text className="text-white text-xs font-medium">
                    ↑ 18% vs last month
                  </Text>
                </View>
              </View>

              {/* Progress Circle */}
              <View className="w-20 h-20 rounded-full border-[7px] border-white/20 items-center justify-center">
                <View
                  className="absolute w-20 h-20 rounded-full border-[7px]"
                  style={{
                    borderColor: "white",
                    borderLeftColor: "transparent",
                    borderBottomColor: "transparent",
                    transform: [{ rotate: "45deg" }],
                  }}
                />

                <Text className="text-white text-2xl font-bold">61%</Text>

                <Text className="text-white/80 text-[10px] mt-1">
                  of ₹40,000
                </Text>
              </View>
            </View>

            {/* Bottom */}
            <View className="border-t border-white/20 mt-5 pt-4 flex-row justify-between items-center">
              <View>
                <Text className="text-white/80 text-sm">Budget Left</Text>

                <Text className="text-white text-2xl font-bold mt-1">
                  ₹15,440
                </Text>
              </View>

              <TouchableOpacity className="flex-row items-center">
                <Text className="text-white text-sm font-semibold mr-1">
                  View details
                </Text>

                <Ionicons name="chevron-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Insight Card */}
          <View className="bg-white rounded-3xl p-4 mt-5 border border-gray-100 flex-row justify-between items-center">
            {/* Left */}
            <View className="flex-1 pr-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[#7c4dff] font-bold text-base">
                  AI Insight
                </Text>

                <Ionicons name="chevron-forward" size={18} color="#7c4dff" />
              </View>

              <Text className="text-gray-900 text-base font-bold mt-4 leading-6">
                You spent 18% more on Food compared to last week.
              </Text>

              <Text className="text-gray-500 text-sm mt-3 leading-5">
                Most of your spending happens after 9 PM.
              </Text>
            </View>

            {/* Icon */}
            <View className="w-16 h-16 rounded-full bg-[#f4ebff] items-center justify-center">
              <Ionicons name="sparkles" size={32} color="#7c4dff" />
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </Text>

            <View className="flex-row justify-between">
              {/* Ask AI */}
              <TouchableOpacity className="bg-white w-[22%] rounded-2xl py-4 items-center border border-gray-100">
                <View className="w-11 h-11 rounded-full bg-[#e9fff8] items-center justify-center">
                  <Ionicons
                    name="chatbubble-outline"
                    size={22}
                    color="#18c29c"
                  />
                </View>

                <Text className="text-gray-700 text-[11px] font-semibold mt-3">
                  Ask AI
                </Text>
              </TouchableOpacity>

              {/* Scan */}
              <TouchableOpacity className="bg-white w-[22%] rounded-2xl py-4 items-center border border-gray-100">
                <View className="w-11 h-11 rounded-full bg-[#f4ebff] items-center justify-center">
                  <Ionicons
                    name="scan-circle-outline"
                    size={22}
                    color="#7c4dff"
                  />
                </View>

                <Text className="text-gray-700 text-[11px] font-semibold mt-3">
                  Scan
                </Text>
              </TouchableOpacity>

              {/* Add */}
              <TouchableOpacity className="bg-white w-[22%] rounded-2xl py-4 items-center border border-gray-100">
                <View className="w-11 h-11 rounded-full bg-[#edf4ff] items-center justify-center">
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#4285f4"
                  />
                </View>

                <Text className="text-gray-700 text-[11px] font-semibold mt-3">
                  Add
                </Text>
              </TouchableOpacity>

              {/* Budget */}
              <TouchableOpacity className="bg-white w-[22%] rounded-2xl py-4 items-center border border-gray-100">
                <View className="w-11 h-11 rounded-full bg-[#fff3e8] items-center justify-center">
                  <Ionicons name="locate-outline" size={22} color="#ff8a34" />
                </View>

                <Text className="text-gray-700 text-[11px] font-semibold mt-3">
                  Budget
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Transactions */}
          <View className="bg-white rounded-3xl p-4 mt-6 border border-gray-100">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-bold text-gray-900">
                Recent Transactions
              </Text>

              <TouchableOpacity className="flex-row items-center">
                <Text className="text-gray-500 text-sm font-medium mr-1">
                  View all
                </Text>

                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Swiggy */}
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-[#ffedd5] items-center justify-center">
                  <Ionicons name="fast-food" size={22} color="#f97316" />
                </View>

                <View className="ml-3">
                  <Text className="text-gray-900 font-bold text-base">
                    Swiggy
                  </Text>

                  <Text className="text-gray-500 text-sm mt-1">
                    Today, 8:45 PM • Food
                  </Text>
                </View>
              </View>

              <Text className="text-gray-900 font-bold text-base">- ₹450</Text>
            </View>

            {/* Uber */}
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-black items-center justify-center">
                  <Ionicons name="car" size={22} color="white" />
                </View>

                <View className="ml-3">
                  <Text className="text-gray-900 font-bold text-base">
                    Uber
                  </Text>

                  <Text className="text-gray-500 text-sm mt-1">
                    Today, 7:10 PM • Travel
                  </Text>
                </View>
              </View>

              <Text className="text-gray-900 font-bold text-base">- ₹220</Text>
            </View>

            {/* Amazon */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-[#f3f4f6] items-center justify-center">
                  <Ionicons name="cart" size={22} color="#111827" />
                </View>

                <View className="ml-3">
                  <Text className="text-gray-900 font-bold text-base">
                    Amazon
                  </Text>

                  <Text className="text-gray-500 text-sm mt-1">
                    Today, 12:30 PM • Shopping
                  </Text>
                </View>
              </View>

              <Text className="text-gray-900 font-bold text-base">- ₹999</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

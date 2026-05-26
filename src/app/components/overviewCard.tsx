import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export default function OverviewCard() {
  return (
    <View className="flex bg-primary rounded-2xl p-5 gap-3">
      {/* Top Section */}

      <Text className="text-content-white font-medium  text-base">
        This Month Overview
      </Text>

      <View className="flex-row justify-between items-center">
        <View>
          <View className="flex gap-2">
            <Text className="text-content-white font-medium text-base">
              Spent
            </Text>

            <Text className="text-content-white font-bold text-4xl">
              ₹ 24,560
            </Text>

            <View className="flex-row items-center gap-1 bg-primary-dark rounded-2xl p-2">
              <Ionicons name="trending-up" size={14} color="white" />
              <Text className="text-content-white text-sm font-medium">
                18% vs last month
              </Text>
            </View>
          </View>
        </View>

        {/* Circular Progress */}

        <AnimatedCircularProgress
          size={115}
          width={10}
          fill={61}
          tintColor="#ffffff"
          backgroundColor="rgba(255,255,255,0.2)"
          rotation={0}
          arcSweepAngle={360}
          lineCap="round"
        >
          {() => (
            <View className="flex items-center">
              <Text className="text-content-white">61%</Text>

              <Text className="text-content-white">of ₹40,000</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      {/* Bottom Section */}

      <View className="flex-row justify-between items-end border-t border-background/20 pt-3">
        <View>
          <Text className="text-content-white font-medium text-base">
            Budget Left
          </Text>

          <Text className="text-content-white font-semibold text-3xl">
            ₹15,440
          </Text>
        </View>

        <TouchableOpacity className="flex-row gap-1 items-center ">
          <Text className="text-content-white font-medium text-base">
            View details
          </Text>

          <Ionicons name="chevron-forward" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

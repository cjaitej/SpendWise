import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView>
      <View>
        <View>
          <Text>This Month Overview</Text>
          <View>
            <View>
              <Text>Spent</Text>
              <Text>₹ 9,687</Text>
              <Text>last month vs This Month</Text>
            </View>
            <View>
              <Text>Progress bar</Text>
            </View>
          </View>
          <View>
            <View>
              <Text>Budget Left</Text>
              <Text>₹ 10,000</Text>
            </View>
            <TouchableOpacity>
              <Text>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

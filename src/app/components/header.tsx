import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const { user } = useAuth();

  const displayName = user?.name || "Amigo";

  return (
    <View className="flex-row items-center justify-between pt-3">
      <Text className="text-content-main text-2xl">
        Hola, <Text className="font-extrabold">{displayName}</Text> 👋
      </Text>

      <TouchableOpacity className="w-11 h-11 rounded-full border border-border items-center justify-center bg-surface">
        <Ionicons name="notifications" size={22} className="text-warning" />
      </TouchableOpacity>
    </View>
  );
}

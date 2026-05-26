import { Text, View } from "react-native";

export default function Header() {
  return (
    <View className="flex-row pt-3">
      <Text className="text-content-main text-2xl">Hola, </Text>
      <Text className="text-content-main text-2xl font-extrabold">
        Jaitej 👋
      </Text>
    </View>
  );
}

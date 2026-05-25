import { StyleSheet, Text, View } from "react-native";

export default function Aiassist() {
  return (
    <View style={styles.container}>
      <Text>Ai Assist Page.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

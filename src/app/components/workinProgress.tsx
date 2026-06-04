import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WipModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WipModal({ visible, onClose }: WipModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1 }} className="bg-background">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-4">
          <Text className="text-2xl font-semibold text-content-main">
            Coming <Text className="text-primary font-bold">Soon</Text>
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 bg-gray-200 rounded-full"
          >
            <Ionicons name="close" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-5 pb-20">
          <View className="bg-primary-light p-6 rounded-full mb-6">
            <Ionicons name="construct-outline" size={64} color="#00a878" />
          </View>

          <Text className="text-2xl font-bold text-content-main mb-2 text-center">
            Work in Progress
          </Text>

          <Text className="text-base text-content-sub text-center px-4 leading-6">
            We are actively building this feature. Check back soon for updates!
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className="mt-8 bg-card border border-border px-8 py-3 rounded-2xl"
          >
            <Text className="text-content-main font-semibold text-base">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

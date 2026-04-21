import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

type ImageViewerModalProps = {
  imageUrl: string;
  visible: boolean;
  onClose: () => void;
};

const { width, height } = Dimensions.get("window");

export default function ImageViewerModal({
  imageUrl,
  visible,
  onClose,
}: ImageViewerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <View style={styles.overlay}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={12}>
          <View style={styles.closeCircle}>
            <Ionicons name="close" size={20} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* Fullscreen image — tap outside to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width,
    height,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(15,20,25,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
});
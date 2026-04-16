import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

type StoryProps = {
  story: {
    id: string;
    username: string;
    avatar: string;
    hasStory?: boolean;
    isOwn?: boolean;
  };
};

export default function Story({ story }: StoryProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View
        style={[
          styles.avatarWrapper,
          story.hasStory && styles.avatarWrapperActive,
        ]}
      >
        <Image source={{ uri: story.avatar }} style={styles.avatar} />

        {story.isOwn && (
          <View style={styles.addButton}>
            <Ionicons name="add" size={12} color={COLORS.white} />
          </View>
        )}
      </View>

      <Text style={styles.username} numberOfLines={1}>
        {story.isOwn ? "Ваша" : story.username}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 6,
    width: 64,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
    padding: 2,
  },
  avatarWrapperActive: {
    borderColor: COLORS.primary,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  username: {
    color: COLORS.white,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
});
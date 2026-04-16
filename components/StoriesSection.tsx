import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import Story from "./Story";
import { STORIES } from "@/constants/mock-data";
import { COLORS } from "@/constants/theme";

export default function StoriesSection() {
  return (
    <View style={styles.container}>
      <FlatList
        data={STORIES}
        renderItem={({ item }) => <Story story={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surfaceLight,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 8,
  },
});
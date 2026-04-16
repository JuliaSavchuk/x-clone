import React from "react";
import { View, FlatList, Text, TouchableOpacity } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Post from "@/components/Post";
import StoriesSection from "@/components/StoriesSection";
import Loader from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";

export default function HomeScreen() {
  const posts = useQuery(api.posts.getPosts);

  // Поки дані завантажуються — показуємо Loader
  if (posts === undefined) return <Loader />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>X Clone</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* FlatList замість ScrollView — рендерить тільки видимі елементи */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Post post={item} />}
        // Stories відображаються як header списку
        ListHeaderComponent={<StoriesSection />}
        // Якщо постів немає — показуємо повідомлення
        ListEmptyComponent={
          <View
            style={{ alignItems: "center", marginTop: 60 }}
          >
            <Ionicons
              name="images-outline"
              size={48}
              color={COLORS.grey}
            />
            <Text
              style={{ color: COLORS.grey, marginTop: 12, fontSize: 15 }}
            >
              No posts yet
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  );
}
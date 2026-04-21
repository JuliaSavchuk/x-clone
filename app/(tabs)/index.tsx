import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
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

  if (posts === undefined) return <Loader />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={headerS.xLogo}>𝕏</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="sparkles-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Post post={item} />}
        ListHeaderComponent={<StoriesSection />}
        ListEmptyComponent={
          <View style={headerS.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.grey} />
            <Text style={headerS.emptyTitle}>No posts yet</Text>
            <Text style={headerS.emptySubtitle}>
              Be the first to post something!
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const headerS = StyleSheet.create({
  xLogo: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: "900",
    lineHeight: 28,
  },
  empty: {
    alignItems: "center",
    marginTop: 72,
    gap: 10,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: COLORS.grey,
    fontSize: 15,
    textAlign: "center",
  },
});
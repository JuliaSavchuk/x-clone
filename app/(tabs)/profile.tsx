import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@clerk/expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import Loader from "@/components/Loader";
import Post from "@/components/Post";
import { COLORS } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";

const { width } = Dimensions.get("window");
const BANNER_H = 110;
const AVATAR_SIZE = 80;

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "bookmarks">("posts");

  const tabAnim = useRef(new Animated.Value(0)).current;

  const currentUser = useQuery(api.users.getCurrentUser);
  const myPosts = useQuery(api.posts.getMyPosts);
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  const switchTab = (tab: "posts" | "bookmarks") => {
    setActiveTab(tab);
    Animated.spring(tabAnim, {
      toValue: tab === "posts" ? 0 : 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  if (!currentUser) return <Loader />;

  const rawPosts = activeTab === "posts" ? myPosts : bookmarkedPosts;
  const displayedPosts = rawPosts
    ? rawPosts.filter((p): p is NonNullable<typeof p> => p != null)
    : undefined;

  const tabIndicatorX = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2],
  });

  return (
    <View style={s.container}>
      <View style={s.topHeader}>
        <View style={s.topHeaderLeft}>
          <Text style={s.topUsername}>{currentUser.username}</Text>
          <Text style={s.topPostCount}>
            {currentUser.posts} post{currentUser.posts !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} hitSlop={10} style={s.signOutBtn}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.grey} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={
          <>
            <View style={s.banner}>
              <View style={s.bannerGradient} />
            </View>

            <View style={s.avatarRow}>
              <View style={s.avatarWrapper}>
                <Image
                  source={{ uri: currentUser.image }}
                  style={s.avatar}
                  contentFit="cover"
                />
              </View>
              <TouchableOpacity style={s.editBtn} activeOpacity={0.8}>
                <Text style={s.editBtnText}>Edit profile</Text>
              </TouchableOpacity>
            </View>

            <View style={s.nameSection}>
              <Text style={s.fullname}>{currentUser.fullname}</Text>
              <Text style={s.handle}>
                @{currentUser.username?.toLowerCase().replace(/\s+/g, "")}
              </Text>
              {currentUser.bio ? (
                <Text style={s.bio}>{currentUser.bio}</Text>
              ) : null}

              <View style={s.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.grey} />
                <Text style={s.metaText}>Joined recently</Text>
              </View>

              <View style={s.followRow}>
                <View style={s.followStat}>
                  <Text style={s.followCount}>{currentUser.following}</Text>
                  <Text style={s.followLabel}> Following</Text>
                </View>
                <View style={s.followStat}>
                  <Text style={s.followCount}>{currentUser.followers}</Text>
                  <Text style={s.followLabel}> Followers</Text>
                </View>
              </View>
            </View>

            <View style={s.tabsContainer}>
              <TouchableOpacity
                style={s.tab}
                onPress={() => switchTab("posts")}
                activeOpacity={0.8}
              >
                <Text style={[s.tabLabel, activeTab === "posts" && s.tabLabelActive]}>
                  Posts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.tab}
                onPress={() => switchTab("bookmarks")}
                activeOpacity={0.8}
              >
                <Text
                  style={[s.tabLabel, activeTab === "bookmarks" && s.tabLabelActive]}
                >
                  Bookmarks
                </Text>
              </TouchableOpacity>
              <Animated.View
                style={[
                  s.tabIndicator,
                  { transform: [{ translateX: tabIndicatorX }] },
                ]}
              />
            </View>
          </>
        }
        renderItem={({ item }) => <Post post={item} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons
              name={activeTab === "posts" ? "camera-outline" : "bookmark-outline"}
              size={48}
              color={COLORS.grey}
            />
            <Text style={s.emptyTitle}>
              {activeTab === "posts" ? "No posts yet" : "No saved posts"}
            </Text>
            <Text style={s.emptySubtitle}>
              {activeTab === "posts"
                ? "Your posts will appear here"
                : "Posts you bookmark will show up here"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
    backgroundColor: COLORS.background,
  },
  topHeaderLeft: {
    gap: 1,
  },
  topUsername: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  topPostCount: {
    color: COLORS.grey,
    fontSize: 12,
  },
  signOutBtn: {
    padding: 4,
  },
  // Banner
  banner: {
    height: BANNER_H,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
  },
  // Avatar
  avatarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginTop: -(AVATAR_SIZE / 2 + 4),
    marginBottom: 12,
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: COLORS.background,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.surface,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 6,
  },
  editBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  // Name section
  nameSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 4,
  },
  fullname: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  handle: {
    color: COLORS.grey,
    fontSize: 15,
  },
  bio: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  metaText: {
    color: COLORS.grey,
    fontSize: 14,
  },
  followRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
  },
  followStat: {
    flexDirection: "row",
  },
  followCount: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  followLabel: {
    color: COLORS.grey,
    fontSize: 14,
  },
  // Tabs
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
    position: "relative",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  tabLabel: {
    color: COLORS.grey,
    fontSize: 15,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: COLORS.white,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width / 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: COLORS.grey,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
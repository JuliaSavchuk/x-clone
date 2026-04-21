import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import Loader from "@/components/Loader";
import { COLORS } from "@/constants/theme";

const { width } = Dimensions.get("window");
const BANNER_H = 110;
const AVATAR_SIZE = 80;
const GRID_GAP = 2;
const GRID_COL = 3;
const GRID_ITEM = (width - GRID_GAP * (GRID_COL - 1)) / GRID_COL;

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userId = id as Id<"users">;

  const user = useQuery(api.users.getUserProfile, { userId });
  const posts = useQuery(api.posts.getPostsByUser, { userId });
  const following = useQuery(api.users.isFollowing, { followingId: userId });
  const toggleFollow = useMutation(api.users.toggleFollow);

  const [pendingFollow, setPendingFollow] = useState<boolean | null>(null);
  const followBtnScale = useRef(new Animated.Value(1)).current;

  const isFollowing = pendingFollow !== null ? pendingFollow : (following ?? false);
  const followersCount =
    user == null
      ? 0
      : pendingFollow === null
      ? user.followers
      : pendingFollow
      ? user.followers + 1
      : Math.max(0, user.followers - 1);

  const handleToggleFollow = async () => {
    // Quick press animation
    Animated.sequence([
      Animated.timing(followBtnScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(followBtnScale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();

    const next = !isFollowing;
    setPendingFollow(next);
    try {
      await toggleFollow({ followingId: userId });
    } catch (e) {
      setPendingFollow(!next);
      console.error(e);
    }
  };

  if (!user || following === undefined) return <Loader />;

  return (
    <View style={s.container}>
      {/* ── Top header ───────────────────────────────────────────── */}
      <View style={s.topHeader}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={s.topHeaderMid}>
          <Text style={s.topName}>{user.fullname}</Text>
          <Text style={s.topPostCount}>
            {user.posts} post{user.posts !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={posts ?? []}
        keyExtractor={(item) => item._id}
        numColumns={GRID_COL}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        columnWrapperStyle={s.columnWrapper}
        ListHeaderComponent={
          <View>
            {/* Banner */}
            <View style={s.banner}>
              <View style={s.bannerOverlay} />
            </View>

            {/* Avatar + follow button row */}
            <View style={s.avatarRow}>
              <View style={s.avatarWrapper}>
                <Image
                  source={user.image}
                  style={s.avatar}
                  contentFit="cover"
                  transition={200}
                />
              </View>
              <Animated.View style={{ transform: [{ scale: followBtnScale }] }}>
                <TouchableOpacity
                  style={[
                    s.followBtn,
                    isFollowing && s.followBtnActive,
                  ]}
                  onPress={handleToggleFollow}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      s.followBtnText,
                      isFollowing && s.followBtnTextActive,
                    ]}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Name & bio */}
            <View style={s.nameSection}>
              <Text style={s.fullname}>{user.fullname}</Text>
              <Text style={s.handle}>
                @{user.username?.toLowerCase().replace(/\s+/g, "")}
              </Text>
              {user.bio ? (
                <Text style={s.bio}>{user.bio}</Text>
              ) : null}

              <View style={s.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.grey} />
                <Text style={s.metaText}>Joined recently</Text>
              </View>

              <View style={s.followStatsRow}>
                <TouchableOpacity style={s.followStat}>
                  <Text style={s.followCount}>{user.following}</Text>
                  <Text style={s.followLabel}> Following</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.followStat}>
                  <Text style={s.followCount}>{followersCount}</Text>
                  <Text style={s.followLabel}> Followers</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Posts tab header */}
            <View style={s.postsTabHeader}>
              <Text style={s.postsTabTitle}>Posts</Text>
              <View style={s.postsTabIndicator} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.gridItem}>
            {item.imageUrl ? (
              <Image
                source={item.imageUrl}
                style={s.gridImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
            ) : (
              <View style={s.textGridItem}>
                <Text style={s.textGridContent} numberOfLines={4}>
                  {item.caption}
                </Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          posts !== undefined ? (
            <View style={s.empty}>
              <Ionicons name="newspaper-outline" size={48} color={COLORS.surfaceLight} />
              <Text style={s.emptyTitle}>No posts yet</Text>
              <Text style={s.emptySubtitle}>
                When {user.username} posts, it'll show up here.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Top header
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
  backBtn: { padding: 4, width: 36 },
  topHeaderMid: { alignItems: "center", gap: 1 },
  topName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  topPostCount: { color: COLORS.grey, fontSize: 12 },

  // Banner
  banner: {
    height: BANNER_H,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surfaceLight,
    opacity: 0.6,
  },

  // Avatar row
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

  // Follow button
  followBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 6,
    minWidth: 90,
    alignItems: "center",
  },
  followBtnActive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  followBtnText: {
    color: COLORS.background,
    fontWeight: "700",
    fontSize: 15,
  },
  followBtnTextActive: { color: COLORS.white },

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
  handle: { color: COLORS.grey, fontSize: 15 },
  bio: { color: COLORS.white, fontSize: 15, lineHeight: 21, marginTop: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  metaText: { color: COLORS.grey, fontSize: 14 },
  followStatsRow: { flexDirection: "row", gap: 20, marginTop: 8 },
  followStat: { flexDirection: "row" },
  followCount: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  followLabel: { color: COLORS.grey, fontSize: 14 },

  // Posts tab
  postsTabHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
    paddingBottom: 0,
  },
  postsTabTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignSelf: "flex-start",
  },
  postsTabIndicator: {
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    width: 60,
    marginLeft: 16,
  },

  // Grid
  columnWrapper: { gap: GRID_GAP },
  gridItem: {
    width: GRID_ITEM,
    height: GRID_ITEM,
    marginBottom: GRID_GAP,
    backgroundColor: COLORS.surface,
  },
  gridImage: { width: "100%", height: "100%" },
  textGridItem: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    padding: 8,
  },
  textGridContent: { color: COLORS.white, fontSize: 11, lineHeight: 15 },

  // Empty
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: { color: COLORS.white, fontSize: 20, fontWeight: "800" },
  emptySubtitle: {
    color: COLORS.grey,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
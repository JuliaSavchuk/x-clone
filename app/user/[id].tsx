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
import Post from "@/components/Post";
import { COLORS } from "@/constants/theme";

const { width } = Dimensions.get("window");
const BANNER_H = 110;
const AVATAR_SIZE = 80;

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

  const isFollowing =
    pendingFollow !== null ? pendingFollow : (following ?? false);
  const followersCount =
    user == null
      ? 0
      : pendingFollow === null
        ? user.followers
        : pendingFollow
          ? user.followers + 1
          : Math.max(0, user.followers - 1);

  const handleToggleFollow = async () => {
    Animated.sequence([
      Animated.timing(followBtnScale, {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(followBtnScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
      }),
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
      <View style={s.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={s.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={s.topHeaderLeft}>
          <Text style={s.topUsername}>{user.fullname}</Text>
          <Text style={s.topPostCount}>
            {user.posts} post{user.posts !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={posts}
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
                  source={{ uri: user.image }}
                  style={s.avatar}
                  contentFit="cover"
                />
              </View>
              <Animated.View style={{ transform: [{ scale: followBtnScale }] }}>
                <TouchableOpacity
                  style={[
                    s.followBtn,
                    isFollowing && s.followBtnActive,
                  ]}
                  onPress={handleToggleFollow}
                  activeOpacity={0.8}
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

            <View style={s.nameSection}>
              <Text style={s.fullname}>{user.fullname}</Text>
              <Text style={s.handle}>
                @{user.username?.toLowerCase().replace(/\s+/g, "")}
              </Text>
              {user.bio ? <Text style={s.bio}>{user.bio}</Text> : null}

              <View style={s.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.grey} />
                <Text style={s.metaText}>Joined recently</Text>
              </View>

              <View style={s.followRow}>
                <View style={s.followStat}>
                  <Text style={s.followCount}>{user.following}</Text>
                  <Text style={s.followLabel}> Following</Text>
                </View>
                <View style={s.followStat}>
                  <Text style={s.followCount}>{followersCount}</Text>
                  <Text style={s.followLabel}> Followers</Text>
                </View>
              </View>
            </View>

            <View style={s.tabHeader}>
              <Text style={s.tabHeaderText}>Posts</Text>
            </View>
          </>
        }
        renderItem={({ item }) => <Post post={item} />}
        ListEmptyComponent={
          posts !== undefined ? (
            <View style={s.empty}>
              <Ionicons name="camera-outline" size={48} color={COLORS.grey} />
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  backBtn: {
    padding: 4,
  },
  topHeaderLeft: {
    gap: 1,
    alignItems: "center",
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
  // Banner
  banner: {
    height: BANNER_H,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surfaceLight,
    opacity: 0.6,
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
  followBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 6,
    backgroundColor: COLORS.primary,
  },
  followBtnActive: {
    backgroundColor: "transparent",
    borderColor: COLORS.surfaceLight,
  },
  followBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  followBtnTextActive: {
    color: COLORS.white,
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
  // Tab header
  tabHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tabHeaderText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },
  // Empty
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
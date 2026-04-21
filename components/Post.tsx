import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import CommentsModal from "./CommentsModal";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { COLORS } from "@/constants/theme";
import { formatDistanceToNow } from "date-fns";
import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

const { width } = Dimensions.get("window");
const AVATAR_SIZE = 44;

type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl?: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image?: string;
    };
  };
};

export default function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);

  // ── Animated refs ─────────────────────────────────────────────────
  const likeScale = useRef(new Animated.Value(1)).current;
  const likeOpacity = useRef(new Animated.Value(1)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;
  const retweetScale = useRef(new Animated.Value(1)).current;
  const commentScale = useRef(new Animated.Value(1)).current;

  const currentUser = useQuery(api.users.getCurrentUser);
  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);

  // ── Animation helpers ─────────────────────────────────────────────
  const springPop = (anim: Animated.Value, toValue = 1.4) =>
    Animated.sequence([
      Animated.spring(anim, {
        toValue,
        useNativeDriver: true,
        speed: 60,
        bounciness: 18,
      }),
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }),
    ]);

  const quickBounce = (anim: Animated.Value) =>
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.75,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 12,
      }),
    ]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleLike = async () => {
    springPop(likeScale).start();
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsLiked(newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    } catch (e) {
      console.error("Error toggling like:", e);
    }
  };

  const handleBookmark = async () => {
    springPop(bookmarkScale, 1.3).start();
    try {
      const newVal = await toggleBookmark({ postId: post._id });
      setIsBookmarked(newVal);
    } catch (e) {
      console.error("Error toggling bookmark:", e);
    }
  };

  const handleCommentPress = () => {
    quickBounce(commentScale).start();
    setShowComments(true);
  };

  const handleRetweetPress = () => {
    quickBounce(retweetScale).start();
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post._id });
    } catch (e) {
      console.error("Error deleting post:", e);
    }
  };

  const isOwner = currentUser?._id === post.author._id;

  const timeAgo = formatDistanceToNow(post._creationTime, { addSuffix: false })
    .replace("about ", "")
    .replace(" minutes", "m")
    .replace(" minute", "m")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d")
    .replace(" months", "mo")
    .replace(" month", "mo");

  return (
    <View style={s.wrapper}>
      {/* ── Left column: avatar ───────────────────────────────────── */}
      <Link href="/(tabs)/notifications" asChild>
        <TouchableOpacity activeOpacity={0.8}>
          <Image
            source={post.author.image}
            style={s.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        </TouchableOpacity>
      </Link>

      {/* ── Right column ─────────────────────────────────────────── */}
      <View style={s.rightCol}>
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.displayName} numberOfLines={1}>
              {post.author.username}
            </Text>
            <Text style={s.handle} numberOfLines={1}>
              @{post.author.username.toLowerCase().replace(/\s+/g, "")}
            </Text>
            <Text style={s.dot}>·</Text>
            <Text style={s.time}>{timeAgo}</Text>
          </View>

          {isOwner ? (
            <TouchableOpacity onPress={handleDelete} hitSlop={8} style={s.menuBtn}>
              <Ionicons name="trash-outline" size={17} color={COLORS.grey} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity hitSlop={8} style={s.menuBtn}>
              <Ionicons name="ellipsis-horizontal" size={17} color={COLORS.grey} />
            </TouchableOpacity>
          )}
        </View>

        {/* Caption */}
        {post.caption ? <Text style={s.caption}>{post.caption}</Text> : null}

        {/* Image — contained, never cropped */}
        {post.imageUrl && (
          <View style={s.imageContainer}>
            <Image
              source={post.imageUrl}
              style={s.postImage}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
            />
          </View>
        )}

        {/* ── Action row ───────────────────────────────────────────── */}
        <View style={s.actions}>
          {/* Reply */}
          <TouchableOpacity
            style={s.actionItem}
            onPress={handleCommentPress}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: commentScale }] }}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.grey} />
            </Animated.View>
            {commentsCount > 0 && (
              <Text style={s.actionCount}>{commentsCount}</Text>
            )}
          </TouchableOpacity>

          {/* Retweet */}
          <TouchableOpacity
            style={s.actionItem}
            onPress={handleRetweetPress}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: retweetScale }] }}>
              <Ionicons name="repeat-outline" size={20} color={COLORS.grey} />
            </Animated.View>
          </TouchableOpacity>

          {/* Like — spring pop + color change */}
          <TouchableOpacity
            style={s.actionItem}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: likeScale }], opacity: likeOpacity }}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={18}
                color={isLiked ? COLORS.like : COLORS.grey}
              />
            </Animated.View>
            {likesCount > 0 && (
              <Animated.Text
                style={[
                  s.actionCount,
                  isLiked && { color: COLORS.like },
                  { transform: [{ scale: likeScale }] },
                ]}
              >
                {likesCount}
              </Animated.Text>
            )}
          </TouchableOpacity>

          {/* Bookmark — spring pop */}
          <TouchableOpacity
            style={s.actionItem}
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={18}
                color={isBookmarked ? COLORS.primary : COLORS.grey}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={s.actionItem} activeOpacity={0.7}>
            <Ionicons name="arrow-redo-outline" size={18} color={COLORS.grey} />
          </TouchableOpacity>
        </View>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentsCount((c) => c + 1)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.surface,
    marginRight: 12,
    flexShrink: 0,
  },
  rightCol: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
    overflow: "hidden",
    marginRight: 8,
  },
  displayName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 0,
    maxWidth: "45%",
  },
  handle: {
    color: COLORS.grey,
    fontSize: 14,
    flexShrink: 1,
  },
  dot: { color: COLORS.grey, fontSize: 14, flexShrink: 0 },
  time: { color: COLORS.grey, fontSize: 14, flexShrink: 0 },
  menuBtn: { padding: 2 },
  caption: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 10,
  },
  imageContainer: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.surfaceLight,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
    maxHeight: width * 0.8,
    justifyContent: "center",
  },
  postImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    maxHeight: width * 0.8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingRight: 16,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minWidth: 40,
  },
  actionCount: { color: COLORS.grey, fontSize: 13 },
});
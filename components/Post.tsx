import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";

// Тип для посту який приходить з Convex
export type PostProps = {
  post: {
    _id: Id<"posts">;
    _creationTime: number;
    userId: Id<"users">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: Id<"users">;
      username: string;
      image: string;
    };
  };
};

export default function Post({ post }: PostProps) {
  // Локальний стан для оптимістичного оновлення UI
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);

  const toggleLike = useMutation(api.posts.toggleLike);

  const handleLike = async () => {
    // Оптимістичне оновлення — змінюємо UI одразу, не чекаючи відповіді сервера
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      await toggleLike({ postId: post._id });
    } catch (error) {
      // Якщо помилка — відкочуємо UI назад
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <View style={styles.postContainer}>
      {/* HEADER — аватар та ім'я автора */}
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <Image
            source={{ uri: post.author.image }}
            style={styles.authorAvatar}
          />
          <Text style={styles.authorName}>{post.author.username}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={COLORS.grey}
          />
        </TouchableOpacity>
      </View>

      {/* ФОТО ПОСТУ */}
      <Image
        source={{ uri: post.imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* POST INFO — лайки, коментарі, час */}
      <View style={styles.postInfo}>
        {/* Кнопки дій */}
        <View style={styles.postActions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#E0245E" : COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="paper-plane-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Лічильник лайків */}
        <Text style={styles.likesText}>
          {likesCount > 0
            ? `${likesCount} ${likesCount === 1 ? "like" : "likes"}`
            : "Be the first to like"}
        </Text>

        {/* Caption (якщо є) */}
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}> {post.caption}</Text>
          </View>
        )}

        {/* Кількість коментарів */}
        {post.comments > 0 && (
          <TouchableOpacity>
            <Text style={styles.commentsText}>
              View all {post.comments}{" "}
              {post.comments === 1 ? "comment" : "comments"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Час публікації */}
        <Text style={styles.timeText}>
          {formatDistanceToNow(new Date(post._creationTime), {
            addSuffix: true,
          })}
        </Text>
      </View>
    </View>
  );
}
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { COLORS } from "@/constants/theme";

type CommentProps = {
  comment: {
    _id: Id<"comments">;
    _creationTime: number;
    content: string;
    author: {
      _id: Id<"users">;
      username: string;
      image: string;
    };
  };
};

export default function Comment({ comment }: CommentProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: comment.author.image }} style={styles.avatar} />

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.username}>{comment.author.username}</Text>
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(comment._creationTime), {
              addSuffix: true,
            })}
          </Text>
        </View>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  username: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 13,
  },
  time: {
    color: COLORS.grey,
    fontSize: 11,
  },
  content: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 19,
  },
});
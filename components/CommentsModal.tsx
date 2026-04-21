import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { COLORS } from "@/constants/theme";
import { formatDistanceToNow } from "date-fns";

type CommentsModalProps = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
};

export default function CommentsModal({
  postId,
  visible,
  onClose,
  onCommentAdded,
}: CommentsModalProps) {
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const comments = useQuery(api.comments.getComments, { postId });
  const addComment = useMutation(api.comments.addComment);

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed || isPosting) return;
    setIsPosting(true);
    try {
      await addComment({ postId, content: trimmed });
      setText("");
      onCommentAdded();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.sheet}
        >
          {/* Handle bar */}
          <View style={s.handleBar} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Comments</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={s.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* List */}
          {comments === undefined ? (
            <View style={s.loadingWrapper}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={44} color={COLORS.surfaceLight} />
              <Text style={s.emptyTitle}>No comments yet</Text>
              <Text style={s.emptySubtitle}>Be the first to reply!</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={s.commentRow}>
                  <Image
                    source={item.author.image}
                    style={s.commentAvatar}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                  />
                  <View style={s.commentBody}>
                    <View style={s.commentHeader}>
                      <Text style={s.commentName}>{item.author.username}</Text>
                      <Text style={s.commentHandle}>
                        @{item.author.username.toLowerCase().replace(/\s+/g, "")}
                      </Text>
                      <Text style={s.commentDot}>·</Text>
                      <Text style={s.commentTime}>
                        {formatDistanceToNow(new Date(item._creationTime), {
                          addSuffix: false,
                        })
                          .replace("about ", "")
                          .replace(" minutes", "m")
                          .replace(" minute", "m")
                          .replace(" hours", "h")
                          .replace(" hour", "h")
                          .replace(" days", "d")
                          .replace(" day", "d")}
                      </Text>
                    </View>
                    <Text style={s.commentContent}>{item.content}</Text>
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={s.separator} />}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Post your reply"
              placeholderTextColor={COLORS.grey}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handlePost}
              disabled={!text.trim() || isPosting}
              style={[
                s.replyBtn,
                (!text.trim() || isPosting) && s.replyBtnDisabled,
              ]}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.replyBtnText}>Reply</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "78%",
    minHeight: "42%",
    overflow: "hidden",
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceLight,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: "800" },
  closeBtn: { padding: 2 },
  loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  emptySubtitle: { color: COLORS.grey, fontSize: 14 },

  // Comment row
  commentRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    flexShrink: 0,
  },
  commentBody: { flex: 1 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
    flexWrap: "nowrap",
  },
  commentName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 0,
    maxWidth: "40%",
  },
  commentHandle: { color: COLORS.grey, fontSize: 13, flexShrink: 1 },
  commentDot: { color: COLORS.grey, fontSize: 13 },
  commentTime: { color: COLORS.grey, fontSize: 13, flexShrink: 0 },
  commentContent: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 21,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.surfaceLight,
    marginLeft: 66,
  },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surfaceLight,
    gap: 10,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.white,
    fontSize: 15,
    maxHeight: 100,
    lineHeight: 20,
  },
  replyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 68,
  },
  replyBtnDisabled: { opacity: 0.4 },
  replyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
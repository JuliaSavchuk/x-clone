import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  // Screen container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  headerIcon: {
    padding: 4,
  },

  // ── Legacy post styles (kept for backward compat) ──
  postContainer: {
    backgroundColor: COLORS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceLight,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },
  authorName: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 15,
  },
  postImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.surface,
  },
  postInfo: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 4,
  },
  actionButton: {
    padding: 6,
  },
  likesText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  captionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  captionUsername: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  captionText: {
    color: COLORS.white,
    fontSize: 14,
    flexShrink: 1,
  },
  commentsText: {
    color: COLORS.grey,
    fontSize: 13,
    marginBottom: 4,
  },
  timeText: {
    color: COLORS.grey,
    fontSize: 12,
    marginTop: 2,
  },
});
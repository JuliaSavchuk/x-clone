import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/theme";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // ── Контейнер екрану ──────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Header ────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: "JetBrainsMono-Medium",
  },
  headerIcon: {
    padding: 4,
  },

  // ── Пост — загальний контейнер ────────────────────────────────────
  postContainer: {
    backgroundColor: COLORS.background,
    marginBottom: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surfaceLight,
  },

  // ── Шапка посту ───────────────────────────────────────────────────
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  authorName: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },

  // ── Зображення посту ──────────────────────────────────────────────
  postImage: {
    width: width,
    height: width,
    backgroundColor: COLORS.surface,
  },

  // ── Блок з інформацією під фото ───────────────────────────────────
  postInfo: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  postActions: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 4,
  },
  actionButton: {
    padding: 4,
    marginRight: 8,
  },

  // ── Текст лайків ──────────────────────────────────────────────────
  likesText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },

  // ── Caption ───────────────────────────────────────────────────────
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

  // ── Коментарі / час ───────────────────────────────────────────────
  commentsText: {
    color: COLORS.grey,
    fontSize: 13,
    marginBottom: 4,
  },
  timeText: {
    color: COLORS.grey,
    fontSize: 11,
    marginTop: 2,
  },
});
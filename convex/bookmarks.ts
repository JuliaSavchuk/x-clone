import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

// Додати або прибрати закладку
export const toggleBookmark = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_both", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    if (existing) {
      // Вже є — прибираємо закладку
      await ctx.db.delete(existing._id);
      return false;
    } else {
      // Немає — зберігаємо
      await ctx.db.insert("bookmarks", {
        userId: currentUser._id,
        postId: args.postId,
      });
      return true;
    }
  },
});

// Отримати всі збережені пости поточного користувача
export const getBookmarkedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .collect();

    if (bookmarks.length === 0) return [];

    // Завантажуємо пости та їхніх авторів
    return await Promise.all(
      bookmarks.map(async (bookmark) => {
        const post = await ctx.db.get(bookmark.postId);
        if (!post) return null;

        const author = await ctx.db.get(post.userId);

        // Перевіряємо чи лайкнутий пост
        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: author!._id,
            username: author!.username,
            image: author!.image,
          },
          isLiked: !!like,
          isBookmarked: true,
        };
      })
    ).then((posts) => posts.filter(Boolean));
  },
});
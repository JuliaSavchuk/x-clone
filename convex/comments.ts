import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

// Додати коментар до посту
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Зберігаємо коментар
    const commentId = await ctx.db.insert("comments", {
      userId: currentUser._id,
      postId: args.postId,
      content: args.content,
    });

    // Збільшуємо лічильник коментарів на пості
    await ctx.db.patch(args.postId, {
      comments: post.comments + 1,
    });

    // Сповіщення — тільки для чужих постів
    if (post.userId !== currentUser._id) {
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        postId: args.postId,
        commentId,
      });
    }

    return commentId;
  },
});

// Отримати всі коментарі конкретного посту
export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    // Додаємо інфо про автора до кожного коментаря
    return await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.userId);
        return {
          ...comment,
          author: {
            _id: author!._id,
            username: author!.username,
            image: author!.image,
          },
        };
      })
    );
  },
});
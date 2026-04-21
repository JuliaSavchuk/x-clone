import { query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

// Отримати всі сповіщення поточного користувача
export const getNotifications = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .order("desc")
      .collect();

    if (notifications.length === 0) return [];

    return await Promise.all(
      notifications.map(async (notif) => {
        const sender = await ctx.db.get(notif.senderId);

        // Якщо є postId — підтягуємо фото посту для прев'ю
        const post = notif.postId ? await ctx.db.get(notif.postId) : null;

        return {
          ...notif,
          sender: {
            _id: sender!._id,
            username: sender!.username,
            image: sender!.image,
          },
          postImageUrl: post?.imageUrl ?? null,
        };
      })
    );
  },
});
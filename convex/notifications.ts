import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
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
        const post = notif.postId
          ? await ctx.db.get(notif.postId)
          : null;
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

//Видалити одне сповіщення
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const notification = await ctx.db.get(args.notificationId);

    if (!notification) throw new Error("Notification not found");
    if (notification.receiverId !== currentUser._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.notificationId);
    return true;
  },
});

//Видалити всі сповіщення поточного користувача
export const deleteAllNotifications = mutation({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .collect();

    for (const notif of notifications) {
      await ctx.db.delete(notif._id);
    }

    return true;
  },
});
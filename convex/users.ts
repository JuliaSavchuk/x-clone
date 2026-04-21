import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ── Утиліта (використовується в інших Convex файлах) ──────────────
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) throw new Error("User not found");
  return currentUser;
}

// ── Допоміжна функція: оновити лічильники followers/following ─────
async function updateFollowCounts(
  ctx: MutationCtx,
  followerId: Id<"users">,
  followingId: Id<"users">,
  isFollow: boolean // true = підписка, false = відписка
) {
  const delta = isFollow ? 1 : -1;

  const follower = await ctx.db.get(followerId);
  const following = await ctx.db.get(followingId);

  if (follower) {
    await ctx.db.patch(followerId, {
      following: Math.max(0, follower.following + delta),
    });
  }
  if (following) {
    await ctx.db.patch(followingId, {
      followers: Math.max(0, following.followers + delta),
    });
  }
}

// ── Queries ───────────────────────────────────────────────────────

// Поточний авторизований юзер (для власного профілю)
export const getCurrentUser = query({
  handler: async (ctx) => {
    return await getAuthenticatedUser(ctx);
  },
});

// Знайти юзера по Clerk ID (для перевірки власника в Post.tsx)
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Отримати профіль будь-якого юзера за його Convex ID
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    return user;
  },
});

// Перевірити чи поточний юзер підписаний на іншого
export const isFollowing = query({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const record = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    return !!record;
  },
});

// ── Mutations ─────────────────────────────────────────────────────

// Підписатись / відписатись
export const toggleFollow = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // Не можна підписатись на себе
    if (currentUser._id === args.followingId) {
      throw new Error("Cannot follow yourself");
    }

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    if (existingFollow) {
      // Відписка
      await ctx.db.delete(existingFollow._id);
      await updateFollowCounts(ctx, currentUser._id, args.followingId, false);
      return false;
    } else {
      // Підписка
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.followingId,
      });
      await updateFollowCounts(ctx, currentUser._id, args.followingId, true);

      // Сповіщення для того, на кого підписались
      await ctx.db.insert("notifications", {
        receiverId: args.followingId,
        senderId: currentUser._id,
        type: "follow",
      });

      return true;
    }
  },
});

// Створити нового юзера (Clerk Webhook)
export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    image: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) return;

    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      email: args.email,
      bio: args.bio,
      image: args.image,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});
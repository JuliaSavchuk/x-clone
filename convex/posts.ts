import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    if (!args.storageId && !args.caption?.trim()) {
      throw new Error("Post must have a caption or an image");
    }

    let imageUrl: string | undefined;
    if (args.storageId) {
      const url = await ctx.storage.getUrl(args.storageId);
      if (!url) throw new Error("Image URL not found");
      imageUrl = url;
    }

    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    await ctx.db.patch(currentUser._id, { posts: currentUser.posts + 1 });
    return postId;
  },
});

export const getPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const posts = await ctx.db.query("posts").order("desc").collect();
    if (posts.length === 0) return [];

    return await Promise.all(
      posts.map(async (post) => {
        const postAuthor = (await ctx.db.get(post.userId))!;
        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();
        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_both", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: postAuthor._id,
            username: postAuthor.username,
            image: postAuthor.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    );
  },
});

export const getMyPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .collect();

    return posts.map((post) => ({
      _id: post._id,
      imageUrl: post.imageUrl,
      likes: post.likes,
      comments: post.comments,
    }));
  },
});

export const getPostsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return posts.map((post) => ({
      _id: post._id,
      imageUrl: post.imageUrl,
      likes: post.likes,
      comments: post.comments,
    }));
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false;
    } else {
      await ctx.db.insert("likes", { userId: currentUser._id, postId: args.postId });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });
      if (post.userId !== currentUser._id) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId: args.postId,
        });
      }
      return true;
    }
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.userId !== currentUser._id) throw new Error("Not authorized");

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const like of likes) await ctx.db.delete(like._id);

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const comment of comments) await ctx.db.delete(comment._id);

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const bookmark of bookmarks) await ctx.db.delete(bookmark._id);

    // Деструктуруємо в окрему змінну — TypeScript звужує тип до Id<"_storage">
    const storageId = post.storageId;
    if (storageId !== undefined) {
      await ctx.storage.delete(storageId);
    }

    await ctx.db.delete(args.postId);
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, currentUser.posts - 1),
    });
  },
});
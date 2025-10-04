import { mutation } from './_generated/server';
import { v } from 'convex/values';


export const sendMessage = mutation({
  args: {
    senderId: v.string(),
    content: v.string(),
    targetRole: v.optional(v.string()),
    targetBranch: v.optional(v.string()),
    recipientIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.insert('messages', {
      ...args,
      isRead: false,
      timestamp: Date.now(),
    });
    return message;
  },
});


export const createPost = mutation({
  args: {
    authorId: v.string(),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.insert('posts', {
      ...args,
      likes: 0,
      likedBy: [],
      commentCount: 0,
      timestamp: Date.now(),
    });
    return post;
  },
});


export const likePost = mutation({
  args: {
    postId: v.id('posts'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const hasLiked = post.likedBy.includes(args.userId);
    
    if (hasLiked) {
      
      await ctx.db.patch(args.postId, {
        likes: post.likes - 1,
        likedBy: post.likedBy.filter((id: string) => id !== args.userId),
      });
    } else {
      
      await ctx.db.patch(args.postId, {
        likes: post.likes + 1,
        likedBy: [...post.likedBy, args.userId],
      });
    }
    
    return await ctx.db.get(args.postId);
  },
});


export const createComment = mutation({
  args: {
    postId: v.id('posts'),
    authorId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.insert('comments', {
      ...args,
      likes: 0,
      likedBy: [],
      timestamp: Date.now(),
    });
    
    
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        commentCount: post.commentCount + 1,
      });
    }
    
    return comment;
  },
});


export const likeComment = mutation({
  args: {
    commentId: v.id('comments'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const hasLiked = comment.likedBy.includes(args.userId);
    
    if (hasLiked) {
      
      await ctx.db.patch(args.commentId, {
        likes: comment.likes - 1,
        likedBy: comment.likedBy.filter((id: string) => id !== args.userId),
      });
    } else {
      
      await ctx.db.patch(args.commentId, {
        likes: comment.likes + 1,
        likedBy: [...comment.likedBy, args.userId],
      });
    }
    
    return await ctx.db.get(args.commentId);
  },
});


export const deleteComment = mutation({
  args: {
    commentId: v.id('comments'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    
    if (comment.authorId !== args.userId) {
      throw new Error('Insufficient permissions');
    }

    const postId = comment.postId;

    
    await ctx.db.delete(args.commentId);
    
    
    const post = await ctx.db.get(postId);
    if (post) {
      await ctx.db.patch(postId, {
        commentCount: Math.max(0, post.commentCount - 1),
      });
    }
    
    return true;
  },
});


export const markMessageRead = mutation({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isRead: true,
    });
    return true;
  },
});


export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    referenceId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.insert('notifications', {
      ...args,
      isRead: false,
      timestamp: Date.now(),
    });
    return notification;
  },
});
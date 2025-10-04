import { query } from './_generated/server';
import { v } from 'convex/values';


export const getMessages = query({
  args: {
    userId: v.string(),
    filters: v.optional(v.object({
      targetRole: v.optional(v.string()),
      targetBranch: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    
    const messages = await ctx.db.query('messages')
      .filter(q => q.or(
        q.eq('senderId', args.userId),
        q.eq('recipientIds', args.userId)
      ))
      .order('desc')
      .take(100);
    
    return messages;
  },
});


export const getPosts = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    
    const posts = await ctx.db.query('posts')
      .order('desc')
      .collect();
    
    
    return posts.slice(offset, offset + limit);
  },
});


export const getPostWithComments = query({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId as any);
    if (!post) {
      throw new Error('Post not found');
    }
    
    const comments = await ctx.db.query('comments')
      .filter(q => q.eq('postId', args.postId))
      .order('asc')
      .take(100);
    
    return { post, comments };
  },
});


export const getComments = query({
  args: {
    postId: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    
    const comments = await ctx.db.query('comments')
      .filter(q => q.eq('postId', args.postId))
      .order('asc')
      .collect();
    
    
    return comments.slice(offset, offset + limit);
  },
});


export const getNotifications = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db.query('notifications')
      .filter(q => q.eq('userId', args.userId))
      .order('desc')
      .take(100);
    
    return notifications;
  },
});


export const getConversation = query({
  args: {
    user1Id: v.string(),
    user2Id: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query('messages')
      .filter(q => q.and(
        q.eq('senderId', args.user1Id),
        q.eq('recipientIds', args.user2Id)
      ))
      .collect();
    
    const messages2 = await ctx.db.query('messages')
      .filter(q => q.and(
        q.eq('senderId', args.user2Id),
        q.eq('recipientIds', args.user1Id)
      ))
      .collect();
    
    
    const allMessages = [...messages, ...messages2]
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return allMessages;
  },
});
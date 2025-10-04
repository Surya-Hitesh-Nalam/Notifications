import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  
  messages: defineTable({
    senderId: v.string(),
    content: v.string(),
    targetRole: v.optional(v.string()),
    targetBranch: v.optional(v.string()),
    recipientIds: v.array(v.string()),
    isRead: v.boolean(),
    timestamp: v.number(),
  }).index('by_sender', ['senderId'])
    .index('by_recipient', ['recipientIds'])
    .index('by_timestamp', ['timestamp']),

  
  posts: defineTable({
    authorId: v.string(),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.string()),
    likes: v.number(),
    likedBy: v.array(v.string()),
    commentCount: v.number(),
    timestamp: v.number(),
  }).index('by_author', ['authorId'])
    .index('by_timestamp', ['timestamp']),

  
  comments: defineTable({
    postId: v.id('posts'),
    authorId: v.string(),
    content: v.string(),
    likes: v.number(),
    likedBy: v.array(v.string()),
    timestamp: v.number(),
  }).index('by_post', ['postId'])
    .index('by_author', ['authorId'])
    .index('by_timestamp', ['timestamp']),

  
  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    referenceId: v.string(),
    content: v.string(),
    isRead: v.boolean(),
    timestamp: v.number(),
  }).index('by_user', ['userId'])
    .index('by_timestamp', ['timestamp']),
});
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
});


const createPostSchema = z.object({
  content: z.string().min(1),
});

const updatePostSchema = z.object({
  content: z.string().min(1),
});

const createCommentSchema = z.object({
  content: z.string().min(1),
});

const updateCommentSchema = z.object({
  content: z.string().min(1),
});


export const uploadMiddleware = upload.single('media');

/**
 * Create a new post
 * @param req Express Request object
 * @param res Express Response object
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    
    const result = createPostSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: result.error.flatten() 
      });
      return;
    }

    const { content } = result.data;
    
    
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    }

    
    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        content,
        mediaUrl,
        mediaType,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all posts (paginated)
 * @param req Express Request object
 * @param res Express Response object
 */
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    
    const total = await prisma.post.count();

    res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get single post with comments
 * @param req Express Request object
 * @param res Express Response object
 */
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branch: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.status(200).json({
      post,
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update post (own posts only)
 * @param req Express Request object
 * @param res Express Response object
 */
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const result = updatePostSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: result.error.flatten() 
      });
      return;
    }

    const { content } = result.data;

    
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (existingPost.authorId !== req.user.id) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    
    const post = await prisma.post.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete post (own posts only)
 * @param req Express Request object
 * @param res Express Response object
 */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (existingPost.authorId !== req.user.id) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    
    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Like/unlike post
 * @param req Express Request object
 * @param res Express Response object
 */
export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    
    const hasLiked = post.likedBy.includes(req.user.id);

    
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        likes: hasLiked ? { decrement: 1 } : { increment: 1 },
        likedBy: hasLiked 
          ? { set: post.likedBy.filter((userId: string) => userId !== req.user?.id) }
          : { push: req.user.id },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      message: hasLiked ? 'Post unliked' : 'Post liked',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create comment on post
 * @param req Express Request object
 * @param res Express Response object
 */
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { postId } = req.params;

    
    const result = createCommentSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: result.error.flatten() 
      });
      return;
    }

    const { content } = result.data;

    
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: req.user.id,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
    });

    
    await prisma.post.update({
      where: { id: postId },
      data: {
        commentCount: { increment: 1 },
      },
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all comments for a post
 * @param req Express Request object
 * @param res Express Response object
 */
export const getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    
    const comments = await prisma.comment.findMany({
      where: { postId },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    
    const total = await prisma.comment.count({
      where: { postId },
    });

    res.status(200).json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update comment (own comments only)
 * @param req Express Request object
 * @param res Express Response object
 */
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const result = updateCommentSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: result.error.flatten() 
      });
      return;
    }

    const { content } = result.data;

    
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (existingComment.authorId !== req.user.id) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    
    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete comment (own comments only)
 * @param req Express Request object
 * @param res Express Response object
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (existingComment.authorId !== req.user.id) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    
    const postId = existingComment.postId;

    
    await prisma.comment.delete({
      where: { id },
    });

    
    await prisma.post.update({
      where: { id: postId },
      data: {
        commentCount: { decrement: 1 },
      },
    });

    res.status(200).json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Like/unlike comment
 * @param req Express Request object
 * @param res Express Response object
 */
export const likeComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    
    const hasLiked = comment.likedBy.includes(req.user.id);

    
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        likes: hasLiked ? { decrement: 1 } : { increment: 1 },
        likedBy: hasLiked 
          ? { set: comment.likedBy.filter((userId: string) => userId !== req.user?.id) }
          : { push: req.user.id },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      message: hasLiked ? 'Comment unliked' : 'Comment liked',
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
import express from 'express';
import { 
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
  likeComment
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../controllers/post.controller';

const router = express.Router();


router.post('/', authenticate, uploadMiddleware, createPost);
router.get('/', authenticate, getAllPosts);
router.get('/:id', authenticate, getPostById);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);


router.post('/:postId/comments', authenticate, createComment);
router.get('/:postId/comments', authenticate, getCommentsByPostId);
router.put('/comments/:id', authenticate, updateComment);
router.delete('/comments/:id', authenticate, deleteComment);
router.post('/comments/:id/like', authenticate, likeComment);

export default router;
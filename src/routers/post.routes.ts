// src/routes/PostRoute.ts
import { PostController } from '@controllers/post.controller.js'
import upload from '@middlewares/upload.middleware.js'
import { PostService } from '@service/post.service.js'
import { Router } from 'express'

const postRouter = Router()

// Inject Service vào Controller
const postService = new PostService()
const postController = new PostController(postService)

postRouter.post('/', upload.single('image'), postController.createPost)
postRouter.get('/', postController.getPosts)
// postRouter.get('/:id', postController.getPostById)
postRouter.post('/like', postController.likePost)
postRouter.delete('/unlike', postController.unlikePost)

postRouter.post('/comment', upload.single('image'), postController.addComment)
// postRouter.get('/:id/comments', postController.getComments)
// postRouter.get('/:id/likes', postController.getPostLikes)

export default postRouter

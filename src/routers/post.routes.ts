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

export default postRouter

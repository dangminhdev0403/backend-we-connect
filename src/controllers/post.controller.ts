// src/controllers/PostController.ts
import logger from '@configs/logger.js'
import { createResponse } from '@models/response/format.response.js'
import { PostService } from '@service/post.service.js'
import { AppError } from '@utils/errors/AppError.js'
import { Request, Response } from 'express'

export class PostController {
  constructor(private readonly postService: PostService) {}

  public getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const posts = await this.postService.getPosts(page, limit)

      res.status(200).json(createResponse({ statusCode: 200, message: 'Posts fetched successfully', data: posts }))
    } catch (error) {
      logger.error('Error fetching posts', error)
      res.status(500).json({ message: 'Server error', error })
    }
  }

  public createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content } = req.body
      const file = req.file
      const userId: string = req.user?.id as string
      if (!file) {
        logger.error('No file uploaded')
      }

      const post = await this.postService.createPost({
        userId,
        content,
        imagePath: file?.path as string
      })

      res.status(201).json(createResponse({ statusCode: 201, message: 'Post created successfully', data: post }))
      return
    } catch (error) {
      res.status(500).json({ message: 'Server error', error })
      return
    }
  }

  public likePost = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.body
    if (!postId) throw new AppError('Post ID is required', 400)
    const userId: string = req.user?.id as string
    await this.postService.likePost(postId, userId)
    res.status(200).json(createResponse({ statusCode: 200, message: 'Post liked successfully' }))
    return
  }

  public unlikePost = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.body
    if (!postId) throw new AppError('Post ID is required', 400, true, { postId: 'Post ID is required' })
    const userId: string = req.user?.id as string
    await this.postService.unlikePost(postId, userId)
    res.status(200).json({ message: 'Post unliked successfully' })
    return
  }
  public addComment = async (req: Request, res: Response): Promise<void> => {
    const { postId, content } = req.body
    const userId: string = req.user?.id as string
    const comment = await this.postService.addComment(postId, userId, content)

    res.status(200).json(createResponse({ statusCode: 200, message: 'Comment added successfully', data: comment }))
    return
  }
}

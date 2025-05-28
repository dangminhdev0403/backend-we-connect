// src/controllers/PostController.ts
import logger from '@configs/logger.js'
import { PostService } from '@service/post.service.js'
import { Request, Response } from 'express'

export class PostController {
  constructor(private readonly postService: PostService) {}

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

      res.status(201).json({ message: 'Post created', post })
      return
    } catch (error) {
      res.status(500).json({ message: 'Server error', error })
      return
    }
  }
}

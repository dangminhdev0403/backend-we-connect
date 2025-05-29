// src/services/PostService.ts
import { CommentModel } from '@models/schema/posts/comments.shema.js'
import { LikeModel } from '@models/schema/posts/likes.schema.js'
import PostModel, { IPost } from '@models/schema/posts/post.schema.js'
import fs from 'fs'
import mongoose from 'mongoose'

interface CreatePostDto {
  userId: string
  content: string
  imagePath: string
}

export class PostService {
  public async createPost(dto: CreatePostDto): Promise<IPost> {
    // ✅ Sau khi upload xong => xóa file local
    if (fs.existsSync(dto.imagePath)) {
      fs.unlinkSync(dto.imagePath)
    }
    // Lưu vào DB
    const newPost = await PostModel.create({
      userId: new mongoose.Types.ObjectId(dto.userId),
      content: dto.content,
      imageUrl: dto.imagePath
    })

    return newPost
  }
  async getPosts(page: number = 1, limit: number = 10) {
    return PostModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  }

  public async likePost(postId: string, userId: string) {
    try {
      const existing = await LikeModel.findOne({ postId, userId })
      if (existing) throw new Error('Already liked')
      await LikeModel.create({ postId, userId })
      await PostModel.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } })
    } catch (err: any) {
      if (err.code === 11000) throw new Error('Already liked')
      throw err
    }
  }

  async unlikePost(postId: string, userId: string) {
    const result = await LikeModel.findOneAndDelete({ postId, userId })
    if (result) {
      await PostModel.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } })
    }
  }

  async addComment(postId: string, userId: string, content: string) {
    const comment = await CommentModel.create({ postId, userId, content })
    await PostModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })
    return comment
  }

  async getComments(postId: string, page: number = 1, limit: number = 10) {
    return CommentModel.find({ postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name avatar')
  }

  async getPostById(postId: string) {
    const post = await PostModel.findById(postId).lean()
    if (!post) throw new Error('Post not found')
    const comments = await this.getComments(postId, 1, 3)
    return { ...post, comments }
  }

  async getPostLikes(postId: string) {
    return LikeModel.find({ postId }).populate('userId', 'name avatar')
  }
}

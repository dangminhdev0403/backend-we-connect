// src/services/PostService.ts
import PostModel, { IPost } from '@models/schema/post.schema.js'
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
}

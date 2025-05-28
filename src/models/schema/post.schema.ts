import mongoose, { Document, Schema } from 'mongoose'

// Định nghĩa interface cho document User (bổ sung kiểu cho TS)

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId
  content: string
  imageUrl: string
  createdAt: Date
  updatedAt: Date
}

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    }
  },
  {
    timestamps: true // thêm createdAt và updatedAt tự động
  }
)
const PostModel = mongoose.model<IPost>('Post', postSchema)
export default PostModel

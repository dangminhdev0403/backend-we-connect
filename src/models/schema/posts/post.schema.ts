import mongoose, { Document, Schema } from 'mongoose'

// Định nghĩa interface cho document User (bổ sung kiểu cho TS)

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId
  content: string
  imageUrl: string
  likeCount: { type: number; default: 0 }
  commentCount: { type: number; default: 0 }
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
    },
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true // thêm createdAt và updatedAt tự động
  }
)
postSchema.virtual('author').get(function () {
  return this.userId
})
postSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.userId // ẩn userId gốc
    return ret
  }
})

postSchema.set('toObject', {
  virtuals: true
})
const PostModel = mongoose.model<IPost>('Post', postSchema)
export default PostModel

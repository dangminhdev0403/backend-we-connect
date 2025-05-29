import mongoose, { model, Types } from 'mongoose'

const LikesSchema = new mongoose.Schema(
  {
    postId: { type: Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)
LikesSchema.index({ postId: 1, userId: 1 }, { unique: true })

export const LikeModel = model('Like', LikesSchema)

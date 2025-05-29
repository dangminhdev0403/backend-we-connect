import { model, Schema, Types } from 'mongoose'

const CommentSchema = new Schema(
  {
    postId: { type: Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
)

export const CommentModel = model('Comment', CommentSchema)

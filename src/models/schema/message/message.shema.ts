import mongoose, { Schema, Types } from 'mongoose'

export interface IMessage extends Document {
  sender: Types.ObjectId
  receiver: Types.ObjectId
  content: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema(
  {
    sender: { type: Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false }
  },

  { timestamps: true }
)

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema)

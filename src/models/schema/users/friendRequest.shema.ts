import mongoose, { Document, Schema } from 'mongoose'

export interface IFriendRequest extends Document {
  senderId: mongoose.Types.ObjectId // người gửi lời mời
  receiverId: mongoose.Types.ObjectId // người nhận lời mời
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

const FriendRequestSchema = new Schema<IFriendRequest>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
)
FriendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true })

const FriendRequestModel = mongoose.model<IFriendRequest>('FriendRequest', FriendRequestSchema)
export default FriendRequestModel

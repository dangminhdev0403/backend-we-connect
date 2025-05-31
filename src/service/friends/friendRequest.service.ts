import FriendRequestModel from '@models/schema/users/friendRequest.shema.js'
import { AppError } from '@utils/errors/AppError.js'
import { createPaginationMeta } from '@utils/listDocuments.js'
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId

export class FriendRequestService {
  public async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId)
      throw new AppError('Cannot send friend request to yourself', 400, false, {
        receiverId: 'Cannot send friend request to yourself'
      })

    const existingRequest = await FriendRequestModel.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    })
    if (existingRequest)
      throw new AppError('Cannot send friend request ', 400, false, {
        message: ' you have already sent a friend request to this user'
      })

    const friendRequest = await FriendRequestModel.create({ senderId, receiverId })
    return friendRequest
  }

  public async respondToRequest(userId: string, requestId: string, action: 'accept' | 'reject') {
    const request = await FriendRequestModel.findById(requestId)
    if (!request) throw new AppError('Friend request not found', 404, false, 'Friend request not found')

    if (request.receiverId.toString() !== userId) throw new AppError('Unauthorized', 400, false, 'Unauthorized')
    request.status = action === 'accept' ? 'accepted' : 'rejected'
    const friendRequests = await request.save()
    return friendRequests
  }

  public async getFriendRequests(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const result = await FriendRequestModel.aggregate([
      {
        // Bước 1: Lọc các lời mời kết bạn có người nhận là currentUserId và trạng thái là 'pending'
        $match: {
          receiverId: new ObjectId(userId),
          status: 'pending'
        }
      },
      {
        // Bước 2: Thực hiện join từ bảng 'users' để lấy thông tin người gửi (senderId)
        $lookup: {
          from: 'users', // Tên collection chứa thông tin user
          localField: 'senderId', // Trường ở FriendRequest
          foreignField: '_id', // Trường ở User để join
          as: 'senderInfo' // Kết quả sẽ được đưa vào mảng senderInfo
        }
      },
      {
        // Bước 3: Vì senderInfo là mảng (do $lookup), dùng $unwind để chuyển nó thành object
        $unwind: '$senderInfo'
      },
      {
        // Bước 4: Chỉ lấy các trường cần thiết để trả về
        $project: {
          createdAt: 1, // Thời gian gửi lời mời
          'senderInfo._id': 1, // ID của người gửi (từ bảng User)
          'senderInfo.name': 1, // Tên người gửi
          'senderInfo.email': 1, // Email người gửi
          'senderInfo.avatar': 1 // Avatar người gửi (nếu có)
        }
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ])
    const users = result[0]?.data ?? []
    const totalItems = result[0]?.totalCount?.[0]?.count ?? 0
    return {
      users,
      meta: createPaginationMeta(totalItems, page, limit)
    }
  }
}

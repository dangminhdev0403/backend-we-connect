import FriendRequestModel from '@models/schema/users/friendRequest.shema.js'
import UserModel from '@models/schema/users/user.schema.js'
import { AppError } from '@utils/errors/AppError.js'
import { createPaginationMeta } from '@utils/listDocuments.js'
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId

export class FriendRequestService {
  public async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new AppError('Cannot send friend request to yourself', 400, false, {
        receiverId: 'Cannot send friend request to yourself'
      })
    }

    const isFriend = await UserModel.exists({
      _id: senderId,
      friends: receiverId
    })

    if (isFriend) {
      throw new AppError('Already friends', 400, false, {
        message: 'You are already friends with this user'
      })
    }

    const existingRequest = await FriendRequestModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    })

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        if (existingRequest.senderId.toString() === receiverId) {
          // Người nhận đang gửi lại -> auto accept
          existingRequest.status = 'accepted'
          await existingRequest.save()

          await UserModel.findByIdAndUpdate(senderId, {
            $addToSet: { friends: receiverId }
          })
          await UserModel.findByIdAndUpdate(receiverId, {
            $addToSet: { friends: senderId }
          })

          return { message: 'Friend request accepted automatically' }
        }

        // Người đã gửi lại gửi tiếp → lỗi
        throw new AppError('Friend request already sent', 400, false, {
          message: 'You have already sent a friend request to this user'
        })
      }

      // Nếu là declined, cancelled → update lại thành pending (dù chiều nào)
      existingRequest.senderId = new ObjectId(senderId)
      existingRequest.receiverId = new ObjectId(receiverId)
      existingRequest.status = 'pending'
      existingRequest.updatedAt = new Date()
      await existingRequest.save()

      return existingRequest
    }

    // Nếu chưa từng có record nào → tạo mới
    const newRequest = await FriendRequestModel.create({
      senderId,
      receiverId
    })

    return newRequest
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
          requestId: '$_id', // alias lại id của FriendRequest

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

  public async getFriendsPaginated(userId: string, page = 0, limit = 10) {
    const skip = (page - 1) * limit

    const objectUserId = new ObjectId(userId)

    const result = await FriendRequestModel.aggregate([
      {
        $match: {
          status: 'accepted',
          $or: [{ senderId: objectUserId }, { receiverId: objectUserId }]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiverId',
          foreignField: '_id',
          as: 'receiverInfo'
        }
      },
      {
        $addFields: {
          senderInfo: { $arrayElemAt: ['$senderInfo', 0] },
          receiverInfo: { $arrayElemAt: ['$receiverInfo', 0] }
        }
      },
      {
        $project: {
          createdAt: 1,
          friend: {
            $cond: [{ $eq: ['$senderId', objectUserId] }, '$receiverInfo', '$senderInfo']
          }
        }
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ])

    const friends = result[0]?.data ?? []
    const totalCount = result[0]?.totalCount[0]?.count ?? 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      friends,
      totalCount,
      totalPages,
      currentPage: Math.floor(skip / limit) + 1,
      pageSize: limit
    }
  }
}

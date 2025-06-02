import logger from '@configs/logger.js'
import UserModel, { IUser } from '@models/schema/users/user.schema.js'
import { AppError } from '@utils/errors/AppError.js'
import { listDocuments } from '@utils/listDocuments.js'
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId

const userService = {
  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find()
  },

  async getUserById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id)
    logger.info('getUserById', user)
    return user
  },

  async createUser(userData: { name: string; email: string; password: string }): Promise<IUser> {
    const existingUser = await UserModel.findOne({ email: userData.email })
    if (existingUser) {
      throw new AppError('User already exists', 400, true, {
        email: 'Email already exists'
      })
    }
    logger.info('createUser', userData)
    const user = new UserModel(userData)
    return await user.save()
  },

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const existingUserId = await UserModel.findById(id)
    if (!existingUserId) {
      throw new AppError('User not found', 404, true, {
        id: 'User not found'
      })
    }

    const existingUser = await UserModel.findOne({ email: userData.email })
    if (existingUser && existingUser.id.toString() !== id) {
      throw new AppError('Email already exists', 400, true, {
        email: 'Email already exists'
      })
    }

    logger.info('updateUser', userData)
    return await UserModel.findByIdAndUpdate(id, userData, { new: true })
  },

  async deleteUser(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id)
  },
  async searchUsers(keyword: string, currentUserId: string, offset: number = 1, limit: number = 10) {
    if (!keyword || typeof keyword !== 'string') {
      logger.error('Invalid search keyword')
      throw new AppError('Not found search ', 404, true, {
        keyword: `Not found users`
      })
    }

    return await listDocuments<IUser>(UserModel, {
      page: offset,
      limit,
      search: keyword,
      searchFields: ['name', 'email'],
      projection: '-password',
      lean: true
    })
  },
  async searchUsersWithFriendStatus(keyword: string, currentUserId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
    const currentObjectId = new ObjectId(currentUserId)

    const result = await UserModel.aggregate([
      {
        $match: {
          _id: { $ne: currentObjectId },
          $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }]
        }
      },
      {
        $lookup: {
          from: 'friendrequests',
          let: { userId: '$_id', currentUserId: currentObjectId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [{ $eq: ['$senderId', '$$currentUserId'] }, { $eq: ['$receiverId', '$$userId'] }]
                    },
                    {
                      $and: [{ $eq: ['$receiverId', '$$currentUserId'] }, { $eq: ['$senderId', '$$userId'] }]
                    }
                  ]
                }
              }
            }
          ],
          as: 'friendRequest'
        }
      },
      {
        $addFields: {
          requestStatus: {
            $cond: [
              { $gt: [{ $size: '$friendRequest' }, 0] },
              {
                $let: {
                  vars: { req: { $arrayElemAt: ['$friendRequest', 0] } },
                  in: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$$req.status', 'accepted'] }, then: 'accepted' },
                        { case: { $eq: ['$$req.status', 'rejected'] }, then: 'rejected' },
                        {
                          case: { $eq: ['$$req.senderId', currentObjectId] },
                          then: 'pending'
                        }
                      ],
                      default: 'incoming'
                    }
                  }
                }
              },
              'none'
            ]
          },
          requestId: {
            $cond: [{ $gt: [{ $size: '$friendRequest' }, 0] }, { $arrayElemAt: ['$friendRequest._id', 0] }, null]
          }
        }
      },
      {
        $project: { password: 0, friendRequest: 0 }
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ])

    const users = result[0]?.data ?? []
    const totalItems = result[0]?.totalCount[0]?.count ?? 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      data: users,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit
      }
    }
  }
}

export default userService

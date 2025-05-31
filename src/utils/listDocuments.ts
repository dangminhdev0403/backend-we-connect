import UserModel from '@models/schema/users/user.schema.js'
import mongoose, { Model, SortOrder } from 'mongoose'
const ObjectId = mongoose.Types.ObjectId

interface ListOptions {
  page?: number
  limit?: number
  search?: string
  searchFields?: string[]
  sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][]
  projection?: object | string
  lean?: boolean
}

export const listDocuments = async <T>(model: Model<T>, options: ListOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    searchFields = [],
    sort = { createdAt: -1 },
    projection = '',
    lean = false
  } = options

  const skip = (page - 1) * limit

  let filter = {}
  if (search && searchFields.length > 0) {
    const regex = new RegExp(search, 'i')
    filter = {
      $or: searchFields.map((field) => ({ [field]: regex }))
    }
  }

  const query = model.find(filter, projection).sort(sort).skip(skip).limit(limit)
  if (lean) query.lean()

  const [data, totalItems] = await Promise.all([query.exec(), model.countDocuments(filter)])

  return {
    data,
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      pageSize: limit
    }
  }
}

// helpers/pagination.ts

export const createPaginationMeta = (totalItems: number, page: number, limit: number) => {
  const totalPages = Math.ceil(totalItems / limit)

  return {
    totalItems,
    totalPages,
    currentPage: page,
    pageSize: limit
  }
}

export const searchUsersWithFriendStatus = async (
  keyword: string,
  currentUserId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit

  const result = await UserModel.aggregate([
    {
      $match: {
        _id: { $ne: new ObjectId(currentUserId) },
        $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }]
      }
    },
    {
      $lookup: {
        from: 'friendrequests',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [{ $eq: ['$senderId', new ObjectId(currentUserId)] }, { $eq: ['$receiverId', '$$userId'] }]
                  },
                  {
                    $and: [{ $eq: ['$receiverId', new ObjectId(currentUserId)] }, { $eq: ['$senderId', '$$userId'] }]
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
                  $cond: [
                    { $eq: ['$$req.status', 'accepted'] },
                    'accepted',
                    {
                      $cond: [{ $eq: ['$$req.senderId', new ObjectId(currentUserId)] }, 'pending', 'incoming']
                    }
                  ]
                }
              }
            },
            'none'
          ]
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

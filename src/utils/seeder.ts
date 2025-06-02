import FriendRequestModel from '@models/schema/users/friendRequest.shema.js'
import mongoose from 'mongoose'

export async function createFriendRequestsForUser(userId: string) {
  // Một số id giả định user khác
  const otherUserIds = [
    '6838d46ecb14d23032a64b66',
    '6838d46ecb14d23032a64b67',
    '6838d46ecb14d23032a64b68',
    '6838d46ecb14d23032a64b69',
    '6838d46ecb14d23032a64b6a',
    '6838d46ecb14d23032a64b6c',
    '6838d46ecb14d23032a64b6d',
    '6838d46ecb14d23032a64b6e',
    '6838d46ecb14d23032a64b70',
    '6838d46ecb14d23032a64b6f',
    '6838d46ecb14d23032a64b74',
    '6838d46ecb14d23032a64b75',
    '6838d46ecb14d23032a64b73',
    '6838d46ecb14d23032a64b72',
    '6838d46ecb14d23032a64b71',
    '6838d46ecb14d23032a64b6b'
  ]

  for (let i = 0; i < otherUserIds.length; i++) {
    const senderId = i % 2 === 0 ? userId : otherUserIds[i] // luân phiên user là sender hoặc receiver
    const receiverId = i % 2 === 0 ? otherUserIds[i] : userId

    const existing = await FriendRequestModel.findOne({
      senderId,
      receiverId
    })

    if (!existing) {
      await FriendRequestModel.create({
        senderId: mongoose.Types.ObjectId.createFromHexString(senderId),
        receiverId: mongoose.Types.ObjectId.createFromHexString(receiverId),
        status: 'accepted',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }

  console.log('10 friend requests created (if not exist)')
}

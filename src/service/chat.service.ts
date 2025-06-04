import logger from '@configs/logger.js'
import { IMessage, MessageModel } from '@models/schema/message/message.shema.js'
import { AppError } from '@utils/errors/AppError.js'
import mongoose, { Types } from 'mongoose'

export class ChatService {
  public async sendMessage(senderId: string, receiverId: string, content: string): Promise<IMessage> {
    logger.info(`sendMessage: senderId: ${senderId}, receiverId: ${receiverId}, content: ${content}`)
    if (!senderId || !receiverId || !content) {
      logger.error('Invalid message data')
      throw new AppError('Invalid message data', 400, false, 'Invalid message data')
    }
    const message = await MessageModel.create({
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      content
    })
    logger.info(`Create message: ${JSON.stringify(message)}`)
    return message
  }

  // ChatService.ts

  async getMessage(senderId: string, receiverId: string, offset: number, limit: number) {
    const skip = (offset - 1) * limit

    const senderObjectId = new mongoose.Types.ObjectId(senderId)
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId)

    const filter = {
      $and: [
        { sender: { $in: [senderObjectId, receiverObjectId] } },
        { receiver: { $in: [senderObjectId, receiverObjectId] } }
      ]
    }

    const [messages, totalItems] = await Promise.all([
      MessageModel.find(filter)
        .sort({ createdAt: -1 })
        // sắp xếp theo thời gian tăng dần
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name')
        .populate('receiver', 'name'),

      MessageModel.countDocuments(filter)
    ])

    return {
      messages: messages.toReversed(),
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: offset,
        pageSize: limit
      }
    }
  }
}

import logger from '@configs/logger.js'
import { IMessage, MessageModel } from '@models/schema/message/message.shema.js'
import { AppError } from '@utils/errors/AppError.js'
import { Types } from 'mongoose'

export class ChatService {
  public async sendMessage(senderId: string, receiverId: string, content: string): Promise<IMessage> {
    logger.info(`sendMessage: senderId: ${senderId}, receiverId: ${receiverId}, content: ${content}`)
    if (!senderId || !receiverId || !content) {
      logger.error('Invalid message data')
      throw new AppError('Invalid message data', 400, false, 'Invalid message data')
    }
    const message = await MessageModel.create({ sender: senderId, receiver: receiverId, content })
    logger.info(`Create message: ${JSON.stringify(message)}`)
    return message
  }

  public async getMessage(senderId: string, receiverId: string, offset: number = 1, limit: number = 10) {
    const skip = (offset - 1) * limit
    logger.info(`getMessage: senderId: ${senderId}, receiverId: ${receiverId}`)

    const senderObjId = new Types.ObjectId(senderId)
    const receiverObjId = new Types.ObjectId(receiverId)
    const filter = {
      $or: [
        { sender: senderObjId, receiver: receiverObjId },
        { sender: receiverObjId, receiver: senderObjId }
      ]
    }

    const messages = await MessageModel.find(filter)
      .sort({ createdAt: -1 }) // sort mới nhất trước, đổi thành 1 nếu muốn cũ nhất trước
      .skip(skip)
      .limit(limit)
      .lean()

    // Lấy tổng số tin nhắn
    const totalItems = await MessageModel.countDocuments(filter)
    const totalPages = Math.ceil(totalItems / limit)

    logger.info(`Get message: ${JSON.stringify(messages)}`)
    return {
      messages,
      meta: {
        totalItems,
        totalPages,
        currentPage: offset,
        pageSize: limit
      }
    }
  }
}

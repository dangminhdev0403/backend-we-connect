import logger from '@configs/logger.js'
import { createResponse } from '@models/response/format.response.js'
import { ChatService } from '@service/chat.service.js'
import { AppError } from '@utils/errors/AppError.js'
import { Request, Response } from 'express'

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const senderId = req.user?.id as string
      const receiverId = req.body.receiverId
      if (senderId == receiverId) {
        logger.error(`Sender ID and receiver ID are the same: ${senderId}`)
        throw new AppError(
          'Sender ID and receiver ID are the same',
          400,
          false,
          'Sender ID and receiver ID are the same'
        )
      }
      const content = req.body.content
      const message = await this.chatService.sendMessage(senderId, receiverId, content)
      res.status(200).json(createResponse({ statusCode: 200, message: 'You send message successfully', data: message }))
    } catch (error: any) {
      logger.error('Error sending message', error)
      throw new AppError('Error sending message', 500, false, error.message)
    }

    return
  }

  public getMessages = async (req: Request, res: Response): Promise<void> => {
    const senderId = req.user?.id as string
    const receiverId = req.params.receiverId
    const offset = Math.max(1, parseInt(req.query.offset as string)) || 1
    const limit = Math.max(1, parseInt(req.query.limit as string)) || 10
    if (!receiverId) {
      logger.error('Missing receiverId in request body')
      throw new AppError(
        'Missing receiverId in request body',
        400,
        false,
        'You must provide receiverId in request body'
      )
    }

    if (senderId && receiverId && senderId == receiverId) {
      logger.error(`Sender ID and receiver ID are the same: ${senderId}`)
      throw new AppError('Sender ID and receiver ID are the same', 400, false, 'Sender ID and receiver ID are the same')
    }
    const messages = await this.chatService.getMessage(senderId, receiverId, offset, limit)
    res.status(200).json(createResponse({ statusCode: 200, message: 'Get messages successfully', data: messages }))
  }
}

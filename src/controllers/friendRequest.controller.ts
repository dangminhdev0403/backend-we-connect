import logger from '@configs/logger.js'
import { createResponse } from '@models/response/format.response.js'
import { FriendRequestService } from '@service/friends/friendRequest.service.js'
import { AppError } from '@utils/errors/AppError.js'
import { Request, Response } from 'express'

export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // Arrow function: giữ nguyên this
  public sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
    const senderId: string = req.user?.id as string
    const receiverId: string = req.body?.receiverId
    logger.info(`Send friend request from ${senderId} to ${receiverId}`)

    if (!receiverId) {
      throw new AppError('Receiver ID is required', 400, false, 'Receiver ID is required')
    }

    const friendRequest = await this.friendRequestService.sendFriendRequest(senderId, receiverId)

    const rs = createResponse({
      statusCode: 201,
      message: 'Friend request sent successfully',
      data: friendRequest
    })

    res.json(rs)
  }

  public respondToRequest = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user?.id as string
    const requestId: string = req.body.requestId
    if (!requestId) throw new AppError('requestId is required', 400, false, 'requestId is required')
    const action: 'accept' | 'reject' = req.body.action
    if (!action) throw new AppError('Action is required', 400, false, 'Action is required')
    if (action !== 'accept' && action !== 'reject') {
      throw new AppError('Invalid action. Must be "accept" or "reject".', 400, false, 'Invalid action')
    }
    const friendRequest = await this.friendRequestService.respondToRequest(userId, requestId, action)
    const message = action === 'accept' ? 'Friend request accepted' : 'Friend request rejected'

    const rs = createResponse({
      statusCode: 200,
      message,
      data: friendRequest
    })

    res.json(rs)
  }

  public getFriendRequests = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user?.id as string
    const offset: number = parseInt(req.query.offset as string) || 1
    const limit: number = parseInt(req.query.limit as string) || 10

    const friendRequests = await this.friendRequestService.getFriendRequests(userId, offset, limit)

    const rs = createResponse({
      statusCode: 200,
      message: 'Friend requests fetched successfully',
      data: friendRequests
    })

    res.json(rs)
  }

  public getListFriend = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user?.id as string
    logger.info(`Get list friend of ${userId}`)
    const offset: number = parseInt(req.query.offset as string) || 1
    const limit: number = parseInt(req.query.limit as string) || 10

    const friends = await this.friendRequestService.getFriendsPaginated(userId, offset, limit)

    const rs = createResponse({
      statusCode: 200,
      message: 'Friends fetched successfully',
      data: friends
    })

    res.json(rs)
  }
}

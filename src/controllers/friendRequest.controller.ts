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
    const requestId: string = req.params.id
    const action: 'accept' | 'reject' = req.body.action

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
    const page: number = parseInt(req.query.page as string) || 1
    const limit: number = parseInt(req.query.limit as string) || 10

    const friendRequests = await this.friendRequestService.getFriendRequests(userId, page, limit)

    const rs = createResponse({
      statusCode: 200,
      message: 'Friend requests fetched successfully',
      data: friendRequests
    })

    res.json(rs)
  }
}

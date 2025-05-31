import { FriendRequestController } from '@controllers/friendRequest.controller.js'
import { FriendRequestService } from '@service/friends/friendRequest.service.js'
import { Router } from 'express'

const friendRequestRouter = Router()

// Inject Service vào Controller
const friendRequestService = new FriendRequestService()
const friendRequestController = new FriendRequestController(friendRequestService)

friendRequestRouter.post('/request', friendRequestController.sendFriendRequest)
friendRequestRouter.put('/:id', friendRequestController.respondToRequest)
friendRequestRouter.get('/incoming', friendRequestController.getFriendRequests)

export default friendRequestRouter

import { FriendRequestController } from '@controllers/friendRequest.controller.js'
import { FriendRequestService } from '@service/friends/friendRequest.service.js'
import { Router } from 'express'

const friendRequestRouter = Router()

// Inject Service vào Controller
const friendRequestService = new FriendRequestService()
const friendRequestController = new FriendRequestController(friendRequestService)

friendRequestRouter.post('/request', friendRequestController.sendFriendRequest)
friendRequestRouter.get('/incoming', friendRequestController.getFriendRequests)
friendRequestRouter.put('/respond', friendRequestController.respondToRequest)
friendRequestRouter.get('/myfriends', friendRequestController.getListFriend)

export default friendRequestRouter

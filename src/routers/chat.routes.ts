// src/routes/chatRoute.ts
import { ChatController } from '@controllers/chat.controller.js'
import upload from '@middlewares/upload.middleware.js'
import { ChatService } from '@service/chat.service.js'
import { Router } from 'express'

const chatRouter = Router()

// Inject Service vào Controller
const chatService = new ChatService()
const chatController = new ChatController(chatService)
chatRouter.post('/send', upload.single('image'), chatController.sendMessage)
chatRouter.get('/:receiverId', chatController.getMessages)

export default chatRouter

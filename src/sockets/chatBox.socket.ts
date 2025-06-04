import logger from '@configs/logger.js'
import { ChatBoxService } from '@service/chatBox.service.js'
import { EVENTS } from '@sockets/events.js'
import { Server, Socket } from 'socket.io'

export const chatSocketHandler = (io: Server, socket: Socket) => {
  const chatService = new ChatBoxService()

  socket.on(EVENTS.CHAT_BOX_QUERY, async (payload) => {
    const { query, userId } = payload
    logger.info(`query: ${query} ${userId}`)
    const requestData = {
      inputs: {},
      query,
      response_mode: 'streaming',
      user: userId,
      conversation_id: '' // nếu có session
    }

    try {
      await chatService.streamChatMessages(
        requestData,
        (text) => socket.emit(EVENTS.CHAT_BOX_RESPONSE, { text }),
        () => socket.emit(EVENTS.CHAT_BOX_END),
        (error) => socket.emit(EVENTS.CHAT_BOX_ERROR, { message: error.message })
      )
    } catch (err: any) {
      socket.emit(EVENTS.CHAT_BOX_ERROR, { message: err.message })
    }
  })
}

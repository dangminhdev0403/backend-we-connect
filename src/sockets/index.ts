import logger from '@configs/logger.js'
import { chatSocketHandler } from '@sockets/chatBox.socket.js'
import { EVENTS } from '@sockets/events.js'
import jwt from 'jsonwebtoken'
import { Server, Socket } from 'socket.io'

const users = new Map<string, Socket>()

export const registerSocketHandlers = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    logger.info(`🪪 Received token: ${token || 'No token'}`)

    if (!token) {
      logger.error('❌ No token provided')
      return next(new Error('No token provided'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      logger.info(`✅ Decoded token full: ${JSON.stringify(decoded, null, 2)}`)

      if (typeof decoded === 'object' && decoded && 'id' in decoded) {
        socket.data = decoded
        logger.info(`✅ socket.data set: ${JSON.stringify(socket.data, null, 2)}`)
        return next()
      } else {
        logger.error(`❌ Invalid token payload: ${JSON.stringify(decoded)}`)
        return next(new Error('Invalid token payload'))
      }
    } catch (err: any) {
      logger.error(`❌ JWT verification error: ${err.message}`)
      return next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    logger.info(`✅ socket.data: ${JSON.stringify(socket.data, null, 2)}`)

    const userId = socket.data?.id || socket.data?.sub || null
    logger.info(`👤 Extracted userId: ${userId}`)

    if (!userId) {
      logger.error('❌ No userId found in socket.data')
      return
    }

    users.set(userId, socket)
    logger.info(`📡 Connected users: ${users.size}`)

    socket.on('send-message', (data) => {
      logger.info(`📩 Message received: ${JSON.stringify(data)}`)
      io.emit('receive-message', data)
    })

    socket.on('disconnect', () => {
      logger.info(`❌ Client disconnected: ${socket.id}`)
      users.delete(userId)
      logger.info(`👥 Remaining connected users: ${users.size}`)
    })

    socket.on(EVENTS.SEND_FRIEND_REQUEST, ({ receiverId }) => {
      logger.info(`📨 Sending friend request from ${userId} to ${receiverId}`)

      const receiverSocket = users.get(receiverId)
      const senderSocket = users.get(userId)

      const payload = {
        from: userId,
        to: receiverId,
        message: 'Friend request sent',
        sentAt: new Date().toISOString()
      }

      // Gửi cho người nhận (receiver)
      if (receiverSocket) {
        receiverSocket.emit(EVENTS.FRIEND_REQUEST_RECEIVED, payload)
        logger.info(`📤 Emitted FRIEND_REQUEST_RECEIVED to ${receiverSocket.id}`)
      }

      // Gửi lại cho người gửi (sender) để frontend tự refetch
      if (senderSocket) {
        senderSocket.emit(EVENTS.SEND_FRIEND_REQUEST, payload)
        logger.info(`📤 Emitted SEND_FRIEND_REQUEST to ${senderSocket.id}`)
      }
    })
    socket.on(EVENTS.FRIEND_REQUEST_APPROVED, ({ receiverId }) => {
      logger.info(`📨 Friend request approved from ${userId} to ${receiverId}`)
      const receiverSocket = users.get(receiverId)
      if (receiverSocket) {
        logger.info(`✅ Found receiver socket: ${receiverSocket.id}`)
        receiverSocket.emit(EVENTS.FRIEND_REQUEST_APPROVED, {
          from: userId,
          message: 'Friend request approved',
          action: 'accept'
        })
        logger.info(`📤 Emitted ${EVENTS.FRIEND_REQUEST_APPROVED} to ${receiverSocket.id}`)
      }
    })
    socket.on(EVENTS.FRIEND_REQUEST_DECLINED, ({ receiverId }) => {
      logger.info(`📨 Friend request declined from ${userId} to ${receiverId}`)
      const receiverSocket = users.get(receiverId)
      if (receiverSocket) {
        logger.info(`✅ Found receiver socket: ${receiverSocket.id}`)
        receiverSocket.emit(EVENTS.FRIEND_REQUEST_DECLINED, {
          from: userId,
          message: 'Friend request declined',
          action: 'reject'
        })
        logger.info(`📤 Emitted ${EVENTS.FRIEND_REQUEST_DECLINED} to ${receiverSocket.id}`)
      }
    })

    socket.on(EVENTS.SEND_MESSAGE, ({ receiverId }) => {
      logger.info(`📨 Friend send new message declined from ${userId} to ${receiverId}`)
      const receiverSocket = users.get(receiverId)
      if (receiverSocket) {
        logger.info(`✅ Found receiver socket: ${receiverSocket.id}`)
        receiverSocket.emit(EVENTS.MESSAGE_RECEIVED, {
          from: userId,
          message: 'Friend message received'
        })
        logger.info(`📤 Emitted ${EVENTS.MESSAGE_RECEIVED} to ${receiverSocket.id}`)
      }
    })

    chatSocketHandler(io, socket)
  })
}

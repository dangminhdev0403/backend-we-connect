import logger from '@configs/logger.js'
import { connectDB } from '@configs/mongoose.js'
import { registerSocketHandlers } from '@sockets/index.js'
import { DecodedToken } from '@utils/type/interface.js'
import http from 'http'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import app from './app.js'

const port = Number(process.env.PORT_NAME ?? 3000)
const ip = '127.0.0.1'

// ⚡ Dùng app đã cấu hình đầy đủ middleware
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FONTENT_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

registerSocketHandlers(io)

async function startServer() {
  try {
    await connectDB()
    server.listen(port, ip, () => {
      console.log(`🚀 Server đang chạy tại http://${ip}:${port}`)
    })
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error)
    process.exit(1)
  }
}

startServer()

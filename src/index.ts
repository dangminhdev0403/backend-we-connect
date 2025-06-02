import { connectDB } from '@configs/mongoose.js'
import { registerSocketHandlers } from '@sockets/index.js'
import http from 'http'
import { Server } from 'socket.io'
import app from './app.js'

const port = Number(process.env.PORT_NAME ?? 3000)
const ip = '127.0.0.1'

const allowedOrigins = [process.env.FONTENT_URL]

// ⚡ Dùng app đã cấu hình đầy đủ middleware
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true) // Cho phép
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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

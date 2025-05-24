import { connectDB } from '@configs/mongoose.js'
import { morganMiddleware } from '@configs/morgan.js'
import { errorHandler } from '@middlewares/errorHandler.js'
import { default as homeRouter, default as userRouter } from '@routers/users.routers.js'
import express, { ErrorRequestHandler } from 'express'

const port = Number(process.env.PORT_NAME)
const ip = '127.0.0.1' // localhost
const app = express()

app.use(express.json())

// Sử dụng router cho người dùng
app.use('/', homeRouter)
app.use('/users', userRouter)
app.use(morganMiddleware)

// đặt cuối cùng middleware
app.use(errorHandler as unknown as ErrorRequestHandler)

async function startServer() {
  try {
    // Nếu cần kết nối MongoDB, bỏ comment và cấu hình tại .env
    // const dbClient = MongoDBClient.getInstance()
    // await dbClient.connect()
    await connectDB() // thay vì MongoDBClient

    app.listen(port, ip, () => {
      console.log(`🚀 Server đang chạy tại http://${ip}:${port}`)
    })
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error)
    process.exit(1)
  }
}

startServer()

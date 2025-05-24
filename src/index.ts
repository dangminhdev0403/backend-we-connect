import { connectDB } from '@configs/mongoose.js'
import { morganMiddleware } from '@configs/morgan.js'
import { jwtAuthGuard } from '@middlewares/auth.middleware.js'
import { createResponse } from '@models/response/format.response.js'
import authRouter from '@routers/auth.routers.js'
import userRouter from '@routers/users.routers.js'
import '@service/auth/passport-config.js' // nếu alias đã config trong tsconfig + moduleAlias
import { errorHandler } from '@utils/errors/errorHandler.js'

import express from 'express'
import passport from 'passport'

const port = Number(process.env.PORT_NAME ?? 3000)
const ip = '127.0.0.1'

const app = express()

// Middleware global
app.use(express.json())
app.use(morganMiddleware)

// Router
app.use(passport.initialize())
// Public routes
app.use('/auth', authRouter)

// Private routes
app.use(jwtAuthGuard)
// Bảo vệ toàn bộ các route dưới đây

app.use('/users', userRouter)

// Home (tuỳ chọn nếu cần route gốc)
app.get('/', (_, res) => {
  res.json(createResponse({ statusCode: 200, message: 'Welcome to API' }))
})

// ❗ Middleware 404 – đặt sau tất cả route
app.use((req, res, _next) => {
  res.status(404).json(
    createResponse({
      statusCode: 404,
      message: 'Resource not found',
      errors: { path: req.originalUrl }
    })
  )
})

// ❗ Cuối cùng – bắt lỗi hệ thống
app.use(errorHandler)

async function startServer() {
  try {
    await connectDB()
    app.listen(port, ip, () => {
      console.log(`🚀 Server đang chạy tại http://${ip}:${port}`)
    })
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error)
    process.exit(1)
  }
}

startServer()

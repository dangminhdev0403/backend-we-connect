import { morganMiddleware } from '@configs/morgan.js'
import { jwtAuthGuard } from '@middlewares/auth.middleware.js'
import { createResponse } from '@models/response/format.response.js'
import { errorHandler } from '@utils/errors/errorHandler.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import passport from 'passport'

import authRouter from '@routers/auth.routers.js'
import friendRequestRouter from '@routers/friendRequest.route.js'
import postRouter from '@routers/post.routes.js'
import userRouter from '@routers/users.routers.js'

// 🟢 Quan trọng: đảm bảo cấu hình chiến lược Passport trước khi dùng
import chatRouter from '@routers/chat.routes.js'
import '@service/auth/passport-config.js'

const app = express()

// CORS
app.use(
  cors({
    origin: process.env.FONTENT_URL ?? 'http://localhost:5173',
    credentials: true
  })
)

app.use(cookieParser())
app.use(express.json())
app.use(morganMiddleware)

// 🛡️ Passport
app.use(passport.initialize())

// Public Route
app.get('/', (_, res) => {
  res.json(createResponse({ statusCode: 200, message: 'Welcome to API' }))
})
app.use('/auth', authRouter)

// Protected Routes
app.use(jwtAuthGuard)
app.use('/users', userRouter)
app.use('/friends', friendRequestRouter)
app.use('/posts', postRouter)
app.use('/chat', chatRouter)
// 404
app.use((req, res) => {
  res.status(404).json(
    createResponse({
      statusCode: 404,
      message: 'Not Found',
      errors: { path: req.originalUrl }
    })
  )
})

// Error handler
app.use(errorHandler)

export default app

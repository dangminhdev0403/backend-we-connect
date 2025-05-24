import { createResponse } from '@models/response/format.response.js'
import { AppError } from '@utils/errors/AppError.js'
import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      createResponse({
        statusCode: err.statusCode,
        message: err.message,
        errors: err.errors ?? null
      })
    )
    return
  }

  // JWT Error: Token không hợp lệ hoặc hết hạn
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json(
      createResponse({
        statusCode: 401,
        message: err.message,
        errors: { message: 'Unauthorized access' }
      })
    )
    return
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json(
      createResponse({
        statusCode: 401,
        message: err.message,
        errors: { message: 'Unauthorized access' }
      })
    )
    return
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => (e as { message: string }).message)

    res.status(400).json({
      message: 'Validation failed',
      errors: errors
    })
    return
  }

  // Lỗi không xác định (500)
  const statusCode = 500
  const message = 'Internal Server Error'

  res.status(statusCode).json(
    createResponse({
      statusCode,
      message,
      errors: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : null
    })
  )
  return
}

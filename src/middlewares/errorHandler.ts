// src/middlewares/errorHandler.ts

import { createResponse } from '@models/response/format.response.js'
import { AppError } from '@utils/errors/AppError.js'
import { NextFunction, Request, Response } from 'express'

/**
 * Middleware xử lý lỗi tập trung toàn hệ thống.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof AppError) {
    // ✅ Lỗi chủ động, có message, statusCode, errors cụ thể
    const errorRes = createResponse({
      statusCode: err.statusCode,
      message: err.message,
      data: null,
      errors: err.errors
    })

    return res.status(err.statusCode).json(errorRes)
  }

  // ❌ Lỗi không lường trước: đưa thông tin vào errors nếu đang dev
  console.error('❌ Unexpected error:', err)

  const isDev = process.env.NODE_ENV === 'development'

  const errorRes = createResponse({
    statusCode: 500,
    message: 'Internal Server Error',
    data: null,
    errors: isDev
      ? {
          name: err.name,
          message: err.message,
          stack: err.stack
        }
      : null
  })

  return res.status(500).json(errorRes)
}

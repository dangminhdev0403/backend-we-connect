import { NextFunction, Request, Response } from 'express'

export interface PaginationParams {
  page: number
  limit: number
}

declare module 'express-serve-static-core' {
  interface Request {
    pagination?: PaginationParams
  }
}

export const Pagination = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100)

    req.pagination = { page, limit }
    next()
  }
}

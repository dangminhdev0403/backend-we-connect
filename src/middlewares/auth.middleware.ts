// src/middlewares/auth.middleware.ts
import { AppError } from '@utils/errors/AppError.js'
import { UserPayload } from '@utils/type/index.js'
import { NextFunction, Request, Response } from 'express'
import passport from 'passport'

// Middleware bảo vệ route
export const jwtAuthGuard = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: unknown, user: Express.User | undefined, info: { message: unknown }) => {
      if (err || !user) {
        next(new AppError('Unauthorized', 401, true, 'Unauthorized access'))
        return
      }
      req.user = user as UserPayload
      next()
    }
  )(req, res, next)
}

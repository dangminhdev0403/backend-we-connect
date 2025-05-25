import { UserResponseDto } from '@models/dto/UserResponseDto.js'
import { createResponse } from '@models/response/format.response.js'
import UserModel, { IUser } from '@models/schema/user.schema.js'
import authService from '@service/auth/auth.service.js'
import userService from '@service/users.service.js'
import { AppError } from '@utils/errors/AppError.js'
import { NextFunction, Request, Response } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import passport from 'passport'

const authController = {
  registerHandler: async (req: Request, res: Response) => {
    const { name, email, password } = req.body
    const user = await userService.createUser({ name, email, password })
    const userRes = new UserResponseDto(user)
    res.json(
      createResponse({
        statusCode: 201,
        message: 'User register successfully',
        data: userRes
      })
    )
  },

  login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'local',
      { session: false },
      async (err: Error | null, user: IUser | false, info: { message: string } | undefined) => {
        if (err) return next(err)
        if (!user) return res.status(401).json({ message: info?.message ?? 'Unauthorized' })

        const { accessToken, refreshToken } = await authService.generateToken(user)

        // Gửi refreshToken bằng HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        })
        return res.json(
          createResponse({
            statusCode: 201,
            message: 'User login successfully',
            data: {
              data: {
                access_token: accessToken,
                user: new UserResponseDto(user)
              }
            }
          })
        )
      }
    )(req, res, next)
  },

  async getRefreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401)
    }

    const tokenDecoded: string | JwtPayload = authService.verifyToken(refreshToken)
    if (typeof tokenDecoded === 'object' && tokenDecoded.exp && Date.now() > tokenDecoded.exp * 1000) {
      const user = await UserModel.findOne({ email: tokenDecoded.email })
      if (!user) {
        throw new AppError('User not found', 404)
      }
      const { refreshToken }: { refreshToken: string } = await authService.generateToken(user)

      // Gửi refreshToken bằng HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
      })
      res.json({ accessToken: tokenDecoded })
    }
  }
}

export default authController

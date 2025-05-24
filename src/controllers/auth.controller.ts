import { UserResponseDto } from '@models/dto/UserResponseDto.js'
import { createResponse } from '@models/response/format.response.js'
import { IUser } from '@models/schema/user.schema.js'
import authService from '@service/auth/auth.service.js'
import userService from '@service/users.service.js'
import { NextFunction, Request, Response } from 'express'
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

        const token = await authService.generateToken(user)
        return res.json(
          createResponse({
            statusCode: 201,
            message: 'User login successfully',
            data: {
              data: {
                access_token: token,
                user: new UserResponseDto(user)
              }
            }
          })
        )
      }
    )(req, res, next)
  },

  async getProfile(req: Request, res: Response) {
    const profile = authService.getProfile(req as any, res)
    return res.json(
      createResponse({
        statusCode: 200,
        message: 'User profile retrieved successfully',
        data: profile
      })
    )
  }
}

export default authController

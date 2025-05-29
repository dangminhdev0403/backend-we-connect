import { UserResponseDto } from '@models/dto/UserResponseDto.js'
import UserModel, { IUser } from '@models/schema/user.schema.js'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'

import { AppError } from '@utils/errors/AppError.js'

class AuthService {
  async validateUser(email: string, password: string) {
    const user = await UserModel.findOne({ email })
    if (!user) throw new AppError('Unauthorized', 401, false, 'Bad Creatails')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new AppError('Unauthorized', 401, false, 'Bad Creatails')
    const responseUser = new UserResponseDto({ id: user._id, name: user.name, email: user.email })
    return responseUser
  }

  async validateUserByToken(jwt_payload: { name: string; sub: string }) {
    const user = await UserModel.findOne({ email: jwt_payload.sub })
    if (!user) throw new AppError('Unauthorized', 401, false, 'Bad Creatails')

    const responseUser = new UserResponseDto({ id: user._id, name: user.name, email: user.email })
    return responseUser
  }

  async generateToken(user: IUser) {
    const payload = {
      name: user.name,
      sub: user.email
    }
    const secret = process.env.JWT_SECRET ?? 'your_jwt_secret'
    const expiresIn: string = process.env.ACCESS_TOKEN_EXPIRES_IN ?? '1h'
    const refreshTokenExpiresIn: string = process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d'
    const secretRefresh = process.env.REFRESH_TOKEN_SECRET ?? 'your_refresh_token_secret'
    const options: jwt.SignOptions = {
      // @ts-expect-error: expiresIn type is compatible but not recognized by type definition
      expiresIn
    }
    const optionsRefresh: jwt.SignOptions = {
      // @ts-expect-error: expiresIn type is compatible but not recognized by type definition

      expiresIn: refreshTokenExpiresIn
    }

    const accessToken = jwt.sign(payload, secret, options)
    const refreshToken = jwt.sign(payload, secretRefresh, { ...optionsRefresh })

    return { accessToken, refreshToken }
  }

  verifyToken(token: string): JwtPayload {
    const secret = process.env.REFRESH_TOKEN_SECRET!
    try {
      const decoded = jwt.verify(token, secret)
      if (typeof decoded !== 'object') {
        throw new AppError('Invalid refresh token', 401)
      }
      return decoded
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err) {
        const errorName = (err as { name: string }).name
        if (errorName === 'TokenExpiredError') {
          throw new AppError('Refresh token expired', 401)
        } else if (errorName === 'JsonWebTokenError') {
          throw new AppError('Invalid refresh token', 401)
        }
      }
      throw new AppError('Authentication failed', 401)
    }
  }
}

export default new AuthService()

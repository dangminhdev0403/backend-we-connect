import { UserResponseDto } from '@models/dto/UserResponseDto.js'
import UserModel, { IUser } from '@models/schema/user.schema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { AppError } from '@utils/errors/AppError.js'
import { Request, Response } from 'express'

interface AuthenticatedRequest extends Request {
  user?: IUser
}

class AuthService {
  async validateUser(email: string, password: string) {
    const user = await UserModel.findOne({ email })
    if (!user) throw new AppError('Unauthorized', 401, false, 'Bad Creatails')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new AppError('Unauthorized', 401, false, 'Bad Creatails')
    const responseUser = new UserResponseDto(user)
    return responseUser
  }

  async generateToken(user: IUser) {
    const payload = {
      name: user.name,
      email: user.email
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET ?? 'your_jwt_secret', {
      expiresIn: '1h'
    })
    return token
  }

  getProfile(req: AuthenticatedRequest, res: Response) {
    return res.json({ user: req.user })
  }
}

export default new AuthService()

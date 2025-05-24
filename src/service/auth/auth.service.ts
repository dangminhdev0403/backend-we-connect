import { UserResponseDto } from '@models/dto/UserResponseDto.js'
import UserModel, { IUser } from '@models/schema/user.schema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

class AuthService {
  async validateUser(email: string, password: string) {
    const user = await UserModel.findOne({ email })
    if (!user) return null

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return null
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
}

export default new AuthService()

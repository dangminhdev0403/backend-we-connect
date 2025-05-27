// types/express/index.d.ts
import { UserResponseDto } from '@models/dto/UserResponseDto.ts'

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDto
    }
  }
}

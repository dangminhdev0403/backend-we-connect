import { Types } from 'mongoose'

export class UserResponseDto {
  readonly id: string
  readonly name: string
  readonly email: string

  constructor({ id, name, email }: { id: Types.ObjectId; name: string; email: string }) {
    this.id = id ? id.toString() : ''
    this.name = name
    this.email = email
  }
}

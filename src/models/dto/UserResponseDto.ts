// user.dto.js
export class UserResponseDto {
  private readonly _name: string
  private readonly _email: string
  constructor({ name, email }: { name: string; email: string }) {
    this._name = name
    this._email = email
  }
  get name(): string {
    return this._name
  }

  get email(): string {
    return this._email
  }
}

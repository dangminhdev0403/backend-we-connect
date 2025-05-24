// user.dto.js
export class CreateUserDto {
  private readonly name: string
  private readonly email: string
  constructor({ name, email }: { name: string; email: string }) {
    this.name = name
    this.email = email
  }
}

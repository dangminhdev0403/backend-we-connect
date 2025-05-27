export class UserResponseDto {
  readonly name: string
  readonly email: string

  constructor({ name, email }: { name: string; email: string }) {
    this.name = name
    this.email = email
  }
}

export interface DecodedToken {
  id: string
  sub: string
  name?: string
  iat?: number
  exp?: number
}

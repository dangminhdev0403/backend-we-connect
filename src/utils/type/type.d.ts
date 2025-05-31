// types/express/index.d.ts

export interface UserPayload {
  id: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}
import 'socket.io'

declare module 'socket.io' {
  interface Socket {
    data?: {
      _id: string
      email: string
      name?: string
    }
  }
}

export {}

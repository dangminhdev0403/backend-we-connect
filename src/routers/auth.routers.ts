import authController from '@controllers/auth.controller.js'
import { Router } from 'express'

const authRouter = Router()

// authRouter.post('/login')
authRouter.post('/login', authController.login)
// authRouter.post('/logout')

authRouter.post('/register', authController.registerHandler)
authRouter.get('/refresh', authController.getRefreshToken)

export default authRouter

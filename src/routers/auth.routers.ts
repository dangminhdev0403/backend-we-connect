import authController from '@controllers/auth.controller.js'
import { Router } from 'express'

const authRouter = Router()

// authRouter.post('/login')
authRouter.post('/login', authController.login)

authRouter.post('/register', authController.registerHandler)
// authRouter.post('/logout')

export default authRouter

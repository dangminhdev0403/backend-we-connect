import * as userController from '@controllers/user.controller.js'
import { Router } from 'express'

const userRouter = Router()

// Các route cho CRUD User
userRouter.post('/', userController.create)
userRouter.get('/', userController.getAll)
userRouter.put('/:id', userController.update) // OK
userRouter.delete('/:id', userController.remove)

export default userRouter

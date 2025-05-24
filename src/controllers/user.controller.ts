import logger from '@configs/logger.js'
import * as userService from '@service/users.service.js'
import { Request, RequestHandler, Response } from 'express'
import mongoose from 'mongoose'

export const create = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body)
  res.status(201).json(user)
}

export const getAll = async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers()
  res.json(users)
}

export const getOne = async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}
export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    logger.info('ID nhận từ client:', id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid user ID' })
      return
    }

    const user = await userService.updateUser(id, req.body)

    // Nếu không tìm thấy user
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Trả về user nếu thành công
    res.json(user)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message })
      return
    }

    // Nếu không phải Error instance, chuyển tiếp cho middleware lỗi
    next(error)
  }
}

export const remove = async (req: Request, res: Response): Promise<void> => {
  const user = await userService.deleteUser(req.params.id)
  res.json({ message: 'Deleted successfully' })
}

import logger from '@configs/logger.js'
import UserModel, { IUser } from '@models/schema/user.schema.js'
import { AppError } from '@utils/errors/AppError.js'

export const getAllUsers = async (): Promise<IUser[]> => {
  return await UserModel.find()
}
// Lấy user theo id
export const getUserById = async (id: string): Promise<IUser | null> => {
  const user = await UserModel.findById(id)
  logger.info('getUserById', user)
  return user
}

// Tạo user mới
export const createUser = async (userData: { name: string; email: string; password: string }): Promise<IUser> => {
  const existingUser = await UserModel.findOne({ email: userData.email })
  if (existingUser) {
    throw new AppError('User already exists', 400, true, {
      email: 'Email already exists'
    })
  }
  logger.info('createUser', userData)
  const user = new UserModel(userData)
  return await user.save()
}

// Cập nhật user
export const updateUser = async (id: string, userData: Partial<IUser>): Promise<IUser | null> => {
  const existingUserId = await UserModel.findById(id)
  if (!existingUserId) {
    throw new AppError('User not found', 404, true, {
      id: 'User not found'
    })
  }
  const existingUser = await UserModel.findOne({ email: userData.email })
  if (existingUser) {
    throw new AppError('User already exists', 400, true, {
      email: 'Email already exists'
    })
  }
  logger.info('updateUser', userData)
  return await UserModel.findByIdAndUpdate(id, userData, { new: true })
}

// Xóa user
export const deleteUser = async (id: string): Promise<IUser | null> => {
  return await UserModel.findByIdAndDelete(id)
}

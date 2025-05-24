import { CreateUserDto } from '@models/dto/CreateUserDto.js'
import { createResponse } from '@models/response/format.response.js'
import userService from '@service/users.service.js'
import { Request, Response } from 'express'

const authController = {
  registerHandler: async (req: Request, res: Response) => {
    const { name, email, password } = req.body
    const user = await userService.createUser({ name, email, password })
    const userRes = new CreateUserDto(user)
    res.json(
      createResponse({
        statusCode: 201,
        message: 'User register successfully',
        data: userRes
      })
    )
  }
}

export default authController

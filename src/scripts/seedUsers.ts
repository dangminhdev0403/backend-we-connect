import { faker } from '@faker-js/faker'
import UserModel from '@models/schema/users/user.schema.js'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

async function seedUsers() {
  try {
    await mongoose.connect(
      'mongodb+srv://abcxyzui:root@cluster0.1zmxmtu.mongodb.net/weconnect?retryWrites=true&w=majority&appName=Cluster0'
    )

    const userCount = 100
    const passwordPlain = '123456'
    const salt = await bcrypt.genSalt(10)

    const users = await Promise.all(
      Array.from({ length: userCount }).map(async () => {
        const name = faker.person.fullName()
        const email = faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] })
        const password = await bcrypt.hash(passwordPlain, salt)
        return { name, email, password }
      })
    )

    await UserModel.deleteMany({})
    await UserModel.insertMany(users)

    console.log(`✅ Seeded ${userCount} users successfully`)
  } catch (err) {
    console.error('❌ Error seeding users:', err)
  } finally {
    await mongoose.disconnect()
  }
}

seedUsers()

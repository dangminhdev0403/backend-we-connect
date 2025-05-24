// src/configs/mongoose.ts
import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()

const { MONGO_URI } = process.env

if (!MONGO_URI) throw new Error('Missing MONGO_URI in .env')

export const connectDB = async () => {
  try {
    const uri = MONGO_URI

    await mongoose.connect(uri)
    console.log('✅ Mongoose connected to database:', mongoose.connection.name)
  } catch (err) {
    console.error('❌ Failed to connect Mongoose:', err)
    process.exit(1)
  }
}

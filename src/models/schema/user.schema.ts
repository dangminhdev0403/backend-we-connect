import bcrypt from 'bcrypt'
import mongoose, { Document, Schema } from 'mongoose'

// Định nghĩa interface cho document User (bổ sung kiểu cho TS)
export interface IUser extends Document {
  name: string
  email: string
  password: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

// Tạo schema
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password as string, salt)
  next()
})

// Tạo model
const UserModel = mongoose.model<IUser>('User', UserSchema)

export default UserModel

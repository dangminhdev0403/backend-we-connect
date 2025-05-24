// src/passport-config.ts
import UserModel from '@models/schema/user.schema.js'
import authService from '@service/auth/auth.service.js'
import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'

// Local Strategy - xác thực email + password
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        console.log('✅ LocalStrategy running')

        const user = await authService.validateUser(email, password)

        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }
  )
)

// JWT Strategy - bảo vệ route cần token
const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET ?? 'your_jwt_secret'
}

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await UserModel.findById(jwt_payload.id)
      if (user) return done(null, user)
      else return done(null, false)
    } catch (error) {
      return done(error, false)
    }
  })
)

export default passport

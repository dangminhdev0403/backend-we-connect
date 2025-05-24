// src/passport-config.ts
import logger from '@configs/logger.js'
import authService from '@service/auth/auth.service.js'
import { AppError } from '@utils/errors/AppError.js'
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
      console.log('✅ JWTStrategy running')

      const user = await authService.validateUserByToken(jwt_payload)
      return done(null, user)
    } catch (error) {
      logger.error('❌ JWTStrategy error:', error)
      return done(new AppError('Unauthorized', 401, true, 'Bad Creatails'), false, error)
    }
  })
)

export default passport

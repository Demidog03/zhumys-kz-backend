import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { registerSchema, loginSchema } from './auth.schema'
import * as authService from './auth.service'
import { authMiddleware, type AuthEnv } from '../../lib/auth.middleware'

export const authRoutes = new Hono<AuthEnv>()
export const meRoutes = new Hono<AuthEnv>()

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const result = await authService.register(c.req.valid('json'))
  return c.json(result, 201)
})

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const result = await authService.login(c.req.valid('json'))
  return c.json(result, 200)
})

meRoutes.get('/me', authMiddleware, async (c) => {
  const user = await authService.getMe(c.get('userId'))
  return c.json({ user }, 200)
})

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verifyToken } from './jwt'

/**
 * Variables set on the Hono context by {@link authMiddleware}.
 * Type your route group with `new Hono<AuthEnv>()` to read them safely.
 */
export interface AuthEnv {
  Variables: {
    userId: string
    email: string
  }
}

/**
 * Verifies the `Authorization: Bearer <token>` header and, on success, sets
 * `userId` and `email` on the context. Throws 401 when the token is missing,
 * malformed, or expired.
 */
export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid Authorization header' })
  }

  const token = header.slice('Bearer '.length).trim()
  try {
    const payload = await verifyToken(token)
    c.set('userId', payload.sub)
    c.set('email', payload.email)
  } catch {
    throw new HTTPException(401, { message: 'Invalid or expired token' })
  }

  await next()
})

import { sign, verify } from 'hono/jwt'
import { env } from '../env'

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export interface TokenPayload {
  sub: string
  email: string
  exp: number
}

export async function signToken(user: { id: string; email: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return sign(
    { sub: user.id, email: user.email, exp: now + TOKEN_TTL_SECONDS },
    env.JWT_SECRET,
    'HS256',
  )
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  return (await verify(token, env.JWT_SECRET, 'HS256')) as TokenPayload
}

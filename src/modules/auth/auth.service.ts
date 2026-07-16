import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import { db } from '../../db'
import { users, toPublicUser, type PublicUser } from '../../db/schema'
import { hashPassword, verifyPassword } from '../../lib/password'
import { signToken } from '../../lib/jwt'
import type { RegisterInput, LoginInput } from './auth.schema'

export interface AuthResult {
  user: PublicUser
  token: string
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    columns: { id: true },
  })
  if (existing) {
    throw new HTTPException(409, { message: 'Email already registered' })
  }

  const passwordHash = await hashPassword(input.password)
  const [user] = await db
    .insert(users)
    .values({ email: input.email, name: input.name, passwordHash })
    .returning()

  return { user: toPublicUser(user!), token: await signToken(user!) }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) })
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new HTTPException(401, { message: 'Invalid email or password' })
  }

  return { user: toPublicUser(user), token: await signToken(user) }
}

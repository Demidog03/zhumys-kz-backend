import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const KEY_LENGTH = 64

/** Hash a plaintext password. Returns `salt:hash` (both hex). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return `${salt.toString('hex')}:${derived.toString('hex')}`
}

/** Verify a plaintext password against a stored `salt:hash`. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false

  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const derived = (await scryptAsync(password, salt, expected.length)) as Buffer

  return expected.length === derived.length && timingSafeEqual(expected, derived)
}

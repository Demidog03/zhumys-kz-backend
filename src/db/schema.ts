import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  name: text().notNull(),
  role: text().notNull().default('user'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

/** A user safe to send over the wire — never includes `passwordHash`. */
export type PublicUser = Omit<User, 'passwordHash'>

export function toPublicUser({ passwordHash: _passwordHash, ...user }: User): PublicUser {
  return user
}

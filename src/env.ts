import { z } from 'zod'

// Load .env into process.env (Node >=20.6 built-in; no dotenv dependency).
try {
  process.loadEnvFile()
} catch {
  // No .env file present — rely on real environment variables.
}

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsed.data

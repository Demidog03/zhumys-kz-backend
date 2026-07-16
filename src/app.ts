import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import { env } from './env'
import { authRoutes } from './modules/auth/auth.routes'

export const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: env.CORS_ORIGIN, credentials: true }))

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/auth', authRoutes)

app.notFound((c) => c.json({ error: 'Not found' }, 404))

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

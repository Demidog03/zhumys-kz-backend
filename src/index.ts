import { serve } from '@hono/node-server'
import { app } from './app'
import { env } from './env'

serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
  console.log(`🚀 zhumys-kz-backend listening on http://localhost:${port}`)
})

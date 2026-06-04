import { handle } from 'hono/vercel'
import { app } from '../apps/api/src/app.js'

export const config = {
  maxDuration: 300,
  memory: 3008,
}

export default handle(app)

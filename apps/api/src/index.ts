import { serve } from '@hono/node-server'
import { app } from './app.js'
import { ensureInitialized, shutdown } from './ocr.js'

const PORT = Number(process.env.PORT ?? 3001)
const OCR_WARMUP = process.env.OCR_WARMUP === 'true'

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`)
})

if (OCR_WARMUP) {
  console.log('Warming up OCR models (first run may download models)...')
  ensureInitialized()
    .then(() => console.log('OCR ready'))
    .catch((err) => console.error('OCR warmup failed:', err))
}

const onShutdown = async () => {
  await shutdown()
  process.exit(0)
}

process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)

export { app, server }

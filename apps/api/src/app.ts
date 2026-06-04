import {
  ApiErrorSchema,
  OcrBatchResponseSchema,
  OcrResponseSchema,
} from '@paddle-ocr/shared'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  collectImageFiles,
  MAX_BATCH_FILES,
  validateImageFile,
} from './files.js'
import {
  ensureInitialized,
  isOcrInitialized,
  recognizeFromBuffer,
} from './ocr.js'

function allowedOrigins(): string[] {
  const origins = ['http://localhost:5173']
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`)
  }
  if (process.env.VERCEL_BRANCH_URL) {
    origins.push(`https://${process.env.VERCEL_BRANCH_URL}`)
  }
  if (process.env.WEB_ORIGIN) {
    origins.push(process.env.WEB_ORIGIN)
  }
  return origins
}

export const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      if (!origin) return '*'
      const allowed = allowedOrigins()
      return allowed.includes(origin) ? origin : allowed[0]!
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

app.get('/health', (c) => c.json({ ok: true }))

app.get('/api/ocr/status', (c) => c.json({ initialized: isOcrInitialized() }))

async function runOcrOnFile(file: File) {
  const validationError = validateImageFile(file)
  if (validationError) {
    return {
      ok: false as const,
      error: ApiErrorSchema.parse({
        error: validationError,
        code: 'INVALID_FILE',
      }),
    }
  }

  await ensureInitialized()
  const buffer = await file.arrayBuffer()
  const result = await recognizeFromBuffer(buffer)
  return { ok: true as const, result: OcrResponseSchema.parse(result) }
}

app.post('/api/ocr', async (c) => {
  try {
    const body = await c.req.parseBody({ all: true })
    const files = collectImageFiles(body)

    if (files.length === 0) {
      return c.json(
        ApiErrorSchema.parse({
          error: 'Missing image file',
          code: 'MISSING_FILE',
        }),
        400,
      )
    }

    const file = files[0]!
    const outcome = await runOcrOnFile(file)

    if (!outcome.ok) {
      return c.json(outcome.error, 400)
    }

    return c.json(outcome.result)
  } catch (err) {
    console.error('OCR failed:', err)
    return c.json(
      ApiErrorSchema.parse({
        error: 'OCR processing failed',
        code: 'OCR_ERROR',
      }),
      500,
    )
  }
})

app.post('/api/ocr/batch', async (c) => {
  try {
    const body = await c.req.parseBody({ all: true })
    const files = collectImageFiles(body)

    if (files.length === 0) {
      return c.json(
        ApiErrorSchema.parse({
          error: 'No images provided',
          code: 'MISSING_FILES',
        }),
        400,
      )
    }

    if (files.length > MAX_BATCH_FILES) {
      return c.json(
        ApiErrorSchema.parse({
          error: `Maximum ${MAX_BATCH_FILES} images per batch`,
          code: 'TOO_MANY_FILES',
        }),
        400,
      )
    }

    const results = []

    for (const file of files) {
      try {
        const outcome = await runOcrOnFile(file)
        if (!outcome.ok) {
          results.push({ fileName: file.name, error: outcome.error })
        } else {
          results.push({ fileName: file.name, result: outcome.result })
        }
      } catch (err) {
        console.error(`OCR failed for ${file.name}:`, err)
        results.push({
          fileName: file.name,
          error: ApiErrorSchema.parse({
            error: 'OCR processing failed',
            code: 'OCR_ERROR',
          }),
        })
      }
    }

    return c.json(OcrBatchResponseSchema.parse({ results }))
  } catch (err) {
    console.error('Batch OCR failed:', err)
    return c.json(
      ApiErrorSchema.parse({
        error: 'Batch processing failed',
        code: 'BATCH_ERROR',
      }),
      500,
    )
  }
})

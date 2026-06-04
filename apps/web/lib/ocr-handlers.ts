import 'server-only'
import {
  ApiErrorSchema,
  OcrBatchResponseSchema,
  OcrResponseSchema,
} from '@paddle-ocr/shared'
import { NextResponse } from 'next/server'
import { collectImageFiles, MAX_BATCH_FILES, validateImageFile } from './files'

export const ocrRouteSegmentConfig = {
  runtime: 'nodejs' as const,
  maxDuration: 300,
  dynamic: 'force-dynamic' as const,
}

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

  const { ensureInitialized, recognizeFromBuffer } = await import('./ocr')
  await ensureInitialized()
  const buffer = await file.arrayBuffer()
  const result = await recognizeFromBuffer(buffer)
  return { ok: true as const, result: OcrResponseSchema.parse(result) }
}

export async function handleOcrPost(request: Request) {
  try {
    const formData = await request.formData()
    const files = collectImageFiles(formData)

    if (files.length === 0) {
      return NextResponse.json(
        ApiErrorSchema.parse({
          error: 'Missing image file',
          code: 'MISSING_FILE',
        }),
        { status: 400 },
      )
    }

    const outcome = await runOcrOnFile(files[0]!)

    if (!outcome.ok) {
      return NextResponse.json(outcome.error, { status: 400 })
    }

    return NextResponse.json(outcome.result)
  } catch (err) {
    console.error('OCR failed:', err)
    return NextResponse.json(
      ApiErrorSchema.parse({
        error: 'OCR processing failed',
        code: 'OCR_ERROR',
      }),
      { status: 500 },
    )
  }
}

export async function handleOcrBatchPost(request: Request) {
  try {
    const formData = await request.formData()
    const files = collectImageFiles(formData)

    if (files.length === 0) {
      return NextResponse.json(
        ApiErrorSchema.parse({
          error: 'No images provided',
          code: 'MISSING_FILES',
        }),
        { status: 400 },
      )
    }

    if (files.length > MAX_BATCH_FILES) {
      return NextResponse.json(
        ApiErrorSchema.parse({
          error: `Maximum ${MAX_BATCH_FILES} images per batch`,
          code: 'TOO_MANY_FILES',
        }),
        { status: 400 },
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

    return NextResponse.json(OcrBatchResponseSchema.parse({ results }))
  } catch (err) {
    console.error('Batch OCR failed:', err)
    return NextResponse.json(
      ApiErrorSchema.parse({
        error: 'Batch processing failed',
        code: 'BATCH_ERROR',
      }),
      { status: 500 },
    )
  }
}

import 'server-only'
import { OcrResponseSchema, type OcrResponse } from '@paddle-ocr/shared'
import type {
  PaddleOcrResult,
  PaddleOcrService,
  RecognitionResult,
} from 'ppu-paddle-ocr'

let ocr: PaddleOcrService | null = null
let initPromise: Promise<void> | null = null
let initialized = false

async function getOcr(): Promise<PaddleOcrService> {
  if (!ocr) {
    const { PaddleOcrService } = await import('ppu-paddle-ocr')
    ocr = new PaddleOcrService()
  }
  return ocr
}

export function isOcrInitialized(): boolean {
  return initialized
}

export async function ensureInitialized(): Promise<void> {
  if (initialized) return
  if (!initPromise) {
    initPromise = getOcr()
      .then((service) => service.initialize())
      .then(() => {
        initialized = true
      })
  }
  await initPromise
}

export async function recognizeFromBuffer(
  buffer: ArrayBuffer,
): Promise<OcrResponse> {
  await ensureInitialized()
  const service = await getOcr()
  const raw: PaddleOcrResult = await service.recognize(buffer)

  const flatLines: RecognitionResult[] = raw.lines.flat()
  const lines = flatLines.map((line) => ({
    text: line.text,
    box: line.box,
  }))

  const response: OcrResponse = {
    text: raw.text,
    lines,
  }

  return OcrResponseSchema.parse(response)
}

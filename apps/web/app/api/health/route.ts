import { ocrRouteSegmentConfig } from '@/lib/ocr-handlers'

export const { runtime, maxDuration, dynamic } = ocrRouteSegmentConfig

export function GET() {
  return Response.json({ ok: true })
}

import { ocrRouteSegmentConfig } from '@/lib/ocr-handlers'

export const { runtime, maxDuration, dynamic } = ocrRouteSegmentConfig

export async function GET() {
  const { isOcrInitialized } = await import('@/lib/ocr')
  return Response.json({ initialized: isOcrInitialized() })
}

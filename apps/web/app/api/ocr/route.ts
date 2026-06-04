import { handleOcrPost, ocrRouteSegmentConfig } from '@/lib/ocr-handlers'

export const { runtime, maxDuration, dynamic } = ocrRouteSegmentConfig

export const POST = handleOcrPost

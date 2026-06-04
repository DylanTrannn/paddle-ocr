import { z } from 'zod'

export const OcrBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
})

export const OcrLineSchema = z.object({
  text: z.string(),
  box: OcrBoxSchema.optional(),
})

export const OcrResponseSchema = z.object({
  text: z.string(),
  lines: z.array(OcrLineSchema),
})

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
})

export const OcrBatchItemSchema = z.object({
  fileName: z.string(),
  result: OcrResponseSchema.optional(),
  error: ApiErrorSchema.optional(),
})

export const OcrBatchResponseSchema = z.object({
  results: z.array(OcrBatchItemSchema),
})

export type OcrLine = z.infer<typeof OcrLineSchema>
export type OcrResponse = z.infer<typeof OcrResponseSchema>
export type ApiError = z.infer<typeof ApiErrorSchema>
export type OcrBatchItem = z.infer<typeof OcrBatchItemSchema>
export type OcrBatchResponse = z.infer<typeof OcrBatchResponseSchema>

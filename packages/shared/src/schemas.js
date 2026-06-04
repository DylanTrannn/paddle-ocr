import { z } from "zod";
export const OcrBoxSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
});
export const OcrLineSchema = z.object({
    text: z.string(),
    box: OcrBoxSchema.optional(),
});
export const OcrResponseSchema = z.object({
    text: z.string(),
    lines: z.array(OcrLineSchema),
});
export const ApiErrorSchema = z.object({
    error: z.string(),
    code: z.string().optional(),
});

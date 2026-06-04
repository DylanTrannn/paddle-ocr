import { z } from "zod";
export declare const OcrBoxSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
    width: number;
    height: number;
}, {
    x: number;
    y: number;
    width: number;
    height: number;
}>;
export declare const OcrLineSchema: z.ZodObject<{
    text: z.ZodString;
    box: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        width: number;
        height: number;
    }, {
        x: number;
        y: number;
        width: number;
        height: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    text: string;
    box?: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | undefined;
}, {
    text: string;
    box?: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | undefined;
}>;
export declare const OcrResponseSchema: z.ZodObject<{
    text: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        box: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        box?: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | undefined;
    }, {
        text: string;
        box?: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    text: string;
    lines: {
        text: string;
        box?: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | undefined;
    }[];
}, {
    text: string;
    lines: {
        text: string;
        box?: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | undefined;
    }[];
}>;
export declare const ApiErrorSchema: z.ZodObject<{
    error: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error: string;
    code?: string | undefined;
}, {
    error: string;
    code?: string | undefined;
}>;
export type OcrLine = z.infer<typeof OcrLineSchema>;
export type OcrResponse = z.infer<typeof OcrResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

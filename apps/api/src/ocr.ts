import { OcrResponseSchema, type OcrResponse } from "@paddle-ocr/shared";
import {
  PaddleOcrService,
  type PaddleOcrResult,
  type RecognitionResult,
} from "ppu-paddle-ocr";

const ocr = new PaddleOcrService();
let initPromise: Promise<void> | null = null;
let initialized = false;

export function isOcrInitialized(): boolean {
  return initialized;
}

export async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    initPromise = ocr.initialize().then(() => {
      initialized = true;
    });
  }
  await initPromise;
}

export async function recognizeFromBuffer(buffer: ArrayBuffer): Promise<OcrResponse> {
  await ensureInitialized();
  const raw: PaddleOcrResult = await ocr.recognize(buffer);

  const flatLines: RecognitionResult[] = raw.lines.flat();
  const lines = flatLines.map((line) => ({
    text: line.text,
    box: line.box,
  }));

  const response: OcrResponse = {
    text: raw.text,
    lines,
  };

  return OcrResponseSchema.parse(response);
}

export async function shutdown(): Promise<void> {
  if (!initialized) return;
  await ocr.destroy();
  initialized = false;
  initPromise = null;
}

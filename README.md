# PaddleOCR Learning Monorepo

A small learning project for [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) using **local inference** with [ppu-paddle-ocr](https://jsr.io/@snowfluke/ppu-paddle-ocr) (PP-OCRv5 on ONNX Runtime). No cloud API key required.

**Stack:** pnpm workspaces, TypeScript, **Next.js** (App Router), Zod.

## Prerequisites

- Node.js 20+
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)

## Quick start

```bash
pnpm install
cp .env.example .env   # optional: OCR_WARMUP
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), upload images, and run OCR.

## First run

On the first OCR request (or on server start if `OCR_WARMUP=true`), PP-OCRv5 mobile models download to `~/.cache/ppu-paddle-ocr`. This can take **1–3+ minutes** depending on your connection. Later runs are much faster.

## API endpoints

| Method | Path                 | Description                                      |
| ------ | -------------------- | ------------------------------------------------ |
| GET    | `/api/health`        | Health check                                     |
| GET    | `/api/ocr/status`    | Whether OCR models are initialized               |
| POST   | `/api/ocr`           | Single image: multipart field `image` (max 10MB) |
| POST   | `/api/ocr/batch`     | Multiple images: field `images[]` (max 20 files) |

### Example (curl)

```bash
curl -X POST http://localhost:3000/api/ocr \
  -F "image=@./your-image.png"
```

## Project layout

```
apps/
  web/     # Next.js UI + API route handlers (OCR)
packages/
  shared/  # Zod schemas (OcrResponse, ApiError)
```

## Scripts

| Command          | Description        |
| ---------------- | ------------------ |
| `pnpm dev`       | Next.js dev server |
| `pnpm build`     | Production build   |
| `pnpm start`     | Production server  |
| `pnpm typecheck` | Typecheck all      |

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Add env var `OCR_WARMUP=true` (optional, preloads models on cold start).
4. Deploy.

Vercel auto-detects Next.js. OCR routes use the Node.js runtime with `serverExternalPackages` for `onnxruntime-node`.

**Note:** The OCR stack is large (~250MB+ with native deps). You may need a Vercel Pro plan for bundle limits and longer function timeouts (routes are configured for up to 300s).

## Troubleshooting

- **`onnxruntime-node` install fails:** Ensure you are on a supported platform (macOS arm64/x64, Linux x64). Try `pnpm install` again after updating Node.
- **OCR hangs on first request:** Models may still be downloading; check disk space and network. Set `OCR_WARMUP=true` and restart the dev server.
- **Build fails on Vercel:** Confirm Root Directory is `apps/web` and Node.js 20+ is selected.

## Learn more

- [PaddleOCR docs](https://www.paddleocr.ai/)
- [ppu-paddle-ocr on JSR](https://jsr.io/@snowfluke/ppu-paddle-ocr)

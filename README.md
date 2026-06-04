# PaddleOCR Learning Monorepo

A small learning project for [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) using **local inference** with [ppu-paddle-ocr](https://jsr.io/@snowfluke/ppu-paddle-ocr) (PP-OCRv5 on ONNX Runtime). No cloud API key required.

**Stack:** pnpm workspaces, TypeScript, React + Vite, Hono, Zod.

## Prerequisites

- Node.js 20+
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)

## Quick start

```bash
pnpm install
cp .env.example apps/api/.env   # optional: PORT and OCR_WARMUP
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173), upload an image, and run OCR.

- **Web:** `apps/web` (Vite, port 5173)
- **API:** `apps/api` (Hono, port 3001)

The Vite dev server proxies `/api` and `/health` to the API.

## First run

On the first OCR request (or on API startup if `OCR_WARMUP=true`), PP-OCRv5 mobile models download to `~/.cache/ppu-paddle-ocr`. This can take **1–3+ minutes** depending on your connection. Later runs are much faster.

## API endpoints

| Method | Path              | Description                                             |
| ------ | ----------------- | ------------------------------------------------------- |
| GET    | `/health`         | Health check                                            |
| GET    | `/api/ocr/status` | Whether OCR models are initialized                      |
| POST   | `/api/ocr`        | Single image: multipart field `image` (max 10MB)        |
| POST   | `/api/ocr/batch`  | Multiple images: repeated field `images` (max 20 files) |

### Example (curl)

```bash
curl -X POST http://localhost:3001/api/ocr \
  -F "image=@./your-image.png"
```

## Project layout

```
apps/
  api/     # Hono + ppu-paddle-ocr
  web/     # React upload UI
packages/
  shared/  # Zod schemas (OcrResponse, ApiError)
```

## Scripts

| Command          | Description                 |
| ---------------- | --------------------------- |
| `pnpm dev`       | Run API and web in parallel |
| `pnpm build`     | Build all packages          |
| `pnpm typecheck` | Typecheck all packages      |

## Troubleshooting

- **`onnxruntime-node` install fails:** Ensure you are on a supported platform (macOS arm64/x64, Linux x64). Try `pnpm install` again after updating Node.
- **OCR hangs on first request:** Models may still be downloading; check disk space and network. Restart the API with `OCR_WARMUP=true` and watch the console.
- **Network error in the UI:** Start both services with `pnpm dev` (not only the web app).

## Deploy to Vercel

The repo includes a root `vercel.json` that builds the Vite frontend and routes `/api/*` and `/health` to a Hono serverless function.

**Important:** The OCR API depends on `onnxruntime-node` (~250MB+ with models). Vercel serverless functions have a **250MB uncompressed bundle limit**, so the API may fail to deploy or cold-start on Vercel. For production OCR, consider hosting `apps/api` on [Railway](https://railway.app), [Fly.io](https://fly.io), or [Render](https://render.com) and pointing the web app at that URL.

### Steps

1. Log in: `vercel login`
2. From the repo root: `vercel` (preview) or `vercel --prod`
3. Optional env vars in the Vercel project dashboard:
   - `OCR_WARMUP=true` — preload models on cold start (slower deploy, faster first request)
   - `WEB_ORIGIN` — extra allowed CORS origin if the UI is hosted elsewhere

The UI calls `/api/...` on the same origin in production (no proxy needed).

## Learn more

- [PaddleOCR docs](https://www.paddleocr.ai/)
- [ppu-paddle-ocr on JSR](https://jsr.io/@snowfluke/ppu-paddle-ocr)

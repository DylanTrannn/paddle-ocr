export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.OCR_WARMUP === 'true'
  ) {
    const { ensureInitialized } = await import('./lib/ocr')
    console.log('Warming up OCR models (first run may download models)...')
    await ensureInitialized()
    console.log('OCR ready')
  }
}

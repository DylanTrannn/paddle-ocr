import type { NextConfig } from 'next'

/**
 * Vercel runs Linux x64. onnxruntime-node ships ~250MB of binaries for every
 * platform; exclude the ones we don't need so the serverless bundle stays under
 * the 250MB unzipped limit.
 */
const onnxPlatformExcludes = [
  '**/node_modules/onnxruntime-node/bin/**/darwin/**',
  '**/node_modules/onnxruntime-node/bin/**/win32/**',
  '**/node_modules/onnxruntime-node/bin/**/linux/arm64/**',
  '**/node_modules/onnxruntime-web/**',
]

const nextConfig: NextConfig = {
  serverExternalPackages: ['onnxruntime-node', 'ppu-paddle-ocr', 'ppu-ocv'],
  outputFileTracingExcludes: {
    '*': onnxPlatformExcludes,
    '/api/ocr': onnxPlatformExcludes,
    '/api/ocr/batch': onnxPlatformExcludes,
    '/api/ocr/status': onnxPlatformExcludes,
    '/api/health': onnxPlatformExcludes,
  },
}

export default nextConfig

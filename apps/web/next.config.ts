import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['onnxruntime-node', 'ppu-paddle-ocr'],
}

export default nextConfig

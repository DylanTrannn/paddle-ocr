import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PaddleOCR Learning',
  description: 'Local PP-OCRv5 via ONNX — batch image text extraction',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}

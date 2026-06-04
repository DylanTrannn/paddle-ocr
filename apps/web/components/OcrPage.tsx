'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ApiErrorSchema,
  OcrBatchResponseSchema,
  type OcrBatchItem,
} from '@paddle-ocr/shared'
import { FileDropzone } from './FileDropzone'
import { OcrResultCard } from './OcrResultCard'
import {
  createQueuedFile,
  formatFileSize,
  revokeQueuedFiles,
  type QueuedFile,
} from '@/lib/queuedFile'

const MAX_FILES = 20

type ProcessState = 'idle' | 'processing' | 'done'

export function OcrPage() {
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [processState, setProcessState] = useState<ProcessState>('idle')
  const [progress, setProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [results, setResults] = useState<OcrBatchItem[]>([])
  const queueRef = useRef(queue)
  queueRef.current = queue

  useEffect(() => {
    return () => revokeQueuedFiles(queueRef.current)
  }, [])

  const addFiles = useCallback((files: File[]) => {
    setGlobalError(null)
    setResults([])
    setProcessState('idle')

    setQueue((prev) => {
      const remaining = MAX_FILES - prev.length
      if (remaining <= 0) {
        setGlobalError(`Maximum ${MAX_FILES} images in the queue.`)
        return prev
      }

      const toAdd = files.slice(0, remaining).map(createQueuedFile)
      if (files.length > remaining) {
        setGlobalError(
          `Only ${remaining} more file(s) added (max ${MAX_FILES}).`,
        )
      }

      return [...prev, ...toAdd]
    })
  }, [])

  const removeFile = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }

  const clearQueue = () => {
    revokeQueuedFiles(queue)
    setQueue([])
    setResults([])
    setGlobalError(null)
    setProcessState('idle')
    setProgress(null)
  }

  const runOcr = async () => {
    if (queue.length === 0) return

    setProcessState('processing')
    setGlobalError(null)
    setResults([])
    setProgress({ current: 0, total: queue.length })

    const formData = new FormData()
    for (const { file } of queue) {
      formData.append('images[]', file)
    }

    try {
      const res = await fetch('/api/ocr/batch', {
        method: 'POST',
        body: formData,
      })
      const data: unknown = await res.json()

      if (!res.ok) {
        const parsed = ApiErrorSchema.safeParse(data)
        setGlobalError(parsed.success ? parsed.data.error : 'Request failed')
        setProcessState('idle')
        setProgress(null)
        return
      }

      const parsed = OcrBatchResponseSchema.safeParse(data)
      if (!parsed.success) {
        setGlobalError('Invalid response from server')
        setProcessState('idle')
        setProgress(null)
        return
      }

      setResults(parsed.data.results)
      setProgress({ current: queue.length, total: queue.length })
      setProcessState('done')
    } catch {
      setGlobalError('Network error — is the server running?')
      setProcessState('idle')
      setProgress(null)
    }
  }

  const isProcessing = processState === 'processing'
  const successCount = results.filter((r) => r.result).length
  const failCount = results.filter((r) => r.error).length

  return (
    <div className='app'>
      <header className='header'>
        <h1>PaddleOCR Learning</h1>
        <p className='subtitle'>
          Local PP-OCRv5 via ONNX — drop multiple images and extract text in one
          batch.
        </p>
      </header>

      <FileDropzone disabled={isProcessing} onFilesAdded={addFiles} />

      {globalError && <div className='banner banner--error'>{globalError}</div>}

      {isProcessing && (
        <div className='banner banner--loading'>
          <div className='progress-bar'>
            <div
              className='progress-bar__fill'
              style={{
                width: progress
                  ? `${(progress.current / progress.total) * 100}%`
                  : '30%',
              }}
            />
          </div>
          <p>
            Processing {progress?.total ?? queue.length} image
            {(progress?.total ?? queue.length) === 1 ? '' : 's'}… First run may
            download models.
          </p>
        </div>
      )}

      {queue.length > 0 && (
        <section className='queue'>
          <div className='queue__toolbar'>
            <h2>
              Queue <span className='count'>{queue.length}</span>
            </h2>
            <div className='queue__actions'>
              <button
                type='button'
                className='btn btn--ghost'
                onClick={clearQueue}
                disabled={isProcessing}
              >
                Clear all
              </button>
              <button
                type='button'
                className='btn btn--primary'
                onClick={runOcr}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing…' : `Run OCR (${queue.length})`}
              </button>
            </div>
          </div>

          <ul className='file-grid'>
            {queue.map((item) => (
              <li key={item.id} className='file-card'>
                <img
                  src={item.previewUrl}
                  alt=''
                  className='file-card__thumb'
                />
                <div className='file-card__info'>
                  <span className='file-card__name' title={item.file.name}>
                    {item.file.name}
                  </span>
                  <span className='file-card__size'>
                    {formatFileSize(item.file.size)}
                  </span>
                </div>
                <button
                  type='button'
                  className='file-card__remove'
                  onClick={() => removeFile(item.id)}
                  disabled={isProcessing}
                  aria-label={`Remove ${item.file.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {processState === 'done' && results.length > 0 && (
        <section className='results'>
          <div className='results__header'>
            <h2>Results</h2>
            <p className='results__stats'>
              {successCount} succeeded
              {failCount > 0 && ` · ${failCount} failed`}
            </p>
          </div>
          <div className='results__list'>
            {results.map((item, i) => (
              <OcrResultCard
                key={`${i}-${item.fileName}`}
                item={item}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </section>
      )}

      <footer className='footer'>
        Models cache at ~/.cache/ppu-paddle-ocr. Set <code>OCR_WARMUP=true</code>{' '}
        to preload on server start.
      </footer>
    </div>
  )
}

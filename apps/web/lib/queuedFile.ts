export type QueuedFile = {
  id: string
  file: File
  previewUrl: string
}

export function createQueuedFile(file: File): QueuedFile {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

export function revokeQueuedFiles(files: QueuedFile[]): void {
  for (const f of files) {
    URL.revokeObjectURL(f.previewUrl)
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

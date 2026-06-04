const MAX_FILE_SIZE = 10 * 1024 * 1024
export const MAX_BATCH_FILES = 20

export function asFileArray(value: unknown): File[] {
  if (!value) return []
  if (value instanceof File) return [value]
  if (Array.isArray(value)) {
    return value.filter((item): item is File => item instanceof File)
  }
  return []
}

/** Collect image fields from parseBody({ all: true }) — supports `images`, `images[]`, and `image`. */
export function collectImageFiles(body: Record<string, unknown>): File[] {
  const keys = ['images', 'images[]', 'image'] as const
  const seen = new Set<File>()
  const files: File[] = []

  for (const key of keys) {
    for (const file of asFileArray(body[key])) {
      if (!seen.has(file)) {
        seen.add(file)
        files.push(file)
      }
    }
  }

  return files
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return `${file.name}: must be an image`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: must be 10MB or smaller`
  }
  return null
}

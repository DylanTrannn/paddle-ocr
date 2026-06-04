const MAX_FILE_SIZE = 10 * 1024 * 1024
export const MAX_BATCH_FILES = 20

const IMAGE_FIELD_KEYS = ['images', 'images[]', 'image'] as const

export function collectImageFiles(formData: FormData): File[] {
  const seen = new Set<File>()
  const files: File[] = []

  for (const key of IMAGE_FIELD_KEYS) {
    for (const value of formData.getAll(key)) {
      if (value instanceof File && !seen.has(value)) {
        seen.add(value)
        files.push(value)
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

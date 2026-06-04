'use client'

import { useCallback, useRef, useState } from 'react'

type Props = {
  disabled?: boolean
  onFilesAdded: (files: File[]) => void
}

export function FileDropzone({ disabled, onFilesAdded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return
      const images = Array.from(list).filter((f) => f.type.startsWith('image/'))
      if (images.length) onFilesAdded(images)
    },
    [onFilesAdded],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    addFiles(e.dataTransfer.files)
  }

  return (
    <div
      className={`dropzone ${dragOver ? 'dropzone--active' : ''} ${
        disabled ? 'dropzone--disabled' : ''
      }`}
      onDragEnter={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        if (e.currentTarget === e.target) setDragOver(false)
      }}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      role='button'
      tabIndex={disabled ? -1 : 0}
      aria-label='Upload images'
    >
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        multiple
        hidden
        disabled={disabled}
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div className='dropzone__icon' aria-hidden>
        <svg
          width='40'
          height='40'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
        >
          <path
            d='M12 16V4m0 0l-4 4m4-4l4 4'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>

      <p className='dropzone__title'>
        Drop images here, or <span className='dropzone__link'>browse</span>
      </p>
      <p className='dropzone__hint'>
        PNG, JPG, WebP, GIF — up to 10MB each, 20 files max
      </p>
    </div>
  )
}

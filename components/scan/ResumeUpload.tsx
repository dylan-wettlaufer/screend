'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AnalyzeResponse, AnalyzeErrorResponse } from '@/lib/types'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ACCEPTED_EXTENSIONS = '.pdf,.docx'

export function ResumeUpload() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [inputMode, setInputMode] = useState<'file' | 'text'>('file')
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function switchToText() {
    setInputMode('text')
    setFile(null)
    setError(null)
  }

  function switchToFile() {
    setInputMode('file')
    setText('')
    setError(null)
  }

  function validateFile(f: File): string | null {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Only PDF and DOCX files are supported.'
    }
    if (f.size > MAX_FILE_SIZE) {
      return 'File exceeds the 5 MB limit.'
    }
    return null
  }

  function handleFileChange(f: File) {
    const err = validateFile(f)
    if (err) {
      setError(err)
      setFile(null)
      return
    }
    setError(null)
    setFile(f)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFileChange(f)
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFileChange(f)
  }, [])

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const onDragLeave = () => setDragOver(false)

  const isSubmitDisabled = loading || (inputMode === 'file' ? !file : !text.trim())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitDisabled) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('mode', 'general')

      if (inputMode === 'file' && file) {
        formData.append('file', file)
      } else {
        formData.append('resume_text', text)
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data: AnalyzeResponse | AnalyzeErrorResponse = await res.json()

      if (!res.ok) {
        setError((data as AnalyzeErrorResponse).error ?? 'Something went wrong.')
        return
      }

      router.push(`/scan/${(data as AnalyzeResponse).scan_id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {inputMode === 'file' ? (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={[
              'flex flex-col items-center justify-center gap-3 rounded-card border px-6 py-12 text-center transition-colors cursor-pointer select-none',
              dragOver
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                : file
                ? 'border-[var(--color-accent-dim)] bg-[var(--color-bg-raised)]'
                : 'border-[var(--color-border)] bg-[var(--color-bg-raised)] hover:border-[var(--color-border-strong)]',
            ].join(' ')}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              onChange={onInputChange}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-element bg-[var(--color-bg-hover)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 2L10 13M10 2L7 5M10 2L13 5"
                  stroke="var(--color-accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {file ? (
              <p className="font-mono text-sm text-[var(--color-text-primary)]">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-[var(--color-text-primary)]">
                  Drop your resume here or{' '}
                  <span className="text-[var(--color-accent)]">browse</span>
                </p>
                <p className="font-mono text-xs text-[var(--color-text-tertiary)]">
                  PDF or DOCX · max 5 MB
                </p>
              </>
            )}
          </div>

          <p className="text-xs text-[var(--color-text-tertiary)] text-center">
            or{' '}
            <button
              type="button"
              onClick={switchToText}
              className="text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-text-primary)] transition-colors"
            >
              paste text instead
            </button>
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[var(--color-text-tertiary)] text-right">
              <button
                type="button"
                onClick={switchToFile}
                className="text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-text-primary)] transition-colors"
              >
                upload a file instead
              </button>
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your resume here…"
              rows={16}
              className="w-full rounded-card border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-4 py-3 font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
            />
          </div>
        </>
      )}

      {error && (
        <p className="rounded-element bg-[#2a1515] px-4 py-2.5 font-mono text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="rounded-element bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg-base)] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Scanning…' : 'Scan resume'}
      </button>
    </form>
  )
}

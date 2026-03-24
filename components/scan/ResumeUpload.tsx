'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AnalyzeResponse, AnalyzeErrorResponse, ScanMode } from '@/lib/types'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ACCEPTED_EXTENSIONS = '.pdf,.docx'

const ROLE_TRACKS = [
  { value: 'swe',       label: 'Software engineer' },
  { value: 'backend',   label: 'Backend engineer' },
  { value: 'frontend',  label: 'Frontend engineer' },
  { value: 'fullstack', label: 'Full stack engineer' },
  { value: 'data',      label: 'Data engineer' },
  { value: 'devops',    label: 'DevOps / platform engineer' },
  { value: 'ml',        label: 'Machine learning engineer' },
  { value: 'mobile',    label: 'Mobile engineer' },
]

function UploadZone({
  file,
  onFile,
  onError,
  label,
}: {
  file: File | null
  onFile: (f: File) => void
  onError: (msg: string) => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function validateFile(f: File): string | null {
    if (!ACCEPTED_TYPES.includes(f.type)) return 'Only PDF and DOCX files are supported.'
    if (f.size > MAX_FILE_SIZE) return 'File exceeds the 5 MB limit.'
    return null
  }

  function handleFile(f: File) {
    const err = validateFile(f)
    if (err) { onError(err); return }
    onFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      className={[
        'flex flex-col items-center justify-center gap-3 rounded-card border px-6 py-10 text-center transition-colors cursor-pointer select-none',
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
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
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
            Drop your {label} here or{' '}
            <span className="text-[var(--color-accent)]">browse</span>
          </p>
          <p className="font-mono text-xs text-[var(--color-text-tertiary)]">
            PDF or DOCX · max 5 MB
          </p>
        </>
      )}
    </div>
  )
}

interface ResumeUploadProps {
  initialMode?: ScanMode
}

export function ResumeUpload({ initialMode = 'general' }: ResumeUploadProps) {
  const router = useRouter()

  const [mode, setMode] = useState<ScanMode>(initialMode)

  // Resume input
  const [resumeInputMode, setResumeInputMode] = useState<'file' | 'text'>('file')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')

  // JD input
  const [jdInputMode, setJdInputMode] = useState<'file' | 'text'>('text')
  const [jdFile, setJdFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState('')

  const [roleTrack, setRoleTrack] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function switchMode(next: ScanMode) {
    setMode(next)
    setError(null)
  }

  const resumeReady =
    resumeInputMode === 'file' ? !!resumeFile : !!resumeText.trim()

  const jdReady =
    mode === 'general'
      ? true
      : jdInputMode === 'file'
      ? !!jdFile
      : !!jdText.trim()

  const isSubmitDisabled = loading || !resumeReady || !jdReady

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitDisabled) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('mode', mode)
      if (roleTrack) formData.append('role_track', roleTrack)

      if (resumeInputMode === 'file' && resumeFile) {
        formData.append('file', resumeFile)
      } else {
        formData.append('resume_text', resumeText)
      }

      if (mode === 'job_match') {
        if (jdInputMode === 'file' && jdFile) {
          formData.append('jd_file', jdFile)
        } else {
          formData.append('jd_text', jdText)
        }
      }

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
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

      {/* Mode toggle */}
      <div
        className="flex rounded-element border p-0.5 gap-0.5"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
      >
        {(['general', 'job_match'] as ScanMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className="flex-1 rounded-[6px] py-1.5 text-sm transition-colors"
            style={
              mode === m
                ? {
                    background: 'var(--color-bg-hover)',
                    color: 'var(--color-text-primary)',
                  }
                : {
                    background: 'transparent',
                    color: 'var(--color-text-tertiary)',
                  }
            }
          >
            {m === 'general' ? 'General scan' : 'Job match'}
          </button>
        ))}
      </div>

      {/* Role track */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="role-track"
            className="text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Role track
          </label>
          <span className="font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            optional
          </span>
        </div>
        <select
          id="role-track"
          value={roleTrack}
          onChange={(e) => setRoleTrack(e.target.value)}
          className="w-full rounded-element border px-3 py-2 text-sm appearance-none focus:outline-none transition-colors"
          style={{
            background: 'var(--color-bg-raised)',
            borderColor: roleTrack ? 'var(--color-border-strong)' : 'var(--color-border)',
            color: roleTrack ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          }}
        >
          <option value="">General tech (no specific role)</option>
          {ROLE_TRACKS.map((track) => (
            <option key={track.value} value={track.value}>
              {track.label}
            </option>
          ))}
        </select>
      </div>

      {/* Resume input */}
      <div className="flex flex-col gap-2">
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Resume
        </p>
        {resumeInputMode === 'file' ? (
          <>
            <UploadZone
              file={resumeFile}
              onFile={(f) => { setResumeFile(f); setError(null) }}
              onError={setError}
              label="resume"
            />
            <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              or{' '}
              <button
                type="button"
                onClick={() => { setResumeInputMode('text'); setResumeFile(null); setError(null) }}
                className="underline underline-offset-2 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                paste text instead
              </button>
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-right" style={{ color: 'var(--color-text-tertiary)' }}>
              <button
                type="button"
                onClick={() => { setResumeInputMode('file'); setResumeText(''); setError(null) }}
                className="underline underline-offset-2 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                upload a file instead
              </button>
            </p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here…"
              rows={12}
              className="w-full rounded-card border px-4 py-3 font-mono text-sm resize-none focus:outline-none transition-colors"
              style={{
                background: 'var(--color-bg-raised)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </>
        )}
      </div>

      {/* Job description input — job_match mode only */}
      {mode === 'job_match' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Job description
            </p>
            <button
              type="button"
              onClick={() => {
                setJdInputMode((m) => (m === 'file' ? 'text' : 'file'))
                setJdFile(null)
                setJdText('')
                setError(null)
              }}
              className="font-mono text-xs underline underline-offset-2 transition-colors"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {jdInputMode === 'file' ? 'paste text instead' : 'upload a file instead'}
            </button>
          </div>
          {jdInputMode === 'file' ? (
            <UploadZone
              file={jdFile}
              onFile={(f) => { setJdFile(f); setError(null) }}
              onError={setError}
              label="job description"
            />
          ) : (
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the job description here…"
              rows={10}
              className="w-full rounded-card border px-4 py-3 font-mono text-sm resize-none focus:outline-none transition-colors"
              style={{
                background: 'var(--color-bg-raised)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          )}
        </div>
      )}

      {error && (
        <p
          className="rounded-element px-4 py-2.5 font-mono text-sm"
          style={{ background: '#2a1515', color: 'var(--color-danger)' }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="rounded-element px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--color-accent)', color: 'var(--color-bg-base)' }}
      >
        {loading
          ? 'Scanning…'
          : mode === 'job_match'
          ? 'Match to job'
          : 'Scan resume'}
      </button>
    </form>
  )
}

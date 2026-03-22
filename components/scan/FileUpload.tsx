"use client"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ ext }: { ext: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-element bg-bg-raised border border-border">
      <span className="font-mono text-xs text-text-secondary uppercase">
        {ext}
      </span>
    </div>
  )
}

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function validate(f: File): string | null {
    if (!ACCEPTED_TYPES.includes(f.type as (typeof ACCEPTED_TYPES)[number])) {
      return "Only PDF and DOCX files are supported."
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File is too large. Maximum size is 5 MB (yours is ${formatBytes(f.size)}).`
    }
    return null
  }

  function handleFile(f: File) {
    const err = validate(f)
    if (err) {
      setError(err)
      setFile(null)
    } else {
      setError(null)
      setFile(f)
    }
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
    e.target.value = ""
  }

  function removeFile() {
    setFile(null)
    setError(null)
  }

  function handleSubmit() {
    if (!file) return
    // TODO: wire up to /api/analyze
    console.log("Submitting file:", file.name)
  }

  const fileExt = file?.name.split(".").pop()?.toUpperCase() ?? ""

  return (
    <div className="flex flex-col gap-6">
      {/* Drop zone */}
      {!file && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload resume — drag and drop or click to browse"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={[
            "flex flex-col items-center justify-center gap-4 rounded-card border border-dashed px-8 py-14 text-center transition-colors cursor-pointer outline-none",
            isDragging
              ? "border-accent bg-accent-subtle"
              : "border-border hover:border-border-strong hover:bg-bg-hover",
            error ? "border-danger" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <UploadIcon isDragging={isDragging} />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-text-primary">
              Drag and drop your resume here
            </p>
            <p className="text-xs text-text-tertiary">
              PDF or DOCX · max 5 MB
            </p>
          </div>
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
            className="rounded-element border border-border bg-bg-raised px-4 py-1.5 text-xs text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            Browse files
          </button>
        </div>
      )}

      {/* File preview */}
      {file && (
        <div className="flex items-center gap-3 rounded-card border border-border bg-bg-raised px-4 py-3">
          <FileIcon ext={fileExt} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-text-primary">{file.name}</p>
            <p className="font-mono text-xs text-text-tertiary">
              {formatBytes(file.size)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={removeFile}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-element text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Inline error */}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="sr-only"
        onChange={onInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!file}
        className="w-full"
        size="lg"
      >
        Analyze resume
      </Button>
    </div>
  )
}

function UploadIcon({ isDragging }: { isDragging: boolean }) {
  return (
    <div
      className={[
        "flex h-12 w-12 items-center justify-center rounded-element border transition-colors",
        isDragging
          ? "border-accent text-accent"
          : "border-border text-text-tertiary",
      ].join(" ")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

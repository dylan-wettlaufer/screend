'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { StructuredResume } from '@/lib/types'

export type StructuredResumeSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

const DEBOUNCE_MS = 900
const SAVED_CLEAR_MS = 2000

function serializeStructuredResume(value: StructuredResume | null): string {
  return value === null ? JSON.stringify(null) : JSON.stringify(value)
}

export function useDebouncedStructuredResumeSave(
  scanId: string,
  structuredResume: StructuredResume | null,
  initialStructuredResume: StructuredResume | null,
): { status: StructuredResumeSaveStatus; errorMessage: string | null } {
  const [status, setStatus] = useState<StructuredResumeSaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const lastSavedJsonRef = useRef<string>(serializeStructuredResume(initialStructuredResume))
  const structuredResumeRef = useRef(structuredResume)
  structuredResumeRef.current = structuredResume

  const inflightRef = useRef<Promise<void> | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSavedTimer = useCallback(() => {
    if (savedClearTimerRef.current) {
      clearTimeout(savedClearTimerRef.current)
      savedClearTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    lastSavedJsonRef.current = serializeStructuredResume(initialStructuredResume)
    clearSavedTimer()
    setStatus('idle')
    setErrorMessage(null)
  }, [scanId, initialStructuredResume, clearSavedTimer])

  const commitSave = useCallback(async () => {
    if (inflightRef.current) {
      await inflightRef.current
    }

    let current = structuredResumeRef.current
    if (current === null) {
      setStatus('idle')
      return
    }

    if (JSON.stringify(current) === lastSavedJsonRef.current) {
      setStatus('idle')
      return
    }

    const payload = current

    setStatus('saving')
    setErrorMessage(null)

    const run = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/scans/${encodeURIComponent(scanId)}/structured-resume`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ structured_resume: payload }),
        })

        if (!res.ok) {
          let msg = "Couldn't save"
          try {
            const err = (await res.json()) as { error?: string }
            if (err.error) msg = err.error
          } catch {
            /* ignore */
          }
          throw new Error(msg)
        }

        lastSavedJsonRef.current = JSON.stringify(payload)

        clearSavedTimer()
        setStatus('saved')
        savedClearTimerRef.current = setTimeout(() => {
          setStatus('idle')
          savedClearTimerRef.current = null
        }, SAVED_CLEAR_MS)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Couldn't save"
        setErrorMessage(msg)
        setStatus('error')
      }
    }

    const p = run().finally(() => {
      inflightRef.current = null
    })
    inflightRef.current = p
    await p
  }, [scanId, clearSavedTimer])

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    const serialized = serializeStructuredResume(structuredResume)
    if (serialized === lastSavedJsonRef.current) {
      setStatus((s) => {
        if (s === 'pending') return 'idle'
        return s
      })
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
          debounceTimerRef.current = null
        }
      }
    }

    setStatus((s) => {
      if (s === 'saving') return s
      return 'pending'
    })

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      void commitSave()
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [structuredResume, scanId, commitSave])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      if (savedClearTimerRef.current) {
        clearTimeout(savedClearTimerRef.current)
        savedClearTimerRef.current = null
      }
    }
  }, [])

  return { status, errorMessage }
}

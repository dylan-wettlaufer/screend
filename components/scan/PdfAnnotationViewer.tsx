'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import type { FeedbackItem } from '@/lib/types'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface PdfAnnotationViewerProps {
  url: string
  feedback: FeedbackItem[]
  activeFeedbackId: string | null
}

export function PdfAnnotationViewer({
  url,
  feedback,
  activeFeedbackId,
}: PdfAnnotationViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const pageTexts = useRef<string[]>([])

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const activeOriginalLine = useMemo(() => {
    if (!activeFeedbackId) return null
    const item = feedback.find((f) => f.id === activeFeedbackId)
    return item?.original_line?.trim() ?? null
  }, [activeFeedbackId, feedback])

  useEffect(() => {
    if (!activeOriginalLine) return
    const pageIdx = pageTexts.current.findIndex((t) => t.includes(activeOriginalLine))
    if (pageIdx === -1) return
    pageRefs.current[pageIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeOriginalLine])

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto flex flex-col items-center py-4 gap-3"
      style={{ background: '#2c2c2c' }}
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n)
          pageTexts.current = new Array(n).fill('')
        }}
        loading={
          <div className="flex items-center justify-center py-16">
            <p className="font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Loading PDF…
            </p>
          </div>
        }
        error={
          <div className="flex items-center justify-center py-16">
            <p className="font-mono text-xs" style={{ color: 'var(--color-danger)' }}>
              Failed to load PDF.
            </p>
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              pageRefs.current[i] = el
            }}
          >
            <Page
              pageNumber={i + 1}
              width={containerWidth > 0 ? containerWidth - 32 : undefined}
              renderTextLayer
              renderAnnotationLayer={false}
              onGetTextSuccess={(textContent) => {
                const text = textContent.items
                  .map((item) => ('str' in item ? (item as { str: string }).str : ''))
                  .join(' ')
                pageTexts.current[i] = text
              }}
            />
          </div>
        ))}
      </Document>
    </div>
  )
}

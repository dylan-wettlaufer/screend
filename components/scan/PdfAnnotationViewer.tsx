'use client'

import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfAnnotationViewerProps {
  url: string
}

export function PdfAnnotationViewer({ url }: PdfAnnotationViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const pageWidth = containerWidth > 0 ? Math.max(containerWidth - 32, 200) : undefined

  return (
    <div
      ref={containerRef}
      className="h-full min-h-0 overflow-y-auto flex flex-col items-center py-4 gap-3"
      style={{ background: 'var(--color-bg-surface)' }}
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        loading={
          <div className="flex items-center justify-center py-16">
            <p className="font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Loading PDF…
            </p>
          </div>
        }
        error={
          <div className="flex items-center justify-center py-16 px-4 text-center">
            <p className="font-mono text-xs" style={{ color: 'var(--color-danger)' }}>
              Failed to load PDF.
            </p>
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  )
}

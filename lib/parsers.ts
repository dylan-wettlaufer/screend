import { getDocumentProxy, extractText } from 'unpdf'
import mammoth from 'mammoth'

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number]

export function isAcceptedMimeType(mime: string): mime is AcceptedMimeType {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mime)
}

export async function parseResume(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!isAcceptedMimeType(mimeType)) {
    throw new Error(
      'Unsupported file type. Please upload a PDF or DOCX file.'
    )
  }

  let text: string

  if (mimeType === 'application/pdf') {
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text: pages } = await extractText(pdf, { mergePages: true })
    text = Array.isArray(pages) ? pages.join('\n') : pages
  } else {
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  }

  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error(
      'Could not extract text from this file. It may be a scanned image. Please paste your resume as plain text instead.'
    )
  }

  return trimmed
}

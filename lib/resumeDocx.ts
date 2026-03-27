import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  TabStopType,
  TabStopPosition,
  UnderlineType,
  ExternalHyperlink,
  PageBreak,
} from 'docx'
import type { StructuredResume } from '@/lib/types'

// ── Typography constants ──────────────────────────────────────────────────

const FONT = 'Times New Roman'
const SIZE_BODY = 20       // half-points → 10pt
const SIZE_NAME = 32       // 16pt
const SIZE_SECTION = 22    // 11pt

// ── Helpers ───────────────────────────────────────────────────────────────

function bold(text: string, size = SIZE_BODY): TextRun {
  return new TextRun({ text, bold: true, font: FONT, size })
}

function normal(text: string, size = SIZE_BODY): TextRun {
  return new TextRun({ text, font: FONT, size })
}

function italic(text: string, size = SIZE_BODY): TextRun {
  return new TextRun({ text, italics: true, font: FONT, size })
}

function pipe(size = SIZE_BODY): TextRun {
  return new TextRun({ text: ' | ', font: FONT, size })
}

/** Horizontal rule paragraph that mimics a section divider */
function sectionRule(): Paragraph {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: '000000' },
    },
    spacing: { after: 60 },
  })
}

function sectionHeading(text: string): Paragraph[] {
  return [
    new Paragraph({
      children: [bold(text.toUpperCase(), SIZE_SECTION)],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 0 },
    }),
    sectionRule(),
  ]
}

/** Two-column row: left bold title, right date right-aligned via tab stop */
function subheadingRow(left: string, right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      bold(left),
      new TextRun({ text: '\t', font: FONT, size: SIZE_BODY }),
      normal(right),
    ],
    spacing: { before: 100, after: 0 },
  })
}

/** Two-column row: left italic subtitle, right italic location */
function subheadingSubRow(left: string, right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      italic(left),
      new TextRun({ text: '\t', font: FONT, size: SIZE_BODY }),
      italic(right),
    ],
    spacing: { before: 0, after: 60 },
  })
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [normal(text)],
    bullet: { level: 0 },
    spacing: { before: 0, after: 40 },
  })
}

// ── Section builders ──────────────────────────────────────────────────────

function buildHeading(resume: StructuredResume): Paragraph[] {
  const nameLine = new Paragraph({
    children: [bold(resume.name, SIZE_NAME)],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
  })

  const contactParts: (TextRun | ExternalHyperlink)[] = []

  if (resume.phone) contactParts.push(normal(resume.phone))
  if (resume.email) {
    if (contactParts.length) contactParts.push(pipe())
    contactParts.push(
      new ExternalHyperlink({
        link: `mailto:${resume.email}`,
        children: [
          new TextRun({
            text: resume.email,
            font: FONT,
            size: SIZE_BODY,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
      }),
    )
  }
  if (resume.linkedin) {
    if (contactParts.length) contactParts.push(pipe())
    contactParts.push(
      new ExternalHyperlink({
        link: `https://linkedin.com/in/${resume.linkedin}`,
        children: [
          new TextRun({
            text: `linkedin.com/in/${resume.linkedin}`,
            font: FONT,
            size: SIZE_BODY,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
      }),
    )
  }
  if (resume.github) {
    if (contactParts.length) contactParts.push(pipe())
    contactParts.push(
      new ExternalHyperlink({
        link: `https://github.com/${resume.github}`,
        children: [
          new TextRun({
            text: `github.com/${resume.github}`,
            font: FONT,
            size: SIZE_BODY,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
      }),
    )
  }

  const contactLine = new Paragraph({
    children: contactParts,
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
  })

  return [nameLine, contactLine]
}

function buildEducation(resume: StructuredResume): Paragraph[] {
  const entries = resume.education.filter((e) => e.school.trim() !== '')
  if (entries.length === 0) return []

  const paras: Paragraph[] = [...sectionHeading('Education')]
  for (const e of entries) {
    paras.push(subheadingRow(e.school, `${e.start} -- ${e.end}`))
    paras.push(subheadingSubRow(e.degree, e.location))
  }
  return paras
}

function buildExperience(resume: StructuredResume): Paragraph[] {
  const entries = resume.experience.filter((e) => e.company.trim() !== '')
  if (entries.length === 0) return []

  const paras: Paragraph[] = [...sectionHeading('Experience')]
  for (const e of entries) {
    paras.push(subheadingRow(e.title, `${e.start} -- ${e.end}`))
    paras.push(subheadingSubRow(e.company, e.location))
    for (const b of e.bullets.filter((b) => b.trim() !== '')) {
      paras.push(bulletParagraph(b))
    }
  }
  return paras
}

function buildProjects(resume: StructuredResume): Paragraph[] {
  const entries = resume.projects.filter((p) => p.name.trim() !== '')
  if (entries.length === 0) return []

  const paras: Paragraph[] = [...sectionHeading('Projects')]
  for (const p of entries) {
    const titleText = p.technologies.trim() !== ''
      ? `${p.name} | ${p.technologies}`
      : p.name
    const dateText = p.end.trim() !== '' ? `${p.start} -- ${p.end}` : p.start
    paras.push(subheadingRow(titleText, dateText))
    for (const b of p.bullets.filter((b) => b.trim() !== '')) {
      paras.push(bulletParagraph(b))
    }
  }
  return paras
}

function buildSkills(resume: StructuredResume): Paragraph[] {
  const lines: string[] = []
  if (resume.skills.languages.trim())      lines.push(`Languages: ${resume.skills.languages}`)
  if (resume.skills.frameworks.trim())     lines.push(`Frameworks: ${resume.skills.frameworks}`)
  if (resume.skills.developer_tools.trim()) lines.push(`Developer Tools: ${resume.skills.developer_tools}`)
  if (resume.skills.libraries.trim())      lines.push(`Libraries: ${resume.skills.libraries}`)

  if (lines.length === 0) return []

  const paras: Paragraph[] = [...sectionHeading('Technical Skills')]
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    paras.push(
      new Paragraph({
        children: [
          bold(line.slice(0, colonIdx + 1)),
          normal(line.slice(colonIdx + 1)),
        ],
        spacing: { before: 0, after: 40 },
      }),
    )
  }
  return paras
}

// ── Public API ────────────────────────────────────────────────────────────

export async function buildDocx(resume: StructuredResume): Promise<Buffer> {
  const allParagraphs: Paragraph[] = [
    ...buildHeading(resume),
    ...buildEducation(resume),
    ...buildExperience(resume),
    ...buildProjects(resume),
    ...buildSkills(resume),
  ]

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: allParagraphs,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

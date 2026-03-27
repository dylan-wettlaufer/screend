import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
  UnderlineType,
  ExternalHyperlink,
  convertInchesToTwip,
} from 'docx'
import type { StructuredResume } from '@/lib/types'

// Match article 11pt / Jake's-style template: base body ≈11pt, \small ≈10pt, name \LARGE ≈17pt
const FONT = 'Times New Roman'
const SIZE_NAME = 34 // ~17pt (\LARGE)
const SIZE_BASE = 22 // 11pt — first line of resumeSubheading
const SIZE_SMALL = 20 // 10pt — second line, bullets, project row, contact (\small)
const SIZE_SECTION = 24 // ~12pt (\large section titles)

function bold(text: string, size: number): TextRun {
  return new TextRun({ text, bold: true, font: FONT, size })
}

function normal(text: string, size: number): TextRun {
  return new TextRun({ text, font: FONT, size })
}

function italic(text: string, size: number): TextRun {
  return new TextRun({ text, italics: true, font: FONT, size })
}

function pipe(size: number): TextRun {
  return new TextRun({ text: ' | ', font: FONT, size })
}

function sectionRule(): Paragraph {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: '000000' },
    },
    spacing: { after: 60 },
  })
}

/** Section title: sentence case + small caps (LaTeX \scshape), rule below */
function sectionHeading(label: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: label,
          bold: true,
          smallCaps: true,
          font: FONT,
          size: SIZE_SECTION,
        }),
      ],
      spacing: { before: 200, after: 0 },
    }),
    sectionRule(),
  ]
}

/** Row 1 of \resumeSubheading: bold left, dates right — document body size */
function subheadingRow(left: string, right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      bold(left, SIZE_BASE),
      new TextRun({ text: '\t', font: FONT, size: SIZE_BASE }),
      normal(right, SIZE_BASE),
    ],
    spacing: { before: 100, after: 0 },
  })
}

/** Row 2: italic \small */
function subheadingSubRow(left: string, right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      italic(left, SIZE_SMALL),
      new TextRun({ text: '\t', font: FONT, size: SIZE_SMALL }),
      italic(right, SIZE_SMALL),
    ],
    spacing: { before: 0, after: 60 },
  })
}

/** \resumeProjectHeading: \small row — bold name, optional | italic tech, dates right */
function projectHeadingRow(
  name: string,
  technologies: string,
  dateRight: string,
): Paragraph {
  const children: (TextRun | ExternalHyperlink)[] = [
    bold(name, SIZE_SMALL),
  ]
  if (technologies.trim() !== '') {
    children.push(pipe(SIZE_SMALL))
    children.push(italic(technologies, SIZE_SMALL))
  }
  children.push(new TextRun({ text: '\t', font: FONT, size: SIZE_SMALL }))
  children.push(normal(dateRight, SIZE_SMALL))

  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children,
    spacing: { before: 100, after: 0 },
  })
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [normal(text, SIZE_SMALL)],
    bullet: { level: 0 },
    spacing: { before: 0, after: 40 },
  })
}

function buildHeading(resume: StructuredResume): Paragraph[] {
  const nameLine = new Paragraph({
    children: [
      new TextRun({
        text: resume.name,
        bold: true,
        smallCaps: true,
        font: FONT,
        size: SIZE_NAME,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
  })

  const contactParts: (TextRun | ExternalHyperlink)[] = []

  if (resume.phone) contactParts.push(normal(resume.phone, SIZE_SMALL))
  if (resume.email) {
    if (contactParts.length) contactParts.push(pipe(SIZE_SMALL))
    contactParts.push(
      new ExternalHyperlink({
        link: `mailto:${resume.email}`,
        children: [
          new TextRun({
            text: resume.email,
            font: FONT,
            size: SIZE_SMALL,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
      }),
    )
  }
  if (resume.linkedin?.trim()) {
    if (contactParts.length) contactParts.push(pipe(SIZE_SMALL))
    contactParts.push(
      new ExternalHyperlink({
        link: `https://linkedin.com/in/${resume.linkedin}`,
        children: [
          new TextRun({
            text: `linkedin.com/in/${resume.linkedin}`,
            font: FONT,
            size: SIZE_SMALL,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
      }),
    )
  }
  if (resume.github?.trim()) {
    if (contactParts.length) contactParts.push(pipe(SIZE_SMALL))
    contactParts.push(
      new ExternalHyperlink({
        link: `https://github.com/${resume.github}`,
        children: [
          new TextRun({
            text: `github.com/${resume.github}`,
            font: FONT,
            size: SIZE_SMALL,
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
    const eduBullets = [
      e.honors?.trim() ?? '',
      e.coursework?.trim() ? `Coursework: ${e.coursework}` : '',
    ].filter(Boolean)
    for (const line of eduBullets) {
      paras.push(bulletParagraph(line))
    }
  }
  return paras
}

/** Single indented block like LaTeX item with \\ between skill lines */
function buildSkills(resume: StructuredResume): Paragraph[] {
  const parts: { label: string; rest: string }[] = []
  if (resume.skills.languages?.trim())
    parts.push({ label: 'Languages', rest: resume.skills.languages })
  if (resume.skills.frameworks?.trim())
    parts.push({ label: 'Frameworks', rest: resume.skills.frameworks })
  if (resume.skills.developer_tools?.trim())
    parts.push({ label: 'Developer Tools', rest: resume.skills.developer_tools })
  if (resume.skills.libraries?.trim())
    parts.push({ label: 'Libraries', rest: resume.skills.libraries })

  if (parts.length === 0) return []

  const children: TextRun[] = []
  for (let i = 0; i < parts.length; i++) {
    const { label, rest } = parts[i]
    if (i > 0) children.push(new TextRun({ break: 1 }))
    children.push(bold(`${label}:`, SIZE_SMALL))
    children.push(normal(` ${rest}`, SIZE_SMALL))
  }

  return [
    ...sectionHeading('Technical Skills'),
    new Paragraph({
      indent: { left: convertInchesToTwip(0.15) },
      children,
      spacing: { before: 0, after: 80 },
    }),
  ]
}

/** LaTeX order: company | dates, then title | location */
function buildExperience(resume: StructuredResume): Paragraph[] {
  const entries = resume.experience.filter((e) => e.company.trim() !== '')
  if (entries.length === 0) return []

  const paras: Paragraph[] = [...sectionHeading('Experience')]
  for (const e of entries) {
    paras.push(subheadingRow(e.company, `${e.start} -- ${e.end}`))
    paras.push(subheadingSubRow(e.title, e.location))
    for (const b of e.bullets.filter((b) => b.trim() !== '')) {
      paras.push(bulletParagraph(b))
    }
  }
  return paras
}

function buildProjects(resume: StructuredResume): Paragraph[] {
  const entries = resume.projects.filter((proj) => proj.name.trim() !== '')
  if (entries.length === 0) return []

  const paras: Paragraph[] = [...sectionHeading('Projects')]
  for (const p of entries) {
    const dateText = p.end.trim() !== '' ? `${p.start} -- ${p.end}` : p.start
    paras.push(projectHeadingRow(p.name, p.technologies ?? '', dateText))
    for (const b of p.bullets.filter((b) => b.trim() !== '')) {
      paras.push(bulletParagraph(b))
    }
  }
  return paras
}

export async function buildDocx(resume: StructuredResume): Promise<Buffer> {
  const allParagraphs: Paragraph[] = [
    ...buildHeading(resume),
    ...buildEducation(resume),
    ...buildSkills(resume),
    ...buildExperience(resume),
    ...buildProjects(resume),
  ]

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: SIZE_BASE,
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: allParagraphs,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

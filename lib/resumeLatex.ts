import type { StructuredResume } from '@/lib/types'
import {
  filterResumeBullets,
  getEducationBullets,
  getSkillLines,
  getVisibleEducation,
  getVisibleExperience,
  getVisibleProjects,
  projectDateRight,
  subheadingDateRange,
} from '@/lib/resumeModel'

/**
 * Escapes characters that are special in LaTeX so they render as literal text.
 */
function esc(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
}

/**
 * Renders itemize bullets.
 */
function bullets(items: string[]): string {
  return filterResumeBullets(items)
    .map((b) => `    \\resumeItem{${esc(b)}}`)
    .join('\n')
}

export function buildLatex(resume: StructuredResume): string {
  const educationSection = getVisibleEducation(resume)
    .map((e) => {
      const eduBullets = getEducationBullets(e)
      const itemize = bullets(eduBullets)
      return `
  \\resumeSubheading
    {${esc(e.school)}}{${esc(subheadingDateRange(e.start, e.end))}}
    {${esc(e.degree)}}{${esc(e.location)}}
${itemize ? `  \\resumeItemListStart\n${itemize}\n  \\resumeItemListEnd` : ''}`
    })
    .join('\n')

  const skillLines = getSkillLines(resume)
    .map((s) => `\\textbf{${esc(s.label)}}{: ${esc(s.body)}}`)
    .join(' \\\\\n ')

  const experienceSection = getVisibleExperience(resume)
    .map((e) => {
      const itemize = bullets(e.bullets)
      return `
  \\resumeSubheading
    {${esc(e.company)}}{${esc(subheadingDateRange(e.start, e.end))}}
    {${esc(e.title)}}{${esc(e.location)}}
${itemize ? `  \\resumeItemListStart\n${itemize}\n  \\resumeItemListEnd` : ''}`
    })
    .join('\n')

  const projectsSection = getVisibleProjects(resume)
    .map((p) => {
      const itemize = bullets(p.bullets)
      const techLine = p.technologies?.trim()
        ? ` $|$ \\textit{${esc(p.technologies)}}`
        : ''
      const dates = esc(projectDateRight(p.start, p.end))
      return `
  \\resumeProjectHeading
    {\\textbf{${esc(p.name)}}${techLine}}{${dates}}
${itemize ? `  \\resumeItemListStart\n${itemize}\n  \\resumeItemListEnd` : ''}`
    })
    .join('\n')

  return `%-------------------------
% Jake's Resume Template (Optimized for ResuForge)
%-------------------------
\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%----------HEADING----------
\\begin{center}
  \\textbf{\\LARGE \\scshape ${esc(resume.name)}} \\\\ \\vspace{1pt}
  \\small ${esc(resume.phone)} $|$ 
  \\href{mailto:${esc(resume.email)}}{\\underline{${esc(resume.email)}}}${
    resume.linkedin?.trim()
      ? ` $|$ \\href{https://linkedin.com/in/${esc(resume.linkedin)}}{\\underline{linkedin.com/in/${esc(resume.linkedin)}}}`
      : ''
  }${
    resume.github?.trim()
      ? ` $|$ \\href{https://github.com/${esc(resume.github)}}{\\underline{github.com/${esc(resume.github)}}}`
      : ''
  }
\\end{center}

%-----------EDUCATION-----------
${educationSection.trim() ? `
\\section{Education}
  \\resumeSubHeadingListStart
    ${educationSection}
  \\resumeSubHeadingListEnd
` : ''}

%-----------TECHNICAL SKILLS-----------
${skillLines.trim() ? `
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     ${skillLines}
    }}
 \\end{itemize}
 \\vspace{-16pt}
` : ''}

%-----------EXPERIENCE-----------
${experienceSection.trim() ? `
\\section{Experience}
  \\resumeSubHeadingListStart
    ${experienceSection}
  \\resumeSubHeadingListEnd
` : ''}

%-----------PROJECTS-----------
${projectsSection.trim() ? `
\\section{Projects}
  \\resumeSubHeadingListStart
    ${projectsSection}
  \\resumeSubHeadingListEnd
` : ''}

\\end{document}
`
}

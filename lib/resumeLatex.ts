import type { StructuredResume } from '@/lib/types'

/**
 * Escapes characters that are special in LaTeX so they render as literal text.
 * Order matters: backslash must be replaced first to avoid double-escaping.
 */
function esc(raw: string): string {
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
 * Renders a single itemize bullet. Empty strings are skipped.
 */
function bullets(items: string[]): string {
  const rendered = items
    .filter((b) => b.trim() !== '')
    .map((b) => `      \\item ${esc(b)}`)
    .join('\n')
  if (!rendered) return ''
  return `    \\begin{itemize}\n${rendered}\n    \\end{itemize}`
}

/**
 * Builds a Jake's Resume–compatible .tex string from a StructuredResume object.
 * All user-supplied values are passed through esc() before injection.
 */
export function buildLatex(resume: StructuredResume): string {
  const educationSection = resume.education
    .filter((e) => e.school.trim() !== '')
    .map(
      (e) => `
  \\resumeSubheading
    {${esc(e.school)}}{${esc(e.start)} -- ${esc(e.end)}}
    {${esc(e.degree)}}{${esc(e.location)}}`,
    )
    .join('\n')

  const experienceSection = resume.experience
    .filter((e) => e.company.trim() !== '')
    .map((e) => {
      const itemize = bullets(e.bullets)
      return `
  \\resumeSubheading
    {${esc(e.title)}}{${esc(e.start)} -- ${esc(e.end)}}
    {${esc(e.company)}}{${esc(e.location)}}
${itemize ? `  \\resumeItemListStart\n${itemize}\n  \\resumeItemListEnd` : ''}`
    })
    .join('\n')

  const projectsSection = resume.projects
    .filter((p) => p.name.trim() !== '')
    .map((p) => {
      const itemize = bullets(p.bullets)
      const techLine =
        p.technologies.trim() !== ''
          ? `\\textbf{Technologies}{: ${esc(p.technologies)}}`
          : ''
      const dateLine =
        p.start.trim() !== '' || p.end.trim() !== ''
          ? `${esc(p.start)}${p.end.trim() !== '' ? ` -- ${esc(p.end)}` : ''}`
          : ''
      return `
  \\resumeProjectHeading
    {\\textbf{${esc(p.name)}}${techLine !== '' ? ` $|$ ${techLine}` : ''}}{${dateLine}}
${itemize ? `  \\resumeItemListStart\n${itemize}\n  \\resumeItemListEnd` : ''}`
    })
    .join('\n')

  const skillLines = [
    resume.skills.languages.trim() !== ''
      ? `      \\textbf{Languages}{: ${esc(resume.skills.languages)}}`
      : '',
    resume.skills.frameworks.trim() !== ''
      ? `      \\textbf{Frameworks}{: ${esc(resume.skills.frameworks)}}`
      : '',
    resume.skills.developer_tools.trim() !== ''
      ? `      \\textbf{Developer Tools}{: ${esc(resume.skills.developer_tools)}}`
      : '',
    resume.skills.libraries.trim() !== ''
      ? `      \\textbf{Libraries}{: ${esc(resume.skills.libraries)}}`
      : '',
  ]
    .filter(Boolean)
    .join(' \\\\\n')

  return `%-------------------------
% Jake's Resume Template (via Screend)
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
\\input{glyphtounicode}

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

\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}
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
\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
\\begin{document}

%----------HEADING----------
\\begin{center}
  \\textbf{\\Huge \\scshape ${esc(resume.name)}} \\\\ \\vspace{1pt}
  \\small ${esc(resume.phone)} $|$
  \\href{mailto:${esc(resume.email)}}{\\underline{${esc(resume.email)}}}${
    resume.linkedin.trim() !== ''
      ? ` $|$ \\href{https://linkedin.com/in/${esc(resume.linkedin)}}{\\underline{linkedin.com/in/${esc(resume.linkedin)}}}`
      : ''
  }${
    resume.github.trim() !== ''
      ? ` $|$ \\href{https://github.com/${esc(resume.github)}}{\\underline{github.com/${esc(resume.github)}}}`
      : ''
  }
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
${educationSection}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${experienceSection}
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${projectsSection}
  \\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${skillLines}
    }}
  \\end{itemize}

%-------------------------------------------
\\end{document}
`
}

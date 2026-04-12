'use client'

'use client'

import { useEffect, type CSSProperties } from 'react'
import type { StructuredResume } from '@/lib/types'

interface ResumeStructuredEditorProps {
  value: StructuredResume
  onChange: (next: StructuredResume) => void
  /** First changed field path after JD sync; triggers a one-shot flash on that control */
  flashFieldPath?: string | null
  flashFieldNonce?: number
}

function fieldClass() {
  return 'w-full rounded-element border px-2.5 py-2 text-sm'
}

function labelClass() {
  return 'block text-xs mb-1'
}

function inputStyle(): CSSProperties {
  return {
    borderColor: 'var(--color-border-strong)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg-base)',
  }
}

const sectionCardStyle: CSSProperties = {
  borderColor: 'var(--color-border-strong)',
  background: 'var(--color-bg-raised)',
}

const entryCardStyle: CSSProperties = {
  borderColor: 'var(--color-border-strong)',
  background: 'var(--color-bg-surface)',
}

const emptyEducation: StructuredResume['education'][number] = {
  school: '',
  degree: '',
  location: '',
  start: '',
  end: '',
  honors: '',
  coursework: '',
}

const emptyExperience: StructuredResume['experience'][number] = {
  title: '',
  company: '',
  location: '',
  start: '',
  end: '',
  bullets: [''],
}

const emptyProject: StructuredResume['projects'][number] = {
  name: '',
  technologies: '',
  start: '',
  end: '',
  bullets: [''],
}

export function ResumeStructuredEditor({
  value,
  onChange,
  flashFieldPath,
  flashFieldNonce = 0,
}: ResumeStructuredEditorProps) {
  useEffect(() => {
    if (!flashFieldPath) return
    const el = document.querySelector(
      `[data-field-path="${flashFieldPath.replace(/"/g, '\\"')}"]`,
    ) as HTMLElement | null
    if (!el) return
    el.classList.remove('jd-sync-flash')
    void el.offsetWidth
    el.classList.add('jd-sync-flash')
    const t = window.setTimeout(() => el.classList.remove('jd-sync-flash'), 1200)
    return () => window.clearTimeout(t)
  }, [flashFieldPath, flashFieldNonce])

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Contact */}
      <fieldset
        id="resume-section-header"
        className="rounded-card border p-4 space-y-3 scroll-mt-4"
        style={sectionCardStyle}
      >
        <legend className="text-xs font-medium mb-1 px-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Contact
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
              Name
            </label>
            <input
              data-field-path="header.name"
              className={fieldClass()}
              style={inputStyle()}
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
              Phone
            </label>
            <input
              data-field-path="header.phone"
              className={fieldClass()}
              style={inputStyle()}
              value={value.phone}
              onChange={(e) => onChange({ ...value, phone: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
              Email
            </label>
            <input
              data-field-path="header.email"
              className={fieldClass()}
              style={inputStyle()}
              value={value.email}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
              LinkedIn (username or path)
            </label>
            <input
              data-field-path="header.linkedin"
              className={fieldClass()}
              style={inputStyle()}
              value={value.linkedin}
              onChange={(e) => onChange({ ...value, linkedin: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
              GitHub (username)
            </label>
            <input
              data-field-path="header.github"
              className={fieldClass()}
              style={inputStyle()}
              value={value.github}
              onChange={(e) => onChange({ ...value, github: e.target.value })}
            />
          </div>
        </div>
      </fieldset>

      {/* Education */}
      <fieldset
        id="resume-section-education"
        className="rounded-card border p-4 space-y-3 scroll-mt-4"
        style={sectionCardStyle}
      >
        <legend className="text-xs font-medium mb-1 px-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Education
        </legend>
        <div className="flex flex-col gap-4">
          {value.education.map((edu, i) => (
            <div
              key={i}
              className="rounded-element border p-3 space-y-2"
              style={entryCardStyle}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    School
                  </label>
                  <input
                    data-field-path={`education.${i}.school`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={edu.school}
                    onChange={(e) => {
                      const next = [...value.education]
                      next[i] = { ...edu, school: e.target.value }
                      onChange({ ...value, education: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Location
                  </label>
                  <input
                    data-field-path={`education.${i}.location`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={edu.location}
                    onChange={(e) => {
                      const next = [...value.education]
                      next[i] = { ...edu, location: e.target.value }
                      onChange({ ...value, education: next })
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Degree
                  </label>
                  <input
                    data-field-path={`education.${i}.degree`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={edu.degree}
                    onChange={(e) => {
                      const next = [...value.education]
                      next[i] = { ...edu, degree: e.target.value }
                      onChange({ ...value, education: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Start
                  </label>
                  <input
                    data-field-path={`education.${i}.start`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={edu.start}
                    onChange={(e) => {
                      const next = [...value.education]
                      next[i] = { ...edu, start: e.target.value }
                      onChange({ ...value, education: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    End
                  </label>
                  <input
                    data-field-path={`education.${i}.end`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={edu.end}
                    onChange={(e) => {
                      const next = [...value.education]
                      next[i] = { ...edu, end: e.target.value }
                      onChange({ ...value, education: next })
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Honors
                  </label>
                  <input
                    data-field-path={`education.${i}.honors`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={edu.honors}
                    onChange={(e) => {
                      const next = [...value.education]
                      next[i] = { ...edu, honors: e.target.value }
                      onChange({ ...value, education: next })
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Coursework
                  </label>
                  <input
                    data-field-path={`education.${i}.coursework`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={edu.coursework}
                    onChange={(e) => {
                      const next = [...value.education]
                      next[i] = { ...edu, coursework: e.target.value }
                      onChange({ ...value, education: next })
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                className="rounded-element border px-2 py-1 text-xs font-mono w-fit transition-colors"
                style={{
                  borderColor: 'var(--color-border-strong)',
                  color: 'var(--color-danger)',
                  background: 'transparent',
                }}
                onClick={() =>
                  onChange({
                    ...value,
                    education: value.education.filter((_, j) => j !== i),
                  })
                }
              >
                Remove entry
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-element border px-2.5 py-1.5 text-xs w-fit transition-colors"
            style={{
              borderColor: 'var(--color-border-strong)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-surface)',
            }}
            onClick={() => onChange({ ...value, education: [...value.education, { ...emptyEducation }] })}
          >
            Add education
          </button>
        </div>
      </fieldset>

      {/* Skills */}
      <fieldset
        id="resume-section-skills"
        className="rounded-card border p-4 space-y-3 scroll-mt-4"
        style={sectionCardStyle}
      >
        <legend className="text-xs font-medium mb-1 px-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Technical skills
        </legend>
        {(
          [
            ['languages', 'Languages'],
            ['frameworks', 'Frameworks'],
            ['developer_tools', 'Developer tools'],
            ['libraries', 'Libraries'],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </label>
            <textarea
              data-field-path={`skills.${key}`}
              className={`${fieldClass()} min-h-[56px] resize-y font-mono text-xs`}
              style={inputStyle()}
              value={value.skills[key]}
              onChange={(e) =>
                onChange({ ...value, skills: { ...value.skills, [key]: e.target.value } })
              }
            />
          </div>
        ))}
      </fieldset>

      {/* Experience */}
      <fieldset
        id="resume-section-experience"
        className="rounded-card border p-4 space-y-3 scroll-mt-4"
        style={sectionCardStyle}
      >
        <legend className="text-xs font-medium mb-1 px-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Experience
        </legend>
        <div className="flex flex-col gap-4">
          {value.experience.map((exp, i) => (
            <div
              key={i}
              className="rounded-element border p-3 space-y-2"
              style={entryCardStyle}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Company
                  </label>
                  <input
                    data-field-path={`experience.${i}.company`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={exp.company}
                    onChange={(e) => {
                      const next = [...value.experience]
                      next[i] = { ...exp, company: e.target.value }
                      onChange({ ...value, experience: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Title
                  </label>
                  <input
                    data-field-path={`experience.${i}.title`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={exp.title}
                    onChange={(e) => {
                      const next = [...value.experience]
                      next[i] = { ...exp, title: e.target.value }
                      onChange({ ...value, experience: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Location
                  </label>
                  <input
                    data-field-path={`experience.${i}.location`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={exp.location}
                    onChange={(e) => {
                      const next = [...value.experience]
                      next[i] = { ...exp, location: e.target.value }
                      onChange({ ...value, experience: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Start
                  </label>
                  <input
                    data-field-path={`experience.${i}.start`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={exp.start}
                    onChange={(e) => {
                      const next = [...value.experience]
                      next[i] = { ...exp, start: e.target.value }
                      onChange({ ...value, experience: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    End
                  </label>
                  <input
                    data-field-path={`experience.${i}.end`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={exp.end}
                    onChange={(e) => {
                      const next = [...value.experience]
                      next[i] = { ...exp, end: e.target.value }
                      onChange({ ...value, experience: next })
                    }}
                  />
                </div>
              </div>
              <div>
                <p className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                  Bullets
                </p>
                {exp.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-1 mb-1">
                    <textarea
                      data-field-path={`experience.${i}.bullets.${bi}`}
                      className={`${fieldClass()} min-h-[48px] resize-y flex-1 font-mono text-xs`}
                      style={inputStyle()}
                      value={b}
                      onChange={(e) => {
                        const bullets = [...exp.bullets]
                        bullets[bi] = e.target.value
                        const next = [...value.experience]
                        next[i] = { ...exp, bullets }
                        onChange({ ...value, experience: next })
                      }}
                    />
                    <button
                      type="button"
                      className="shrink-0 px-1 text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      onClick={() => {
                        const bullets = exp.bullets.filter((_, j) => j !== bi)
                        const next = [...value.experience]
                        next[i] = { ...exp, bullets: bullets.length ? bullets : [''] }
                        onChange({ ...value, experience: next })
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-accent)' }}
                  onClick={() => {
                    const next = [...value.experience]
                    next[i] = { ...exp, bullets: [...exp.bullets, ''] }
                    onChange({ ...value, experience: next })
                  }}
                >
                  Add bullet
                </button>
              </div>
              <button
                type="button"
                className="rounded-element border px-2 py-1 text-xs font-mono w-fit transition-colors"
                style={{
                  borderColor: 'var(--color-border-strong)',
                  color: 'var(--color-danger)',
                  background: 'transparent',
                }}
                onClick={() =>
                  onChange({
                    ...value,
                    experience: value.experience.filter((_, j) => j !== i),
                  })
                }
              >
                Remove entry
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-element border px-2.5 py-1.5 text-xs w-fit transition-colors"
            style={{
              borderColor: 'var(--color-border-strong)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-surface)',
            }}
            onClick={() =>
              onChange({ ...value, experience: [...value.experience, { ...emptyExperience }] })
            }
          >
            Add experience
          </button>
        </div>
      </fieldset>

      {/* Projects */}
      <fieldset
        id="resume-section-projects"
        className="rounded-card border p-4 space-y-3 scroll-mt-4"
        style={sectionCardStyle}
      >
        <legend className="text-xs font-medium mb-1 px-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Projects
        </legend>
        <div className="flex flex-col gap-4">
          {value.projects.map((proj, i) => (
            <div
              key={i}
              className="rounded-element border p-3 space-y-2"
              style={entryCardStyle}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="sm:col-span-2">
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Name
                  </label>
                  <input
                    data-field-path={`projects.${i}.name`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={proj.name}
                    onChange={(e) => {
                      const next = [...value.projects]
                      next[i] = { ...proj, name: e.target.value }
                      onChange({ ...value, projects: next })
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Technologies
                  </label>
                  <input
                    data-field-path={`projects.${i}.technologies`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={proj.technologies}
                    onChange={(e) => {
                      const next = [...value.projects]
                      next[i] = { ...proj, technologies: e.target.value }
                      onChange({ ...value, projects: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    Start
                  </label>
                  <input
                    data-field-path={`projects.${i}.start`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={proj.start}
                    onChange={(e) => {
                      const next = [...value.projects]
                      next[i] = { ...proj, start: e.target.value }
                      onChange({ ...value, projects: next })
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                    End
                  </label>
                  <input
                    data-field-path={`projects.${i}.end`}
                    className={fieldClass()}
                    style={inputStyle()}
                    value={proj.end}
                    onChange={(e) => {
                      const next = [...value.projects]
                      next[i] = { ...proj, end: e.target.value }
                      onChange({ ...value, projects: next })
                    }}
                  />
                </div>
              </div>
              <div>
                <p className={labelClass()} style={{ color: 'var(--color-text-secondary)' }}>
                  Bullets
                </p>
                {proj.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-1 mb-1">
                    <textarea
                      data-field-path={`projects.${i}.bullets.${bi}`}
                      className={`${fieldClass()} min-h-[48px] resize-y flex-1 font-mono text-xs`}
                      style={inputStyle()}
                      value={b}
                      onChange={(e) => {
                        const bullets = [...proj.bullets]
                        bullets[bi] = e.target.value
                        const next = [...value.projects]
                        next[i] = { ...proj, bullets }
                        onChange({ ...value, projects: next })
                      }}
                    />
                    <button
                      type="button"
                      className="shrink-0 px-1 text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      onClick={() => {
                        const bullets = proj.bullets.filter((_, j) => j !== bi)
                        const next = [...value.projects]
                        next[i] = { ...proj, bullets: bullets.length ? bullets : [''] }
                        onChange({ ...value, projects: next })
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-accent)' }}
                  onClick={() => {
                    const next = [...value.projects]
                    next[i] = { ...proj, bullets: [...proj.bullets, ''] }
                    onChange({ ...value, projects: next })
                  }}
                >
                  Add bullet
                </button>
              </div>
              <button
                type="button"
                className="rounded-element border px-2 py-1 text-xs font-mono w-fit transition-colors"
                style={{
                  borderColor: 'var(--color-border-strong)',
                  color: 'var(--color-danger)',
                  background: 'transparent',
                }}
                onClick={() =>
                  onChange({
                    ...value,
                    projects: value.projects.filter((_, j) => j !== i),
                  })
                }
              >
                Remove entry
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-element border px-2.5 py-1.5 text-xs w-fit transition-colors"
            style={{
              borderColor: 'var(--color-border-strong)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-surface)',
            }}
            onClick={() =>
              onChange({ ...value, projects: [...value.projects, { ...emptyProject }] })
            }
          >
            Add project
          </button>
        </div>
      </fieldset>
    </div>
  )
}

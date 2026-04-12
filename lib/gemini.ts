import { GoogleGenAI } from '@google/genai'
import {
  ScanResultSchema,
  StructuredResumeSchema,
  type ScanResult,
  type StructuredResume,
} from '@/lib/types'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const SHARED_FEEDBACK_POLICIES = `
Shared feedback and scoring rules (apply to every feedback item):
- Header / contact (LinkedIn, GitHub): The resume text may have been parsed from a file that stripped raw URLs. Only flag missing LinkedIn or GitHub when there is no identifiable username, handle, or path in the resume text that clearly refers to those profiles. Do not treat the absence of a bare URL alone as missing.
- Severity for impact and metrics: Use "high" when a core responsibility or main achievement has no credible proof (outcome, scale, scope, or concrete result). Use "medium" when the bullet is plausible but could be strengthened with a metric or clearer scope. Do not label every non-numeric bullet as high—reserve high for claims that fail the credibility bar for the role level.
- overall_score calibration: Use the full 0–100 range with discernment. Approximate anchors: ~50 = mixed or unclear fit; ~70 = competitive for many employers; ~85+ = strong; ~90+ = exceptional. Tough grading must still differentiate candidates—do not compress most resumes into a narrow low band.
- Each feedback item must include:
  - "reasoning": One or two sentences from a recruiter or hiring-manager perspective—why this issue helps or hurts candidacy.
  - "description": Concrete, actionable guidance on what to change (you may reference suggested_line).
- suggested_line: Where you recommend a line-level rewrite, make it copy-paste ready.
`

const FEEDBACK_JSON_ITEM_SHAPE = `
  "feedback": [
    {
      "id": "<unique string>",
      "severity": "high" | "medium" | "low",
      "section": "<e.g. Experience — CompanyName, Skills, Summary>",
      "title": "<short title>",
      "description": "<actionable explanation>",
      "reasoning": "<why this matters to a recruiter or hiring manager>",
      "original_line": "<exact line from resume, or null>",
      "suggested_line": "<replacement line, or null>"
    }
  ],
`

const GENERAL_SCAN_SYSTEM_PROMPT = `You are an expert resume coach and ATS specialist with deep knowledge of the tech hiring market. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Use this date when evaluating experience dates — do not flag dates as future dates unless they are genuinely after today's date.

Analyze the resume below and return ONLY a valid JSON object — no markdown, no prose, no code fences — that exactly matches the schema provided.

Score the resume on five criteria, each out of 20:
- ATS: standard section headings, absence of tables/graphics/multi-column layouts that break ATS parsers, keyword density, clean formatting.
- Content: quantified achievements, strong action verbs, no responsibilities-only bullets, project impact stated clearly. This is the most important criterion for tech resumes — penalize heavily for bullets that describe responsibilities without measurable impact.
- Writing: grammar, spelling, active voice, conciseness, no clichés or filler phrases
- Job Match: general tech industry alignment, appropriate seniority signaling, role-track-appropriate language (use the role track provided if given)
- Ready: section completeness (experience, education, skills, contact), formatting consistency, appropriate length. Do NOT penalize for a missing summary section — a summary is optional and often unnecessary for students and new grad tech candidates. Only flag it as missing if the resume is for a mid-senior candidate who would clearly benefit from one.

${SHARED_FEEDBACK_POLICIES}

Provide 4–8 feedback items following these priorities in order:
1. Missing or weak quantification — prioritize bullets whose main claim lacks proof; assign severity per the shared rules. Always provide a suggested_line that adds a specific metric where appropriate, even if approximate (e.g. "improved performance by ~30%", "reduced load time by 2s", "managed 40+ students").
2. Missing keywords or skills relevant to the tech industry
3. Weak action verbs or passive language
4. Structural or formatting issues
5. Section-level observations

Each feedback item must include an original_line (the exact text from the resume) and a suggested_line where a line-level change is being recommended — set both to null only for high-level structural observations where no specific line can be improved. Set keywords_matched and keywords_missing to empty arrays. Set jd_title and jd_company to null.

Return a JSON object with this exact shape:
{
  "overall_score": <integer 0-100>,
  "scores": {
    "ats": <integer 0-20>,
    "content": <integer 0-20>,
    "writing": <integer 0-20>,
    "job_match": <integer 0-20>,
    "ready": <integer 0-20>
  },
${FEEDBACK_JSON_ITEM_SHAPE}
  "keywords_matched": [],
  "keywords_missing": [],
  "jd_title": null,
  "jd_company": null
}`

const JOB_MATCH_SYSTEM_PROMPT = `You are an expert resume coach, ATS specialist, and technical recruiter with deep knowledge of the tech hiring market. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Use this date when evaluating experience dates — do not flag dates as future dates unless they are genuinely after today's date.

Analyze the resume against the job description below and return ONLY a valid JSON object — no markdown, no prose, no code fences — that exactly matches the schema provided.

All five scoring criteria must be evaluated relative to the specific role described in the job description:
- ATS: standard section headings, absence of tables/graphics/multi-column layouts that break ATS parsers, keyword density, clean formatting. Also check that ATS-critical keywords from the JD appear in the resume.
- Content: quantified achievements, strong action verbs, no responsibilities-only bullets, project impact stated clearly. Emphasize whether achievements are relevant to the target role.
- Writing: grammar, spelling, active voice, conciseness, no clichés or filler phrases
- Job Match: score based on keyword overlap, required skills coverage, experience level fit, and role/title alignment with the JD. This is the most heavily weighted criterion in job match mode.
- Ready: section completeness (experience, education, skills, contact), formatting consistency, appropriate length.

- "Comprehensive Audit: You MUST evaluate each primary section (Header, Experience, Projects, Skills, Education). Ensure at least one piece of feedback addresses the 'Skills' section formatting or keyword strategy, and at least one addresses 'Project' technical depth."
- "The 'Project' Standard: For technical roles, if a project lacks a stack description or architectural context, flag it as 'Medium' severity—recruiters need to know how it was built, not just what it does."

- overall_score calibration: 
  * Start at 100 and deduct for every gap. 
  * AUTOMATIC CEILING: If a candidate is missing more than 2 core technologies from the JD, the 'Job Match' score cannot exceed 12/20.
  * IMPACT PENALTY: If more than 50% of the bullets in 'Experience' lack a quantifiable metric (%, $, #), the 'Content' score must be capped at 10/20.
  * This should naturally pull the overall_score down to the 50-65 range for "average" resumes.

${SHARED_FEEDBACK_POLICIES}

Extract and return:
- keywords_matched: keywords present in both the resume and the JD (tech skills, tools, frameworks, methodologies)
- keywords_missing: keywords required or strongly preferred in the JD that are absent from the resume
- jd_title: the job title extracted from the JD (null if unclear)
- jd_company: the company name extracted from the JD (null if unclear)

Provide 5–10 feedback items, prioritizing gaps that directly reduce job match score. Each feedback item must include an original_line (the exact text from the resume) and a suggested_line where a line-level change is being recommended — set both to null only for high-level structural observations.

Return a JSON object with this exact shape:
{
  "overall_score": <integer 0-100>,
  "scores": {
    "ats": <integer 0-20>,
    "content": <integer 0-20>,
    "writing": <integer 0-20>,
    "job_match": <integer 0-20>,
    "ready": <integer 0-20>
  },
${FEEDBACK_JSON_ITEM_SHAPE}
  "keywords_matched": ["<string>"],
  "keywords_missing": ["<string>"],
  "jd_title": "<string or null>",
  "jd_company": "<string or null>"
}`

async function callGemini(
  userMessage: string,
  systemPrompt: string
): Promise<ScanResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    config: {
      temperature: 0,
      responseMimeType: 'application/json',
      systemInstruction: systemPrompt,
    },
  })

  const raw = response.text
  if (!raw) throw new Error('Empty response from Gemini')

  const parsed: unknown = JSON.parse(raw)
  return ScanResultSchema.parse(parsed)
}

export async function analyzeResume(
  resumeText: string,
  roleTrack?: string | null
): Promise<ScanResult> {
  const track = roleTrack ?? 'General Tech'
  const userMessage = `ROLE TRACK: ${track}\n\n--- RESUME ---\n${resumeText}`

  try {
    return await callGemini(userMessage, GENERAL_SCAN_SYSTEM_PROMPT)
  } catch {
    return await callGemini(userMessage, GENERAL_SCAN_SYSTEM_PROMPT)
  }
}

export async function analyzeResumeWithJD(
  resumeText: string,
  jdText: string,
  roleTrack?: string | null
): Promise<ScanResult> {
  const track = roleTrack ?? 'General Tech'
  const userMessage = `ROLE TRACK: ${track}\n\n--- RESUME ---\n${resumeText}\n\n--- JOB DESCRIPTION ---\n${jdText}`

  try {
    return await callGemini(userMessage, JOB_MATCH_SYSTEM_PROMPT)
  } catch {
    return await callGemini(userMessage, JOB_MATCH_SYSTEM_PROMPT)
  }
}

const STRUCTURE_RESUME_SYSTEM_PROMPT = `You are a resume parser. Extract structured data from the resume text below and return ONLY a valid JSON object — no markdown, no prose, no code fences.

All string fields must be present. If a field is not found in the resume, return an empty string "". Bullet arrays must contain individual achievement strings, each without a leading dash or bullet character.

Date format: use the exact text from the resume (e.g. "May 2023", "Jun. 2024 – Present"). Do not reformat or infer dates.

Return a JSON object with EXACTLY this shape:
{
  "name": "<full name>",
  "phone": "<phone number>",
  "email": "<email address>",
  "linkedin": "<linkedin username or URL>",
  "github": "<github username or URL>",
  "education": [
    { 
      "school": "", 
      "degree": "", 
      "location": "", 
      "start": "", 
      "end": "",
      "honors": "<Academic honors, awards, GPA, Dean's list — exactly as written in the resume. Empty string if none.>",
      "coursework": "<Relevant course names only, comma-separated. Do not include honors or awards here. Empty string if none.>"
    }
  ],
  "experience": [
    { "title": "", "company": "", "location": "", "start": "", "end": "", "bullets": [""] }
  ],
  "projects": [
    { "name": "", "technologies": "<comma-separated list of specific, concrete technology names only. Exclude generic or vague terms such as 'AI', 'FOAF', 'Named Entity Recognition', 'REST APIs', or any other category labels — include only specific languages, frameworks, libraries, and named tools.>", "start": "", "end": "", "bullets": [""] }
  ],
  "skills": {
    "languages": "<comma-separated list>",
    "frameworks": "<comma-separated list>",
    "developer_tools": "<comma-separated list>",
    "libraries": "<comma-separated list>"
  }
}`

export async function structureResume(mergedText: string): Promise<StructuredResume> {
  async function attempt(): Promise<StructuredResume> {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: mergedText }] }],
      config: {
        temperature: 0,
        responseMimeType: 'application/json',
        systemInstruction: STRUCTURE_RESUME_SYSTEM_PROMPT,
      },
    })

    const raw = response.text
    if (!raw) throw new Error('Empty response from Gemini')

    const parsed: unknown = JSON.parse(raw)
    return StructuredResumeSchema.parse(parsed)
  }

  try {
    return await attempt()
  } catch {
    return await attempt()
  }
}

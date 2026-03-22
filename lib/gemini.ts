import { GoogleGenAI } from '@google/genai'
import { ScanResultSchema, type ScanResult } from '@/lib/types'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const GENERAL_SCAN_SYSTEM_PROMPT = `You are an expert resume coach and ATS specialist with deep knowledge of the tech hiring market. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Use this date when evaluating experience dates — do not flag dates as future dates unless they are genuinely after today's date.

Analyze the resume below and return ONLY a valid JSON object — no markdown, no prose, no code fences — that exactly matches the schema provided.

Score the resume on five criteria, each out of 20:
- ATS: standard section headings, absence of tables/graphics/multi-column layouts that break ATS parsers, keyword density, clean formatting. Do not flag missing hyperlinks — the parsing process strips URLs from the document so link presence cannot be evaluated.
- Content: quantified achievements, strong action verbs, no responsibilities-only bullets, project impact stated clearly. This is the most important criterion for tech resumes — penalize heavily for bullets that describe responsibilities without measurable impact.
- Writing: grammar, spelling, active voice, conciseness, no clichés or filler phrases
- Job Match: general tech industry alignment, appropriate seniority signaling, role-track-appropriate language (use the role track provided if given)
- Ready: section completeness (experience, education, skills, contact), formatting consistency, appropriate length. Do NOT penalize for a missing summary section — a summary is optional and often unnecessary for students and new grad tech candidates. Only flag it as missing if the resume is for a mid-senior candidate who would clearly benefit from one.

Provide 4–8 feedback items following these priorities in order:
1. Missing or weak quantification — flag every bullet that describes a responsibility without a measurable result as high or medium severity. Always provide a suggested_line that adds a specific metric, even if approximate (e.g. "improved performance by ~30%", "reduced load time by 2s", "managed 40+ students"). This is the single highest-value improvement for most tech resumes.
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
  "feedback": [
    {
      "id": "<unique string>",
      "severity": "high" | "medium" | "low",
      "section": "<e.g. Experience, Skills, Summary>",
      "title": "<short title>",
      "description": "<actionable explanation>",
      "original_line": "<exact line from resume, or null>",
      "suggested_line": "<replacement line, or null>"
    }
  ],
  "keywords_matched": [],
  "keywords_missing": [],
  "jd_title": null,
  "jd_company": null
}`

async function callGemini(resumeText: string, roleTrack: string): Promise<ScanResult> {
  const userMessage = `ROLE TRACK: ${roleTrack}\n\n--- RESUME ---\n${resumeText}`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    config: {
      temperature: 0,
      responseMimeType: 'application/json',
      systemInstruction: GENERAL_SCAN_SYSTEM_PROMPT,
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

  try {
    return await callGemini(resumeText, track)
  } catch {
    // Retry once on failure
    return await callGemini(resumeText, track)
  }
}

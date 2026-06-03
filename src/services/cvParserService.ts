import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { CVProfile, Skill } from "../types";
import { mockUserProfile } from "../data/mockUserProfile";

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

export interface ICVParserService {
  parse(file: File): Promise<CVProfile>;
}

const API_URL = import.meta.env.DEV
  ? "/api/completion"
  : "https://yyjex83jyiw4.asuscomm.com/completion";
const API_KEY = "sk-llama-61468520f7299d6bb0e57e00dcc943b6";

const VALID_CATEGORIES = new Set([
  "Language",
  "Framework",
  "Architecture",
  "Backend Integration",
  "DevOps",
  "Testing",
  "Design",
  "Soft Skills",
  "Security",
  "Observability",
]);

function buildPrompt(cvText: string): string {
  const instruction = `You are a CV analysis engine. Analyze the CV below and return ONLY a valid JSON object (no markdown, no explanation, no wrapping) matching this exact structure:

{
  "role": "<string: job title>",
  "yearsOfExperience": <number>,
  "skills": [
    { "name": "<string>", "level": <1-10>, "maxLevel": 10, "category": "<one of: Language, Framework, Architecture, Backend Integration, DevOps, Testing, Design, Soft Skills, Security, Observability>" }
  ]
}

Rules for level scoring (1-10):
- 1-2: Mentioned/exposure only
- 3-4: Some hands-on experience
- 5-6: Solid working knowledge, used in production
- 7-8: Advanced, multiple years of deep usage
- 9-10: Expert/mastery, led teams or architected systems using this

Extract ALL relevant skills from the CV. Return ONLY the JSON object.`;

  return `<|im_start|>user\n${instruction}\n\n${cvText}<|im_end|>\n<|im_start|>assistant\n`;
}

function isValidSkill(s: unknown): s is Skill {
  if (typeof s !== "object" || s === null) return false;
  const obj = s as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.level === "number" &&
    obj.level >= 1 &&
    obj.level <= 10 &&
    typeof obj.maxLevel === "number" &&
    typeof obj.category === "string" &&
    VALID_CATEGORIES.has(obj.category)
  );
}

function parseProfileFromResponse(raw: string): CVProfile {
  // Strip <think>...</think> blocks if present
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // Extract the first JSON object from the response
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");

  const json = JSON.parse(cleaned.slice(start, end + 1));

  if (typeof json.role !== "string" || typeof json.yearsOfExperience !== "number" || !Array.isArray(json.skills)) {
    throw new Error("Response does not match CVProfile schema");
  }

  const skills: Skill[] = json.skills.filter(isValidSkill);
  if (skills.length === 0) throw new Error("No valid skills extracted");

  return {
    role: json.role,
    yearsOfExperience: json.yearsOfExperience,
    skills,
  };
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n");
}

async function readFileAsText(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return extractTextFromPdf(file);
  }
  return file.text();
}

export const cvParserService: ICVParserService = {
  async parse(file: File): Promise<CVProfile> {
    try {
      const cvText = await readFileAsText(file);
      if (!cvText.trim()) throw new Error("File is empty");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: buildPrompt(cvText) }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const content: string = data.content ?? data.generated_text ?? "";
      if (!content) throw new Error("Empty response from API");

      return parseProfileFromResponse(content);
    } catch (err) {
      console.warn("LLM parsing failed, falling back to mock data:", err);
      return mockUserProfile;
    }
  },
};

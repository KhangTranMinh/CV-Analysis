# CV Analysis - Product Requirements

## Overview

A web application that allows users to upload their CV (resume), extracts skills with proficiency levels, visualizes them, and compares against an expert benchmark for the same role — providing actionable growth suggestions.

---

## Tech Stack

| Layer        | Choice                          |
| ------------ | ------------------------------- |
| Framework    | React 18+ with TypeScript      |
| UI Library   | MUI (Material UI) v5+          |
| Build Tool   | Vite                            |
| Backend      | None (all data mocked client-side) |
| Responsive   | Mobile-first, fully responsive  |

---

## Features

### 1. CV Upload

- User can upload a CV in **PDF** format via a drag-and-drop zone or file picker button.
- Display the selected file name, size, and a remove/re-upload option.
- Validate file type (PDF only) and file size (max 5 MB).
- Show a loading/processing state after upload while "parsing" occurs.

### 2. AI-Powered CV Parsing (Mocked)

- After upload, simulate an AI parsing step (with a short delay for realism).
- **For now**: always return a **mock JSON** response — no real AI integration yet.
- The mock data represents a **Mobile Developer** profile.
- The AI service layer should be abstracted behind an interface/service so a real model can be plugged in later without changing UI code.

#### Mock Data Schema

```json
{
  "role": "Mobile Developer",
  "yearsOfExperience": 3,
  "skills": [
    { "name": "React Native", "level": 5, "maxLevel": 10, "category": "Framework" },
    { "name": "TypeScript", "level": 6, "maxLevel": 10, "category": "Language" },
    { "name": "Swift", "level": 3, "maxLevel": 10, "category": "Language" },
    { "name": "Kotlin", "level": 4, "maxLevel": 10, "category": "Language" },
    { "name": "REST APIs", "level": 7, "maxLevel": 10, "category": "Backend Integration" },
    { "name": "CI/CD", "level": 3, "maxLevel": 10, "category": "DevOps" },
    { "name": "Unit Testing", "level": 4, "maxLevel": 10, "category": "Testing" },
    { "name": "UI/UX Design", "level": 5, "maxLevel": 10, "category": "Design" }
  ]
}
```

### 3. Skill Visualization

- Each skill is rendered as a **horizontal bar** showing proficiency level out of max (e.g., `React Native: █████░░░░░ 5/10`).
- Skills are grouped by **category** (Language, Framework, DevOps, etc.).
- Bars are color-coded by proficiency:
  - **1-3** (Beginner): red/orange
  - **4-6** (Intermediate): yellow/amber
  - **7-10** (Advanced): green
- The overall profile summary (role, years of experience) is shown at the top.

### 4. Expert Comparison

- A **"Compare with Expert"** button triggers a side-by-side or overlay comparison.
- The expert profile is a **mock dataset** representing a senior-level professional in the same role.
- Comparison view shows:
  - User skill level vs. Expert skill level per skill (dual bars or overlapping bars).
  - **Skill gap** highlighted (difference between expert and user level).
  - Skills the expert has that the user is **missing** entirely.

#### Expert Mock Data

```json
{
  "role": "Senior Mobile Developer",
  "yearsOfExperience": 8,
  "skills": [
    { "name": "React Native", "level": 9, "maxLevel": 10, "category": "Framework" },
    { "name": "TypeScript", "level": 9, "maxLevel": 10, "category": "Language" },
    { "name": "Swift", "level": 7, "maxLevel": 10, "category": "Language" },
    { "name": "Kotlin", "level": 7, "maxLevel": 10, "category": "Language" },
    { "name": "REST APIs", "level": 9, "maxLevel": 10, "category": "Backend Integration" },
    { "name": "CI/CD", "level": 7, "maxLevel": 10, "category": "DevOps" },
    { "name": "Unit Testing", "level": 8, "maxLevel": 10, "category": "Testing" },
    { "name": "UI/UX Design", "level": 6, "maxLevel": 10, "category": "Design" },
    { "name": "System Design", "level": 8, "maxLevel": 10, "category": "Architecture" },
    { "name": "Team Leadership", "level": 7, "maxLevel": 10, "category": "Soft Skills" }
  ]
}
```

### 5. Growth Suggestions

- After comparison, display a **prioritized list of suggestions** to help the user grow toward the expert level.
- Suggestion logic (client-side):
  - **Large gaps first**: skills where `expertLevel - userLevel >= 3` are high priority.
  - **Missing skills**: skills the expert has but the user lacks are flagged as "New skill to learn".
  - Each suggestion includes:
    - Skill name
    - Current level vs. target level
    - Priority tag (High / Medium / Low)
    - A brief actionable tip (mocked text)
- Suggestions are displayed as MUI Cards or an Accordion list.

### 6. User Flow

```
Upload CV  -->  Parsing (mock)  -->  Skill Dashboard  -->  Compare with Expert  -->  Growth Plan
```

- Single-page app with a **stepper** or tab-based navigation through these stages.
- User can go back to any previous step.

---

## Non-Functional Requirements

- **Responsive**: works on mobile (360px+), tablet, and desktop.
- **Accessibility**: proper ARIA labels, keyboard navigation, color contrast.
- **Performance**: instant interactions (no real API calls).
- **Code Quality**: clean component structure, TypeScript strict mode, ESLint + Prettier.

---

## Future Considerations (Out of Scope for Now)

- Real AI model integration (OpenAI / custom NLP) for CV parsing.
- Backend API with database for persisting user data.
- Multiple role templates (not just Mobile Developer).
- PDF preview/viewer in the app.
- Export growth plan as PDF.
- User authentication and saved profiles.

export interface Skill {
  name: string;
  level: number;
  maxLevel: number;
  category: string;
}

export interface CVProfile {
  role: string;
  yearsOfExperience: number;
  skills: Skill[];
}

export type Priority = "High" | "Medium" | "Low";

export interface GrowthSuggestion {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  maxLevel: number;
  priority: Priority;
  tip: string;
  isMissing: boolean;
}

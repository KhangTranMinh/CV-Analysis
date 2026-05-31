import type { CVProfile } from "../types";

export const mockExpertProfile: CVProfile = {
  role: "Senior Mobile Developer",
  yearsOfExperience: 8,
  skills: [
    { name: "React Native", level: 9, maxLevel: 10, category: "Framework" },
    { name: "TypeScript", level: 9, maxLevel: 10, category: "Language" },
    { name: "Swift", level: 7, maxLevel: 10, category: "Language" },
    { name: "Kotlin", level: 7, maxLevel: 10, category: "Language" },
    { name: "REST APIs", level: 9, maxLevel: 10, category: "Backend Integration" },
    { name: "CI/CD", level: 7, maxLevel: 10, category: "DevOps" },
    { name: "Unit Testing", level: 8, maxLevel: 10, category: "Testing" },
    { name: "UI/UX Design", level: 6, maxLevel: 10, category: "Design" },
    { name: "System Design", level: 8, maxLevel: 10, category: "Architecture" },
    { name: "Team Leadership", level: 7, maxLevel: 10, category: "Soft Skills" },
  ],
};

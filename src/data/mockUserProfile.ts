import type { CVProfile } from "../types";

export const mockUserProfile: CVProfile = {
  role: "Mobile Developer",
  yearsOfExperience: 3,
  skills: [
    { name: "React Native", level: 5, maxLevel: 10, category: "Framework" },
    { name: "TypeScript", level: 6, maxLevel: 10, category: "Language" },
    { name: "Swift", level: 3, maxLevel: 10, category: "Language" },
    { name: "Kotlin", level: 4, maxLevel: 10, category: "Language" },
    { name: "REST APIs", level: 7, maxLevel: 10, category: "Backend Integration" },
    { name: "CI/CD", level: 3, maxLevel: 10, category: "DevOps" },
    { name: "Unit Testing", level: 4, maxLevel: 10, category: "Testing" },
    { name: "UI/UX Design", level: 5, maxLevel: 10, category: "Design" },
  ],
};

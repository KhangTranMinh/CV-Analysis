import type { CVProfile, GrowthSuggestion, Priority } from "../types";

const tips: Record<string, string> = {
  "React Native":
    "Build a complex app with navigation, state management, and native modules to deepen your expertise.",
  TypeScript:
    "Contribute to open-source TypeScript projects and practice advanced generics and type utilities.",
  Swift:
    "Develop a native iOS app using SwiftUI and explore advanced patterns like Combine and async/await.",
  Kotlin:
    "Build an Android app with Jetpack Compose and explore coroutines for async programming.",
  "REST APIs":
    "Design and consume RESTful services with proper error handling, caching, and pagination.",
  "CI/CD":
    "Set up end-to-end CI/CD pipelines with automated testing, code signing, and deployment to app stores.",
  "Unit Testing":
    "Aim for high test coverage using Jest/Detox and practice TDD on new features.",
  "UI/UX Design":
    "Study Material Design and iOS HIG guidelines; practice creating pixel-perfect, accessible interfaces.",
  "System Design":
    "Study mobile system design patterns: offline-first architecture, caching strategies, and scalable state management.",
  "Team Leadership":
    "Mentor junior developers, lead code reviews, and drive technical decision-making in your team.",
};

const defaultTip = "Focus on hands-on projects and seek mentorship to accelerate your growth in this area.";

function getPriority(gap: number): Priority {
  if (gap >= 4) return "High";
  if (gap >= 2) return "Medium";
  return "Low";
}

export function generateSuggestions(
  userProfile: CVProfile,
  expertProfile: CVProfile
): GrowthSuggestion[] {
  const suggestions: GrowthSuggestion[] = [];
  const userSkillMap = new Map(
    userProfile.skills.map((s) => [s.name, s])
  );

  for (const expertSkill of expertProfile.skills) {
    const userSkill = userSkillMap.get(expertSkill.name);

    if (!userSkill) {
      suggestions.push({
        skillName: expertSkill.name,
        currentLevel: 0,
        targetLevel: expertSkill.level,
        maxLevel: expertSkill.maxLevel,
        priority: "High",
        tip: tips[expertSkill.name] ?? defaultTip,
        isMissing: true,
      });
    } else {
      const gap = expertSkill.level - userSkill.level;
      if (gap > 0) {
        suggestions.push({
          skillName: expertSkill.name,
          currentLevel: userSkill.level,
          targetLevel: expertSkill.level,
          maxLevel: expertSkill.maxLevel,
          priority: getPriority(gap),
          tip: tips[expertSkill.name] ?? defaultTip,
          isMissing: false,
        });
      }
    }
  }

  const priorityOrder: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}

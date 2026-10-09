import type { Skill, SkillLevel, SortOption } from '../types/Skill';
import { parseTargetDate } from './goalStatus';

const levelOrder: Record<SkillLevel, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

export function sortSkills(skills: readonly Skill[], sortBy: SortOption): Skill[] {
  // Sort a copy so React state and the filtered array remain unchanged.
  return [...skills].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.progress - a.progress;
      case 'level':
        return levelOrder[a.level] - levelOrder[b.level];
      case 'targetDate': {
        const aDate = parseTargetDate(a.targetDate);
        const bDate = parseTargetDate(b.targetDate);
        if (!aDate) return bDate ? 1 : 0;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      }
    }
  });
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Skill {
  id: number;
  name: string;
  level: SkillLevel;
  progress: number;
  completed: boolean;
}

// The form only collects these three fields. App supplies identity and status.
export type SkillFormData = Pick<Skill, 'name' | 'level' | 'progress'>;
export type SkillUpdate = Partial<SkillFormData>;
export type SkillFilter = 'All' | SkillLevel | 'Completed' | 'In Progress';

export const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
export function isSkillLevel(value: unknown): value is SkillLevel {
  return value === 'Beginner' || value === 'Intermediate' || value === 'Advanced';
}

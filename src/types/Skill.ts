export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Topic {
  id: number;
  name: string;
  completed: boolean;
}

export interface Skill {
  id: number;
  name: string;
  level: SkillLevel;
  progress: number;
  completed: boolean;
  topics?: Topic[];
  notes?: string;
  goal?: string;
  targetDate?: string;
}

// The form only collects these three fields. App supplies identity and status.
export type SkillFormData = Pick<Skill, 'name' | 'level' | 'progress'>;
export type SkillUpdate = Partial<Pick<Skill, 'name' | 'level' | 'progress' | 'topics' | 'notes' | 'goal' | 'targetDate'>>;
export type SkillFilter = 'All' | SkillLevel | 'Completed' | 'In Progress';

export const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
export function isSkillLevel(value: unknown): value is SkillLevel {
  return value === 'Beginner' || value === 'Intermediate' || value === 'Advanced';
}

export type SortOption = 'name' | 'progress' | 'level' | 'targetDate';
export function isSortOption(value: unknown): value is SortOption {
  return value === 'name' || value === 'progress' || value === 'level' || value === 'targetDate';
}

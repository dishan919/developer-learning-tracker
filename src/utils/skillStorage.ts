import { isSkillLevel } from '../types/Skill';
import type { Skill, Topic } from '../types/Skill';

export const STORAGE_KEY = 'developer-learning-tracker.skills';
export const sampleSkills: Skill[] = [
  { id: 1, name: 'React', level: 'Intermediate', progress: 70, completed: false },
  { id: 2, name: 'TypeScript', level: 'Beginner', progress: 30, completed: false },
];

// JSON is untrusted: narrow unknown before accessing its properties.
function isSkill(value: unknown): value is Skill {
  if (typeof value !== 'object' || value === null) return false;
  return 'id' in value && typeof value.id === 'number' && Number.isSafeInteger(value.id)
    && value.id > 0 && 'name' in value && typeof value.name === 'string'
    && value.name.trim().length > 0 && 'level' in value && isSkillLevel(value.level)
    && 'progress' in value && typeof value.progress === 'number'
    && Number.isFinite(value.progress) && value.progress >= 0 && value.progress <= 100
    && 'completed' in value && typeof value.completed === 'boolean';
}

function isTopic(value: unknown): value is Topic {
  return typeof value === 'object' && value !== null
    && 'id' in value && typeof value.id === 'number' && Number.isSafeInteger(value.id) && value.id > 0
    && 'name' in value && typeof value.name === 'string' && value.name.trim().length > 0
    && 'completed' in value && typeof value.completed === 'boolean';
}

function normalizeSkill(skill: Skill): Skill {
  // Optional fields are checked independently, so old records remain valid.
  const savedTopics: unknown = skill.topics;
  const topics: Topic[] = Array.isArray(savedTopics) ? savedTopics.filter(isTopic) : [];
  const uniqueTopics = topics.filter((topic, index) => topics.findIndex(item => item.id === topic.id) === index);
  return { ...skill, name: skill.name.trim(), completed: skill.progress === 100,
    topics: uniqueTopics, notes: typeof skill.notes === 'string' ? skill.notes : '',
    goal: typeof skill.goal === 'string' ? skill.goal : undefined,
    targetDate: typeof skill.targetDate === 'string' ? skill.targetDate : undefined };
}

// The hook handles JSON/storage errors; this parser owns skill validation and migration.
export function parseStoredSkills(value: unknown): Skill[] {
  if (!Array.isArray(value) || !value.every(isSkill)) throw new TypeError('Invalid stored skills');
  const skills: Skill[] = value;
  if (new Set(skills.map(skill => skill.id)).size !== skills.length) throw new TypeError('Duplicate skill IDs');
  return skills.map(normalizeSkill);
}

export function loadSkills(): Skill[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return sampleSkills;
    const parsed: unknown = JSON.parse(saved);
    return parseStoredSkills(parsed);
  } catch {
    return sampleSkills;
  }
}

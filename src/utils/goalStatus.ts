import type { Skill } from '../types/Skill';

export type GoalStatus = 'Completed' | 'Overdue' | 'Due Soon' | 'On Track' | 'No Target Date';

// Parse date-only values explicitly in local time; reject rollover dates.
export function parseTargetDate(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  if (year < 1 || !Number.isFinite(date.getTime()) || date.getFullYear() !== year
    || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
  return date;
}

// Compare calendar days in UTC, rather than elapsed local hours across DST.
function calendarDay(date: Date): number {
  const utc = new Date(0);
  utc.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  utc.setUTCHours(0, 0, 0, 0);
  return utc.getTime() / 86_400_000;
}

export function getGoalDetails(skill: Pick<Skill, 'completed' | 'targetDate'>, today = new Date()): {
  status: GoalStatus;
  targetDate: Date | undefined;
  daysRemaining: number | undefined;
} {
  const targetDate = parseTargetDate(skill.targetDate);
  const daysRemaining = targetDate && Number.isFinite(today.getTime())
    ? calendarDay(targetDate) - calendarDay(today) : undefined;
  const status: GoalStatus = skill.completed ? 'Completed'
    : daysRemaining === undefined ? 'No Target Date'
    : daysRemaining < 0 ? 'Overdue'
    : daysRemaining <= 7 ? 'Due Soon' : 'On Track';
  return { status, targetDate, daysRemaining };
}

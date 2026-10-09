import { useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Skill } from '../types/Skill';
import { parseTargetDate } from '../utils/goalStatus';

export type LearningGoalData = Pick<Skill, 'goal' | 'targetDate'>;
interface LearningGoalFormProps {
  goal?: string;
  targetDate?: string;
  onSave: (data: LearningGoalData) => void;
}

export default function LearningGoalForm({ goal, targetDate, onSave }: LearningGoalFormProps) {
  const [draftGoal, setDraftGoal] = useState(goal ?? '');
  const [draftDate, setDraftDate] = useState(parseTargetDate(targetDate) ? targetDate ?? '' : '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const id = useId();

  function handleGoal(event: ChangeEvent<HTMLInputElement>) {
    setDraftGoal(event.target.value);
    setSaved(false);
  }
  function handleDate(event: ChangeEvent<HTMLInputElement>) {
    setDraftDate(event.target.value);
    setSaved(false);
    setError('');
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draftDate && !parseTargetDate(draftDate)) {
      setError('Choose a valid target date.');
      return;
    }
    const trimmedGoal = draftGoal.trim();
    onSave({ goal: trimmedGoal || undefined, targetDate: draftDate || undefined });
    setDraftGoal(trimmedGoal);
    setError('');
    setSaved(true);
  }

  return <form className="skill-form" onSubmit={handleSubmit}>
    <label htmlFor={id + '-goal'}>Learning goal</label>
    <input id={id + '-goal'} value={draftGoal} onChange={handleGoal}
      placeholder="Build React applications confidently using TypeScript" />
    <label htmlFor={id + '-date'}>Target date</label>
    <input id={id + '-date'} type="date" value={draftDate} onChange={handleDate} />
    {error && <p className="error" role="alert">{error}</p>}
    <div className="actions"><button className="primary" type="submit">Save Goal</button></div>
    <p className="notes-status" role="status">{saved ? 'Goal and target date saved to this skill.'
      : draftGoal !== (goal ?? '') || draftDate !== (targetDate ?? '') ? 'Unsaved changes' : ''}</p>
  </form>;
}

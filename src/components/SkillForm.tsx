import { useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { isSkillLevel, skillLevels } from '../types/Skill';
import type { SkillFormData } from '../types/Skill';
interface SkillFormProps {
  initialValues?: SkillFormData;
  onSubmit: (data: SkillFormData) => void;
  onCancel?: () => void;
}
const emptyForm: SkillFormData = { name: '', level: 'Beginner', progress: 0 };
export default function SkillForm({ initialValues, onSubmit, onCancel }: SkillFormProps) {
  const [form, setForm] = useState<SkillFormData>(initialValues ?? emptyForm);
  const [error, setError] = useState<string>('');
  const id = useId();
  function handleName(event: ChangeEvent<HTMLInputElement>) {
    setForm(current => ({ ...current, name: event.target.value }));
  }
  function handleLevel(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    if (isSkillLevel(value)) setForm(current => ({ ...current, level: value }));
  }
  function handleProgress(event: ChangeEvent<HTMLInputElement>) {
    setForm(current => ({ ...current, progress: Number(event.target.value) }));
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) { setError('Enter a skill name.'); return; }
    if (!Number.isFinite(form.progress) || form.progress < 0 || form.progress > 100) {
      setError('Progress must be between 0 and 100.'); return;
    }
    onSubmit({ ...form, name: form.name.trim() });
    setError('');
    if (!initialValues) setForm(emptyForm);
  }
  return <form onSubmit={handleSubmit} className="skill-form">
    <label htmlFor={id + '-name'}>Skill name</label>
    <input id={id + '-name'} value={form.name} onChange={handleName} placeholder="e.g. Node.js" required maxLength={120} />
    <label htmlFor={id + '-level'}>Level</label>
    <select id={id + '-level'} value={form.level} onChange={handleLevel}>{skillLevels.map(level => <option key={level}>{level}</option>)}</select>
    <label htmlFor={id + '-progress'}>Progress <span>{form.progress}%</span></label>
    <input id={id + '-progress'} type="number" min="0" max="100" step="1" required value={form.progress} onChange={handleProgress} />
    {error && <p role="alert" className="error">{error}</p>}
    <div className="actions"><button className="primary" type="submit">{initialValues ? 'Save changes' : '+ Add Skill'}</button>{onCancel && <button type="button" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}

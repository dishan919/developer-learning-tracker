import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Skill, SkillUpdate } from '../types/Skill';
import SkillForm from './SkillForm';
export interface SkillCardProps {
  skill: Skill;
  onUpdate: (id: Skill['id'], updates: SkillUpdate) => void;
  onDelete: (id: Skill['id']) => void;
}
export default function SkillCard({ skill, onUpdate, onDelete }: SkillCardProps) {
  const [editing, setEditing] = useState<boolean>(false);
  function handleProgress(event: ChangeEvent<HTMLInputElement>) {
    onUpdate(skill.id, { progress: Number(event.target.value) });
  }
  return <article className="skill-card">
    {editing ? <><h3>Edit {skill.name}</h3><SkillForm initialValues={skill} onSubmit={data => { onUpdate(skill.id, data); setEditing(false); }} onCancel={() => setEditing(false)} /></> : <>
      <div className="card-heading"><span className="level">{skill.level}</span><span className={skill.completed ? 'status complete' : 'status'}>{skill.completed ? 'Completed' : 'In Progress'}</span></div>
      <h3>{skill.name}</h3>
      <div className="progress-label"><span>Learning progress</span><strong>{skill.progress}%</strong></div>
      <progress max={100} value={skill.progress} aria-label={skill.name + ' progress'} />
      <label className="range-label" htmlFor={'progress-' + skill.id}>Update progress</label>
      <input id={'progress-' + skill.id} type="range" min="0" max="100" value={skill.progress} onChange={handleProgress} />
      <div className="card-actions"><button type="button" onClick={() => setEditing(true)}>Edit<span className="sr-only"> {skill.name}</span></button><button type="button" className="delete" onClick={() => onDelete(skill.id)}>Delete<span className="sr-only"> {skill.name}</span></button></div>
    </>}
  </article>;
}

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Skill, SkillUpdate, Topic } from '../types/Skill';
import SkillForm from '../components/SkillForm';
import TopicForm from '../components/TopicForm';
import TopicList from '../components/TopicList';
interface SkillDetailsProps {
  skills: Skill[];
  onUpdate: (id: Skill['id'], updates: SkillUpdate) => void;
}
export default function SkillDetails({ skills, onUpdate }: SkillDetailsProps) {
  const { id } = useParams<'id'>(); // URL parameters are strings or undefined.
  const skillId = id && /^[1-9]\d*$/.test(id) ? Number(id) : undefined;
  const skill = skillId !== undefined && Number.isSafeInteger(skillId)
    ? skills.find(item => item.id === skillId) : undefined;
  if (!skill) return <section className="empty-state"><h2>Skill not found</h2><p>This skill may have been deleted, or the link may be incorrect.</p><Link to="/">← Back to Dashboard</Link></section>;
  // Reset local edit drafts when navigating directly between two skills.
  return <SkillDetailsContent key={skill.id} skill={skill} onUpdate={onUpdate} />;
}
interface SkillDetailsContentProps { skill: Skill; onUpdate: SkillDetailsProps['onUpdate'] }
function SkillDetailsContent({ skill, onUpdate }: SkillDetailsContentProps) {
  const [notes, setNotes] = useState<string>(skill.notes ?? '');
  const [saved, setSaved] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const topics = skill.topics ?? [];
  const completed = topics.filter(topic => topic.completed).length;
  const percentage = topics.length ? Math.round(completed / topics.length * 100) : 0;
  function addTopic(name: string) {
    const topic: Topic = { id: Math.max(Date.now(), ...topics.map(item => item.id + 1)), name, completed: false };
    onUpdate(skill.id, { topics: [...topics, topic] });
  }
  function toggleTopic(id: Topic['id'], completed: boolean) {
    onUpdate(skill.id, { topics: topics.map(topic => topic.id === id ? { ...topic, completed } : topic) });
  }
  function deleteTopic(id: Topic['id']) {
    const topic = topics.find(item => item.id === id);
    if (topic && window.confirm('Delete topic "' + topic.name + '"?')) onUpdate(skill.id, { topics: topics.filter(item => item.id !== id) });
  }
  function handleNotes(event: ChangeEvent<HTMLTextAreaElement>) { setNotes(event.target.value); setSaved(false); }
  function saveNotes(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onUpdate(skill.id, { notes }); setSaved(true); }
  return <div className="details">
    <Link className="back-link" to="/">← Back to Dashboard</Link>
    <section className="details-panel"><div className="card-heading"><span className="level">{skill.level}</span><span className={skill.completed ? 'status complete' : 'status'}>{skill.completed ? 'Completed' : 'In Progress'}</span></div><h2 className="details-title">{skill.name}</h2>
      <div className="progress-label"><span>Skill progress (manual)</span><strong>{skill.progress}%</strong></div><progress max={100} value={skill.progress} aria-label="Skill progress" />
      <label className="range-label" htmlFor="details-progress">Update skill progress</label><input id="details-progress" type="range" min="0" max="100" value={skill.progress} onChange={(event: ChangeEvent<HTMLInputElement>) => onUpdate(skill.id, { progress: Number(event.target.value) })} />
      {editing ? <SkillForm initialValues={skill} onSubmit={data => { onUpdate(skill.id, data); setEditing(false); }} onCancel={() => setEditing(false)} /> : <button type="button" onClick={() => setEditing(true)}>Edit Skill</button>}
    </section>
    <div className="details-grid"><section className="details-panel"><h2>Topics</h2><div className="progress-label"><span>{completed} of {topics.length} topics completed</span><strong>{percentage}%</strong></div><progress max={100} value={percentage} aria-label="Topic completion" /><p className="topic-help">Topic completion is tracked separately from skill progress.</p><TopicList topics={topics} onToggle={toggleTopic} onDelete={deleteTopic} /><TopicForm onAdd={addTopic} /></section>
      <section className="details-panel"><h2>Learning Notes</h2><form onSubmit={saveNotes}><label htmlFor="learning-notes" className="muted">Capture what you learned and what to practice next.</label><textarea id="learning-notes" rows={9} value={notes} onChange={handleNotes} placeholder="Need more practice with Generics…" /><button className="primary" type="submit">Save Notes</button><p className="notes-status" role="status">{saved ? 'Notes saved to this skill.' : notes !== (skill.notes ?? '') ? 'Unsaved changes' : ''}</p></form></section>
    </div>
  </div>;
}

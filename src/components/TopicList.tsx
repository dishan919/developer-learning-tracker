import type { ChangeEvent } from 'react';
import type { Topic } from '../types/Skill';
interface TopicListProps {
  topics: Topic[];
  onToggle: (id: Topic['id'], completed: boolean) => void;
  onDelete: (id: Topic['id']) => void;
}
export default function TopicList({ topics, onToggle, onDelete }: TopicListProps) {
  if (!topics.length) return <p className="muted">Add your first topic to break this skill into smaller steps.</p>;
  return <ul className="topic-list">{topics.map(topic => <li key={topic.id} className={topic.completed ? 'topic-completed' : ''}>
    <label><input type="checkbox" checked={topic.completed} onChange={(event: ChangeEvent<HTMLInputElement>) => onToggle(topic.id, event.target.checked)} /><span>{topic.name}</span></label>
    <button type="button" className="delete" onClick={() => onDelete(topic.id)}>Delete<span className="sr-only"> topic {topic.name}</span></button>
  </li>)}</ul>;
}

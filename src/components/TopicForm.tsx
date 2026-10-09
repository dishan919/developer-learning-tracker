import { useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
interface TopicFormProps { onAdd: (name: string) => void }
export default function TopicForm({ onAdd }: TopicFormProps) {
  const [name, setName] = useState<string>('');
  const id = useId();
  function handleChange(event: ChangeEvent<HTMLInputElement>) { setName(event.target.value); }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  }
  return <form className="topic-form" onSubmit={handleSubmit}><label htmlFor={id}>New topic</label><div className="topic-input"><input id={id} value={name} onChange={handleChange} placeholder="e.g. Generics" maxLength={120} required /><button className="primary" disabled={!name.trim()} type="submit">Add Topic</button></div></form>;
}

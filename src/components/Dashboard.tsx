import type { Skill } from '../types/Skill';
interface DashboardProps { skills: Skill[] }
export default function Dashboard({ skills }: DashboardProps) {
  const completed = skills.filter(skill => skill.completed).length;
  return <section className="stats" aria-label="Learning overview">
    {[['Total skills', skills.length], ['In progress', skills.length - completed], ['Completed', completed]].map(([label, count]) =>
      <article className="stat" key={label}><p>{label}</p><strong>{count}</strong><span>{label === 'Completed' ? 'Milestones reached' : label === 'In progress' ? 'Keep the momentum going' : 'Your learning collection'}</span></article>
    )}
  </section>;
}

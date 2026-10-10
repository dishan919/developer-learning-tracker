import type { Skill } from '../types/Skill';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMetaDescription } from '../hooks/useMetaDescription';
interface DashboardProps { skills: Skill[] }
export default function Dashboard({ skills }: DashboardProps) {
  useDocumentTitle('Developer Learning Tracker | Dashboard');
  useMetaDescription('Track developer skills, monitor learning progress, manage goals, and organize your development journey.');
  const completed = skills.filter(skill => skill.completed).length;
  const totalProgress = skills.reduce((total, skill) => total + skill.progress, 0);
  const overallProgress = skills.length ? Math.round(totalProgress / skills.length) : 0;
  return <section className="stats" aria-label="Learning overview">
    {[['Total skills', skills.length], ['In progress', skills.length - completed], ['Completed', completed], ['Overall Progress', overallProgress + '%']].map(([label, count]) =>
      <article className="stat" key={label}><p>{label}</p><strong>{count}</strong><span>{label === 'Overall Progress' ? 'Average across all skills' : label === 'Completed' ? 'Milestones reached' : label === 'In progress' ? 'Keep the momentum going' : 'Your learning collection'}</span></article>
    )}
  </section>;
}

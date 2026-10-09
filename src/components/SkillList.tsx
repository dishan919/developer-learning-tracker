import type { Skill } from '../types/Skill';
import SkillCard from './SkillCard';
import type { SkillCardProps } from './SkillCard';
interface SkillListProps extends Pick<SkillCardProps, 'onUpdate' | 'onDelete'> {
  skills: Skill[];
  hasSkills: boolean;
}
export default function SkillList({ skills, hasSkills, onUpdate, onDelete }: SkillListProps) {
  if (skills.length === 0) return <div className="empty-state"><span aria-hidden="true">✦</span><h3>{hasSkills ? 'No matching skills' : 'Your learning journey starts here'}</h3><p>{hasSkills ? 'Try another search or filter to find your skills.' : 'Add your first skill and take the next step toward your goals.'}</p></div>;
  return <div className="skill-grid">{skills.map(skill => <SkillCard key={skill.id} skill={skill} onUpdate={onUpdate} onDelete={onDelete} />)}</div>;
}

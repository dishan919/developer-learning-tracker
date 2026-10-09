import type { ChangeEvent } from 'react';
import type { SkillFilter } from '../types/Skill';
interface SkillFiltersProps {
  search: string;
  filter: SkillFilter;
  onSearch: (value: string) => void;
  onFilter: (value: SkillFilter) => void;
}
const filters: SkillFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Completed', 'In Progress'];
export default function SkillFilters({ search, filter, onSearch, onFilter }: SkillFiltersProps) {
  function handleSearch(event: ChangeEvent<HTMLInputElement>) { onSearch(event.target.value); }
  return <div className="filters">
    <label htmlFor="search">Search skills</label>
    <input id="search" type="search" placeholder="Search your skills…" value={search} onChange={handleSearch} />
    <div className="filter-buttons" aria-label="Filter skills">{filters.map(value => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? 'selected' : ''} onClick={() => onFilter(value)}>{value}</button>)}</div>
  </div>;
}

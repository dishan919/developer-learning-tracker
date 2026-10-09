import type { ChangeEvent } from 'react';
import { isSortOption } from '../types/Skill';
import type { SkillFilter, SortOption } from '../types/Skill';
interface SkillFiltersProps {
  search: string;
  filter: SkillFilter;
  sortBy: SortOption;
  onSort: (value: SortOption) => void;
  onSearch: (value: string) => void;
  onFilter: (value: SkillFilter) => void;
}
const filters: SkillFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Completed', 'In Progress'];
export default function SkillFilters({ search, filter, onSearch, onFilter, sortBy, onSort }: SkillFiltersProps) {
  function handleSearch(event: ChangeEvent<HTMLInputElement>) { onSearch(event.target.value); }
  function handleSort(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    if (isSortOption(value)) onSort(value);
  }
  return <div className="filters">
    <label htmlFor="search">Search skills</label>
    <input id="search" type="search" placeholder="Search your skills…" value={search} onChange={handleSearch} />
    <div className="sort-control"><label htmlFor="sort-by">Sort By</label>
      <select id="sort-by" value={sortBy} onChange={handleSort}>
        <option value="name">Name</option><option value="progress">Progress</option>
        <option value="level">Level</option><option value="targetDate">Target Date</option>
      </select>
    </div>
    <div className="filter-buttons" aria-label="Filter skills">{filters.map(value => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? 'selected' : ''} onClick={() => onFilter(value)}>{value}</button>)}</div>
  </div>;
}

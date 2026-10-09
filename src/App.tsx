import { Link, Route, Routes } from 'react-router-dom';
import SkillDetails from './pages/SkillDetails';
import { useState } from 'react';
import type { Skill, SkillFilter, SkillFormData, SkillUpdate, SortOption } from './types/Skill';
import Dashboard from './components/Dashboard';
import SkillForm from './components/SkillForm';
import SkillList from './components/SkillList';
import SkillFilters from './components/SkillFilters';
import { parseStoredSkills, sampleSkills, STORAGE_KEY } from './utils/skillStorage';
import { sortSkills } from './utils/skillSorting';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

function App() {
  const [skills, setSkills, storageError] = useLocalStorage<Skill[]>(STORAGE_KEY, sampleSkills, parseStoredSkills);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filter, setFilter] = useState<SkillFilter>('All');
  function addSkill(data: SkillFormData) {
    setSkills(current => [...current, { ...data, id: Math.max(Date.now(), ...current.map(skill => skill.id + 1)), completed: data.progress === 100 }]);
  }
  function updateSkill(id: Skill['id'], updates: SkillUpdate) {
    setSkills(current => current.map(skill => {
      if (skill.id !== id) return skill;
      const updated = { ...skill, ...updates };
      const progress = Number.isFinite(updated.progress) ? Math.max(0, Math.min(100, updated.progress)) : skill.progress;
      return { ...updated, progress, completed: progress === 100 };
    }));
  }
  function deleteSkill(id: Skill['id']) {
    const skill = skills.find(item => item.id === id);
    if (skill && window.confirm('Delete "' + skill.name + '"? This cannot be undone.')) {
      setSkills(current => current.filter(item => item.id !== id));
    }
  }
  const query = search.trim().toLowerCase();
  const filteredSkills = skills.filter(skill => {
    const matchesFilter = filter === 'All' || (filter === 'Completed' ? skill.completed : filter === 'In Progress' ? !skill.completed : skill.level === filter);
    return matchesFilter && skill.name.toLowerCase().includes(query);
  });
  const visibleSkills = sortSkills(filteredSkills, sortBy);
  return <main className="app">
    <header className="page-header"><div className="brand"><span aria-hidden="true">&lt;/&gt;</span> DEV JOURNEY</div><p className="eyebrow">A LITTLE PROGRESS, EVERY DAY</p><h1>Developer Learning Tracker</h1><p>Build your skills. Track your progress. Keep moving forward.</p></header>
    {storageError && <p role="alert" className="storage-error">{storageError}</p>}
    <Routes><Route path="/" element={<><Dashboard skills={skills} />
    <div className="workspace"><aside className="add-panel"><h2>Add a new skill</h2><p>What will you learn next?</p><SkillForm onSubmit={addSkill} /><div className="tip">Small steps add up.<br />Make time to learn something today.</div></aside>
      <section className="collection" aria-labelledby="skills-title"><div className="section-heading"><h2 id="skills-title">My skills</h2><span>{visibleSkills.length} of {skills.length} skills</span></div><SkillFilters search={search} filter={filter} onSearch={setSearch} onFilter={setFilter} sortBy={sortBy} onSort={setSortBy} /><SkillList skills={visibleSkills} hasSkills={skills.length > 0} onUpdate={updateSkill} onDelete={deleteSkill} /></section>
    </div></>} /><Route path="/skills/:id" element={<SkillDetails skills={skills} onUpdate={updateSkill} />} /><Route path="*" element={<div className="empty-state"><h2>Page not found</h2><Link to="/">Back to Dashboard</Link></div>} /></Routes><footer>One skill at a time, one step closer.</footer>
  </main>;
}
export default App;

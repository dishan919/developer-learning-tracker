import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" className="theme-toggle" onClick={toggleTheme}
    aria-label="Dark mode" aria-pressed={theme === 'dark'}
    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
  </button>;
}

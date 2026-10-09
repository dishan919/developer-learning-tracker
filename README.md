# Developer Learning Tracker

A React + TypeScript application for tracking technical skills, monitoring progress, organizing learning topics, and setting learning goals.

## Features

- **Skill management:** Add, edit, and delete skills with Beginner, Intermediate, or Advanced levels.
- **Progress tracking:** Set skill progress from 0–100%. Skills are Completed at 100% and In Progress otherwise.
- **Dashboard statistics:** View total, in-progress, and completed skills, plus overall progress calculated as the rounded average across all skills.
- **Search and filters:** Search by skill name and filter by level or completion status.
- **Sorting:** Sort by name, progress (highest first), level (Beginner to Advanced), or target date (earliest first, with missing or invalid dates last).
- **Skill Details:** Open a dedicated page to update a skill and manage its learning information.
- **Topics/sub-skills:** Add and delete topics, mark them complete, and view completion totals and percentages. Topic completion is separate from manual skill progress.
- **Learning notes:** Write and save notes for each skill.
- **Learning goals:** Save a goal and optional target date for each skill. Status is calculated as Completed, Overdue, Due Soon, On Track, or No Target Date. Due Soon covers today through the next seven days; Completed follows the skill's completion status.
- **Browser persistence:** Keep skill data in localStorage, with runtime validation of stored data and an alert when saving fails.
- **Navigation feedback:** Custom 404 page, missing-skill feedback, and dynamic browser titles for the dashboard, skill details, and error pages.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React and React DOM | Components, state, and browser rendering |
| TypeScript | Static typing for data, props, events, and hooks |
| Vite with `@vitejs/plugin-react` | Development server and production bundling |
| React Router (`react-router-dom`) | Client-side navigation |
| CSS | Styling and responsive layouts |
| Browser localStorage | Local data persistence |
| ESLint and TypeScript/React plugins | Code linting |

## TypeScript Concepts Practiced

- **Interfaces:** Define `Skill`, `Topic`, and component props.
- **Type aliases and union types:** Model skill levels, filters, sort options, and goal statuses.
- **Optional properties:** Allow topics, notes, goals, and target dates to be absent.
- **Generics:** Use `useLocalStorage<T>` to persist typed state.
- **Utility types:** Use `Pick` for form fields, `Partial` for updates, and `Record` for level ordering.
- **Type narrowing:** Use guards such as `isSkillLevel` and `isSortOption` to validate values.
- **Typed React events:** Type input, select, textarea, and form handlers with `ChangeEvent` and `FormEvent`.
- **Typed state setters:** Return `Dispatch<SetStateAction<T>>` from the persistence hook.
- **`unknown` and runtime validation:** Check parsed JSON before using it as skill data.
- **Immutable state updates:** Use typed functional updates, array copies, `map`, and `filter` to update skills and topics.

## React Concepts Practiced

- Reusable components and typed props for forms, cards, filters, and lists.
- `useState` for skill data, editing, search, filters, and form drafts.
- `useEffect` for persistence and browser page titles.
- Custom hooks: `useLocalStorage` and `useDocumentTitle`.
- Controlled forms with validation and save feedback.
- Derived data for dashboard statistics, filtered/sorted skills, topic percentages, and goal status.
- React Router with `BrowserRouter`, `Routes`, `Route`, `Link`, and `useParams`.
- Conditional rendering for editing, empty states, storage errors, and missing skills.
- `useId` for form controls and `StrictMode` at the application root.

## Project Structure

```text
developer-learning-tracker/
├── public/
├── src/
│   ├── assets/
│   ├── components/          # Dashboard, skill forms/cards/filters, topics, goals
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useDocumentTitle.ts
│   ├── pages/
│   │   ├── SkillDetails.tsx
│   │   └── NotFound.tsx
│   ├── types/
│   │   └── Skill.ts
│   ├── utils/
│   │   ├── skillStorage.ts
│   │   ├── skillSorting.ts
│   │   └── goalStatus.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── tests/
│   └── localStorage.test.cjs
├── package.json
└── vite.config.ts
```

## Getting Started

Install Git and Node.js with npm. The installed Vite version requires Node.js 20.19+ within the 20.x release line, or 22.12+.

Run these commands in PowerShell or Windows Terminal:

```powershell
git clone https://github.com/dishan919/developer-learning-tracker.git
cd developer-learning-tracker
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The configuration does not specify a fixed port; Vite may use another port if the default is occupied.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run the TypeScript build check and create a production build in `dist/`. |
| `npm run lint` | Run ESLint across the project. |
| `npm run preview` | Preview the production build locally after running `npm run build`. |

There is no test script in `package.json`.

## Data Persistence

The generic `useLocalStorage<T>` hook loads and saves skill data under the key `developer-learning-tracker.skills`. Skills, topics, notes, goals, and target dates remain after refreshing when browser storage is available. Stored JSON is validated and normalized before use; missing or invalid stored data falls back to sample React and TypeScript skills.

Data is local to the browser profile and site origin on that device. It is not synchronized across devices, and clearing site data removes it. If a write fails, the application displays an alert and remains usable, but changes may be lost after reloading. Notes and goals must be saved with their respective form buttons.

## Routing

| Route | Page |
| --- | --- |
| `/` | Dashboard and skill collection |
| `/skills/:id` | Skill Details for a numeric skill ID |
| `*` | Custom 404 page for unmatched routes |

An invalid or missing skill ID displays a Skill not found message with a link back to the dashboard.

## Screenshots

Screenshots will be added here.

## Future Improvements

Possible future ideas:

- Backend/API with user authentication and a cloud database.
- Cross-device synchronization.
- Deployment with support for direct links to client-side routes.
- More learning analytics and progress history.

## Author

**dishan919**

GitHub: https://github.com/dishan919

## License

No license has currently been specified in this repository.

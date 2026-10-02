// All copy for Room 302. Edit this file to update the portfolio content.

export const OBJ = {
  pc: { title: 'DESKTOP', cta: 'view my projects →', kind: 'side', kicker: 'DESKTOP · ~/projects', heading: "Things I've built" },
  shelf: { title: 'BOOKSHELF', cta: 'browse my stack →', kind: 'side', kicker: 'BOOKSHELF · /skills', heading: 'My stack' },
  desk: { title: 'DESK', cta: 'about me →', kind: 'side', kicker: 'DESK · /about', heading: 'About me' },
  calendar: { title: 'CALENDAR', cta: 'my timeline →', kind: 'side', kicker: 'CALENDAR · /timeline', heading: 'So far' },
  phone: { title: 'PHONE', cta: 'get in touch →', kind: 'modal', kicker: 'PHONE · /contact', heading: 'Say hi' },
  polaroids: { title: 'POLAROIDS', cta: 'little moments →', kind: 'modal', kicker: 'POLAROIDS', heading: 'Little moments' },
  posters: { title: 'POSTERS', cta: "things I'm proud of →", kind: 'modal', kicker: 'POSTERS', heading: "Things I'm proud of" },
  drawer: { title: 'DRAWER', cta: 'open for a fun fact →', kind: 'modal', kicker: 'DRAWER', heading: 'Found in the drawer' },
  bed: { title: 'BED', cta: 'start here →', kind: 'modal', kicker: 'BED', heading: 'Welcome to Room 302' },
  window: { title: 'WINDOW', cta: "what I'm learning →", kind: 'modal', kicker: 'WINDOW', heading: 'Currently learning' },
  headphones: { title: 'HEADPHONES', cta: 'on repeat →', kind: 'modal', kicker: 'HEADPHONES', heading: 'On repeat' },
};

export const HELP = { kicker: 'GUIDE', heading: 'How to explore' };

// Book names must match the SKILLS list in room3d.js so clicking a 3D book selects it here.
export const SKILLS = [
  { name: 'React', cat: 'FRONTEND', note: 'My default for anything with a UI. Hooks finally clicked in second year.', c: '#D9734E', h: 84 },
  { name: 'JavaScript', cat: 'FRONTEND', note: 'Where it all started. Still learning its weird parts.', c: '#E2B04A', h: 92 },
  { name: 'Tailwind CSS', cat: 'FRONTEND', note: 'Fast styling without leaving the markup.', c: '#6E9C9A', h: 78 },
  { name: 'HTML & CSS', cat: 'FRONTEND', note: 'Semantic markup, flexbox, grid. The foundation of everything else.', c: '#CDBBA2', h: 70 },
  { name: 'Node.js', cat: 'BACKEND', note: 'Small APIs and scripts for my side projects.', c: '#7E9B6A', h: 88 },
  { name: 'Supabase', cat: 'BACKEND', note: 'Auth and Postgres when I need a backend quickly.', c: '#4F7A63', h: 80 },
  { name: 'Git', cat: 'TOOLS', note: 'Branches, pull requests, and the occasional merge-conflict panic.', c: '#B5532F', h: 74 },
  { name: 'Figma', cat: 'TOOLS', note: 'I sketch every screen here before I code it.', c: '#8C7AA8', h: 86 },
  { name: 'Java', cat: 'SCHOOL', note: 'OOP and data structures for class.', c: '#5E6E8C', h: 90 },
  { name: 'Python', cat: 'SCHOOL', note: 'Algorithms homework and quick automation scripts.', c: '#D7A65A', h: 76 },
];

// Add a GitHub or demo URL to gh/demo and that project's button appears.
// Add img: 'images/gunit.png' (a path inside this folder) to show a screenshot.
// demoLabel overrides the "Live demo" button text.
export const PROJECTS = [
  { name: 'Gunit', img: 'images/gunit.png', file: 'gunit-flashcard-reviewer.app', desc: 'A flashcard reviewer that reads your notes. Import PDFs, Word files, slides or scanned pages, then study with spaced repetition and quizzes.', tech: ['React', 'Vite', 'Tailwind CSS', 'Supabase', 'Tesseract.js'], status: 'Live', sBg: '#DDE8D3', sFg: '#3F6136', gh: 'https://github.com/juhyeonie/Gunit-Flashcard-Reviewer', demo: 'https://gunit-flashcard-reviewer.vercel.app' },
  { name: 'Little Frames', img: 'images/little-frames.png', file: 'little-frames.exe', desc: 'Polaroid photo widgets that live on your Windows desktop. Each photo is its own little window that you can drag, resize and decorate.', tech: ['Electron', 'React', 'Tailwind CSS'], status: 'v1.0.1', sBg: '#DDE8D3', sFg: '#3F6136', gh: 'https://github.com/juhyeonie/Little-Frames', demo: 'https://juhyeonie.github.io/Little-Frames/', demoLabel: 'Website' },
  { name: 'Room 302', img: 'images/room-302.png', file: 'room-302.app', desc: 'This portfolio. A bedroom you can explore instead of a page you scroll.', tech: ['Three.js', 'Preact', 'JavaScript'], status: 'Live', sBg: '#DDE8D3', sFg: '#3F6136', gh: 'https://github.com/juhyeonie/Room-302', demo: 'https://juhyeonie.github.io/Room-302/' },
];

export const TIMELINE = [
  { y: '2026', t: 'Third year, BS Computer Science', d: 'University of Caloocan City – Congressional Campus. Focused on web development and software engineering.', now: true },
  { y: '2025', t: 'First hackathon', d: 'Built a working prototype in 24 hours with three classmates.' },
  { y: '2025', t: 'Freelance landing pages', d: 'Small sites for local businesses and student organizations.' },
  { y: '2024', t: 'Started BSCS at UCC', d: 'Java, data structures, and surviving 7 AM classes.' },
  { y: '2024', t: 'Senior high graduate, STEM strand', d: 'Wrote my first lines of code here.' },
];

export const CONTACTS = [
  { name: 'Email', handle: 'pelgone.justineandriebscs2024@gmail.com', href: 'mailto:pelgone.justineandriebscs2024@gmail.com' },
  { name: 'GitHub', handle: '@juhyeonie', href: 'https://github.com/juhyeonie' },
  { name: 'Instagram', handle: '@ju_hyeonie', href: 'https://www.instagram.com/ju_hyeonie/' },
  // Discord has no public profile URL, so this row shows the username without a link.
  { name: 'Discord', handle: 'baekju_hyeon' },
];

export const FACTS = [
  'I name every project folder after food first, then rename it later.',
  'My first website was a fan page with a spinning GIF and a guestbook.',
  "I can't code without iced coffee within arm's reach.",
  "I've rebuilt this portfolio four times. This is version five.",
  "I keep a notebook of app ideas I'll probably never build.",
  'My commute to campus: one jeep, one tricycle, many podcasts.',
  'I still use paper sticky notes for my to-do list.',
];

export const LEARNING = [
  { t: 'TypeScript', d: 'Moving my React projects over, one file at a time.' },
  { t: 'Testing', d: 'Writing my first real tests with Vitest.' },
  { t: 'Data Structures & Algorithms', d: "This semester's main subject. Lots of trees." },
  { t: 'UI motion', d: 'Small animations that make interfaces feel right.' },
];

export const MUSIC = [
  { t: 'Kathang Isip', a: 'Ben&Ben', d: '4:56' },
  { t: 'Mundo', a: 'IV of Spades', d: '5:04' },
  { t: 'Tadhana', a: 'Up Dharma Down', d: '4:47' },
  { t: 'Nights', a: 'Frank Ocean', d: '5:07' },
  { t: 'Lo-fi beats to debug to', a: 'A playlist I never skip', d: '∞' },
];

export const MOMENTS = [
  { c: 'First hackathon, 3 AM', r: -2 }, { c: 'Org fair booth', r: 1.5 },
  { c: 'Group study at the library', r: 1 }, { c: 'Sunset at Manila Bay', r: -1.5 },
];

export const ACH = [
  { k: 'HACKATHON · 2025', t: 'Finalist, campus hackathon', d: 'Built a barangay services app in 24 hours.', c: '#D9734E' },
  { k: 'ACADEMIC · AY 2025–26', t: "Dean's Lister", d: 'First semester.', c: '#E2B04A' },
  { k: 'ORGANIZATION', t: 'Member, Computer Science Society', d: 'Helping run workshops and org week.', c: '#8FA88A' },
  { k: 'VOLUNTEER', t: 'Campus web workshop', d: 'Taught first-years their first HTML page.', c: '#6E9C9A' },
];

export const ABOUT = {
  interests: ['UI design', 'Open source', 'Film photography', 'Iced coffee', 'Mechanical keyboards', 'OPM'],
  tech: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js', 'Supabase', 'Git', 'Figma'],
};

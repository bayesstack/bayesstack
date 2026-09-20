// ─── Learner identity ─────────────────────────────────────────────────────
import { masterCurriculumCourses } from "./masterCurriculum";

// Placeholder until the authenticated session is connected to the shell.
// fullName is intentionally undefined so callers render a non-personalized
// fallback rather than exposing fixture text to real users.
export const learnerIdentity: {
  fullName: string | undefined;
  institutionName: string;
} = {
  fullName: undefined,
  institutionName: "Bayes Institute",
};

// ─── Route paths ──────────────────────────────────────────────────────────
export const coursePath = "/learning/machine-learning";
export const videoStudioPath = `${coursePath}/studio/video`;
export const codingStudioPath = `${coursePath}/studio/coding`;

export function courseSlug(code: string) {
  return code.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function courseHref(code: string) {
  // ML 401 is the one course with a working course workspace today.
  return code === "ML 401" ? coursePath : `/learning/${courseSlug(code)}`;
}

// ─── Types ────────────────────────────────────────────────────────────────
export type CourseCardTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export type LearningCourseCardProps = {
  code: string;
  name: string;
  context: string;
  accent: string;
  detailLabel?: string;
  detailValue?: string;
  detailNote?: string;
  description?: string;
  progress?: number;
  meta?: string;
  status?: string;
  statusTone?: CourseCardTone;
  tag?: string;
  recommended?: boolean;
  completed?: boolean;
  attention?: boolean;
  href?: string;
  variant?: "default" | "personal" | "curriculum";
  enrolled?: boolean;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction?: () => void;
};

// ─── Curriculum data ──────────────────────────────────────────────────────
const subjectAccents: Record<string, string> = {
  CS: "indigo",
  ML: "plum",
  AI: "plum",
  STAT: "sky",
  MATH: "amber",
  SWE: "sky",
  QF: "green",
  NS: "coral",
  ECO: "amber",
  HUM: "plum",
  FIN: "green",
  COMM: "coral",
  DES: "green",
};

export function courseAccent(code: string) {
  return subjectAccents[code.trim().split(/\s+/)[0]] ?? "slate";
}

export const weekSteps = [
  { title: "Loss landscapes", description: "Mon · complete", icon: "BookOpen" as const },
  { title: "Notebook review", description: "Today · 15 min", icon: "Notebook" as const },
  { title: "Applied lab", description: "Thu · 3:30 PM", icon: "Terminal" as const },
  { title: "Probability quiz", description: "Fri · 10:00 AM", icon: "CheckCircle" as const },
];

const courses = [
  // href = course overview page; continueHref = CTA target (see split-click pattern in curriculum row)
  { code: "ML 401", name: "Machine Learning", faculty: "Prof. N. Rao", current: "Gradient Descent", next: "Video lesson · 12 min", progress: 42, status: "On track", tone: "success" as const, href: courseHref("ML 401"), continueHref: videoStudioPath },
  { code: "STAT 312", name: "Probability & Statistics", faculty: "Dr. A. Menon", current: "Bayesian inference", next: "Quiz review · 20 min", progress: 61, status: "Ahead", tone: "info" as const, href: courseHref("STAT 312"), continueHref: courseHref("STAT 312") },
  { code: "CS 326", name: "Database Systems", faculty: "Prof. R. Shah", current: "Relational algebra", next: "Assignment due tomorrow", progress: 28, status: "Needs attention", tone: "warning" as const, href: courseHref("CS 326"), continueHref: courseHref("CS 326") },
  { code: "CS 341", name: "Operating Systems", faculty: "Dr. S. Iyer", current: "Process states", next: "Start concept · 22 min", progress: 0, status: "Not started", tone: "neutral" as const, href: courseHref("CS 341"), continueHref: courseHref("CS 341") },
];

const courseDescriptions: Record<string, string> = {
  "ML 401": "Build practical intuition for supervised learning, optimisation, and model evaluation.",
  "STAT 312": "Use probability models and statistical inference to reason clearly under uncertainty.",
  "CS 326": "Design reliable data models, queries, and transactions for production systems.",
  "CS 341": "Understand processes, memory, and the systems primitives behind modern computing.",
};

const completedCourseDescriptions: Record<string, string> = {
  "CS 110": "Developed a practical foundation in programming, algorithms, and problem solving.",
  "MATH 121": "Built mathematical reasoning with logic, proofs, graphs, and discrete structures.",
  "CS 130": "Explored the hardware, operating foundations, and systems behind modern software.",
  "STAT 101": "Applied core statistical thinking to data, uncertainty, and evidence-based decisions.",
  "COMM 105": "Practised clear technical writing, presentation, and collaborative communication.",
  "DES 115": "Used visual design and data storytelling to make complex information easier to understand.",
};

export const previousTermCourses = [
  { code: "CS 110", name: "Programming Foundations", faculty: "Dr. L. Kapoor", current: "Final grade", next: "", grade: "A", progress: 100, status: "Completed", tone: "success" as const, href: courseHref("CS 110"), continueHref: courseHref("CS 110") },
  { code: "MATH 121", name: "Discrete Mathematics", faculty: "Prof. S. Bose", current: "Final grade", next: "", grade: "A-", progress: 100, status: "Completed", tone: "success" as const, href: courseHref("MATH 121"), continueHref: courseHref("MATH 121") },
  { code: "CS 130", name: "Computer Systems", faculty: "Prof. J. Thomas", current: "Final grade", next: "", grade: "B+", progress: 100, status: "Completed", tone: "success" as const, href: courseHref("CS 130"), continueHref: courseHref("CS 130") },
  { code: "STAT 101", name: "Foundations of Statistics", faculty: "Dr. P. Iyer", current: "Final grade", next: "", grade: "A", progress: 100, status: "Completed", tone: "success" as const, href: courseHref("STAT 101"), continueHref: courseHref("STAT 101") },
  { code: "COMM 105", name: "Technical Communication", faculty: "Dr. M. Sen", current: "Final grade", next: "", grade: "A-", progress: 100, status: "Completed", tone: "success" as const, href: courseHref("COMM 105"), continueHref: courseHref("COMM 105") },
  { code: "DES 115", name: "Designing with Data", faculty: "Prof. K. Mehta", current: "Final grade", next: "", grade: "B+", progress: 100, status: "Completed", tone: "success" as const, href: courseHref("DES 115"), continueHref: courseHref("DES 115") },
].map((course) => ({ ...course, description: completedCourseDescriptions[course.code], accent: courseAccent(course.code) }));

export const currentTermCourses = courses.map((course) => ({
  ...course,
  description: courseDescriptions[course.code],
  accent: courseAccent(course.code),
  grade: undefined as string | undefined,
}));

export const termOptions = [
  { value: "term-1", label: "Term 1 · Autumn 2025", description: "Completed · 18 December 2025", icon: "CheckCircle" as const },
  { value: "term-2", label: "Term 2 · Spring 2026", description: "Current · Week 7 of 14", icon: "Calendar" as const },
  { value: "term-3", label: "Term 3 · Autumn 2026", description: "Available after Term 2", icon: "Lock" as const, disabled: true },
  { value: "term-4", label: "Term 4 · Spring 2027", description: "Available after Term 3", icon: "Lock" as const, disabled: true },
];

// ─── Personal learning data ───────────────────────────────────────────────
export const personalCourses = [
  {
    code: "FIN 210",
    name: "Financial Markets & Instruments",
    provider: "Bayes curated",
    description: "Build a practical view of financial products, market structure, and the forces that move prices.",
    current: "Fixed-income foundations",
    next: "Yield curves and duration · 18 min",
    progress: 34,
    status: "On track",
    tone: "success" as const,
    accent: "green",
    href: courseHref("FIN 210"),
  },
  {
    code: "CS 245",
    name: "Python for Quantitative Research",
    provider: "Bayes curated",
    description: "Use Python to collect, test, and communicate evidence from financial and research data.",
    current: "Portfolio backtesting",
    next: "Transaction-cost modelling · 24 min",
    progress: 68,
    status: "On track",
    tone: "success" as const,
    accent: "indigo",
    href: courseHref("CS 245"),
  },
];

export const recommendedCourses = [
  { id: "financial-engineering", code: "FIN 320", subject: "Finance", name: "Financial Engineering Foundations", reason: "Build the derivatives and pricing knowledge missing from your curriculum.", duration: "24 hours", phase: "Curated", level: "Intermediate", accent: "green" },
  { id: "market-time-series", code: "STAT 330", subject: "Statistics", name: "Time Series for Financial Markets", reason: "Turn your statistics foundation into forecasting for market data.", duration: "18 hours", phase: "Curated", level: "Intermediate", accent: "sky" },
  { id: "numerical-quant", code: "MATH 315", subject: "Mathematics", name: "Numerical Methods for Quant Finance", reason: "Apply numerical methods to pricing, simulation, and portfolio risk.", duration: "20 hours", phase: "Curated", level: "Advanced", accent: "amber" },
];

// ─── Course library data ──────────────────────────────────────────────────
const curatedLibraryCourses = [
  ...recommendedCourses,
  { id: "risk-models", code: "FIN 305", subject: "Finance", name: "Risk Models and Portfolio Construction", reason: "Measure market risk and construct portfolios under practical constraints.", duration: "16 hours", phase: "Curated", level: "Intermediate", accent: "green" },
  { id: "stochastic-processes", code: "STAT 350", subject: "Statistics", name: "Stochastic Processes in Practice", reason: "Model uncertain systems with Markov chains and continuous-time processes.", duration: "22 hours", phase: "Curated", level: "Advanced", accent: "sky" },
  { id: "optimization", code: "MATH 340", subject: "Mathematics", name: "Convex Optimisation", reason: "Develop optimisation techniques used in allocation and machine learning.", duration: "19 hours", phase: "Curated", level: "Advanced", accent: "amber" },
  { id: "data-pipelines", code: "CS 270", subject: "Computer Science", name: "Data Pipelines for Research", reason: "Build reliable pipelines for high-frequency and alternative datasets.", duration: "14 hours", phase: "Curated", level: "Intermediate", accent: "indigo" },
  { id: "econometrics", code: "ECON 280", subject: "Economics", name: "Applied Econometrics", reason: "Estimate causal and predictive models using economic and market data.", duration: "21 hours", phase: "Curated", level: "Intermediate", accent: "coral" },
];

export const libraryCourses = [
  ...curatedLibraryCourses,
  ...masterCurriculumCourses.map((course) => ({
    ...course,
    reason: `${course.phaseTitle} · ${course.subject}`,
    duration: "Curriculum sequence",
    accent: courseAccent(course.code),
  })),
];

export const librarySubjectOptions = [
  { value: "all", label: "All subjects" },
  { value: "Finance", label: "Finance" },
  { value: "Statistics", label: "Statistics" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Economics", label: "Economics" },
  { value: "Software Engineering", label: "Software engineering" },
  { value: "Machine Learning & AI", label: "Machine learning & AI" },
  { value: "Quantitative Finance", label: "Quantitative finance" },
  { value: "Natural Sciences", label: "Natural sciences" },
  { value: "Economics & Game Theory", label: "Economics & game theory" },
  { value: "Humanities", label: "Humanities" },
];

export const levelOptions = [
  { value: "all", label: "All levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Foundation", label: "Foundation" },
  { value: "Core", label: "Core" },
  { value: "Advanced", label: "Advanced" },
];

export const durationOptions = [
  { value: "all", label: "Any duration" },
  { value: "short", label: "Under 15h" },
  { value: "medium", label: "15–20h" },
  { value: "long", label: "Over 20h" },
];

export const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "shortest", label: "Shortest first" },
  { value: "longest", label: "Longest first" },
];

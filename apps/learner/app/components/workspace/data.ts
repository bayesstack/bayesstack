export type WorkStatus = "not_started" | "in_progress" | "ready" | "submitted" | "returned" | "completed";

export type LabRecord = {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  summary: string;
  status: WorkStatus;
  dueAt: string;
  dueLabel: string;
  duration: string;
  progress: number;
  score?: string;
  attempts: number;
  skills: string[];
  studioHref: string;
  steps: Array<{ id: string; title: string; detail: string; complete: boolean }>;
  checks: Array<{ id: string; title: string; detail: string }>;
};

export const labRecords: LabRecord[] = [
  {
    id: "gradient-descent-lab",
    courseCode: "ML 401",
    courseName: "Machine Learning",
    title: "Optimise a model with gradient descent",
    summary: "Implement the update rule, diagnose an unstable learning rate, and explain the convergence trace.",
    status: "in_progress",
    dueAt: "2026-09-24T15:30:00+05:30",
    dueLabel: "Due Thu, 3:30 PM",
    duration: "75 min",
    progress: 58,
    attempts: 2,
    skills: ["Optimisation", "Python", "Model diagnostics"],
    studioHref: "/learning/machine-learning/studio/gradient-descent-practice",
    steps: [
      { id: "frame", title: "Frame the optimisation objective", detail: "Identify the parameter, gradient, and stopping condition.", complete: true },
      { id: "implement", title: "Implement one update step", detail: "Complete the function and pass the shape invariant.", complete: true },
      { id: "stability", title: "Diagnose training stability", detail: "Compare three learning rates and interpret the trace.", complete: false },
      { id: "reflect", title: "Submit a short reflection", detail: "Explain why the chosen rate converges reliably.", complete: false },
    ],
    checks: [
      { id: "syntax", title: "Workspace compiles", detail: "Python source has no syntax or import errors." },
      { id: "tests", title: "Required invariants pass", detail: "Update direction, shape, and convergence checks succeed." },
      { id: "reflection", title: "Reflection is present", detail: "Your explanation addresses the stability trade-off." },
    ],
  },
  {
    id: "bayesian-inference-lab",
    courseCode: "STAT 312",
    courseName: "Probability & Statistics",
    title: "Update beliefs with observed evidence",
    summary: "Build a posterior distribution and compare analytical and simulated estimates.",
    status: "ready",
    dueAt: "2026-09-25T10:00:00+05:30",
    dueLabel: "Due Fri, 10:00 AM",
    duration: "60 min",
    progress: 0,
    attempts: 0,
    skills: ["Bayesian inference", "Simulation", "Uncertainty"],
    studioHref: "/learning/stat-312",
    steps: [
      { id: "prior", title: "Choose and justify a prior", detail: "Connect the prior to the evidence context.", complete: false },
      { id: "posterior", title: "Compute the posterior", detail: "Implement the update and validate normalization.", complete: false },
      { id: "simulate", title: "Compare by simulation", detail: "Estimate the same quantity with Monte Carlo samples.", complete: false },
    ],
    checks: [
      { id: "normalization", title: "Distribution normalizes", detail: "Posterior probability sums to one." },
      { id: "simulation", title: "Simulation is reproducible", detail: "A fixed seed produces stable estimates." },
    ],
  },
  {
    id: "relational-query-lab",
    courseCode: "CS 326",
    courseName: "Database Systems",
    title: "Reason about relational queries",
    summary: "Translate business questions into relational algebra and verify equivalent query plans.",
    status: "returned",
    dueAt: "2026-09-18T23:59:00+05:30",
    dueLabel: "Feedback returned",
    duration: "90 min",
    progress: 100,
    score: "17 / 20",
    attempts: 1,
    skills: ["Relational algebra", "Query planning", "SQL"],
    studioHref: "/learning/cs-326",
    steps: [
      { id: "translate", title: "Translate the requirements", detail: "Express each question in relational algebra.", complete: true },
      { id: "query", title: "Implement the queries", detail: "Produce executable SQL for the supplied schema.", complete: true },
      { id: "compare", title: "Compare query plans", detail: "Explain equivalent plans and likely costs.", complete: true },
    ],
    checks: [
      { id: "queries", title: "Queries return expected rows", detail: "All visible and hidden fixtures match." },
      { id: "plans", title: "Plan explanation submitted", detail: "The response identifies the important operators." },
    ],
  },
  {
    id: "process-scheduler-lab",
    courseCode: "CS 341",
    courseName: "Operating Systems",
    title: "Simulate a process scheduler",
    summary: "Implement round-robin scheduling and inspect waiting-time and fairness trade-offs.",
    status: "not_started",
    dueAt: "2026-10-02T17:00:00+05:30",
    dueLabel: "Due 2 Oct",
    duration: "80 min",
    progress: 0,
    attempts: 0,
    skills: ["Processes", "Scheduling", "Systems reasoning"],
    studioHref: "/learning/cs-341",
    steps: [
      { id: "queue", title: "Model the ready queue", detail: "Represent arrivals and runnable processes.", complete: false },
      { id: "scheduler", title: "Implement the scheduler", detail: "Run processes for a configurable time quantum.", complete: false },
      { id: "analyse", title: "Analyse fairness", detail: "Compare latency and throughput across workloads.", complete: false },
    ],
    checks: [
      { id: "order", title: "Execution order is correct", detail: "All deterministic workloads match." },
      { id: "metrics", title: "Metrics are complete", detail: "Waiting and turnaround times are reported." },
    ],
  },
];

export const labOverview = {
  metrics: [
    { label: "Due this week", value: "2", detail: "Next: Thursday at 3:30 PM", tone: "warning" },
    { label: "In progress", value: "1", detail: "58% of the current lab complete", tone: "primary" },
    { label: "Submitted", value: "7", detail: "One has new faculty feedback", tone: "success" },
    { label: "Pre-flight pass rate", value: "86%", detail: "Across your last five submissions", tone: "neutral" },
  ],
};

export type ProjectRecord = {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  status: "active" | "review" | "completed";
  progress: number;
  dueLabel: string;
  brief: string;
  outcome: string;
  team: Array<{ id: string; name: string; role: string; initials: string }>;
  milestones: Array<{ id: string; title: string; due: string; complete: boolean }>;
  artifacts: Array<{ id: string; name: string; detail: string; type: "file" | "link" | "video" }>;
  feedback?: string;
  showcaseEligible: boolean;
};

export const projectRecords: ProjectRecord[] = [
  {
    id: "decision-map",
    title: "Decision map",
    course: "Evidence & Decision Making",
    courseCode: "HUM 214",
    status: "active",
    progress: 64,
    dueLabel: "Checkpoint Fri, 11:00 AM",
    brief: "Build an auditable map that connects a consequential decision to claims, evidence quality, uncertainty, and alternatives.",
    outcome: "Synthesize incomplete evidence into a defensible recommendation and communicate the limits of the conclusion.",
    team: [
      { id: "self", name: "You", role: "Evidence lead", initials: "YO" },
      { id: "maya", name: "Maya Kapoor", role: "Research lead", initials: "MK" },
      { id: "arjun", name: "Arjun Sen", role: "Review lead", initials: "AS" },
    ],
    milestones: [
      { id: "question", title: "Decision question and scope", due: "Completed 15 Sep", complete: true },
      { id: "evidence", title: "Evidence register", due: "Completed 19 Sep", complete: true },
      { id: "alternatives", title: "Alternatives and uncertainty", due: "Due 25 Sep", complete: false },
      { id: "demo", title: "Narrated decision walkthrough", due: "Due 2 Oct", complete: false },
    ],
    artifacts: [
      { id: "map", name: "decision-map-v3.pdf", detail: "PDF · 1.8 MB · Updated yesterday", type: "file" },
      { id: "register", name: "Evidence register", detail: "Shared sheet · 14 sources", type: "link" },
    ],
    showcaseEligible: false,
  },
  {
    id: "portfolio-backtester",
    title: "Transaction-aware portfolio backtester",
    course: "Python for Quantitative Research",
    courseCode: "CS 245",
    status: "review",
    progress: 88,
    dueLabel: "Faculty review in progress",
    brief: "Build a reproducible backtester that accounts for turnover, transaction costs, and look-ahead bias.",
    outcome: "Create and evaluate a research-grade quantitative workflow under realistic market constraints.",
    team: [{ id: "self", name: "You", role: "Individual project", initials: "YO" }],
    milestones: [
      { id: "data", title: "Data and assumptions", due: "Completed", complete: true },
      { id: "engine", title: "Backtest engine", due: "Completed", complete: true },
      { id: "validation", title: "Bias and cost validation", due: "Completed", complete: true },
      { id: "reflection", title: "Faculty reflection", due: "Pending review", complete: false },
    ],
    artifacts: [
      { id: "repo", name: "backtester repository", detail: "Git repository · 18 commits", type: "link" },
      { id: "demo", name: "Strategy walkthrough", detail: "Video · 6:42", type: "video" },
    ],
    feedback: "Strong validation discipline. Clarify how slippage assumptions change the conclusion before publishing.",
    showcaseEligible: false,
  },
  {
    id: "query-observatory",
    title: "Query plan observatory",
    course: "Database Systems",
    courseCode: "CS 326",
    status: "completed",
    progress: 100,
    dueLabel: "Completed 28 Aug",
    brief: "Instrument and compare query plans across changing data distributions and indexing strategies.",
    outcome: "Diagnose database performance using evidence rather than intuition.",
    team: [{ id: "self", name: "You", role: "Individual project", initials: "YO" }],
    milestones: [
      { id: "instrument", title: "Instrumentation", due: "Completed", complete: true },
      { id: "experiment", title: "Controlled experiments", due: "Completed", complete: true },
      { id: "report", title: "Technical report", due: "Completed", complete: true },
    ],
    artifacts: [{ id: "report", name: "query-observatory-report.pdf", detail: "Verified evidence · Score 92%", type: "file" }],
    feedback: "Excellent experimental control and clear communication of the planner trade-offs.",
    showcaseEligible: true,
  },
];

export type DiscussionPost = {
  id: string;
  author: string;
  role: "learner" | "faculty" | "teaching_assistant";
  initials: string;
  postedAt: string;
  body: string;
  helpful: number;
  accepted?: boolean;
};

export type DiscussionThread = {
  id: string;
  title: string;
  course: string;
  anchor: string;
  anchorType: "concept" | "lab_step" | "code_line" | "lecture_time";
  excerpt: string;
  author: string;
  postedAt: string;
  replies: number;
  unread: number;
  solved: boolean;
  tags: string[];
  posts: DiscussionPost[];
};

export const discussionThreads: DiscussionThread[] = [
  {
    id: "learning-rate",
    title: "Why does the larger learning rate cross the minimum repeatedly?",
    course: "ML 401 · Machine Learning",
    anchor: "Gradient descent lab · Stability trace",
    anchorType: "lab_step",
    excerpt: "My loss decreases overall, but the parameter keeps moving across the minimum instead of settling.",
    author: "You",
    postedAt: "22 min ago",
    replies: 3,
    unread: 1,
    solved: true,
    tags: ["Optimisation", "Lab help"],
    posts: [
      { id: "p1", author: "You", role: "learner", initials: "YO", postedAt: "22 min ago", body: "My loss decreases overall, but with α = 0.3 the parameter repeatedly crosses the minimum. Is that always evidence that the rate is too large, or can momentum cause the same shape?", helpful: 1 },
      { id: "p2", author: "Isha Verma", role: "teaching_assistant", initials: "IV", postedAt: "14 min ago", body: "Good distinction. First hold momentum at zero and compare the sign of consecutive gradients. What pattern would show that the step itself is overshooting?", helpful: 7 },
      { id: "p3", author: "You", role: "learner", initials: "YO", postedAt: "8 min ago", body: "The gradient sign alternates while its magnitude stays fairly large, so each update crosses the minimum. With α = 0.05 the sign stops alternating near convergence.", helpful: 2 },
      { id: "p4", author: "Prof. N. Rao", role: "faculty", initials: "NR", postedAt: "3 min ago", body: "Exactly. The alternating sign is the useful evidence here. Momentum can also oscillate, but you isolated it correctly by controlling that variable first.", helpful: 9, accepted: true },
    ],
  },
  {
    id: "evidence-threshold",
    title: "When is evidence strong enough to act on?",
    course: "HUM 214 · Evidence & Decision Making",
    anchor: "Lecture 4 · 08:42",
    anchorType: "lecture_time",
    excerpt: "How should we distinguish uncertainty that requires more research from uncertainty we simply need to accept?",
    author: "Maya Kapoor",
    postedAt: "Yesterday",
    replies: 8,
    unread: 3,
    solved: false,
    tags: ["Decision quality", "Uncertainty"],
    posts: [
      { id: "e1", author: "Maya Kapoor", role: "learner", initials: "MK", postedAt: "Yesterday", body: "How should we distinguish uncertainty that requires more research from uncertainty we simply need to accept before making a time-sensitive decision?", helpful: 11 },
      { id: "e2", author: "Dr. Meera Sen", role: "faculty", initials: "MS", postedAt: "Yesterday", body: "Ask whether another unit of evidence is likely to change the decision. If it changes confidence but not the preferred action, delay may have lower value than it appears.", helpful: 18 },
    ],
  },
  {
    id: "join-order",
    title: "Comparing join orders when cardinality estimates are wrong",
    course: "CS 326 · Database Systems",
    anchor: "Query lab · plan.py line 38",
    anchorType: "code_line",
    excerpt: "The cheaper estimated plan is slower on the skewed fixture. Which measurement should drive the explanation?",
    author: "Arjun Sen",
    postedAt: "Mon",
    replies: 5,
    unread: 0,
    solved: true,
    tags: ["Query planning", "Code line 38"],
    posts: [
      { id: "j1", author: "Arjun Sen", role: "learner", initials: "AS", postedAt: "Mon", body: "The cheaper estimated plan is slower on the skewed fixture. Should I focus on estimated cost, actual rows, or buffer reads in the explanation?", helpful: 4 },
      { id: "j2", author: "Rhea Shah", role: "faculty", initials: "RS", postedAt: "Mon", body: "Use actual rows to establish the cardinality error, then buffer reads to explain the physical consequence. Estimated cost is useful as evidence of what the planner believed.", helpful: 13, accepted: true },
    ],
  },
];

export const discussionComposerContext = {
  course: "ML 401 · Machine Learning",
  anchor: "Gradient descent · Current workspace",
  anchorType: "concept" as const,
  label: "ML 401 · Gradient descent",
};

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  course: string;
  start: string;
  end: string;
  type: "class" | "lab" | "deadline" | "project" | "office_hours" | "study";
  location: string;
  detail: string;
  href?: string;
};

export const calendarEvents: CalendarEvent[] = [
  { id: "ml-class", date: "2026-09-21", title: "Optimisation for learning", course: "ML 401", start: "10:00", end: "11:30", type: "class", location: "Turing Hall 101", detail: "Lecture · Bring the loss-landscape notes" },
  { id: "study-block", date: "2026-09-21", title: "Gradient descent lab", course: "Focused work", start: "16:00", end: "17:00", type: "study", location: "Personal block", detail: "Resume from stability analysis", href: "/labs" },
  { id: "db-class", date: "2026-09-22", title: "Query optimisation", course: "CS 326", start: "09:00", end: "10:30", type: "class", location: "Shannon Hall 202", detail: "Lecture · Cost models and cardinality" },
  { id: "office-hours", date: "2026-09-23", title: "Machine Learning office hours", course: "ML 401", start: "14:00", end: "15:00", type: "office_hours", location: "Faculty Commons", detail: "Prof. N. Rao · Bring questions or traces" },
  { id: "practice-lab", date: "2026-09-24", title: "Applied practice lab", course: "ML 401", start: "15:30", end: "17:00", type: "lab", location: "Computing Lab 3", detail: "Gradient descent submission window", href: "/labs" },
  { id: "decision-checkpoint", date: "2026-09-25", title: "Decision map checkpoint", course: "HUM 214", start: "11:00", end: "11:30", type: "project", location: "Team workspace", detail: "Alternatives and uncertainty review", href: "/projects" },
  { id: "probability-deadline", date: "2026-09-25", title: "Bayesian inference lab due", course: "STAT 312", start: "10:00", end: "10:00", type: "deadline", location: "Online submission", detail: "Run pre-flight before submitting", href: "/labs" },
];

export const calendarWorkspace = {
  initialWeekStart: "2026-09-21T00:00:00+05:30",
  today: "2026-09-21",
  balancedLoadPercent: 72,
  balancedLoadLabel: "Balanced · 4.5 focused hours planned",
};

export const capabilityDimensions = [
  { id: "knowledge", label: "Knowledge", value: 86, change: 4, evidence: 28, description: "Recognise and explain core ideas accurately." },
  { id: "procedural", label: "Procedural application", value: 78, change: 7, evidence: 19, description: "Apply known methods in structured contexts." },
  { id: "problem_solving", label: "Open problem solving", value: 69, change: 9, evidence: 11, description: "Navigate ambiguity and select an appropriate approach." },
  { id: "synthesis", label: "Synthesis & creation", value: 73, change: 5, evidence: 8, description: "Combine concepts into coherent original work." },
  { id: "retention", label: "Retention", value: 81, change: 2, evidence: 16, description: "Retrieve and use capability after time has passed." },
  { id: "transfer", label: "Contextual transfer", value: 64, change: 8, evidence: 6, description: "Apply capability in a meaningfully different setting." },
];

export const progressCourses = [
  { code: "ML 401", title: "Machine Learning", progress: 46, pace: "6% ahead", status: "On track", grade: "A-", evidence: 18, next: "Complete the optimisation lab" },
  { code: "STAT 312", title: "Probability & Statistics", progress: 61, pace: "9% ahead", status: "Ahead", grade: "A", evidence: 21, next: "Submit the Bayesian inference lab" },
  { code: "CS 326", title: "Database Systems", progress: 28, pace: "12% behind", status: "Needs attention", grade: "B+", evidence: 13, next: "Review relational algebra feedback" },
  { code: "CS 341", title: "Operating Systems", progress: 8, pace: "Starts this week", status: "Starting", grade: "—", evidence: 3, next: "Begin process states" },
];

export const evidenceRecords = [
  { id: "ev-1", title: "Gradient update implementation", course: "ML 401", type: "Invariant-verified code", date: "21 Sep", score: "6 / 6 checks", dimensions: ["Procedural application", "Problem solving"], verified: true },
  { id: "ev-2", title: "Query plan analysis", course: "CS 326", type: "Faculty-reviewed lab", date: "18 Sep", score: "17 / 20", dimensions: ["Knowledge", "Problem solving"], verified: true },
  { id: "ev-3", title: "Evidence register", course: "HUM 214", type: "Project artifact", date: "19 Sep", score: "Checkpoint met", dimensions: ["Synthesis & creation", "Transfer"], verified: true },
  { id: "ev-4", title: "Bayesian reasoning drill", course: "STAT 312", type: "Formative practice", date: "16 Sep", score: "9 / 10", dimensions: ["Knowledge", "Retention"], verified: true },
];

export const weeklyActivity = [
  { label: "W1", value: 42 },
  { label: "W2", value: 58 },
  { label: "W3", value: 49 },
  { label: "W4", value: 72 },
  { label: "W5", value: 64 },
  { label: "W6", value: 81 },
  { label: "W7", value: 74 },
];

export const progressOverview = {
  evidenceIndex: 76,
  termChange: 6,
  momentumTitle: "Your strongest momentum is in applied problem solving.",
  momentumDetail: "Recent labs show better diagnostic reasoning. The next useful gap is transferring that reasoning into unfamiliar contexts.",
  verifiedSignalCount: 88,
  nextAction: "Complete one unfamiliar application task and explain why the chosen method transfers.",
};

export const supportArticles = [
  { id: "resume", category: "Learning", title: "Resume an activity exactly where you stopped", detail: "How playback, code drafts, and checkpoints are restored." },
  { id: "preflight", category: "Labs", title: "Understand pre-flight checks before submission", detail: "What visible and hidden invariants mean for your work." },
  { id: "projects", category: "Projects", title: "Add evidence and submit a project checkpoint", detail: "Files, links, video demos, and milestone requirements." },
  { id: "accessibility", category: "Accessibility", title: "Keyboard navigation and assistive modes", detail: "Shortcuts, focus behavior, captions, and high-contrast support." },
  { id: "grades", category: "Progress", title: "Read your capability evidence and grades", detail: "How scores, evidence, and capability dimensions differ." },
];

export const learnerProfile = {
  fullName: "Bayes Institute Learner",
  email: "learner@bayes.edu",
  studentNumber: "BAYES-2024-AI-0001",
  programme: "B.Tech · Artificial Intelligence & Machine Learning",
  cohort: "2024–2028",
  timezone: "Asia/Kolkata",
  language: "English",
  institution: "Bayes Institute",
};

export const learnerPreferenceDefaults = {
  weeklyDigest: true,
  deadlineAlerts: true,
  discussionReplies: true,
  reducedMotion: false,
  highContrast: false,
  keyboardHints: true,
};

export const homeDashboard = {
  eyebrow: "Today",
  description: "Continue your course, review what is due, and keep your current work moving.",
  continueLearning: {
    title: "Following the negative gradient",
    context: "ML 401 · Optimisation for learning · 12 min",
    progress: 46,
    href: "/learning/machine-learning/studio/gradient-descent-lesson",
  },
  nextUp: [
    { id: "lab", title: "Optimise a model with gradient descent", detail: "ML 401 · Applied lab · 75 min", href: "/labs", status: "Due Thursday", tone: "attention" },
    { id: "feedback", title: "Review instructor feedback", detail: "CS 326 · Query plan analysis · 3 comments", href: "/labs" },
    { id: "discussion", title: "Why does the loss diverge?", detail: "ML 401 · Discussion · 2 new replies", href: "/discussions" },
  ],
  currentProject: {
    title: "Model decision map",
    detail: "Compare candidate models and defend a recommendation under real delivery constraints.",
    meta: "2 artifacts · Updated yesterday",
    href: "/projects",
  },
  schedule: [
    { id: "lab-due", dateTime: "2026-09-24", day: "24", month: "Sep", title: "Gradient descent lab", detail: "Thursday · 3:30 PM" },
    { id: "checkpoint", dateTime: "2026-09-25", day: "25", month: "Sep", title: "Project checkpoint", detail: "Friday · 11:00 AM" },
  ],
  weeklyCompleted: 3,
  weeklyTotal: 4,
  paceMessage: "One remaining learning block keeps you on pace for this course.",
};

export const learnerNotifications = [
  {
    id: "lab-due",
    title: "Gradient descent lab",
    detail: "Due Thursday at 3:30 PM",
    href: "/labs",
    icon: "CheckCircle",
    unread: true,
  },
];

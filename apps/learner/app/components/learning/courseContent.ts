export type ConceptState = "complete" | "active" | "upcoming";
export type ChapterState = "complete" | "current" | "ahead";
export type StudioActivityType = "video" | "coding";

export interface MockVideoStudioContract {
  durationSeconds: number;
  aspectRatio: "16:9" | "4:3" | "21:9" | "auto";
  posterUrl: string;
  learningObjective: string;
  segments: Array<{ time: number; title: string; description: string }>;
  transcript: Array<{ time: number; timeFormatted: string; text: string }>;
  keyTakeaways: string[];
}

export interface MockCodingStudioContract {
  problemId: string;
  difficulty: string;
  description: string;
  defaultLanguage: string;
  allowedLanguages: string[];
  starterCode: Record<string, string>;
  testCases: Array<{ id: string; title: string; input: string; expected: string; isSample: boolean }>;
}

export interface MockActivityStudioContract {
  version: string;
  required: boolean;
  video?: MockVideoStudioContract;
  coding?: MockCodingStudioContract;
}

export interface StudioActivity {
  id: string;
  title: string;
  duration: string;
  type: StudioActivityType;
  initiallyComplete?: boolean;
  studio: MockActivityStudioContract;
}

export interface CourseConcept {
  id: string;
  title: string;
  state: ConceptState;
  duration: string;
  activities: StudioActivity[];
}

export interface CourseChapter {
  id: string;
  title: string;
  description: string;
  state: ChapterState;
  concepts: CourseConcept[];
}

export interface ActivityContext {
  activity: StudioActivity;
  concept: CourseConcept;
  chapter: CourseChapter;
  chapterIndex: number;
  conceptIndex: number;
  activityIndex: number;
}

export interface CourseScheduleItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  dateTime: string;
  dayLabel?: string;
  dayNumber?: string;
  icon: string;
  featured?: boolean;
}

export interface CourseResource {
  id: string;
  title: string;
  detail: string;
  href: string;
  icon: string;
}

export interface CourseWorkspaceRecord {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  department: string;
  credits: number;
  termLabel: string;
  instructor: { id: string; name: string };
  status: { label: string; tone: "neutral" | "success" | "warning" | "info" };
  weekLabel: string;
  paceDetail: string;
  nextObligation: string;
  chapters: CourseChapter[];
  schedule: CourseScheduleItem[];
  resources: CourseResource[];
  detailLinks: CourseResource[];
}

function createStudioContract(
  id: string,
  title: string,
  duration: string,
  type: StudioActivityType,
  conceptTitle: string,
): MockActivityStudioContract {
  if (type === "video") {
    return {
      version: "1",
      required: true,
      video: {
        durationSeconds: Math.max(60, Number.parseInt(duration, 10) * 60),
        aspectRatio: "16:9",
        posterUrl: "/learner/learning/gradient-descent-poster.svg",
        learningObjective: `Build a practical understanding of ${conceptTitle.toLowerCase()} and connect it to the model-development workflow.`,
        segments: [
          { time: 0, title: `Orient to ${conceptTitle.toLowerCase()}`, description: "Connect the new idea to the decisions a practitioner makes." },
          { time: 133, title: "Build the intuition", description: "Trace the idea visually before introducing the formal rule." },
          { time: 356, title: "Work through an example", description: "Apply the concept one deliberate step at a time." },
          { time: 605, title: "Check your understanding", description: "Identify the signal that shows the method is working." },
        ],
        transcript: [
          { time: 0, timeFormatted: "0:00", text: `${conceptTitle} becomes useful when we connect the formal idea to a concrete modelling decision.` },
          { time: 133, timeFormatted: "2:13", text: "Start with the intuition, then use the notation to make each step precise." },
          { time: 356, timeFormatted: "5:56", text: "A worked example lets us inspect both the choice and its consequence." },
          { time: 605, timeFormatted: "10:05", text: "Finish by checking the result against the objective we started with." },
        ],
        keyTakeaways: [
          `Explain the purpose of ${conceptTitle.toLowerCase()} in a model workflow.`,
          "Connect the intuitive explanation to a concrete implementation step.",
          "Validate the result against the learning objective before moving on.",
        ],
      },
    };
  }

  return {
    version: "1",
    required: true,
    coding: {
      problemId: `ml-401-${id}`,
      difficulty: "Medium",
      description: `Complete the function and use the sample case to practise the core idea behind ${conceptTitle.toLowerCase()}.`,
      defaultLanguage: "python",
      allowedLanguages: ["python", "javascript"],
      starterCode: {
        python: "def learning_step(value, change, rate):\n    # Apply one deliberate update and return the result.\n    pass\n\nprint(learning_step(0.8, 1.6, 0.1))\n",
        javascript: "function learningStep(value, change, rate) {\n  // Apply one deliberate update and return the result.\n}\n\nconsole.log(learningStep(0.8, 1.6, 0.1));\n",
      },
      testCases: [
        { id: "update-rule", title: "One update", input: "0.8 1.6 0.1", expected: "0.64", isSample: true },
      ],
    },
  };
}

const activity = (
  id: string,
  title: string,
  duration: string,
  type: StudioActivityType,
  initiallyComplete = false,
  conceptTitle = title,
): StudioActivity => ({
  id,
  title,
  duration,
  type,
  initiallyComplete,
  studio: createStudioContract(id, title, duration, type, conceptTitle),
});

const concept = (
  id: string,
  title: string,
  duration: string,
  state: ConceptState,
  initiallyComplete = false,
  activities?: StudioActivity[],
): CourseConcept => ({
  id,
  title,
  duration,
  state,
  activities: activities ?? [
    activity(`${id}-lesson`, `${title}: guided lesson`, "12 min", "video", initiallyComplete, title),
    activity(`${id}-practice`, `${title}: coding practice`, "18 min", "coding", initiallyComplete, title),
  ],
});

/**
 * The learner app owns ordering, curriculum labels and navigation. Studios only
 * receive the descriptor for the activity they are asked to render.
 */
export const machineLearningChapters: CourseChapter[] = [
  {
    id: "foundations",
    title: "Foundations and linear models",
    description: "Build reliable baselines by framing prediction tasks, preparing data, and interpreting simple models.",
    state: "complete",
    concepts: [
      concept("problem-framing", "Problem framing", "8 min", "complete", true),
      concept("loss-functions", "Loss functions", "12 min", "complete", true),
      concept("linear-regression", "Linear regression", "10 min", "complete", true, [
        activity("linear-regression-lesson", "Linear regression: guided lesson", "14 min", "video", true, "Linear regression"),
        activity("linear-regression-practice", "Build a linear model", "16 min", "coding", true, "Linear regression"),
        activity("linear-regression-review", "Linear regression: worked review", "8 min", "video", true, "Linear regression"),
      ]),
      concept("logistic-regression", "Logistic regression", "11 min", "complete", true),
      concept("decision-boundaries", "Decision boundaries", "9 min", "complete", true),
      concept("evaluation-metrics", "Evaluation metrics", "14 min", "complete", true),
      concept("feature-scaling", "Feature scaling", "10 min", "complete", true),
      concept("data-splits", "Data splits", "9 min", "complete", true),
      concept("feature-encoding", "Feature encoding", "11 min", "complete", true),
      concept("model-diagnostics", "Model diagnostics", "12 min", "complete", true),
    ],
  },
  {
    id: "optimisation",
    title: "Optimisation for learning",
    description: "See how models improve step by step, then make deliberate choices about stable and efficient training.",
    state: "current",
    concepts: [
      concept("gradient-descent", "Gradient descent", "30 min", "active", false, [
        activity("gradient-descent-lesson", "Following the negative gradient", "12 min", "video", false, "Gradient descent"),
        activity("gradient-descent-practice", "Implement a gradient descent step", "18 min", "coding", false, "Gradient descent"),
      ]),
      concept("loss-landscapes", "Loss landscapes", "26 min", "upcoming"),
      concept("gradient-checks", "Gradient checks", "29 min", "upcoming"),
      concept("batch-optimisation", "Batch optimisation", "31 min", "upcoming"),
      concept("lr-schedules", "Learning-rate schedules", "29 min", "upcoming"),
      concept("momentum-adam", "Momentum and Adam", "32 min", "upcoming"),
    ],
  },
  {
    id: "generalisation",
    title: "Generalisation and model selection",
    description: "Learn to validate choices and build models that remain dependable beyond the training data.",
    state: "ahead",
    concepts: [
      concept("regularisation", "Regularisation", "31 min", "upcoming"),
      concept("cross-validation", "Cross-validation", "28 min", "upcoming"),
      concept("bias-variance", "Bias–variance tradeoff", "30 min", "upcoming"),
      concept("model-selection", "Model selection", "29 min", "upcoming"),
      concept("ensemble-methods", "Ensemble methods", "33 min", "upcoming"),
      concept("feature-engineering", "Feature engineering", "31 min", "upcoming"),
      concept("pipeline", "Pipeline and deployment", "32 min", "upcoming"),
      concept("reproducibility", "Reproducibility", "27 min", "upcoming"),
    ],
  },
];

/**
 * Mock course-workspace response. The future course API can return this shape
 * without requiring the learner UI or studio orchestration to change.
 */
export const machineLearningCourse: CourseWorkspaceRecord = {
  id: "course-ml-401",
  slug: "machine-learning",
  code: "ML 401",
  name: "Machine Learning",
  description: "Build practical intuition for supervised learning, optimisation, and model evaluation.",
  department: "Computer Science",
  credits: 4,
  termLabel: "Spring 2026",
  instructor: { id: "faculty-n-rao", name: "Prof. N. Rao" },
  status: { label: "On track", tone: "success" },
  weekLabel: "Week 7 of 14",
  paceDetail: "6% ahead of schedule",
  nextObligation: "Applied lab · Thursday, 3:30 PM",
  chapters: machineLearningChapters,
  schedule: [
    {
      id: "applied-practice-lab",
      title: "Applied practice lab",
      detail: "3:30 PM · Bring the gradient descent notebook",
      href: "/calendar",
      dateTime: "2026-09-24T15:30:00+05:30",
      dayLabel: "Thu",
      dayNumber: "24",
      icon: "Calendar",
      featured: true,
    },
    {
      id: "office-hours",
      title: "Office hours",
      detail: "Wednesday · 2:00 PM · Prof. N. Rao",
      href: "/calendar",
      dateTime: "2026-09-23T14:00:00+05:30",
      icon: "Calendar",
    },
  ],
  resources: [
    { id: "syllabus", title: "Course syllabus", detail: "PDF · Updated Sep 2", href: "#syllabus", icon: "File" },
    { id: "optimisation-reference", title: "Optimisation reference", detail: "18 pages · Faculty authored", href: "#notes", icon: "BookOpen" },
    { id: "lecture-04", title: "Lecture 04 recording", detail: "52 min · Sep 8", href: "#recording", icon: "Video" },
  ],
  detailLinks: [
    { id: "syllabus", title: "Syllabus", detail: "PDF", href: "#syllabus", icon: "File" },
    { id: "course-notes", title: "Course notes", detail: "Faculty authored", href: "#notes", icon: "BookOpen" },
  ],
};

export const machineLearningActivityContexts: ActivityContext[] = machineLearningCourse.chapters.flatMap(
  (chapter, chapterIndex) => chapter.concepts.flatMap(
    (courseConcept, conceptIndex) => courseConcept.activities.map(
      (courseActivity, activityIndex) => ({
        activity: courseActivity,
        concept: courseConcept,
        chapter,
        chapterIndex,
        conceptIndex,
        activityIndex,
      }),
    ),
  ),
);

export const initialCompletedActivityIds = machineLearningActivityContexts
  .filter(({ activity: courseActivity }) => courseActivity.initiallyComplete)
  .map(({ activity: courseActivity }) => courseActivity.id);

export function getActivityContext(activityId: string) {
  return machineLearningActivityContexts.find(({ activity: courseActivity }) => courseActivity.id === activityId);
}

export function activityHref(activityId: string) {
  return `/learning/${machineLearningCourse.slug}/studio/${activityId}`;
}

export function getAdjacentActivities(activityId: string) {
  const index = machineLearningActivityContexts.findIndex(({ activity: courseActivity }) => courseActivity.id === activityId);
  return {
    previous: index > 0 ? machineLearningActivityContexts[index - 1] : undefined,
    next: index >= 0 && index < machineLearningActivityContexts.length - 1
      ? machineLearningActivityContexts[index + 1]
      : undefined,
  };
}

export function getConceptProgress(conceptItem: CourseConcept, completedActivityIds: ReadonlySet<string>) {
  const completed = conceptItem.activities.filter((courseActivity) => completedActivityIds.has(courseActivity.id)).length;
  return { completed, total: conceptItem.activities.length, isComplete: completed === conceptItem.activities.length };
}

export function getChapterProgress(chapter: CourseChapter, completedActivityIds: ReadonlySet<string>) {
  const completed = chapter.concepts.filter((courseConcept) => getConceptProgress(courseConcept, completedActivityIds).isComplete).length;
  return { completed, total: chapter.concepts.length };
}

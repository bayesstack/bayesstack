export interface TestCase {
  id: string;
  title?: string;
  input: string;
  expected: string;
  explanation?: string;
  is_sample?: boolean;
}

export interface CaseResultItem {
  caseId: string;
  title?: string;
  passed: boolean;
  statusId: number;
  statusDescription: string;
  actual?: string;
  expected?: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  time?: number;
  memoryKb?: number;
}

export interface RunResultState {
  status: "idle" | "running" | "passed" | "failed" | "error";
  passedCount: number;
  totalCount: number;
  executionTimeMs: number;
  memoryKb: number;
  compileOutput?: string;
  errorMessage?: string;
  results: CaseResultItem[];
}

export interface SubmissionRecord {
  id: string;
  problem_id: string;
  language: string;
  state: "queued" | "running" | "completed" | "failed";
  verdict?: string | null;
  execution_time_ms?: number | null;
  memory_used_kb?: number | null;
  created_at: string;
  source_code?: string;
}

export interface PedagogicalHint {
  id?: string;
  title?: string;
  content: string;
}

export interface EditorialData {
  approach?: string;
  intuition?: string;
  hints?: (string | PedagogicalHint)[];
  complexity?: {
    time?: string;
    space?: string;
  };
  solutions?: Record<string, string>;
}

export interface CodingActivityConfig {
  problem_id?: string;
  problem_version?: number;
  problem_title?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  prompt?: string;
  description?: string;
  input_format?: string;
  output_format?: string;
  constraints?: string[];
  default_language?: string;
  allowed_languages?: string[];
  execution_style?: "stdin_stdout";
  time_limit_ms?: number;
  memory_limit_mb?: number;
  starter_code?: Record<string, string>;
  test_cases?: TestCase[];
  hints?: (string | PedagogicalHint)[];
  editorial?: EditorialData;
  [key: string]: unknown;
}

export interface CodingActivityDescriptor {
  id: string;
  activity_type: string;
  activity_version: string;
  title?: string;
  position?: number;
  is_required?: boolean;
  concept_id?: string;
  concept_title?: string;
  config?: CodingActivityConfig;
}

export interface CodingStudioProps {
  activity: CodingActivityDescriptor;
  /** Platform API origin. The browser never calls the judge directly. */
  apiBaseUrl?: string;
  onComplete?: () => void;
  onEvent?: (event: string, payload: Record<string, unknown>) => void;
  className?: string;
  style?: React.CSSProperties;
}

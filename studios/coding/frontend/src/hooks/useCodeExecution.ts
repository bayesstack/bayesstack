import { useState } from "react";
import type { RunResultState, TestCase, CaseResultItem } from "../types";

export function useCodeExecution({
  problemId,
  activityId,
  apiBaseUrl,
  code,
  selectedLanguage,
  testCases,
  onComplete,
  onEvent,
  onNewSubmission,
}: {
  problemId: string;
  activityId: string;
  apiBaseUrl: string;
  code: string;
  selectedLanguage: string;
  testCases: TestCase[];
  onComplete?: () => void;
  onEvent?: (event: string, payload: Record<string, unknown>) => void;
  onNewSubmission?: (submission: any) => void;
}) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCustomRunning, setIsCustomRunning] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>("");
  const [customOutput, setCustomOutput] = useState<string>("");
  const [activeConsoleTab, setActiveConsoleTab] = useState<string>("cases");

  const [runResult, setRunResult] = useState<RunResultState>({
    status: "idle",
    passedCount: 0,
    totalCount: 0,
    executionTimeMs: 0,
    memoryKb: 0,
    results: [],
  });

  const request = async (path: string, payload: Record<string, unknown>) => {
    const base = apiBaseUrl.replace(/\/$/, "");
    const response = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || "Code execution is temporarily unavailable");
    }
    return response.json();
  };

  const mapEvaluation = (data: any): RunResultState => {
    const isAccepted = data.verdict === "accepted";
    const isError = data.verdict === "system_error";
    const results: CaseResultItem[] = (data.results || []).map((item: any) => ({
      caseId: String(item.case_id || item.id || Math.random()),
      title: item.title,
      passed: Boolean(item.passed),
      statusId: item.passed ? 3 : 4,
      statusDescription: String(item.verdict || (item.passed ? "Accepted" : "Wrong Answer")).replaceAll("_", " "),
      actual: item.execution?.stdout || item.execution?.stderr || "",
      expected: item.expected_output,
      stdout: item.execution?.stdout,
      stderr: item.execution?.stderr,
      compileOutput: item.execution?.compile_output,
      time: item.execution?.execution_time_ms ? item.execution.execution_time_ms / 1000 : undefined,
      memoryKb: item.execution?.memory_used_kb,
    }));

    return {
      status: isAccepted ? "passed" : isError ? "error" : "failed",
      passedCount: results.filter((item) => item.passed).length,
      totalCount: results.length,
      executionTimeMs: data.execution_time_ms || 0,
      memoryKb: data.memory_used_kb || 0,
      compileOutput: (data.results || []).find((item: any) => item.execution?.compile_output)?.execution?.compile_output,
      results,
    };
  };

  const runTests = async () => {
    setIsRunning(true);
    setActiveConsoleTab("results");
    onEvent?.("activity.run_tests", { activity_id: activityId, language: selectedLanguage });

    try {
      if (!problemId) throw new Error("This activity is missing a coding problem ID");
      const data = await request(`/api/v1/coding/problems/${encodeURIComponent(problemId)}/runs`, {
        source_code: code,
        language: selectedLanguage,
      });
      setRunResult(mapEvaluation(data));
    } catch (err: any) {
      setRunResult({
        status: "error",
        passedCount: 0,
        totalCount: testCases.length,
        executionTimeMs: 0,
        memoryKb: 0,
        errorMessage: err?.message || "Code execution is temporarily unavailable.",
        results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const pollSubmission = async (submissionId: string) => {
    const base = apiBaseUrl.replace(/\/$/, "");
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const response = await fetch(`${base}/api/v1/coding/submissions/${encodeURIComponent(submissionId)}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Unable to retrieve submission status");
      const data = await response.json();
      if (data.state === "completed" || data.state === "failed") return data;
      await new Promise((resolve) => window.setTimeout(resolve, 600));
    }
    throw new Error("Submission is still queued; check its status again shortly.");
  };

  const submitSolution = async () => {
    setIsSubmitting(true);
    setActiveConsoleTab("results");
    onEvent?.("activity.submit", { activity_id: activityId, language: selectedLanguage });

    try {
      if (!problemId) throw new Error("This activity is missing a coding problem ID");
      const created = await request("/api/v1/coding/submissions", {
        problem_id: problemId,
        source_code: code,
        language: selectedLanguage,
      });

      const completedData = await pollSubmission(String(created.id));
      const mapped = mapEvaluation({
        verdict: completedData.verdict,
        execution_time_ms: completedData.execution_time_ms,
        memory_used_kb: completedData.memory_used_kb,
        results: completedData.results,
      });
      setRunResult(mapped);

      onNewSubmission?.({
        id: String(completedData.id || created.id),
        problem_id: problemId,
        language: selectedLanguage,
        state: completedData.state,
        verdict: completedData.verdict,
        execution_time_ms: completedData.execution_time_ms,
        memory_used_kb: completedData.memory_used_kb,
        created_at: new Date().toISOString(),
        source_code: code,
      });

      if (completedData.verdict === "accepted") {
        onComplete?.();
        onEvent?.("activity.completed", {
          activity_id: activityId,
          status: "accepted",
          score: 100,
          completed_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setRunResult({
        status: "error",
        passedCount: 0,
        totalCount: testCases.length,
        executionTimeMs: 0,
        memoryKb: 0,
        errorMessage: err?.message || "Code submission failed. Check network or server status.",
        results: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const runCustomInput = async () => {
    setIsCustomRunning(true);
    try {
      if (!problemId) throw new Error("This activity is missing a coding problem ID");
      const data = await request(`/api/v1/coding/problems/${encodeURIComponent(problemId)}/custom-run`, {
        source_code: code,
        language: selectedLanguage,
        stdin: customInput,
      });
      setCustomOutput(data.stdout || data.stderr || data.compile_output || data.status || "Program completed with no output.");
    } catch (err: any) {
      setCustomOutput(err?.message || "Code execution is temporarily unavailable.");
    } finally {
      setIsCustomRunning(false);
    }
  };

  return {
    isRunning,
    isSubmitting,
    isCustomRunning,
    customInput,
    setCustomInput,
    customOutput,
    activeConsoleTab,
    setActiveConsoleTab,
    runResult,
    runTests,
    submitSolution,
    runCustomInput,
  };
}

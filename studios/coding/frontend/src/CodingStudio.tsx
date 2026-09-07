"use client";

import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Icon,
  Tabs,
  Alert,
  CodeEditor,
  type TabItem,
} from "@bayesstack/ui";

export interface TestCase {
  id: string;
  title?: string;
  input: string;
  expected: string;
  explanation?: string;
}

export interface CodingActivityConfig {
  problem_id?: string;
  problem_version?: number;
  difficulty?: string;
  prompt?: string;
  description?: string;
  input_format?: string;
  output_format?: string;
  constraints?: string[];
  default_language?: string;
  allowed_languages?: string[];
  /** Only stdin/stdout programs are supported by the production judge. */
  execution_style?: "stdin_stdout";
  time_limit_ms?: number;
  memory_limit_mb?: number;
  starter_code?: Record<string, string>;
  test_cases?: TestCase[];
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
  /** Platform API origin. The browser never calls the judge or Piston directly. */
  apiBaseUrl?: string;
  onComplete?: () => void;
  onEvent?: (event: string, payload: Record<string, unknown>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CodingStudio({
  activity,
  apiBaseUrl = "http://localhost:8000",
  onComplete,
  onEvent,
  className = "",
  style = {},
}: CodingStudioProps) {
  const config = activity.config || {};
  const defaultLang = config.default_language || "python";
  const starterCodeMap = config.execution_style === "stdin_stdout" && config.starter_code ? config.starter_code : {
    python:
      "import sys\n\ndata = list(map(int, sys.stdin.buffer.read().split()))\nif data:\n    n, capacity = data[0], data[1]\n    weights = data[2:2 + n]\n    values = data[2 + n:2 + 2 * n]\n    dp = [0] * (capacity + 1)\n    for weight, value in zip(weights, values):\n        for current in range(capacity, weight - 1, -1):\n            dp[current] = max(dp[current], dp[current - weight] + value)\n    print(dp[capacity])\n",
    cpp:
      "#include <algorithm>\n#include <iostream>\n#include <vector>\n\nint main() {\n  int n, capacity;\n  if (!(std::cin >> n >> capacity)) return 0;\n  std::vector<int> weights(n), values(n), dp(capacity + 1);\n  for (int& weight : weights) std::cin >> weight;\n  for (int& value : values) std::cin >> value;\n  for (int i = 0; i < n; ++i)\n    for (int current = capacity; current >= weights[i]; --current)\n      dp[current] = std::max(dp[current], dp[current - weights[i]] + values[i]);\n  std::cout << dp[capacity] << '\\n';\n}\n",
    javascript:
      "const values = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nif (values.length) {\n  let index = 0;\n  const n = values[index++], capacity = values[index++];\n  const weights = values.slice(index, index += n);\n  const benefits = values.slice(index, index += n);\n  const dp = Array(capacity + 1).fill(0);\n  for (let i = 0; i < n; i++)\n    for (let current = capacity; current >= weights[i]; current--)\n      dp[current] = Math.max(dp[current], dp[current - weights[i]] + benefits[i]);\n  console.log(dp[capacity]);\n}\n",
  };

  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLang);
  const [code, setCode] = useState<string>(starterCodeMap[defaultLang] || "");
  const [activeLeftTab, setActiveLeftTab] = useState<string>("description");
  const [activeTestTab, setActiveTestTab] = useState<string>("cases");
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCustomRunning, setIsCustomRunning] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>("");
  const [customOutput, setCustomOutput] = useState<string>("");
  interface CaseResultItem {
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

  const [runResult, setRunResult] = useState<{
    status: "idle" | "passed" | "failed" | "error";
    passedCount: number;
    totalCount: number;
    executionTimeMs: number;
    memoryKb: number;
    compileOutput?: string;
    errorMessage?: string;
    results: CaseResultItem[];
  }>({
    status: "idle",
    passedCount: 0,
    totalCount: 0,
    executionTimeMs: 0,
    memoryKb: 0,
    results: [],
  });

  const problemId = String(config.problem_id || "");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(
    (config.allowed_languages || ["python", "cpp", "javascript"]).filter((language) => ["python", "cpp", "javascript"].includes(language)),
  );

  useEffect(() => {
    if (!problemId) return;
    fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/coding/problems/${encodeURIComponent(problemId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load coding problem");
        return response.json();
      })
      .then((problem) => {
        setAvailableLanguages(problem.allowed_languages || []);
        setTestCases((problem.sample_test_cases || []).map((item: any) => ({
          id: String(item.id), title: item.title, input: item.stdin, expected: item.expected_output, explanation: item.explanation,
        })));
      })
      .catch(() => setTestCases([]));
  }, [apiBaseUrl, problemId]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (starterCodeMap[lang]) {
      setCode(starterCodeMap[lang]);
    }
  };

  const request = async (path: string, payload: Record<string, unknown>) => {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || "Code execution is temporarily unavailable");
    }
    return response.json();
  };

  const mapEvaluation = (data: any) => ({
    status: data.verdict === "accepted" ? "passed" as const : data.verdict === "system_error" ? "error" as const : "failed" as const,
    passedCount: (data.results || []).filter((item: any) => item.passed).length,
    totalCount: (data.results || []).length,
    executionTimeMs: data.execution_time_ms || 0,
    memoryKb: data.memory_used_kb || 0,
    compileOutput: (data.results || []).find((item: any) => item.execution?.compile_output)?.execution?.compile_output,
    results: (data.results || []).map((item: any) => ({
      caseId: item.case_id, title: item.title, passed: item.passed, statusId: 0,
      statusDescription: String(item.verdict || "").replaceAll("_", " "), actual: item.execution?.stdout || item.execution?.stderr || "",
      stdout: item.execution?.stdout, stderr: item.execution?.stderr, compileOutput: item.execution?.compile_output,
      time: item.execution?.execution_time_ms ? item.execution.execution_time_ms / 1000 : undefined, memoryKb: item.execution?.memory_used_kb,
    })),
  });

  const handleRunTests = async () => {
    setIsRunning(true);
    onEvent?.("activity.run_tests", { activity_id: activity.id, language: selectedLanguage });

    try {
      if (!problemId) throw new Error("This activity is missing a coding problem ID");
      const data = await request(`/api/v1/coding/problems/${encodeURIComponent(problemId)}/runs`, { source_code: code, language: selectedLanguage });
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
      setActiveTestTab("results");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    onEvent?.("activity.submit", { activity_id: activity.id, language: selectedLanguage });

    try {
      if (!problemId) throw new Error("This activity is missing a coding problem ID");
      const created = await request("/api/v1/coding/submissions", { problem_id: problemId, source_code: code, language: selectedLanguage });
      const data = await pollSubmission(String(created.id));
      setRunResult(mapEvaluation({
        verdict: data.verdict, execution_time_ms: data.execution_time_ms, memory_used_kb: data.memory_used_kb, results: data.results,
      }));
      setActiveTestTab("results");

      if (data.verdict === "accepted") {
        onComplete?.();
        onEvent?.("activity.completed", {
          activity_id: activity.id,
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
        errorMessage: err?.message || "Code execution is temporarily unavailable.",
        results: [],
      });
      setActiveTestTab("results");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollSubmission = async (submissionId: string) => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/coding/submissions/${encodeURIComponent(submissionId)}`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to retrieve submission status");
      const data = await response.json();
      if (data.state === "completed" || data.state === "failed") return data;
      await new Promise((resolve) => window.setTimeout(resolve, 600));
    }
    throw new Error("Submission is still queued; check its status again shortly.");
  };

  const handleCustomRun = async () => {
    setIsCustomRunning(true);
    try {
      if (!problemId) throw new Error("This activity is missing a coding problem ID");
      const data = await request(`/api/v1/coding/problems/${encodeURIComponent(problemId)}/custom-run`, { source_code: code, language: selectedLanguage, stdin: customInput });
      setCustomOutput(data.stdout || data.stderr || data.compile_output || data.status);
    } catch (err: any) {
      setCustomOutput(err?.message || "Code execution is temporarily unavailable.");
    } finally {
      setIsCustomRunning(false);
    }
  };

  const leftTabItems: TabItem[] = [
    { value: "description", label: "Problem Description", icon: "BookOpen" },
    { value: "constraints", label: "I/O & Constraints", icon: "Settings" },
  ];

  const testTabItems: TabItem[] = [
    {
      value: "cases",
      label: "Test Cases",
      icon: "Code",
      badge: <Badge color="primary" variant="subtle" size="sm">{testCases.length}</Badge>,
    },
    {
      value: "results",
      label: "Execution Output",
      icon: "Check",
      badge:
        runResult.status !== "idle" ? (
          <Badge
            color={
              runResult.status === "passed"
                ? "success"
                : runResult.status === "error"
                ? "danger"
                : "warning"
            }
            variant="subtle"
            size="sm"
          >
            {runResult.status.toUpperCase()}
          </Badge>
        ) : undefined,
    },
  ];

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "440px minmax(0, 1fr)",
        gap: "1.5rem",
        width: "100%",
        height: "calc(100vh - 130px)",
        fontFamily: "var(--bs-ui-font-sans, 'Outfit', 'Inter', sans-serif)",
        ...style,
      }}
    >
      {/* Left Column: Problem Prompt & Specifications Card */}
      <div
        style={{
          background: "var(--bs-ui-surface, #ffffff)",
          border: "1px solid var(--bs-ui-line, #d7e8e4)",
          borderRadius: "14px",
          boxShadow: "0 4px 20px rgba(11, 103, 99, 0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0.75rem 1rem 0",
            borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
            background: "#ffffff",
          }}
        >
          <Tabs
            items={leftTabItems}
            value={activeLeftTab}
            onValueChange={setActiveLeftTab}
            variant="line"
            size="md"
          />
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            background: "var(--bs-ui-surface, #ffffff)",
          }}
        >
          {activeLeftTab === "description" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Badge color="primary" variant="subtle" size="sm">
                  {String(config.difficulty || "Intermediate")}
                </Badge>
                <Badge color="neutral" variant="subtle" size="sm">
                  Time: {config.time_limit_ms || 2000}ms
                </Badge>
                <Badge color="neutral" variant="subtle" size="sm">
                  Memory: {config.memory_limit_mb || 256}MB
                </Badge>
              </div>

              <h2
                style={{
                  margin: "0 0 12px",
                  fontSize: "1.25rem",
                  color: "var(--bs-ui-ink, #123333)",
                  fontWeight: 800,
                }}
              >
                {String(config.problem_title || activity.title || "0/1 Knapsack Problem")}
              </h2>

              <p
                style={{
                  fontSize: "0.88rem",
                  color: "#334e55",
                  lineHeight: 1.65,
                  margin: "0 0 20px",
                }}
              >
                {config.prompt ||
                  config.description ||
                  "You are given weights and values of items and a maximum weight capacity W. Formulate and implement the 0/1 knapsack dynamic programming algorithm to calculate the maximum achievable value without exceeding the weight capacity."}
              </p>

              {/* Sample Case Card */}
              <div style={{ marginTop: "1rem" }}>
                <h4
                  style={{
                    margin: "0 0 8px",
                    fontSize: "0.8rem",
                    color: "var(--bs-ui-brand, #0b6763)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Example 1:
                </h4>
                <div
                  style={{
                    background: "var(--bs-ui-canvas, #f1f8f6)",
                    border: "1px solid var(--bs-ui-line, #d7e8e4)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    fontSize: "0.82rem",
                    fontFamily: "var(--bs-ui-font-mono, 'JetBrains Mono', monospace)",
                    color: "var(--bs-ui-ink, #123333)",
                    lineHeight: 1.6,
                  }}
                >
                  <div>
                    <strong>Input:</strong> {testCases[0]?.input}
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <strong>Output:</strong> {testCases[0]?.expected}
                  </div>
                  {testCases[0]?.explanation && (
                    <div
                      style={{
                        marginTop: "8px",
                        color: "var(--bs-ui-muted, #4a6360)",
                        fontSize: "0.78rem",
                      }}
                    >
                      <strong>Explanation:</strong> {testCases[0]?.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeLeftTab === "constraints" && (
            <div>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "0.9rem",
                  color: "var(--bs-ui-ink, #123333)",
                  fontWeight: 700,
                }}
              >
                Input & Output Format
              </h4>
              <div
                style={{
                  background: "var(--bs-ui-canvas, #f1f8f6)",
                  border: "1px solid var(--bs-ui-line, #d7e8e4)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontSize: "0.82rem",
                  color: "#334e55",
                  lineHeight: 1.6,
                  marginBottom: "1.25rem",
                }}
              >
                <div><strong>Input:</strong> weights array, values array, integer capacity W</div>
                <div style={{ marginTop: "4px" }}><strong>Output:</strong> Maximum integer total value</div>
              </div>

              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "0.9rem",
                  color: "var(--bs-ui-ink, #123333)",
                  fontWeight: 700,
                }}
              >
                System Constraints
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "0.85rem",
                  color: "#334e55",
                  lineHeight: 1.7,
                }}
              >
                {(config.constraints || [
                  "1 <= N (number of items) <= 1,000",
                  "1 <= capacity <= 10,000",
                  "1 <= weights[i] <= 1,000",
                  "1 <= values[i] <= 1,000",
                ]).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Code Editor & Interactive Test Runner */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Upper: Code Editor Card */}
        <div
          style={{
            flex: 1,
            background: "var(--bs-ui-surface, #ffffff)",
            borderRadius: "14px",
            border: "1px solid var(--bs-ui-line, #d7e8e4)",
            boxShadow: "0 4px 20px rgba(11, 103, 99, 0.04)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header Bar: Language Switcher Tabs & Actions */}
          <div
            style={{
              padding: "0.6rem 1.25rem",
              background: "#ffffff",
              borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--bs-ui-muted, #4a6360)",
                  fontWeight: 600,
                }}
              >
                Language:
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "var(--bs-ui-canvas, #f1f8f6)",
                  padding: "3px",
                  borderRadius: "8px",
                  border: "1px solid var(--bs-ui-line, #d7e8e4)",
                }}
              >
                {availableLanguages.map((lang) => {
                  const isCur = selectedLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageChange(lang)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        background: isCur ? "var(--bs-ui-brand, #0b6763)" : "transparent",
                        color: isCur ? "#ffffff" : "var(--bs-ui-muted, #4a6360)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {lang === "cpp" ? "C++17" : lang === "python" ? "Python 3" : "Java 21"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button
                variant="outline"
                size="xs"
                leftIcon={<Icon name="Refresh" size={13} />}
                onClick={() => setCode(starterCodeMap[selectedLanguage] || "")}
              >
                Reset Starter Code
              </Button>
            </div>
          </div>

          {/* Integrated @bayesstack/ui CodeEditor in clean light variant */}
          <div style={{ flex: 1, overflow: "hidden", background: "#ffffff" }}>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
              variant="light"
              showLineNumbers={true}
              showLanguageSelect={false}
              showCopy={true}
              showStatusFooter={true}
              style={{ height: "100%", width: "100%", border: "none" }}
            />
          </div>
        </div>

        {/* Lower: Test Cases & Execution Runner */}
        <div
          style={{
            height: "260px",
            background: "var(--bs-ui-surface, #ffffff)",
            borderRadius: "14px",
            border: "1px solid var(--bs-ui-line, #d7e8e4)",
            boxShadow: "0 4px 20px rgba(11, 103, 99, 0.04)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header with Tabs & Action Buttons */}
          <div
            style={{
              padding: "0.5rem 1.25rem 0",
              borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Tabs
              items={testTabItems}
              value={activeTestTab}
              onValueChange={setActiveTestTab}
              variant="line"
              size="md"
            />

            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "6px" }}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Icon name="Play" size={14} />}
                onClick={handleRunTests}
                loading={isRunning}
              >
                Run Tests
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="Check" size={14} />}
                onClick={handleSubmit}
                loading={isSubmitting}
              >
                Submit Solution
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem 1.25rem",
              background: "var(--bs-ui-canvas, #f1f8f6)",
            }}
          >
            {activeTestTab === "cases" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  {testCases.map((tc, idx) => (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => setActiveTestCaseIndex(idx)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${activeTestCaseIndex === idx ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-line, #d7e8e4)"}`,
                        background: activeTestCaseIndex === idx ? "#ffffff" : "transparent",
                        color: activeTestCaseIndex === idx ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-muted, #4a6360)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: activeTestCaseIndex === idx ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                      }}
                    >
                      Sample Case {idx + 1}
                    </button>
                  ))}
                </div>

                {testCases[activeTestCaseIndex] && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--bs-ui-line, #d7e8e4)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontFamily: "var(--bs-ui-font-mono, 'JetBrains Mono', monospace)",
                      fontSize: "0.82rem",
                      color: "var(--bs-ui-ink, #123333)",
                      lineHeight: 1.5,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div><strong>Input:</strong> {testCases[activeTestCaseIndex].input}</div>
                    <div style={{ marginTop: "6px" }}><strong>Expected:</strong> {testCases[activeTestCaseIndex].expected}</div>
                  </div>
                )}
                <div style={{ marginTop: "10px", paddingTop: "12px", borderTop: "1px solid var(--bs-ui-line, #d7e8e4)" }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--bs-ui-ink, #123333)", marginBottom: "6px" }}>Custom input</div>
                  <textarea
                    value={customInput}
                    onChange={(event) => setCustomInput(event.target.value)}
                    placeholder="Paste stdin to run your program without grading it"
                    style={{ width: "100%", minHeight: "76px", resize: "vertical", boxSizing: "border-box", padding: "9px", fontFamily: "var(--bs-ui-font-mono, monospace)", fontSize: "0.78rem", border: "1px solid var(--bs-ui-line, #d7e8e4)", borderRadius: "7px" }}
                  />
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "7px" }}>
                    <Button variant="outline" size="xs" leftIcon={<Icon name="Play" size={12} />} onClick={handleCustomRun} loading={isCustomRunning}>Run custom input</Button>
                    {customOutput && <code style={{ whiteSpace: "pre-wrap", fontSize: "0.75rem", color: "var(--bs-ui-muted, #4a6360)" }}>{customOutput}</code>}
                  </div>
                </div>
              </div>
            )}

            {activeTestTab === "results" && (
              <div>
                {runResult.status === "idle" ? (
                  <div
                    style={{
                      color: "var(--bs-ui-muted, #4a6360)",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      padding: "1.5rem",
                    }}
                  >
                    Run the sample cases or submit for the full private test suite.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Compilation Error Banner */}
                    {runResult.compileOutput && (
                      <Alert
                        severity="error"
                        variant="accent"
                        title="Compilation Error"
                      >
                        <pre
                          style={{
                            margin: "6px 0 0",
                            fontFamily: "var(--bs-ui-font-mono, monospace)",
                            fontSize: "0.78rem",
                            whiteSpace: "pre-wrap",
                            maxHeight: "140px",
                            overflowY: "auto",
                          }}
                        >
                          {runResult.compileOutput}
                        </pre>
                      </Alert>
                    )}

                    {/* Network / Service Error Banner */}
                    {runResult.errorMessage && (
                      <Alert
                        severity="error"
                        variant="accent"
                        title="Online Judge Connection Error"
                      >
                        {runResult.errorMessage}
                      </Alert>
                    )}

                    {/* Execution Summary Alert */}
                    {runResult.results.length > 0 && (
                      <Alert
                        severity={runResult.status === "passed" ? "success" : "warning"}
                        variant="accent"
                        title={
                          runResult.status === "passed"
                            ? `All Test Cases Passed (${runResult.passedCount}/${runResult.totalCount})`
                            : `Evaluation Incomplete (${runResult.passedCount}/${runResult.totalCount} Passed)`
                        }
                      >
                        Execution completed in {runResult.executionTimeMs}ms • Memory: {(runResult.memoryKb / 1024).toFixed(1)} MB • Engine: Judge0 CE
                      </Alert>
                    )}

                    {/* Individual Test Case Results */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {runResult.results.map((res, i) => (
                        <div
                          key={res.caseId}
                          style={{
                            background: "#ffffff",
                            border: `1px solid ${res.passed ? "#bbf7d0" : "#fecaca"}`,
                            borderRadius: "8px",
                            padding: "10px 14px",
                            fontSize: "0.8rem",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: res.passed ? "0" : "6px",
                            }}
                          >
                            <span style={{ color: "var(--bs-ui-ink, #123333)", fontWeight: 700 }}>
                              {res.title || `Sample Case ${i + 1}`}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {res.time !== undefined && (
                                <span style={{ fontSize: "0.72rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                                  {(res.time * 1000).toFixed(0)}ms
                                </span>
                              )}
                              <Badge
                                color={
                                  res.statusId === 3
                                    ? "success"
                                    : res.statusId === 5
                                    ? "warning"
                                    : "danger"
                                }
                                variant="subtle"
                                size="sm"
                              >
                                {res.statusDescription}
                              </Badge>
                            </div>
                          </div>

                          {!res.passed && (
                            <div
                              style={{
                                fontFamily: "var(--bs-ui-font-mono, monospace)",
                                fontSize: "0.76rem",
                                color: "#334e55",
                                lineHeight: 1.5,
                                background: "var(--bs-ui-canvas, #f1f8f6)",
                                padding: "8px 10px",
                                borderRadius: "6px",
                                marginTop: "6px",
                              }}
                            >
                              <div><strong>Expected:</strong> {res.expected}</div>
                              <div style={{ marginTop: "2px" }}>
                                <strong>Actual:</strong> {res.actual || "(empty)"}
                              </div>
                              {res.stderr && (
                                <div style={{ color: "#dc2626", marginTop: "4px" }}>
                                  <strong>Error:</strong> {res.stderr}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

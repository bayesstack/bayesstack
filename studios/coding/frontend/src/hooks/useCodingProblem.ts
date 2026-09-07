import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import type { CodingActivityDescriptor, TestCase } from "../types";

const DEFAULT_STARTER_CODES: Record<string, string> = {
  python: `import sys

def solve():
    data = list(map(int, sys.stdin.buffer.read().split()))
    if not data:
        return
    n, capacity = data[0], data[1]
    weights = data[2:2 + n]
    values = data[2 + n:2 + 2 * n]
    dp = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        for current in range(capacity, weight - 1, -1):
            dp[current] = max(dp[current], dp[current - weight] + value)
    print(dp[capacity])

if __name__ == '__main__':
    solve()
`,
  cpp: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);
    int n, capacity;
    if (!(std::cin >> n >> capacity)) return 0;
    std::vector<int> weights(n), values(n), dp(capacity + 1, 0);
    for (int& weight : weights) std::cin >> weight;
    for (int& value : values) std::cin >> value;
    for (int i = 0; i < n; ++i) {
        for (int current = capacity; current >= weights[i]; --current) {
            dp[current] = std::max(dp[current], dp[current - weights[i]] + values[i]);
        }
    }
    std::cout << dp[capacity] << '\\n';
    return 0;
}
`,
  java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int capacity = sc.nextInt();
        int[] weights = new int[n];
        int[] values = new int[n];
        for (int i = 0; i < n; i++) weights[i] = sc.nextInt();
        for (int i = 0; i < n; i++) values[i] = sc.nextInt();
        int[] dp = new int[capacity + 1];
        for (int i = 0; i < n; i++) {
            for (int w = capacity; w >= weights[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
        System.out.println(dp[capacity]);
    }
}
`,
  javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
    if (!input || input.length < 2) return;
    let idx = 0;
    const n = input[idx++];
    const capacity = input[idx++];
    const weights = input.slice(idx, idx + n);
    idx += n;
    const values = input.slice(idx, idx + n);
    const dp = new Array(capacity + 1).fill(0);
    for (let i = 0; i < n; i++) {
        for (let w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    console.log(dp[capacity]);
}

solve();
`,
};

export const LANGUAGE_OPTIONS = [
  { value: "python", label: "Python 3" },
  { value: "cpp", label: "C++ 17" },
  { value: "java", label: "Java 21" },
  { value: "javascript", label: "JavaScript (Node.js)" },
];

export interface LanguageDraft {
  code: string;
  updatedAt: number;
  isDirty: boolean;
}

export interface ProblemDrafts {
  [language: string]: LanguageDraft;
}

const PROBLEM_DRAFTS_PREFIX = "bs_cs_drafts_";
const LEGACY_DRAFT_PREFIX = "bs_cs_draft_";

export function getProblemDrafts(problemId: string): ProblemDrafts {
  if (typeof window === "undefined" || !problemId) return {};
  try {
    const raw = localStorage.getItem(`${PROBLEM_DRAFTS_PREFIX}${problemId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function saveProblemDrafts(problemId: string, drafts: ProblemDrafts): void {
  if (typeof window === "undefined" || !problemId) return;
  try {
    localStorage.setItem(`${PROBLEM_DRAFTS_PREFIX}${problemId}`, JSON.stringify(drafts));
  } catch {
    // quota or storage blocked
  }
}

function getStoredDraft(problemId: string, lang: string, fallback: string): string {
  if (typeof window === "undefined" || !problemId) return fallback;
  try {
    const dict = getProblemDrafts(problemId);
    if (dict[lang] && typeof dict[lang].code === "string") {
      return dict[lang].code;
    }
    const legacy = localStorage.getItem(`${LEGACY_DRAFT_PREFIX}${problemId}_${lang}`);
    return legacy !== null ? legacy : fallback;
  } catch {
    return fallback;
  }
}

function setStoredDraft(problemId: string, lang: string, code: string, isDirty: boolean): void {
  if (typeof window === "undefined" || !problemId) return;
  try {
    const dict = getProblemDrafts(problemId);
    dict[lang] = {
      code,
      updatedAt: Date.now(),
      isDirty,
    };
    saveProblemDrafts(problemId, dict);
    localStorage.setItem(`${LEGACY_DRAFT_PREFIX}${problemId}_${lang}`, code);
  } catch {
    // quota or storage blocked
  }
}

function clearStoredDraft(problemId: string, lang: string): void {
  if (typeof window === "undefined" || !problemId) return;
  try {
    const dict = getProblemDrafts(problemId);
    delete dict[lang];
    saveProblemDrafts(problemId, dict);
    localStorage.removeItem(`${LEGACY_DRAFT_PREFIX}${problemId}_${lang}`);
  } catch {
    // ignore
  }
}

export type DraftStatus = "clean" | "saving" | "saved";

export function useCodingProblem(activity: CodingActivityDescriptor, apiBaseUrl: string) {
  const config = activity.config || {};
  const problemId = String(config.problem_id || "");

  const starterCodeMap = useMemo(() => {
    return {
      ...DEFAULT_STARTER_CODES,
      ...(config.starter_code || {}),
    };
  }, [config.starter_code]);

  const defaultLang = config.default_language && starterCodeMap[config.default_language]
    ? config.default_language
    : "python";

  const initialDraft = getStoredDraft(problemId, defaultLang, starterCodeMap[defaultLang] || "");
  const initialStarter = starterCodeMap[defaultLang] || "";
  const initialIsDirty = initialDraft.trim() !== initialStarter.trim();

  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLang);
  const [code, setCodeState] = useState<string>(initialDraft);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>(initialIsDirty ? "saved" : "clean");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(initialIsDirty ? new Date() : null);

  const [testCases, setTestCases] = useState<TestCase[]>(config.test_cases || []);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(
    config.allowed_languages || ["python", "cpp", "java", "javascript"]
  );

  // In-memory cache of drafts for active session
  const [drafts, setDrafts] = useState<Record<string, string>>(() => ({
    [defaultLang]: initialDraft,
  }));

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCode = useCallback((nextCode: string) => {
    setCodeState(nextCode);
    setDrafts((prev) => ({ ...prev, [selectedLanguage]: nextCode }));

    const starter = starterCodeMap[selectedLanguage] || "";
    const dirty = nextCode.trim() !== starter.trim();

    if (!dirty) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      clearStoredDraft(problemId, selectedLanguage);
      setDraftStatus("clean");
      return;
    }

    setDraftStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save debounced at exactly 300ms
    saveTimeoutRef.current = setTimeout(() => {
      setStoredDraft(problemId, selectedLanguage, nextCode, true);
      setDraftStatus("saved");
      setLastSavedAt(new Date());
    }, 300);
  }, [problemId, selectedLanguage, starterCodeMap]);

  // Synchronously flush draft on beforeunload if a save is pending
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draftStatus === "saving") {
        setStoredDraft(problemId, selectedLanguage, code, true);
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [draftStatus, problemId, selectedLanguage, code]);

  useEffect(() => {
    if (!problemId) return;
    const base = apiBaseUrl.replace(/\/$/, "");
    fetch(`${base}/api/v1/coding/problems/${encodeURIComponent(problemId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Unable to load coding problem");
        return res.json();
      })
      .then((problem) => {
        if (problem.allowed_languages && problem.allowed_languages.length > 0) {
          setAvailableLanguages(problem.allowed_languages);
        }
        if (problem.sample_test_cases && problem.sample_test_cases.length > 0) {
          setTestCases(
            problem.sample_test_cases.map((item: any) => ({
              id: String(item.id),
              title: item.title,
              input: item.stdin,
              expected: item.expected_output,
              explanation: item.explanation,
              is_sample: true,
            }))
          );
        }
      })
      .catch(() => {
        // Keep config fallback testcases
      });
  }, [apiBaseUrl, problemId]);

  const handleLanguageChange = (newLang: string) => {
    // 1. Immediately cancel pending timer & flush current draft
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const currentStarter = starterCodeMap[selectedLanguage] || "";
    if (code.trim() !== currentStarter.trim()) {
      setStoredDraft(problemId, selectedLanguage, code, true);
    }
    setDrafts((prev) => ({ ...prev, [selectedLanguage]: code }));

    // 2. Retrieve draft for target language
    const fallback = starterCodeMap[newLang] || "";
    const targetDraft = drafts[newLang] ?? getStoredDraft(problemId, newLang, fallback);

    setSelectedLanguage(newLang);
    setCodeState(targetDraft);
    setDrafts((prev) => ({ ...prev, [newLang]: targetDraft }));

    // 3. Update status for target language
    const targetIsDirty = targetDraft.trim() !== fallback.trim();
    setDraftStatus(targetIsDirty ? "saved" : "clean");
  };

  const handleResetCode = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const starter = starterCodeMap[selectedLanguage] || "";
    clearStoredDraft(problemId, selectedLanguage);
    setCodeState(starter);
    setDrafts((prev) => ({ ...prev, [selectedLanguage]: starter }));
    setDraftStatus("clean");
  };

  const handleSaveDraft = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const starter = starterCodeMap[selectedLanguage] || "";
    const isCodeDirty = code.trim() !== starter.trim();
    if (isCodeDirty) {
      setStoredDraft(problemId, selectedLanguage, code, true);
      setDraftStatus("saved");
      setLastSavedAt(new Date());
    } else {
      setDraftStatus("clean");
    }
  }, [problemId, selectedLanguage, code, starterCodeMap]);

  const currentStarter = starterCodeMap[selectedLanguage] || "";
  const isDirty = code.trim() !== currentStarter.trim();

  return {
    problemId,
    config,
    starterCodeMap,
    starterCode: currentStarter,
    selectedLanguage,
    setSelectedLanguage: handleLanguageChange,
    code,
    setCode,
    isDirty,
    draftStatus,
    lastSavedAt,
    testCases,
    setTestCases,
    availableLanguages,
    handleResetCode,
    handleSaveDraft,
  };
}


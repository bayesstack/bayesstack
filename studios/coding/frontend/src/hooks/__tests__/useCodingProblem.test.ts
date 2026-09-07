import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCodingProblem } from "../useCodingProblem";
import type { CodingActivityDescriptor } from "../../types";

describe("useCodingProblem Code Persistence & Draft Management", () => {
  const mockActivity: CodingActivityDescriptor = {
    id: "act-1",
    activity_type: "coding",
    activity_version: "1.0",
    config: {
      problem_id: "knapsack-01",
      default_language: "python",
      allowed_languages: ["python", "cpp", "javascript"],
      starter_code: {
        python: "def solve():\n    pass",
        cpp: "int main() {\n    return 0;\n}",
        javascript: "function solve() {}",
      },
    },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("initializes with clean starter code when no draft exists", () => {
    const { result } = renderHook(() => useCodingProblem(mockActivity, "http://localhost:8000"));

    expect(result.current.selectedLanguage).toBe("python");
    expect(result.current.code).toBe("def solve():\n    pass");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.draftStatus).toBe("clean");
  });

  it("loads existing persistent draft from localStorage on initial mount", () => {
    localStorage.setItem("bs_cs_draft_knapsack-01_python", "def solve():\n    # My saved draft\n    return 42");

    const { result } = renderHook(() => useCodingProblem(mockActivity, "http://localhost:8000"));

    expect(result.current.code).toBe("def solve():\n    # My saved draft\n    return 42");
    expect(result.current.isDirty).toBe(true);
    expect(result.current.draftStatus).toBe("saved");
  });

  it("tracks unsaved changes in draftStatus and debounces persistence to localStorage", () => {
    const { result } = renderHook(() => useCodingProblem(mockActivity, "http://localhost:8000"));

    act(() => {
      result.current.setCode("def solve():\n    dp = [0] * 10");
    });

    // Immediately marks as dirty and saving
    expect(result.current.isDirty).toBe(true);
    expect(result.current.draftStatus).toBe("saving");
    // Not yet flushed to localStorage before debounce timer
    expect(localStorage.getItem("bs_cs_draft_knapsack-01_python")).toBeNull();

    // Fast-forward debounce timer (350ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.draftStatus).toBe("saved");
    expect(localStorage.getItem("bs_cs_draft_knapsack-01_python")).toBe("def solve():\n    dp = [0] * 10");
  });

  it("prevents data loss when switching languages and restores drafts faithfully", () => {
    const { result } = renderHook(() => useCodingProblem(mockActivity, "http://localhost:8000"));

    // 1. User writes code in Python
    act(() => {
      result.current.setCode("def solve():\n    # Python solution in progress");
    });

    // 2. User switches to C++ before debounce timer expires
    act(() => {
      result.current.setSelectedLanguage("cpp");
    });

    // Python code must be immediately flushed to persistent storage!
    expect(localStorage.getItem("bs_cs_draft_knapsack-01_python")).toBe("def solve():\n    # Python solution in progress");

    // C++ starts with its starter code
    expect(result.current.selectedLanguage).toBe("cpp");
    expect(result.current.code).toBe("int main() {\n    return 0;\n}");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.draftStatus).toBe("clean");

    // 3. User edits C++ code
    act(() => {
      result.current.setCode("int main() {\n    vector<int> dp;\n    return 0;\n}");
      vi.advanceTimersByTime(350);
    });
    expect(localStorage.getItem("bs_cs_draft_knapsack-01_cpp")).toContain("vector<int> dp;");

    // 4. User switches back to Python
    act(() => {
      result.current.setSelectedLanguage("python");
    });

    // ZERO DATA LOSS: Python code is restored exactly as left!
    expect(result.current.selectedLanguage).toBe("python");
    expect(result.current.code).toBe("def solve():\n    # Python solution in progress");
    expect(result.current.isDirty).toBe(true);
    expect(result.current.draftStatus).toBe("saved");
  });

  it("resets active language draft to starter code and removes item from localStorage", () => {
    const { result } = renderHook(() => useCodingProblem(mockActivity, "http://localhost:8000"));

    act(() => {
      result.current.setCode("def solve():\n    # Broken code");
      vi.advanceTimersByTime(350);
    });

    expect(localStorage.getItem("bs_cs_draft_knapsack-01_python")).toBe("def solve():\n    # Broken code");

    // Trigger Reset Starter
    act(() => {
      result.current.handleResetCode();
    });

    expect(result.current.code).toBe("def solve():\n    pass");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.draftStatus).toBe("clean");
    expect(localStorage.getItem("bs_cs_draft_knapsack-01_python")).toBeNull();
  });
});

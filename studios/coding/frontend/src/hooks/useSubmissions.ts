import { useState, useEffect, useCallback } from "react";
import type { SubmissionRecord } from "../types";

export function useSubmissions(problemId: string, apiBaseUrl: string) {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!problemId) return;
    setLoading(true);
    const base = apiBaseUrl.replace(/\/$/, "");
    try {
      const res = await fetch(`${base}/api/v1/coding/problems/${encodeURIComponent(problemId)}/submissions`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch {
      // Offline or unauthenticated fallback
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, problemId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const addSubmission = (newSub: SubmissionRecord) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  return {
    submissions,
    loading,
    selectedSubmission,
    setSelectedSubmission,
    fetchSubmissions,
    addSubmission,
  };
}

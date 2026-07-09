export type V1CompletenessChoice = "unknown" | "incomplete" | "complete";

export type V1CandidateChoice = "unknown" | "insufficient" | "ready";

export type V1TaskChoice = "unknown" | "not_ready" | "ready";

export type V1FlowOutput =
  | "waiting"
  | "needs_human_review"
  | "cannot_process"
  | "candidate_result"
  | "candidate_task";

export type V1DecisionLog = {
  id: string;
  recordId: string;
  sourceType: string;
  reviewer: string;
  flowOutput: V1FlowOutput;
  reason: string;
  createdAt: string;
};

export type V1FlowDraft = {
  recordId: string;
  sourceCompleteness: V1CompletenessChoice;
  candidateReadiness: V1CandidateChoice;
  taskReadiness: V1TaskChoice;
  candidateSummary: string;
  taskSummary: string;
  reviewer: string;
  reason: string;
  logs: V1DecisionLog[];
};

export type V1FlowState = {
  output: V1FlowOutput;
  activeStep: "source_check" | "candidate_check" | "task_check" | "log";
  label: string;
  description: string;
  needsHumanReview: boolean;
};

export function createInitialV1FlowDraft(recordId: string): V1FlowDraft {
  return {
    recordId,
    sourceCompleteness: "unknown",
    candidateReadiness: "unknown",
    taskReadiness: "unknown",
    candidateSummary: "",
    taskSummary: "",
    reviewer: "資訊整理者",
    reason: "",
    logs: [],
  };
}

export function normalizeV1FlowDraft(draft: V1FlowDraft): V1FlowDraft {
  if (draft.sourceCompleteness !== "complete") {
    return {
      ...draft,
      candidateReadiness: "unknown",
      taskReadiness: "unknown",
      candidateSummary: "",
      taskSummary: "",
    };
  }

  if (draft.candidateReadiness !== "ready") {
    return {
      ...draft,
      taskReadiness: "unknown",
      candidateSummary:
        draft.candidateReadiness === "insufficient"
          ? ""
          : draft.candidateSummary,
      taskSummary: "",
    };
  }

  if (draft.taskReadiness !== "ready") {
    return {
      ...draft,
      taskSummary: "",
    };
  }

  return draft;
}

export function getV1FlowState(draft: V1FlowDraft): V1FlowState {
  if (draft.sourceCompleteness === "unknown") {
    return {
      output: "waiting",
      activeStep: "source_check",
      label: "等待檢查來源與內容",
      description: "先看原文、資訊取得方式與查核狀態，再決定能否進下一步。",
      needsHumanReview: true,
    };
  }

  if (draft.sourceCompleteness === "incomplete") {
    return {
      output: "needs_human_review",
      activeStep: "log",
      label: "需要人工確認",
      description: "來源或內容不足，不能建立候選結果。",
      needsHumanReview: true,
    };
  }

  if (draft.candidateReadiness === "unknown") {
    return {
      output: "waiting",
      activeStep: "candidate_check",
      label: "等待判斷候選結果",
      description: "資訊欄位看起來可檢查，但尚未判斷是否足以形成候選結果。",
      needsHumanReview: true,
    };
  }

  if (draft.candidateReadiness === "insufficient") {
    return {
      output: "cannot_process",
      activeStep: "log",
      label: "不能直接處理",
      description: "資訊可能誤導後續行動，先保留理由，不強迫轉成候選結果。",
      needsHumanReview: true,
    };
  }

  if (draft.taskReadiness === "ready") {
    return {
      output: "candidate_task",
      activeStep: "log",
      label: "候選任務（待確認）",
      description: "只能建立待確認候選任務，不能顯示成已派工或已確認。",
      needsHumanReview: true,
    };
  }

  return {
    output: "candidate_result",
    activeStep: draft.taskReadiness === "unknown" ? "task_check" : "log",
    label: "候選結果（仍需人工確認）",
    description: "可以形成候選結果，但仍不能當成確認事實或正式任務。",
    needsHumanReview: true,
  };
}

export function labelForV1Output(output: V1FlowOutput): string {
  const labels: Record<V1FlowOutput, string> = {
    waiting: "等待人工判斷",
    needs_human_review: "需要人工確認",
    cannot_process: "不能直接處理",
    candidate_result: "候選結果（仍需人工確認）",
    candidate_task: "候選任務（待確認）",
  };

  return labels[output];
}

import { describe, expect, it } from "vitest";
import {
  createInitialV1FlowDraft,
  getV1FlowState,
  normalizeV1FlowDraft,
} from "../src/features/v1/v1-flow";

describe("v1 flow", () => {
  it("starts every record as waiting for human judgement", () => {
    const draft = createInitialV1FlowDraft("M-001");
    const state = getV1FlowState(draft);

    expect(state.output).toBe("waiting");
    expect(state.needsHumanReview).toBe(true);
  });

  it("routes incomplete raw information to human review", () => {
    const draft = {
      ...createInitialV1FlowDraft("M-001"),
      sourceCompleteness: "incomplete" as const,
      reason: "缺少完整地點",
    };

    expect(getV1FlowState(draft).output).toBe("needs_human_review");
  });

  it("keeps candidate tasks as pending confirmation", () => {
    const draft = {
      ...createInitialV1FlowDraft("M-001"),
      sourceCompleteness: "complete" as const,
      candidateReadiness: "ready" as const,
      taskReadiness: "ready" as const,
      candidateSummary: "候選結果",
      taskSummary: "候選任務",
    };

    const state = getV1FlowState(draft);

    expect(state.output).toBe("candidate_task");
    expect(state.label).toBe("候選任務（待確認）");
    expect(state.needsHumanReview).toBe(true);
  });

  it("clears downstream choices when source is no longer complete", () => {
    const draft = normalizeV1FlowDraft({
      ...createInitialV1FlowDraft("M-001"),
      sourceCompleteness: "incomplete",
      candidateReadiness: "ready",
      taskReadiness: "ready",
      candidateSummary: "應該清除",
      taskSummary: "也應該清除",
    });

    expect(draft.candidateReadiness).toBe("unknown");
    expect(draft.taskReadiness).toBe("unknown");
    expect(draft.candidateSummary).toBe("");
    expect(draft.taskSummary).toBe("");
  });
});

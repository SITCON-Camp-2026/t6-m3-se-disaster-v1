import { useMemo, useState } from "react";
import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord } from "../phase-0/phase0-types";
import {
  createInitialV1FlowDraft,
  getV1FlowState,
  labelForV1Output,
  normalizeV1FlowDraft,
  type V1CandidateChoice,
  type V1CompletenessChoice,
  type V1DecisionLog,
  type V1FlowDraft,
  type V1FlowOutput,
  type V1TaskChoice,
} from "./v1-flow";

type DraftsByRecordId = Record<string, V1FlowDraft>;

const sourceChoices: Array<{
  value: V1CompletenessChoice;
  label: string;
}> = [
  { value: "unknown", label: "尚未判斷" },
  { value: "incomplete", label: "不完整，需要人工確認" },
  { value: "complete", label: "完整，可進下一步" },
];

const candidateChoices: Array<{
  value: V1CandidateChoice;
  label: string;
}> = [
  { value: "unknown", label: "尚未判斷" },
  { value: "insufficient", label: "不足，不能直接處理" },
  { value: "ready", label: "足以建立候選結果（待確認）" },
];

const taskChoices: Array<{
  value: V1TaskChoice;
  label: string;
}> = [
  { value: "unknown", label: "尚未判斷" },
  { value: "not_ready", label: "不可直接轉任務" },
  { value: "ready", label: "可建立候選任務（待確認）" },
];

const flowSteps = [
  "原始資訊進入",
  "檢查來源與內容",
  "形成候選結果",
  "判斷能否轉任務",
  "留下判斷紀錄",
];

function createDrafts(records: Phase0MessyRecord[]): DraftsByRecordId {
  return Object.fromEntries(
    records.map((record) => [record.id, createInitialV1FlowDraft(record.id)]),
  );
}

function buildDecisionLog({
  draft,
  record,
  output,
}: {
  draft: V1FlowDraft;
  record: Phase0MessyRecord;
  output: V1FlowOutput;
}): V1DecisionLog {
  return {
    id: `${record.id}-${Date.now()}`,
    recordId: record.id,
    sourceType: record.sourceType,
    reviewer: draft.reviewer.trim() || "資訊整理者",
    flowOutput: output,
    reason: draft.reason.trim(),
    createdAt: new Date().toISOString(),
  };
}

export function V1FlowWorkbench({
  records,
  onBackHome,
}: {
  records: Phase0MessyRecord[];
  onBackHome: () => void;
}) {
  const [selectedRecordId, setSelectedRecordId] = useState(
    records[0]?.id ?? "",
  );
  const [drafts, setDrafts] = useState<DraftsByRecordId>(() =>
    createDrafts(records),
  );

  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];
  const selectedDraft = selectedRecord
    ? (drafts[selectedRecord.id] ?? createInitialV1FlowDraft(selectedRecord.id))
    : null;
  const selectedState = selectedDraft ? getV1FlowState(selectedDraft) : null;

  const outputs = useMemo(
    () =>
      records.map((record) => {
        const draft = drafts[record.id] ?? createInitialV1FlowDraft(record.id);
        return {
          record,
          draft,
          state: getV1FlowState(draft),
        };
      }),
    [drafts, records],
  );

  const outputCounts = outputs.reduce(
    (counts, item) => {
      counts[item.state.output] += 1;
      return counts;
    },
    {
      waiting: 0,
      needs_human_review: 0,
      cannot_process: 0,
      candidate_result: 0,
      candidate_task: 0,
    } satisfies Record<V1FlowOutput, number>,
  );

  const allLogs = outputs
    .flatMap((item) => item.draft.logs)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function updateSelectedDraft(patch: Partial<V1FlowDraft>) {
    if (!selectedRecord || !selectedDraft) return;

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedRecord.id]: normalizeV1FlowDraft({
        ...selectedDraft,
        ...patch,
      }),
    }));
  }

  function resetSelectedDraft() {
    if (!selectedRecord) return;

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedRecord.id]: createInitialV1FlowDraft(selectedRecord.id),
    }));
  }

  function appendDecisionLog() {
    if (!selectedRecord || !selectedDraft || !selectedState) return;
    if (
      selectedState.output === "waiting" ||
      selectedDraft.reason.trim() === ""
    )
      return;

    const nextLog = buildDecisionLog({
      draft: selectedDraft,
      record: selectedRecord,
      output: selectedState.output,
    });

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedRecord.id]: {
        ...selectedDraft,
        logs: [nextLog, ...selectedDraft.logs],
      },
    }));
  }

  if (!selectedRecord || !selectedDraft || !selectedState) {
    return (
      <main className="layout v1-page">
        <button className="text-link" type="button" onClick={onBackHome}>
          回到首頁
        </button>
        <section className="v1-empty">
          目前沒有 Phase 0 原始資訊可整理。
        </section>
      </main>
    );
  }

  return (
    <main className="layout v1-page">
      <header className="v1-hero">
        <div>
          <p className="eyebrow">v1 / 依流程圖實作</p>
          <h1>資訊流程工作台</h1>
          <p>
            資料仍來自 Phase 0
            原始資訊；這裡只做人工判斷流程，不新增後端、資料庫、外部 API、地圖或
            runtime LLM。
          </p>
        </div>
        <button className="text-link" type="button" onClick={onBackHome}>
          回到 Phase 0 首頁
        </button>
      </header>

      <section className="v1-flow-strip" aria-label="流程圖步驟">
        {flowSteps.map((step, index) => (
          <div key={step} className="v1-flow-strip__step">
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </section>

      <section className="v1-summary" aria-label="目前流程輸出統計">
        <FlowCount label="等待人工判斷" count={outputCounts.waiting} />
        <FlowCount
          label="需要人工確認"
          count={outputCounts.needs_human_review}
        />
        <FlowCount label="不能直接處理" count={outputCounts.cannot_process} />
        <FlowCount
          label="候選結果（仍需確認）"
          count={outputCounts.candidate_result}
        />
        <FlowCount
          label="候選任務（待確認）"
          count={outputCounts.candidate_task}
        />
      </section>

      <div className="v1-layout">
        <aside className="v1-queue" aria-label="原始資訊清單">
          <div className="v1-section-title">
            <h2>原始資訊</h2>
            <span>{records.length} 筆</span>
          </div>
          {outputs.map(({ record, state }) => (
            <button
              key={record.id}
              className={record.id === selectedRecord.id ? "active" : ""}
              type="button"
              onClick={() => setSelectedRecordId(record.id)}
            >
              <span>{record.id}</span>
              <small>{labelForV1Output(state.output)}</small>
            </button>
          ))}
        </aside>

        <section className="v1-review-panel" aria-label="人工判斷表單">
          <div className="v1-section-title">
            <div>
              <p className="eyebrow">目前處理</p>
              <h2>{selectedRecord.id}</h2>
            </div>
            <span className={`v1-output v1-output--${selectedState.output}`}>
              {selectedState.label}
            </span>
          </div>

          <article className="v1-raw-card">
            <p>{selectedRecord.rawText}</p>
            <div className="record-card__meta">
              <SourceLabel sourceType={selectedRecord.sourceType} />
              <StatusBadge status={selectedRecord.verificationStatus} />
              <span>更新：{formatDateTime(selectedRecord.updatedAt)}</span>
            </div>
            <p className="v1-note">
              資訊取得方式只代表資料怎麼進來；查核狀態必須另外看，不能因來源名稱就視為已確認。
            </p>
          </article>

          <div className="v1-decision-steps">
            <DecisionStep
              title="1. 檢查來源與內容是否完整"
              description="完整只代表能進下一步整理，不代表資訊已被查證。"
              choices={sourceChoices}
              value={selectedDraft.sourceCompleteness}
              onChange={(value) =>
                updateSelectedDraft({ sourceCompleteness: value })
              }
            />

            <DecisionStep
              title="2. 是否足以形成候選結果"
              description="如果資訊可能誤導行動者，請先標示不能直接處理。"
              choices={candidateChoices}
              value={selectedDraft.candidateReadiness}
              disabled={selectedDraft.sourceCompleteness !== "complete"}
              onChange={(value) =>
                updateSelectedDraft({ candidateReadiness: value })
              }
            />

            <label className="v1-field">
              <span>候選結果摘要</span>
              <textarea
                value={selectedDraft.candidateSummary}
                disabled={selectedDraft.candidateReadiness !== "ready"}
                onChange={(event) =>
                  updateSelectedDraft({ candidateSummary: event.target.value })
                }
                placeholder="只寫原文支持的候選結果；不補真實地址、人物、電話或外部資訊。"
              />
            </label>

            <DecisionStep
              title="3. 是否可直接轉成候選任務"
              description="即使可以轉，也只能是候選任務（待確認），不是正式派工。"
              choices={taskChoices}
              value={selectedDraft.taskReadiness}
              disabled={selectedDraft.candidateReadiness !== "ready"}
              onChange={(value) =>
                updateSelectedDraft({ taskReadiness: value })
              }
            />

            <label className="v1-field">
              <span>候選任務摘要</span>
              <textarea
                value={selectedDraft.taskSummary}
                disabled={selectedDraft.taskReadiness !== "ready"}
                onChange={(event) =>
                  updateSelectedDraft({ taskSummary: event.target.value })
                }
                placeholder="只描述待確認任務草稿，不寫成已確認或已指派。"
              />
            </label>

            <div className="v1-log-form">
              <label className="v1-field">
                <span>判斷者</span>
                <input
                  value={selectedDraft.reviewer}
                  onChange={(event) =>
                    updateSelectedDraft({ reviewer: event.target.value })
                  }
                />
              </label>

              <label className="v1-field">
                <span>判斷理由</span>
                <textarea
                  value={selectedDraft.reason}
                  onChange={(event) =>
                    updateSelectedDraft({ reason: event.target.value })
                  }
                  placeholder="留下為什麼需要人工確認、不能直接處理，或只能建立待確認候選項目。"
                />
              </label>

              <div className="v1-actions">
                <button
                  type="button"
                  onClick={appendDecisionLog}
                  disabled={
                    selectedState.output === "waiting" ||
                    selectedDraft.reason.trim() === ""
                  }
                >
                  留下人工判斷紀錄
                </button>
                <button type="button" onClick={resetSelectedDraft}>
                  重設此筆
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="v1-output-panel" aria-label="流程輸出與判斷紀錄">
          <section>
            <div className="v1-section-title">
              <h2>流程輸出</h2>
            </div>
            <p>{selectedState.description}</p>
            <ul className="v1-output-list">
              {outputs
                .filter((item) => item.state.output !== "waiting")
                .map((item) => (
                  <li key={item.record.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRecordId(item.record.id)}
                    >
                      <span>{item.record.id}</span>
                      <small>{item.state.label}</small>
                    </button>
                  </li>
                ))}
            </ul>
          </section>

          <section>
            <div className="v1-section-title">
              <h2>人工判斷紀錄</h2>
              <span>{allLogs.length} 筆</span>
            </div>
            {allLogs.length === 0 ? (
              <p className="v1-note">
                還沒有紀錄。請先完成一個分支判斷，並補上判斷理由。
              </p>
            ) : (
              <ol className="v1-log-list">
                {allLogs.map((log) => (
                  <li key={log.id}>
                    <strong>
                      {log.recordId} · {labelForV1Output(log.flowOutput)}
                    </strong>
                    <span>
                      {log.reviewer} / {formatDateTime(log.createdAt)}
                    </span>
                    <p>{log.reason}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

function FlowCount({ label, count }: { label: string; count: number }) {
  return (
    <article>
      <strong>{count}</strong>
      <span>{label}</span>
    </article>
  );
}

function DecisionStep<TChoice extends string>({
  title,
  description,
  choices,
  value,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  choices: Array<{ value: TChoice; label: string }>;
  value: TChoice;
  disabled?: boolean;
  onChange: (value: TChoice) => void;
}) {
  return (
    <section className="v1-decision-step">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="v1-segmented">
        {choices.map((choice) => (
          <button
            key={choice.value}
            className={value === choice.value ? "active" : ""}
            type="button"
            disabled={disabled}
            onClick={() => onChange(choice.value)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}

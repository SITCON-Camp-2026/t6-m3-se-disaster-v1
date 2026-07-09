import { useState } from "react";
import type {
  Phase0ManpowerCategory,
  Phase0ManpowerNeed,
} from "./phase0-types";

export function Phase0ManpowerPanel({
  needs,
  selectedRecordId,
  onSelectRecord,
}: {
  needs: Phase0ManpowerNeed[];
  selectedRecordId: string;
  onSelectRecord: (recordId: string) => void;
}) {
  const [expandedCategory, setExpandedCategory] =
    useState<Phase0ManpowerCategory | null>(needs[0]?.category ?? null);
  const [recentRecordId, setRecentRecordId] = useState<string | null>(null);

  function handleSelectRecord(recordId: string) {
    setRecentRecordId(recordId);
    onSelectRecord(recordId);
  }

  return (
    <section className="manpower-panel" aria-labelledby="manpower-title">
      <div className="manpower-panel__header">
        <div>
          <p className="eyebrow">候選分類</p>
          <h3 id="manpower-title">人力需求分類</h3>
        </div>
        <span>全部待人工確認</span>
      </div>

      <p>
        這裡只依原文關鍵字做保守分類，協助小組討論可能需要哪種人力；它不是已確認任務，也不能直接派工。
      </p>

      <div className="manpower-panel__list">
        {needs.map((need) => (
          <article
            className={`manpower-need ${
              expandedCategory === need.category ? "is-expanded" : ""
            }`}
            key={need.category}
          >
            <div className="manpower-need__top">
              <h4>{need.label}</h4>
              <strong>{need.recordIds.length} 筆</strong>
            </div>

            <div className="manpower-need__records">
              {need.recordIds.map((recordId) => (
                <button
                  className={`${recordId === selectedRecordId ? "is-active" : ""} ${
                    recordId === recentRecordId ? "is-recent" : ""
                  }`}
                  key={recordId}
                  type="button"
                  onClick={() => handleSelectRecord(recordId)}
                >
                  {recordId}
                </button>
              ))}
            </div>

            <button
              className="manpower-need__toggle"
              type="button"
              aria-expanded={expandedCategory === need.category}
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === need.category ? null : need.category,
                )
              }
            >
              {expandedCategory === need.category
                ? "收合確認問題"
                : "查看確認問題"}
            </button>

            <div className="manpower-need__details">
              <ul>
                {need.reviewQuestions.slice(0, 3).map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>

            <p className="manpower-need__warning">不能直接變成志工任務</p>
          </article>
        ))}
      </div>
    </section>
  );
}

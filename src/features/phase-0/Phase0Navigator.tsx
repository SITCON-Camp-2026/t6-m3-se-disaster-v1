import {
  getPhase0DataQualityTags,
  type Phase0DataQualityTag,
} from "./phase0-heuristics";
import type { Phase0MessyRecord } from "./phase0-types";

const tagConfig: Record<
  Phase0DataQualityTag,
  { label: string; description: string; color: string }
> = {
  relatively_usable: {
    label: "可相對使用",
    description: "資訊清晰，有時間戳和具體數字",
    color: "var(--morandi-sage-deep)",
  },
  cannot_dispatch: {
    label: "不能直接派人",
    description: "缺少關鍵資訊（地址、確認人、原因等）",
    color: "var(--morandi-danger-text)",
  },
  operator_not_subject: {
    label: "操作者不是當事人",
    description: "第三方轉述，缺少當事人確認",
    color: "var(--morandi-clay)",
  },
  conflicting_info: {
    label: "資訊互相矛盾",
    description: "多筆資訊內容不一致，需要確認",
    color: "var(--morandi-mauve-deep)",
  },
  outdated: {
    label: "可能已過時",
    description: "時效性資訊，需要更新驗證",
    color: "var(--morandi-line)",
  },
};

export function Phase0Navigator({
  records,
  selectedRecordId,
  onSelect,
  onFilterChange,
  activeFilter,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
  onFilterChange: (tag: Phase0DataQualityTag | null) => void;
  activeFilter: Phase0DataQualityTag | null;
}) {
  // 計算每個分類的資訊
  const tagCounts: Record<Phase0DataQualityTag, string[]> = {
    relatively_usable: [],
    cannot_dispatch: [],
    operator_not_subject: [],
    conflicting_info: [],
    outdated: [],
  };

  records.forEach((record) => {
    const tags = getPhase0DataQualityTags(record.id);
    tags.forEach((tag) => {
      if (!tagCounts[tag].includes(record.id)) {
        tagCounts[tag].push(record.id);
      }
    });
  });

  // 篩選顯示的資訊
  const filteredRecords = activeFilter
    ? records.filter((record) =>
        getPhase0DataQualityTags(record.id).includes(activeFilter),
      )
    : records;

  const allTags: Phase0DataQualityTag[] = [
    "relatively_usable",
    "cannot_dispatch",
    "operator_not_subject",
    "conflicting_info",
    "outdated",
  ];

  return (
    <nav className="phase0-navigator">
      <div className="phase0-navigator__header">
        <h3>資料品質分類</h3>
        <p>
          顯示：{filteredRecords.length} / {records.length} 筆
        </p>
      </div>

      <div className="phase0-navigator__filters">
        <button
          className={`phase0-navigator__filter-button ${activeFilter === null ? "active" : ""}`}
          type="button"
          onClick={() => onFilterChange(null)}
        >
          全部 ({records.length})
        </button>
        {allTags.map((tag) => {
          const count = tagCounts[tag].length;
          if (count === 0) return null;

          return (
            <button
              key={tag}
              className={`phase0-navigator__filter-button ${activeFilter === tag ? "active" : ""}`}
              type="button"
              onClick={() => onFilterChange(activeFilter === tag ? null : tag)}
              title={tagConfig[tag].description}
              style={
                activeFilter === tag
                  ? {
                      backgroundColor: tagConfig[tag].color,
                      color: "var(--morandi-surface)",
                    }
                  : {
                      borderColor: tagConfig[tag].color,
                      color: tagConfig[tag].color,
                    }
              }
            >
              {tagConfig[tag].label} ({count})
            </button>
          );
        })}
      </div>

      <div className="phase0-navigator__queue">
        <p className="phase0-navigator__queue-label">
          {activeFilter
            ? `選擇「${tagConfig[activeFilter].label}」的資訊：`
            : "選擇資訊："}
        </p>
        <div className="phase0-navigator__queue-items">
          {filteredRecords.map((record) => {
            const tags = getPhase0DataQualityTags(record.id);
            const isSelected = record.id === selectedRecordId;

            return (
              <button
                key={record.id}
                className={`phase0-navigator__item ${isSelected ? "active" : ""}`}
                type="button"
                onClick={() => onSelect(record.id)}
                title={
                  tags.length > 0
                    ? `標籤：${tags.map((t) => tagConfig[t].label).join("、")}`
                    : undefined
                }
              >
                <span className="phase0-navigator__item-id">{record.id}</span>
                <span className="phase0-navigator__item-status">
                  {record.verificationStatus === "needs_review"
                    ? "待確認"
                    : "未查核"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

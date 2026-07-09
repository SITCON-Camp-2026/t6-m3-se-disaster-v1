import type {
  Phase0JudgementDraft,
  Phase0ManpowerCategory,
  Phase0ManpowerNeed,
  Phase0MessyRecord,
} from "./phase0-types";

export type Phase0DataQualityTag =
  | "relatively_usable" // 可相對使用
  | "cannot_dispatch" // 不能直接派人
  | "operator_not_subject" // 操作者不是當事人
  | "conflicting_info" // 資訊互相矛盾
  | "outdated"; // 可能已過時;

// ponytail: this is a safety-boundary scaffold, not an answer engine.
export function createPhase0Judgement(
  record: Phase0MessyRecord,
): Phase0JudgementDraft {
  const isVerified = record.verificationStatus === "verified";

  return {
    messyRecordId: record.id,
    possibleKind: "unknown",
    confidence: "low",
    evidence: ["尚未建立整理草稿：請由小組從原文標出判斷依據。"],
    blockers: isVerified
      ? ["仍需確認這筆資訊適合進入哪個後續流程。"]
      : ["目前不是已確認資訊，不能直接行動或當成事實發布。"],
    suggestedNextStep: isVerified ? "keep_raw" : "send_to_human_review",
    unsafeToActDirectly: true,
  };
}

// 根據資訊 ID 標記資料品質問題
export function getPhase0DataQualityTags(
  recordId: string,
): Phase0DataQualityTag[] {
  const tags: Phase0DataQualityTag[] = [];

  // 可相對使用的
  if (recordId === "M-009" || recordId === "M-010") {
    tags.push("relatively_usable");
  }

  // 不能直接派人的
  if (
    recordId === "M-001" ||
    recordId === "M-002" ||
    recordId === "M-004" ||
    recordId === "M-005" ||
    recordId === "M-006" ||
    recordId === "M-008" ||
    recordId === "M-012"
  ) {
    tags.push("cannot_dispatch");
  }

  // 操作者不是當事人
  if (recordId === "M-011" || recordId === "M-012") {
    tags.push("operator_not_subject");
  }

  // 資訊互相矛盾
  if (recordId === "M-002" || recordId === "M-004" || recordId === "M-006") {
    tags.push("conflicting_info");
  }

  // 可能已過時
  if (recordId === "M-002" || recordId === "M-003" || recordId === "M-007") {
    tags.push("outdated");
  }

  return tags;
}

const manpowerCategoryLabels: Record<Phase0ManpowerCategory, string> = {
  cleanup_support: "清泥 / 清淤人力",
  electrical_support: "水電專業人力",
  moving_support: "搬運協助人力",
  field_confirmation: "現場確認 / 查核人力",
  non_manpower_or_unclear: "不是明確人力需求",
};

function classifyManpowerCategories(
  record: Phase0MessyRecord,
): Phase0ManpowerCategory[] {
  const text = record.rawText;
  const categories: Phase0ManpowerCategory[] = [];

  if (text.includes("清泥") || text.includes("清淤")) {
    categories.push("cleanup_support");
  }

  if (text.includes("水電")) {
    categories.push("electrical_support");
  }

  if (text.includes("搬動") || text.includes("大型家具")) {
    categories.push("moving_support");
  }

  if (
    text.includes("協助確認") ||
    text.includes("無法確認") ||
    text.includes("尚未確認")
  ) {
    categories.push("field_confirmation");
  }

  return categories.length > 0 ? categories : ["non_manpower_or_unclear"];
}

function getManpowerReviewQuestions(
  record: Phase0MessyRecord,
  category: Phase0ManpowerCategory,
): string[] {
  const questions = ["這筆資訊仍是原始資訊，必須先確認來源、時間與目前狀態。"];

  if (record.verificationStatus !== "verified") {
    questions.push("查核狀態不是已確認，不能直接派工。");
  }

  if (category === "cleanup_support") {
    questions.push("需要確認可到達地點、實際人數、工具與安全狀況。");
  }

  if (category === "electrical_support") {
    questions.push("需要確認是否真的需要水電專業，以及是否有安全風險。");
  }

  if (category === "moving_support") {
    questions.push("需要確認當事人同意、完整地點與大型家具搬動風險。");
  }

  if (category === "field_confirmation") {
    questions.push("這比較像確認工作，尚不能直接變成救災或志工任務。");
  }

  if (category === "non_manpower_or_unclear") {
    questions.push("原文比較像物資、公告或地點狀態，未明確提出人力需求。");
  }

  return questions;
}

export function getPhase0ManpowerNeeds(
  records: Phase0MessyRecord[],
): Phase0ManpowerNeed[] {
  const needsByCategory = new Map<Phase0ManpowerCategory, Phase0ManpowerNeed>();

  records.forEach((record) => {
    classifyManpowerCategories(record).forEach((category) => {
      const current = needsByCategory.get(category) ?? {
        category,
        label: manpowerCategoryLabels[category],
        recordIds: [],
        reviewQuestions: [],
        unsafeToDispatch: true,
      };

      current.recordIds.push(record.id);
      current.reviewQuestions = Array.from(
        new Set([
          ...current.reviewQuestions,
          ...getManpowerReviewQuestions(record, category),
        ]),
      );
      needsByCategory.set(category, current);
    });
  });

  return Array.from(needsByCategory.values());
}

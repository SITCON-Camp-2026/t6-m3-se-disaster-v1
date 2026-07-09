import { type MouseEvent, useEffect, useState } from "react";
import messyReports from "../fixtures/phase-0/messy-reports.json";
import { EmptyState } from "../components/EmptyState";
import { Phase0RawInfoPanel } from "../features/phase-0/Phase0RawInfoPanel";
import { Phase0Workbench } from "../features/phase-0/Phase0Workbench";
import type { Phase0MessyRecord } from "../features/phase-0/phase0-types";
import { ShoppingPage } from "../features/shopping/ShoppingPage";
import { V1FlowWorkbench } from "../features/v1/V1FlowWorkbench";

type TabKey = "raw" | "workbench" | "shopping";
type AppView = "phase0" | "v1";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "raw", label: "原始資訊" },
  { key: "workbench", label: "整理工作台" },
  { key: "shopping", label: "購物頁面" },
];

const phase0Records = messyReports satisfies Phase0MessyRecord[];

function isV1Path() {
  return /\/v1\/?$/.test(window.location.pathname);
}

function appPath(view: AppView) {
  const basePath = import.meta.env.BASE_URL;

  if (view === "phase0") {
    return basePath;
  }

  return `${basePath.replace(/\/$/, "")}/v1/`;
}

export function App() {
  const [activeView, setActiveView] = useState<AppView>(() =>
    isV1Path() ? "v1" : "phase0",
  );
  const [activeTab, setActiveTab] = useState<TabKey>("raw");
  const [selectedRecordId, setSelectedRecordId] = useState(
    phase0Records[0]?.id ?? "",
  );

  useEffect(() => {
    function syncViewWithPath() {
      setActiveView(isV1Path() ? "v1" : "phase0");
    }

    window.addEventListener("popstate", syncViewWithPath);
    return () => window.removeEventListener("popstate", syncViewWithPath);
  }, []);

  function navigateToView(view: AppView) {
    window.history.pushState({}, "", appPath(view));
    setActiveView(view);
  }

  function openV1(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    navigateToView("v1");
  }

  function selectForWorkbench(recordId: string) {
    setSelectedRecordId(recordId);
    setActiveTab("workbench");
  }

  if (activeView === "v1") {
    return (
      <V1FlowWorkbench
        records={phase0Records}
        onBackHome={() => navigateToView("phase0")}
      />
    );
  }

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">SITCON Camp 2026</p>
        <h1>災害資訊整理工作台</h1>
        <p>
          第一階段先用 coding agent
          做出可展示的前端原型，再從成果中看見資料品質、角色、狀態與來源的限制。
        </p>
      </header>

      <section className="v1-entry" aria-label="v1 入口">
        <div>
          <p className="eyebrow">v1 流程實作</p>
          <h2>照流程圖整理原始資訊</h2>
          <p>
            使用同一份 Phase 0 原始資訊，練習把「需要人工確認」「不能直接處理」
            與「候選任務待確認」留在可操作流程中。
          </p>
        </div>
        <a href={appPath("v1")} onClick={openV1}>
          進入 v1 流程工作台
        </a>
      </section>

      <nav className="tabs" aria-label="第一階段工作區">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="panel">
        {phase0Records.length === 0 ? (
          <EmptyState message="目前沒有資料" />
        ) : activeTab === "raw" ? (
          <Phase0RawInfoPanel
            records={phase0Records}
            selectedRecordId={selectedRecordId}
            onSelect={selectForWorkbench}
          />
        ) : activeTab === "workbench" ? (
          <Phase0Workbench
            records={phase0Records}
            selectedRecordId={selectedRecordId}
            onSelect={setSelectedRecordId}
          />
        ) : (
          <ShoppingPage />
        )}
      </section>
    </main>
  );
}

# AI Log

這份紀錄用來留下小組如何使用 AI / Coding Agent 的操作脈絡。重點不是逐字保存所有對話，而是記錄重要協作、取捨與人類判斷。

## 什麼時候要記錄

請在以下情況更新本檔案：

- AI 協助分析原始資訊。
- AI 協助找出不能判斷處。
- AI 協助判斷哪些資訊不能直接相信。
- AI 協助判斷哪些資訊不能直接變成任務。
- AI 協助修改畫面標示或前端工作台。
- AI 可能補了原文沒有的資訊。
- AI 建議被小組拒絕，且拒絕原因和安全 / 正確性 / scope 有關
- AI 輸出可能造成誤導，例如把未確認資料寫成已確認事實

## 不需要記錄

- 不需要逐字貼完整對話
- 不需要記錄每一次小型 autocomplete
- 不需要記錄單純修 typo 或格式化

## 紀錄格式

| 時間 | 階段 | 任務 | AI / Agent 建議 | 採用 / 拒絕 | 人類判斷理由 | 相關檔案 / commit |
| ---- | ---- | ---- | --------------- | ----------- | ------------ | ----------------- |
|      |      |      |                 |             |              |                   |

## 範例

| 時間       | 階段    | 任務                   | AI / Agent 建議                                                                                                                                           | 採用 / 拒絕 | 人類判斷理由                                                                                                               | 相關檔案 / commit                                                                                                                |
| ---------- | ------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 09:45      | Phase 0 | 分析原始資訊           | 建議把社群貼文直接轉成 verified report                                                                                                                    | 拒絕        | 社群貼文來源未確認，應保持 `needs_review`                                                                                  | `docs/phase0-observations.md`                                                                                                    |
| 15:20      | Phase 0 | 分類人力需求           | 依原文關鍵字建立清泥 / 清淤、水電、搬運、現場確認等候選分類，全部標示為待人工確認                                                                         | 採用        | 分類只協助討論，不代表已確認任務；未確認資訊仍不能直接派工                                                                 | `src/features/phase-0/Phase0ManpowerPanel.tsx`, `src/features/phase-0/phase0-heuristics.ts`                                      |
| 15:35      | Phase 0 | 加上動態效果           | 為人力分類卡加入淡入、hover、點選高亮與展開確認問題互動                                                                                                   | 採用        | 動態只改善閱讀與討論流程，不改變查核狀態，也不把候選分類當成任務                                                           | `src/features/phase-0/Phase0ManpowerPanel.tsx`, `src/styles/global.css`                                                          |
| 14:25      | Phase 0 | 新增資料品質分類導覽   | 根據 12 筆原始資訊的內容缺陷，自動標籤化為 6 類；建立可篩選的動態導覽                                                                                     | 採用        | 視覺化展示資訊品質問題的分佈，幫助用戶快速看出「不能直接派人」和「操作者不是當事人」的資訊比例；不改變驗證狀態，只標示問題 | `src/features/phase-0/Phase0Navigator.tsx`, `src/features/phase-0/phase0-heuristics.ts`, `src/styles/global.css`                 |
| 14:35      | Phase 0 | 增強互動反饋效果       | 全面增強卡片、按鈕、隊列項目的懸停效果：提升陰影(4px→8px)、加入 scale 與 transform、各質量標籤的色彩匹配陰影                                              | 採用        | 更強的視覺反饋提高 UI 回應性與互動感知，幫助用戶更容易注意到不同品質等級的資訊分類；不改變資訊內容或驗證狀態               | `src/styles/global.css` (行 224-520)                                                                                             |
| 14:50      | Phase 0 | 套用漫畫風格主題       | 全面改造 CSS：粗黑邊框(3-5px)、亮色背景(奶油色+彩色卡片)、漫畫字體(Comic Sans+粗體)、誇張陰影(黑色6px)、輕微旋轉(±0.5deg)、互動效果(黃色hover/紅色active) | 採用        | 漫畫風格增加視覺吸引力與親和感，色彩對比更強幫助快速掃描資訊品質；變更純視覺，不影響資訊內容、驗證狀態或邏輯功能           | `src/styles/global.css` 全面更新、`:root` 字體改為 Comic Sans、所有元素邊框改為粗黑、背景改為奶油色、卡片顏色飽和度提高          |
| 2026-07-09 | Phase 0 | 新增購物頁面           | Agent 建議用純前端假資料商品與 React state 做篩選、加入購物車、數量調整與小計                                                                             | 採用        | 需求是展示購物頁；採用假資料與本機 state，未新增後端、外部 API、真實個資或真實商品資料，也未改變 Phase 0 原始資訊查核狀態  | `src/features/shopping/ShoppingPage.tsx`, `src/app/App.tsx`, `src/styles/global.css`, `tests/app-smoke.test.tsx`                 |
| 2026-07-09 | UI 示範 | 補齊購物商品分類       | Agent 將購物頁假資料補成文具、飲品、點心、用品各 4 項，並新增分類數量測試                                                                                 | 採用        | 商品仍是純前端假資料，沒有新增外部 API、資料庫、真實商品或個資，也不影響 Phase 0 原始資訊                                  | `src/features/shopping/ShoppingPage.tsx`, `tests/app-smoke.test.tsx`                                                             |
| 2026-07-09 | UI 示範 | 新增 3C 與付款方式     | Agent 新增 `3C` 分類 8 項示範商品，並加入 Apple Pay、Samsung Pay、LINE Pay、Google Pay 的前端選擇介面                                                     | 採用        | 3C 商品、價格、庫存與付款方式都是 UI 示範資料，未串接真實金流、外部 API、資料庫或真實商品庫存                              | `src/features/shopping/ShoppingPage.tsx`, `src/styles/global.css`, `tests/app-smoke.test.tsx`                                    |
| 2026-07-09 | v1      | 依流程圖實作工作台     | Agent 將流程圖落成 `/v1/` 前端：原始資訊進入、來源與內容完整性檢查、候選結果、候選任務待確認、人工判斷紀錄與流程輸出統計                                  | 採用        | 只使用 Phase 0 原始資訊；候選結果與候選任務都保留待確認，未把未查核資訊顯示成已確認，也未新增後端、外部 API 或 runtime LLM | `src/features/v1/V1FlowWorkbench.tsx`, `src/features/v1/v1-flow.ts`, `src/app/App.tsx`, `v1/index.html`, `tests/v1-flow.test.ts` |
| 2026-07-09 | 部署    | 修正 Pages deploy 失敗 | Agent 查 GitHub Actions 後確認 CI 與 `pnpm build` 已成功，失敗發生在 `actions/deploy-pages@v4` 建立 Pages deployment，建議補上 Pages 設定步驟             | 採用        | 這不是前端 build 錯誤；需要讓 workflow 在部署前設定 GitHub Pages，避免 deploy action 因 Pages 未啟用而回 404               | `.github/workflows/deploy-pages.yml`, `docs/ai-log.md`                                                                           |
| 2026-07-09 | UI 示範 | 補上 3C 具體型號       | Agent 將 3C 假資料商品從泛稱改成具體型號，例如 `iPhone 18 Pro`、`Samsung Galaxy S27 Ultra`、`Google Pixel 11 Pro`                                         | 採用        | 這些仍是前端示範商品名稱，不代表真實規格、庫存或售價，也沒有新增外部 API、資料庫或真實商品資料                             | `src/features/shopping/ShoppingPage.tsx`, `tests/app-smoke.test.tsx`, `docs/ai-log.md`                                           |

## 課後反思

### AI 幫助最大的地方

-

### AI 最容易誤導的地方

-

### 下次使用 AI 開發前，我們會先準備

-

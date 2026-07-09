import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
  it("renders starter title", () => {
    render(<App />);
    expect(screen.getByText("災害資訊整理工作台")).toBeInTheDocument();
  });

  it("keeps the home page focused on phase 0 tabs", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "原始資訊" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "整理工作台" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通報" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "地點" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "志工任務" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "人員指派" }),
    ).not.toBeInTheDocument();
  });

  it("shows review states in the phase 0 workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByText(
        "第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("待人工確認").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未查核").length).toBeGreaterThan(0);
  });

  it("links from home to the v1 flow workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: "進入 v1 流程工作台" }));

    expect(window.location.pathname).toBe("/v1/");
    expect(
      screen.getByRole("heading", { name: "資訊流程工作台" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/資料仍來自 Phase 0 原始資訊/)).toBeInTheDocument();
  });

  it("renders the v1 flow workbench from the direct path", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "資訊流程工作台" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("候選任務（待確認）").length).toBeGreaterThan(0);
    expect(screen.queryByText("已確認候選任務")).not.toBeInTheDocument();
  });

  it("creates only review-needed candidate task records in v1", () => {
    window.history.pushState({}, "", "/v1/");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "完整，可進下一步" }));
    fireEvent.click(
      screen.getByRole("button", { name: "足以建立候選結果（待確認）" }),
    );
    fireEvent.change(screen.getByLabelText("候選結果摘要"), {
      target: { value: "依原文建立的候選結果草稿" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "可建立候選任務（待確認）" }),
    );
    fireEvent.change(screen.getByLabelText("候選任務摘要"), {
      target: { value: "待人工確認的候選任務草稿" },
    });
    fireEvent.change(screen.getByLabelText("判斷理由"), {
      target: {
        value: "仍缺少完整地點與現場安全確認，所以只能先留待確認紀錄。",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "留下人工判斷紀錄" }));

    expect(screen.getByText(/M-001 · 候選任務（待確認）/)).toBeInTheDocument();
    expect(screen.queryByText(/已指派/)).not.toBeInTheDocument();
  });

  it("keeps draft CRUD as learner work instead of starter output", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(screen.getByText("尚未建立整理草稿")).toBeInTheDocument();
    expect(
      screen.getByText(/請 agent 加上建立、編輯、刪除或重設整理草稿/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/已產生 \d+ 筆安全邊界草稿/),
    ).not.toBeInTheDocument();
  });

  it("shows manpower classification without marking it as dispatchable", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(screen.getByText("人力需求分類")).toBeInTheDocument();
    expect(screen.getByText("清泥 / 清淤人力")).toBeInTheDocument();
    expect(screen.getByText("水電專業人力")).toBeInTheDocument();
    expect(screen.getByText("搬運協助人力")).toBeInTheDocument();
    expect(screen.getAllByText("不能直接變成志工任務").length).toBeGreaterThan(
      0,
    );
  });

  it("shows an interactive shopping page", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "購物頁面" }));

    expect(
      screen.getByRole("heading", { name: "購物頁面" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "+ 加入" })[0]);

    expect(screen.getByText("1 件商品")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /減少/ })).toBeInTheDocument();
  });

  it("shows four products in every shopping category", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "購物頁面" }));

    ["文具", "飲品", "點心", "用品"].forEach((category) => {
      fireEvent.click(screen.getByRole("button", { name: category }));

      expect(screen.getAllByRole("button", { name: "+ 加入" })).toHaveLength(4);
    });
  });

  it("shows eight 3C products and wallet payment methods", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "購物頁面" }));
    fireEvent.click(screen.getByRole("button", { name: "3C" }));

    expect(screen.getAllByRole("button", { name: "+ 加入" })).toHaveLength(8);
    expect(screen.getByText("iPhone")).toBeInTheDocument();
    expect(screen.getByText("Samsung S27 Ultra")).toBeInTheDocument();

    ["Apple Pay", "Samsung Pay", "LINE Pay", "Google Pay"].forEach((method) => {
      expect(screen.getByRole("button", { name: method })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "LINE Pay" }));

    expect(screen.getByRole("button", { name: "LINE Pay" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("lets learners expand manpower review questions", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    const toggle = screen.getAllByRole("button", { name: "查看確認問題" })[0];
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByText(/這筆資訊仍是原始資訊/).length).toBeGreaterThan(
      0,
    );
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index";
import db from "../src/config/db";

beforeEach(async () => {
  try {
    await db.delete("/settings");
  } catch {}
});

describe("Settings API", () => {
  describe("GET /settings", () => {
    it("설정이 없으면 기본값을 반환한다.", async () => {
      const res = await request(app).get("/settings");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weeklyReportDay).toBe(5);
      expect(res.body.data.kpiEnabled).toBe(false);
    });
  });

  describe("POST /settings", () => {
    it("필수 항목을 모두 보내면 201을 반환한다", async () => {
      const res = await request(app).post("/settings").send({
        weeklyReportDay: 4,
        projectName: "테스트 프로젝트",
        isNewProject: true,
        projectStartDate: "2026-03-08",
        kpiEnabled: true,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projectName).toBe("테스트 프로젝트");
      expect(res.body.data.kpiEnabled).toBe(true);
    });

    it("필수 항목 누락 시 400을 반환한다", async () => {
      const res = await request(app).post("/settings").send({
        weeklyReportDay: 4,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("필수 항목");
    });
  });

  describe("PATCH /settings/days", () => {
    it("0-6 사이의 값이면 요일을 변경한다", async () => {
      const res = await request(app).patch("/settings/days").send({
        weeklyReportDay: 1,
      });

      expect(res.status).toBe(201);
      expect(res.body.weeklyReportDay).toBe(1);
    });

    it("7 이상의 값이면 400을 반환한다", async () => {
      const res = await request(app).patch("/settings/days").send({
        weeklyReportDay: 9,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("값이 없으면 400을 반환한다", async () => {
      const res = await request(app).patch("/settings/days").send({});

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /settings/kpi", () => {
    it("kpiEnabled true로 변경한다", async () => {
      const res = await request(app).patch("/settings/kpi").send({
        kpiEnabled: true,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.kpiEnabled).toBe(true);
    });

    it("kpiEnabled false로 변경한다", async () => {
      const res = await request(app).patch("/settings/kpi").send({
        kpiEnabled: false,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.kpiEnabled).toBe(false);
    });

    it("값이 없으면 400 반환", async () => {
      const res = await request(app).patch("/settings/kpi").send({});

      expect(res.status).toBe(400);
    });
  });
});

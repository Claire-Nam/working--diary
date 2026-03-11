import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../src/index";
import db from "../src/config/db";

vi.mock("../src/services/ai.service", () => ({
  aiService: {
    refineDiaryText: vi.fn().mockResolvedValue("AI가 다듬은 업무 일지 내용입니다."),
    generateWeeklySummary: vi.fn().mockResolvedValue("AI가 생성한 주간 요약입니다."),
  },
}));

beforeEach(async () => {
  try {
    await db.delete("/diaries");
  } catch {}
});

describe("Diary API", () => {
  describe("POST /diary", () => {
    it("정상 데이터로 일지를 생성하면 201을 반환한다", async () => {
      const res = await request(app).post("/diary").send({
        date: "2026-03-11",
        rawInput: "diary api 생성 \n diary 코드 확인용 vitest 코드 작성",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.date).toBe("2026-03-11");
      expect(res.body.data.rawInput).toBe("diary api 생성 \n diary 코드 확인용 vitest 코드 작성");
      expect(res.body.data.refined).toBe("AI가 다듬은 업무 일지 내용입니다.");
      expect(res.body.data.id).toBeDefined();
    });

    it("date가 없으면 400을 반환한다.", async () => {
      const res = await request(app).post("/diary").send({
        rawInput: "오늘 업무 내용",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rawInput이 없으면 400을 반환한다.", async () => {
      const res = await request(app).post("/diary").send({ date: "2026-03-11" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("날짜 형식이 잘못됐으면 400을 반환한다.", async () => {
      const res = await request(app).post("/diary").send({
        date: "20260311",
        rawInput: "오늘 업무 내용입니다.",
      });

      expect(res.status).toBe(400);
    });

    it("같은 날짜로 중복 생성하면 409를 반환한다", async () => {
      await request(app).post("/diary").send({ date: "2024-01-15", rawInput: "첫 번째 일지 내용입니다" });

      const res = await request(app).post("/diary").send({ date: "2024-01-15", rawInput: "두 번째 일지 내용입니다" });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /diary", () => {
    it("일지가 없으면 빈 배열을 반환한다", async () => {
      const res = await request(app).get("/diary");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it("생성된 일지 목록을 반환한다", async () => {
      await request(app).post("/diary").send({ date: "2026-03-11", rawInput: "첫째날 업무 일지입니다" });
      await request(app).post("/diary").send({ date: "2026-03-12", rawInput: "둘쨋날 업무 일지입니다." });

      const res = await request(app).get("/diary");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("GET /diary/:date", () => {
    it("존재하는 날짜 조회 시 해당 일지를 반환한다.", async () => {
      await request(app).post("/diary").send({
        date: "2026-03-11",
        rawInput: "오늘의 업무 내용입니다.",
      });

      const res = await request(app).get("/diary/2024-03-11");

      expect(res.status).toBe(200);
      expect(res.body.data.date).toBe("2026-03-11");
    });

    it("없는 날짜 조회 시 404를 반환한다.", async () => {
      const res = await request(app).get("/diary/2025-03-23");

      expect(res.status).toBe(404);
    });

    it("잘못된 날짜 형식이면 400을 반환한다", async () => {
      const res = await request(app).get("/diary/20260311");

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /diary/:date", () => {
    it("존재하는 일지를 수정하면 200을 반환한다", async () => {
      await request(app).post("/diary").send({
        date: "2026-03-11",
        rawInput: "원본 업무 일지입니다.",
      });

      const res = await request(app).put("/diary/2026-03-11").send({
        rawInput: "수정된 업무 일지입니다",
      });

      expect(res.status).toBe(200);
      expect(res.body.data.rawInput).toBe("수정된 업무 내용입니다.");
      expect(res.body.data.id).toBeDefined();
    });

    it("없는 날짜 수정 시 404를 반환한다", async () => {
      const res = await request(app).put("/diary/2025-03-12").send({
        rawInput: "수정할 업무 내용입니다.",
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /diary/:date", () => {
    it("존재하는 일지를 삭제하면 200을 반환한다", async () => {
      await request(app).post("/diary").send({ date: "2026-03-11", rawInput: "삭제할 업무 내용입니다." });

      const res = await request(app).delete("/diary/2026-03-11");

      expect(res.status).toBe(200);
    });

    it("삭제 후 조회하면 404를 반환한다", async () => {
      await request(app).post("/diary").send({ date: "2026-03-11", rawInput: "삭제할 업무 내용입니다." });

      await request(app).delete("/diary/2026-03-11");

      const res = await request(app).get("/diary/2026-03-11");
      expect(res.status).toBe(404);
    });

    it("없는 날짜 삭제 시 404를 반환한다", async () => {
      const res = await request(app).delete("/diary/2026-08-12");
      expect(res.status).toBe(404);
    });
  });
});

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
});

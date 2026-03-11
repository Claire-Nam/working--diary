import { Router, Request, Response } from "express";
import { diaryService } from "../services/diary.service";
import { sendError, getErrorMessage } from "../utils/error";
import { send } from "process";
import { REPLCommand } from "repl";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const diaries = await diaryService.getAllDiaries();
    console.log(diaries);

    return res.status(200).json(diaries);
  } catch (error) {
    return sendError(res, 500, getErrorMessage(error, "일지 목록 조회"));
  }
});

router.get("/:date", async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const stringDate = String(date);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(stringDate)) {
      return sendError(res, 400, "날짜 형식이 올바르지 않습니다.");
    }

    const diary = await diaryService.getDiaryByDate(stringDate);
    if (!diary) {
      return sendError(res, 404, `${date} 날짜의 일지가 존재하지 않습니다.`);
    }

    return res.status(200).json(diary);
  } catch (error) {
    return sendError(res, 500, getErrorMessage(error, "일지 조회"));
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { date, rawInput } = req.body;
    const existing = await diaryService.getDiaryByDate(date);

    if (!date || !rawInput) {
      return sendError(res, 400, "date와 rawInput은 필수입니다.");
    }

    if (existing) {
      return sendError(res, 409, "이미 해당 날짜의 일지가 존재합니다");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return sendError(res, 400, "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)");
    }

    if (rawInput.trim().length < 0) {
      return sendError(res, 400, "업무 일지 내용이 없습니다.");
    }

    const diary = await diaryService.createDiary(date, rawInput);

    return res.status(201).json(diary);
  } catch (error) {
    return sendError(res, 500, getErrorMessage(error, "일지 생성"));
  }
});

router.put("/:date", async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const strDate = String(date);
    const { rawInput } = req.body;

    if (!rawInput) {
      return sendError(res, 400, "rawInput은 필수입니다.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(strDate)) {
      return sendError(res, 400, "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)");
    }

    const diary = await diaryService.updateDiary(strDate, rawInput.trim());
    return res.status(200).json(diary);
  } catch (error) {
    const message = getErrorMessage(error, "일지 수정");

    if (message.includes("찾을 수 없습니다.")) {
      return sendError(res, 404, message);
    }

    return sendError(res, 500, message);
  }
});

router.delete("/:date", async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const strDate = String(date);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(strDate)) {
      return sendError(res, 400, "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)");
    }

    const target = await diaryService.deleteDiary(strDate);
    return res.status(200).json(target);
  } catch (error) {
    const message = getErrorMessage(error, "일지 삭제 중 오류가 발생했습니다.");

    if (message.includes("찾을 수 없습니다")) {
      return sendError(res, 404, message);
    }

    return sendError(res, 500, message);
  }
});

export default router;

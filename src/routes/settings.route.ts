import { Router, Request, Response } from "express";
import { settingsService } from "../services/settings.services";
import { ApiResponse, Settings } from "../types";
import { getErrorMessage, sendError } from "../utils/error";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();
    const response: ApiResponse<Settings> = {
      success: true,
      data: settings,
    };
    console.log(`성공 응답: ${response}`);
    res.status(200).json(response);
  } catch (error) {
    return sendError(res, 500, getErrorMessage(error, "설정 조회 중 오류가 발생했습니다."));
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const input = req.body;

    // 필수 필드 검사
    const requiredFields = ["weeklyReportDay", "projectName", "isNewProject", "projectStartDate"];
    const missingFields = requiredFields.filter(field => input[field] === undefined);

    if (missingFields.length > 0) {
      return sendError(res, 400, `필수 항목이 누락되었습니다: ${missingFields.join(",")}`);
    }

    const settings = await settingsService.updateSettings(input);

    const response: ApiResponse<Settings> = {
      success: true,
      data: settings,
    };
    return res.status(201).json(response);
  } catch (error) {
    return sendError(res, 500, getErrorMessage(error, "설정 저장 중 오류가 발생했습니다."));
  }
});

router.patch("/days", async (req, res) => {
  try {
    const { weeklyReportDay } = req.body;

    if (weeklyReportDay === undefined) {
      return sendError(res, 400, "WeeklyReportDay 값이 필요합니다.");
    }

    const settings = await settingsService.updateWeeklyReportDay(Number(weeklyReportDay));

    const response: ApiResponse<Settings> = {
      success: true,
      data: settings,
    };

    console.log(`요일 업데이트 성공: ${settings}`);
    return res.status(201).json(settings);
  } catch (error) {
    return sendError(res, 400, getErrorMessage(error, "요일 변경 중 오류가 발생했습니다."));
  }
});

router.patch("/kpi", async (req: Request, res: Response) => {
  try {
    const { kpiEnabled } = req.body;

    if (kpiEnabled === undefined) {
      return sendError(res, 400, "kpiEnabled 값이 필요합니다.");
    }

    const enabled = Boolean(kpiEnabled);
    const settings = await settingsService.updateKpi(enabled);

    const response: ApiResponse<Settings> = {
      success: true,
      data: settings,
    };
    return res.status(200).json(response);
  } catch (error) {
    return sendError(res, 500, getErrorMessage(error, "kpi 설정 변경 중 오류가 발생했습니다."));
  }
});

export default router;

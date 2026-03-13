import { v4 as uuidv4 } from "uuid";
import db from "../config/db";
import { aiService } from "./ai.service";
import { diaryService } from "./diary.service";
import { settingsService } from "./settings.services";
import { WeeklySummary, MonthlySummary } from "../types";

const WEEKLY_PATH = "/weeklySummaries";
const MONTHLY_PATH = "/monthlySummaries";

const toDate = (dateStr: string): Date => new Date(`${dateStr}T00:00:00`);
const toDateStr = (date: Date): string => date.toISOString().substring(0, 10);

const getWeekRange = (ReferenceDate: Date): { weekStart: string; weekEnd: string } => {
  const day = ReferenceDate.getDay();

  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(ReferenceDate);
  monday.setDate(ReferenceDate.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: toDateStr(monday),
    weekEnd: toDateStr(sunday),
  };
};

import { v4 as uuid4 } from "uuid";
import db from "../config/db";
import { aiService } from "./ai.service";
import { DiaryEntry } from "../types/index";

const DIARY_PATH = "/diaries";

export const diaryService = {
  async getAllDiaries(): Promise<DiaryEntry[]> {
    try {
      const diaries = await db.getData(DIARY_PATH);
      return diaries;
    } catch {
      return [];
    }
  },

  async getDiaryByDate(date: string): Promise<DiaryEntry | null> {
    try {
      const diaries = await diaryService.getAllDiaries();
      const target = diaries.find(d => d.date === date);
      return target ?? null;
    } catch {
      return null;
    }
  },

  async createDiary(date: string, rawInput: string): Promise<DiaryEntry> {
    const existing = await diaryService.getDiaryByDate(date);
    if (existing) {
      throw new Error(`${date} 날짜의 일지가 이미 존재합니다.`);
    }

    const refined = await aiService.refineDiaryText(rawInput);

    const newEntry: DiaryEntry = {
      id: uuid4(),
      date,
      rawInput,
      refined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.push(`${DIARY_PATH}[]`, newEntry);
    return newEntry;
  },

  async updateDiary(date: string, rawInput: string): Promise<DiaryEntry> {
    const diaries = await diaryService.getAllDiaries();
    const index = diaries.findIndex(d => d.date === date);

    if (index === -1) {
      throw new Error(`${date} 날짜의 일지를 찾을 수 없습니다.`);
    }

    const refined = await aiService.refineDiaryText(rawInput);

    const updated: DiaryEntry = {
      ...diaries[index]!,
      rawInput,
      refined,
      updatedAt: new Date().toISOString(),
    };

    await db.push(`${DIARY_PATH}[${index}]`, updated, true);
    return updated;
  },

  async deleteDiary(date: string): Promise<void> {
    const diaries = await diaryService.getAllDiaries();
    const index = diaries.findIndex(d => d.date === date);

    if (index === -1) {
      throw new Error(`${date} 날짜의 일지를 찾을 수 없습니다.`);
    }

    await db.delete(`${DIARY_PATH}[${index}]`);
  },

  async getDiariesByRange(startDate: string, endDate: string): Promise<DiaryEntry[]> {
    const diaries = await diaryService.getAllDiaries();
    return diaries.filter(d => d.date >= startDate && d.date <= endDate);
  },
};

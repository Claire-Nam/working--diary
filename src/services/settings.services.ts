import db from "../config/db";
import { Settings, SettingsUpdateInput } from "../types";

const SETTINGS_PATH = "/settings";

const DEFAULT_SETTINGS: Settings = {
  weeklyReportDay: 5,
  projectName: "새 프로젝트",
  isNewProject: true,
  projectStartDate: new Date().toISOString().substring(0, 10),
  kpiEnabled: false,
  updatedAt: new Date().toISOString(),
};

export const settingsService = {
  async getSettings(): Promise<Settings> {
    try {
      const settings = await db.getData(SETTINGS_PATH);
      return settings;
    } catch (error) {
      await db.push(SETTINGS_PATH, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(input: SettingsUpdateInput): Promise<Settings> {
    const current = await settingsService.getSettings();

    const updated: Settings = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    await db.push(SETTINGS_PATH, updated, true);
    return updated;
  },

  async updateWeeklyReportDay(day: number): Promise<Settings> {
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw new Error("요일은 월요일부터 일요일까지로 설정해야합니다.");
    }
    return settingsService.updateSettings({ weeklyReportDay: day });
  },

  async updateKpi(enabled: boolean): Promise<Settings> {
    return settingsService.updateSettings({ kpiEnabled: enabled });
  },
};

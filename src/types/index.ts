export interface Settings {
  weeklyReportDay: number;
  projectName: string;
  isNewProject: boolean;
  projectStartDate: string;
  kpiEnabled: boolean;
  updatedAt: string;
}

export type SettingsUpdateInput = Partial<Omit<Settings, "updatedAt">>;

export interface 
  id: string;
  date: string;
  rawInput: string;
  refined: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  id: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  createdAt: string;
}

export interface MonthlySummary {
  id: string;
  year: number;
  month: number;
  kpiGuide: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

import { Response } from "express";
import { ApiResponse } from "../types";

export const sendError = (res: Response, status: number, message: string) => {
  const response: ApiResponse<never> = {
    success: false,
    error: message,
  };

  return res.status(status).json(response);
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  return error instanceof Error ? error.message : `${fallback} 중 오류가 발생했습니다.`;
};

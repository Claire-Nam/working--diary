import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  const text: string = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("AI 응답에서 텍스트를 추출할 수 없습니다.");
  }

  return text.trim();
};

export const aiService = {
  // 데일리 업무 일지 정제
  async refineDiaryText(rawInput: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY가 설정되지 않았씁니다");
    }

    const prompt = `
        아래 내용을 업무 일지 형식으로 다듬어주세요.

        규칙:
        1. 입력된 내용만 바탕으로 작성(추측성 내용 추가 절대 금지)
        2. 업무용 격식체로 톤앤매너만 수정
        3. 항목별로 줄바꿈하여 정리
        4. 불필요한 구어체 표현 제거
        5. 추가 설명이나 인사말 없이 다듬은 내용만 출력

        업무내용:
        ${rawInput}
        `.trim();

    const callApi = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const refined: string = callApi.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(refined);

    if (!refined) {
      throw new Error("AI 응답에서 텍스트를 추출할 수 없습니다.");
    }

    return refined.trim();
  },

  // 주간 요약 생성
  async generateWeeklySummary(diaryTexts: string[]): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
    }

    const combinedText = diaryTexts.join("\n\n---\n\n");

    const prompt = `
    아래는 이번주동안 작성된 데일리 업무 일지입니다.
    핵심 업무 위주로 주간 업무 요약을 작성해주세요.
    
    규칙:
    1. 이번주 핵심 업무 3-5가지로 요약
    2. 업무용 격식체 사용
    3. 중복되는 내용은 하나로 통합
    4. 추가 설명없이 요약 내용만 출력
    
    이번주 업무 일지:
    ${combinedText}
    `.trim();

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const summary: string = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(summary);

    if (!summary) {
      throw new Error("AI 응답에서 텍스트를 추출할 수 없습니다.");
    }

    return summary.trim();
  },

  async generateKpiGuide(diaryTexts: string[], weeklySummaries: string[]): Promise<string> {
    const diarySection = diaryTexts.join("\n\n---\n\n");
    const summarySection = weeklySummaries.join("\n\n---\n\n");

    const prompt = `
    아래는 이번 달의 업무 일지와 주간 요약입니다.
    기록된 업무 내용을 바탕으로 예상 가능한 KPI 가이드라인을 제시해주세요.

    규칙:
    1. 실제 기록된 업무 내용만 근거로 작성
    2. 추측성 내용 절대 추가 금지
    3. KPI 항목별로 구체적인 측정 기준 제시
    4. 업무용 격식체 사용
    5. 추가 설명 없이 KPI 내용만 출력

    [이번 달 업무 일지]
      ${diarySection}

      [주간 요약]
      ${summarySection}
    `.trim();

    return callGemini(prompt);
  },
};

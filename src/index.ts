import express from "express";
import dotenv from "dotenv";
import settingsRouter from "./routes/settings.route";
import diaryRouter from "./routes/diary.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/settings", settingsRouter);
app.use("/diary", diaryRouter);

// 헬스체크
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "업무 일지 A패I 서버 동작 중",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`서버 실행중: http://localhost: ${PORT}`);
  console.log(`Gemini API 키 상태: ${process.env.GEMINI_API_KEY ? "연결됨" : "없음!"}`);
});

export default app;

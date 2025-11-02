// ✅ 必要なパッケージを読み込む
import OpenAI from "openai";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// ✅ 環境変数(.env)を使えるようにする
dotenv.config();

const app = express();
app.use(bodyParser.json());

// ✅ OpenAI クライアントを初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ WebhookやAPI用のエンドポイント（例）
app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.message || "こんにちは！";

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage }
      ]
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Renderでサーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

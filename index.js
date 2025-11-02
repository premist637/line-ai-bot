const express = require('express');
const line = require('@line/bot-sdk');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();

// LINE Config
const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

// OpenAI Config
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const results = await Promise.all(
      req.body.events.map(handleEvent)
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

async function handleEvent(event) {
  // テキスト以外のメッセージは無視
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;

  // ChatGPTへリクエスト
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // 必要なら gpt-4o でもOK！
    messages: [
      { role: 'system', content: 'あなたは優しく丁寧に会話するAIアシスタントです。' },
      { role: 'user', content: userMessage },
    ],
  });

  const aiText = response.choices[0].message.content;

  // LINEへ返信
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: aiText,
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LINE Bot is running on port ${PORT}`);
});

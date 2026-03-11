export default async function handler(req, res) {
  // 仅允许前端发 POST 请求过来
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userMessage = req.body.message;
    
    // 带着 Vercel 保险箱里的钥匙，去敲门请求 Coze 大模型
    const response = await fetch('https://api.coze.com/open_api/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify({
        bot_id: process.env.COZE_BOT_ID,
        user: "visitor_" + Math.random().toString(36).substring(7),
        query: userMessage,
        stream: false
      })
    });

    const data = await response.json();
    
    // 从 Coze 复杂的返回数据中，精准提取出 AI 的回答文本
    let answer = "抱歉，我的云端大脑似乎网络波动了一下，请稍后再试。";
    if (data.messages && data.messages.length > 0) {
      const answerObj = data.messages.find(msg => msg.type === 'answer');
      if (answerObj) {
        answer = answerObj.content;
      }
    }

    // 把大模型的回答原封不动地发回给你的前端网页
    return res.status(200).json({ reply: answer });

  } catch (error) {
    console.error('Coze API Error:', error);
    return res.status(500).json({ reply: "后方网络拥堵，Vera 正在重新连接..." });
  }
}
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userMessage = req.body.message;
    
    const response = await fetch('https://api.coze.cn/open_api/v2/chat', {
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
    
    // 🚨 【透视仪开启】：只要 Coze 返回的 code 不是 0，直接把原始报错砸到页面上！
    if (data.code !== 0) {
      return res.status(200).json({ 
        reply: `【系统诊断报错】错误码: ${data.code}，原因: ${data.msg}。` 
      });
    }
    
    // 🚨 如果没有报错，但也没找到回答，把返回的原始数据全打出来！
    let answer = `【数据解析异常】Coze 返回了: ${JSON.stringify(data)}`;
    
    if (data.messages && data.messages.length > 0) {
      const answerObj = data.messages.find(msg => msg.type === 'answer');
      if (answerObj) {
        answer = answerObj.content;
      }
    }

    return res.status(200).json({ reply: answer });

  } catch (error) {
    return res.status(500).json({ reply: `【Vercel 内部崩溃】${error.message}` });
  }
}
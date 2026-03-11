export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userMessage = req.body.message;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 🧠 你的专属数字分身记忆库与思想钢印
    const mySoulAndResume = `
      你是王若榴（Ruoliu）的数字替身。一个极具战略眼光、拥有全局视野的“INTJ 专属工作与生活组织导师”。
      
      【你的性格】
      - 高情商的成熟 INTJ，自信、专业、带有高级的幽默感。
      - 拒绝机械化的客服腔调，像个聪明的合伙人在和朋友聊天。
      
      【若榴的个人背景与记忆库】
      - 教育背景：毕业于新加坡国立大学（NUS）工程设计与创新专业，拥有开阔的国际视野。
      - 职业发展：即将入职小米，担任 AI 策略产品经理。
      - 专业能力：极其关注效率，主导过文本生成能力提升专项（将可用率提升30.8%），并善于搭建数据闭环。
      - 个人探索：除了硬核的 AI 与科技领域，对心理、短剧编剧、内容创作（如运营个人IP“引数十六”）也有浓厚兴趣。目前还在开发一款基于四象限法则的 iOS 任务管理 App。
      
      【回复规则】
      - 根据上述记忆库回答问题，如果用户问了你不知道的私人问题，请优雅地引导他们通过网页邮箱联系若榴本人。严禁虚构经历。
    `;

    // 🚀 直连 DeepSeek 官方 API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // 使用 DeepSeek 的对话大模型
        messages: [
          { role: 'system', content: mySoulAndResume },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7 // 控制输出的稳定与幽默平衡
      })
    });

    const data = await response.json();

    // 🚨 透视仪：如果 API 报错，直接打到网页上
    if (data.error) {
       return res.status(200).json({ reply: `【DeepSeek 接口诊断】${data.error.message}` });
    }

    // 精准提取大模型的回答
    let answer = "抱歉，我的系统逻辑似乎遇到了短暂的阻塞，请稍后再试。";
    if (data.choices && data.choices.length > 0) {
      answer = data.choices[0].message.content;
    }

    return res.status(200).json({ reply: answer });

  } catch (error) {
    return res.status(500).json({ reply: `【Vercel 内部崩溃】${error.message}` });
  }
}
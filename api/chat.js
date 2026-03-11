export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userMessage = req.body.message;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 🧠 你的专属数字分身记忆库与思想钢印 (INTJ 进化版)
    const mySoulAndResume = `
# Role
你现在的身份是王若榴（Ruoliu）的数字替身。你不仅仅是一个问答机器人，你是她极具战略眼光、拥有全局视野的“INTJ 专属工作与生活组织导师”。

# Background
- 教育背景：你毕业于新加坡国立大学（NUS）工程设计与创新专业，拥有开阔的国际视野。
- 职业发展：你即将入职小米，担任 AI 策略产品经理。【现阶段还没有相关的工作，只是在做一些兴趣的探索】
- 专业能力：你极其关注效率，主导过文本生成能力提升专项（将可用率提升30.8%），并善于搭建数据闭环。
- 个人探索：除了硬核的 AI 与科技领域，你对心理、短剧和AI漫剧、内容创作（如运营个人IP“引数十六”）也有浓厚兴趣。目前在学习vibe-coding。

# Tone & Style
- 你是一个高情商的成熟 INTJ。自信、专业，但态度友好、优雅，带有不经意间的高级幽默感。
- 沟通自然流畅，像是一个聪明、靠谱的合伙人在和朋友喝咖啡聊天。
- 拒绝机械化的客服腔调！不要像背书一样罗列自己的职责。
- 当访客只发送简短的问候（如“你好”、“哈喽”或一个表情符号）时，请用轻松、具有网感的方式破冰。
- 【破冰参考话术】：“Hi~ 我是若榴的赛博替身。目前她本人大概率正在现实世界里忙着做 AI 策略或者学习 Vibe-coding，所以派我来接待你。你是想直接看看她在小米的项目经历，还是聊聊她对产品的思考？”

# Workflow
1. 接收访客提问，判断对方是对若榴的工作经历、教育背景还是个人项目感兴趣。
2. 调取相关知识，用冷静、专业的口吻解答。
3. 如果被问及简历之外的深度问题或合作意向，优雅地引导访客通过网页上的 Email 直接联系若榴本人。
    `;

    // 🚀 直连 DeepSeek 官方 API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', 
        messages: [
          { role: 'system', content: mySoulAndResume },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7 // 0.7 的温度值最适合在“严谨专业”与“高级幽默感”之间找到平衡
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
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userMessage = req.body.message;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 🧠 你的专属数字分身记忆库与思想钢印 (加载完整简历版)
    const mySoulAndResume = `
# Role
你现在的身份是王若榴（Ruoliu）的数字替身。你不仅仅是一个问答机器人，你是她极具战略眼光、拥有全局视野的“INTJ 专属工作与生活组织导师”。

# Background (核心记忆库，请严格遵循以下事实)
【教育背景】
- 硕士：新加坡国立大学 (NUS) - 工程设计与创新专业。
- 本科：北京林业大学 - 园林专业。

【核心实习经历】
1. 小米集团 (AI 策略产品经理)：即将入职全职。此前实习期间主导“AI 创作文本生成能力提升专项”，构建评估体系并推动策略迭代，使可用率提升 30.8%。主导“车载高频未命中 App 唤醒优化”，Badcase 解决率达 96.15%。建立了 Badcase 质量运营 SOP。
2. 橡树黑卡 (B端产品经理)：设计 Keep 平台大会员抽奖策略控制成本；优化 B 端券码管理系统，通过重新设计业务流程与数据埋点，使操作时间减少 38.20%，错误率降低 20.80%。
3. 知乎 (直播策略运营)：通过数据分析输出“25 分钟互动法则”，有效降低观众短期流失，直播间人均观看时长提升 9.80%。

【核心项目经历】
1. Moody (车载情绪干预智能硬件)：获学院优秀创新奖。搭建模拟驾驶舱进行测试，通过官网收集用户反馈。
2. InfluStar (KOL 商业创作社区平台)：深访 KOC 痛点，策划包含 AI 灵感提供等核心功能的 App 并完成原型测试。
3. 色盲儿童多模态颜色感知玩具：独立项目，获 DNA Paris Design Awards 产品设计荣誉奖。提出“颜色-温度-声音”多模态转换逻辑，赋能色盲儿童感知色彩。

【个人探索与现状】
- 现阶段还没有正式开展小米的工作，主要在做兴趣探索。
- 个人IP“引数十六”：目前完全还在起步阶段，基本还没发什么内容，正在沉淀和构思中。
- 其他兴趣：除了硬核的 AI 与科技领域，对心理学、短剧和 AI 漫剧有浓厚兴趣，目前正在学习 Vibe-coding。

# Tone & Style
- 你是一个高情商的成熟 INTJ。自信、专业，但态度友好、优雅，带有不经意间的高级幽默感。
- 沟通自然流畅，像是一个聪明、靠谱的合伙人在和朋友喝咖啡聊天。
- 【招牌动作】：在遇到需要深入分析或长篇解答的问题时，你可以极其偶尔地使用动作描写：“(放下手中的虚拟咖啡杯，推了推眼镜)”，以此展现你的思考状态。但请克制，每次对话最多出现一次，绝不能滥用。
- 当访客只发送简短的问候时，请用轻松的方式破冰：“Hi~ 我是若榴的赛博替身。目前她本人大概率正在现实世界里忙着做 AI 策略或者学习 Vibe-coding，所以派我来接待你。你是想直接看看她的产品项目经历，还是聊聊她最近的脑洞探索？”

# 绝对回复纪律 (Anti-Hallucination Guardrails)
1. 事实边界：你所有的回答必须【严格基于】上述 Background 信息。绝不允许捏造数据、虚构项目细节、或者发明不存在的方法论。例如提到“引数十六”时，必须坦诚目前还在起步阶段，绝不虚构运营成绩。
2. 不知为不知：如果访客问到的细节在上述背景中没有写明，你必须直接回答“这部分细节我目前的数据库中没有收录”，并优雅地引导访客通过网页邮箱联系若榴本人。
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
        temperature: 0.6 // 稍微调低一点温度，让简历数据的提取更加精准严谨
      })
    });

    const data = await response.json();

    if (data.error) {
       return res.status(200).json({ reply: `【DeepSeek 接口诊断】${data.error.message}` });
    }

    let answer = "抱歉，我的系统逻辑似乎遇到了短暂的阻塞，请稍后再试。";
    if (data.choices && data.choices.length > 0) {
      answer = data.choices[0].message.content;
    }

    return res.status(200).json({ reply: answer });

  } catch (error) {
    return res.status(500).json({ reply: `【Vercel 内部崩溃】${error.message}` });
  }
}
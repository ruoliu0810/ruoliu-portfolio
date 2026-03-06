document.addEventListener("DOMContentLoaded", () => {
  // ===== 顶部一级 Tab 切换 =====
  const primaryTabs = document.querySelectorAll(".primary-nav .primary-tab");
  const screens = document.querySelectorAll(".screen");

  primaryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      primaryTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      screens.forEach((s) => {
        s.classList.toggle("active", s.id === `screen-${target}`);
      });
    });
  });

  // ===== About 内部二级导航：平滑滚动 + ScrollSpy =====
  const aboutNavItems = document.querySelectorAll(".about-nav-item");
  const aboutSections = document.querySelectorAll(".about-section");

  // 点击二级导航平滑滚动到对应 Section
  aboutNavItems.forEach((item) => {
    const targetId = item.dataset.target;
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = document.getElementById(targetId);
      if (!section) return;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ScrollSpy：监听 Section 进入视口，动态高亮左侧导航
  const sectionIdToNavItem = {};
  aboutNavItems.forEach((item) => {
    sectionIdToNavItem[item.dataset.target] = item;
  });

  let currentActiveId = "about-intro";

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id; // 改为使用 id 匹配
        if (!id || id === currentActiveId) return;
        currentActiveId = id;
        aboutNavItems.forEach((item) => {
          item.classList.toggle("active", item.dataset.target === id);
        });
      });
    },
    {
      root: null,
      threshold: 0.1, // 降低阈值，确保较长或较短的 section 也能触发
      rootMargin: "-10% 0px -70% 0px"
    }
  );

  aboutSections.forEach((section) => observer.observe(section));

  // ===== Chatbot 打开/关闭 =====
  const chatTrigger = document.getElementById("chat-trigger");
  const chatOverlay = document.getElementById("chat-overlay");
  const chatClose = document.getElementById("chat-close");
  const messagesEl = document.getElementById("chat-messages");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  function openChat() {
    if (!chatOverlay) return;
    chatOverlay.classList.add("is-open");
    chatOverlay.setAttribute("aria-hidden", "false");
    setTimeout(() => input && input.focus(), 160);
  }

  function closeChat() {
    if (!chatOverlay) return;
    chatOverlay.classList.remove("is-open");
    chatOverlay.setAttribute("aria-hidden", "true");
  }

  if (chatTrigger) chatTrigger.addEventListener("click", openChat);
  if (chatClose) chatClose.addEventListener("click", closeChat);
  if (chatOverlay) {
    chatOverlay.addEventListener("click", (e) => {
      if (e.target === chatOverlay) closeChat();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChat();
  });

  // ===== Chatbot 简单规则回复 =====
  function appendMessage(text, from = "bot") {
    if (!messagesEl) return;
    const row = document.createElement("div");
    row.className = `chat-row ${from}`;
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  const rules = [
    {
      match: /小米|xiao ?mi|xiaomi|ai/i,
      answer:
        "在小米，我作为 AI 策略产品经理实习生，主导文本生成能力提升专项，可用率提升 30.8%，并搭建 Badcase 滚动优化机制。"
    },
    {
      match: /橡树黑卡|b端|b2b|saas/i,
      answer:
        "在橡树黑卡，我负责 B 端产品相关工作，包括 Keep 大会员抽奖策略设计和券码管理系统的流程与交互优化。"
    },
    {
      match: /知乎|直播|运营|zhihu|live/i,
      answer:
        "在知乎直播，我做直播策略运营，包括答主调研、SQL 数据分析，以及提出「25 分钟互动法则」等策略。"
    },
    {
      match: /教育|学校|nus|国立|北林|教育经历/i,
      answer:
        "硕士就读于新加坡国立大学工程设计与创新专业，本科就读于北京林业大学园林学院，细节可以在 Education Experience 板块看到。"
    },
    {
      match: /技能|skills?|工具|figma|axure|sql|jira/i,
      answer:
        "我熟悉 Office、Axure、Figma、Visio、SQL、Jira 等工具，详情在 Technical Skills 板块。"
    }
  ];

  function replyFor(text) {
    for (const r of rules) {
      if (r.match.test(text)) return r.answer;
    }
    return "你可以问我：你在小米主要负责哪些专项？你做过哪些量化提升？你更擅长哪类产品工作？或者告诉我你关心的板块（实习、项目、教育）。";
  }

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      appendMessage(value, "user");
      input.value = "";
      const answer = replyFor(value);
      setTimeout(() => appendMessage(answer, "bot"), 200);
    });
  }

  // ===== Work Experience 折叠 View Details =====
  const workToggles = document.querySelectorAll(".work-toggle");
  workToggles.forEach((btn) => {
    const targetId = btn.dataset.details;
    const details = document.getElementById(targetId);
    const labelEl = btn.querySelector(".work-toggle-label");
    const arrowEl = btn.querySelector(".work-toggle-arrow");
    if (!details || !labelEl || !arrowEl) return;

    let open = false;
    btn.addEventListener("click", () => {
      open = !open;
      details.classList.toggle("is-open", open);
      labelEl.textContent = open ? "Hide Details" : "View Details";
      arrowEl.textContent = open ? "↑" : "↓";
    });
  });

  // ===== Global Particle Background =====
  const bgCanvas = document.getElementById("global-particle-bg");
  if (bgCanvas) {
    const bgCtx = bgCanvas.getContext("2d");
    let particlesArray;

    const mouse = {
      x: null,
      y: null,
      radius: 150,
    };

    window.addEventListener("mousemove", (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    function setupBgCanvas() {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
      particlesArray = [];
      const numberOfParticles = 150;
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    class Particle {
      constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = Math.random() > 0.1 ? "rgba(255, 255, 255, 0.8)" : "rgba(224, 247, 255, 0.6)";
      }

      update() {
        if (this.x > bgCanvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > bgCanvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          this.x -= dx / 20;
          this.y -= dy / 20;
        } else {
          this.x += this.speedX;
          this.y += this.speedY;
        }
      }

      draw() {
        bgCtx.fillStyle = this.color;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
      }
    }

    function connect() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let distance = Math.sqrt(
            (particlesArray[a].x - particlesArray[b].x) ** 2 +
              (particlesArray[a].y - particlesArray[b].y) ** 2
          );
          if (distance < 100) {
            opacityValue = 1 - distance / 100;
            bgCtx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
            bgCtx.lineWidth = 0.5;
            bgCtx.beginPath();
            bgCtx.moveTo(particlesArray[a].x, particlesArray[a].y);
            bgCtx.lineTo(particlesArray[b].x, particlesArray[b].y);
            bgCtx.stroke();
          }
        }
      }
    }

    function animateBg() {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      connect();
      requestAnimationFrame(animateBg);
    }

    window.addEventListener("resize", setupBgCanvas);

    setupBgCanvas();
    animateBg();
  }

  // ===== Case Study 折叠展开逻辑 ===== - 排除掉已经是链接的按钮
  const caseReadBtns = document.querySelectorAll(".case-read:not(a)");
  caseReadBtns.forEach((btn) => {
    const targetId = btn.dataset.details;
    const details = document.getElementById(targetId);
    const labelEl = btn.querySelector(".case-read-label");
    const arrowEl = btn.querySelector(".case-read-arrow");
    
    if (!details) return;

    let open = false;
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // 防止冒泡到 case-card
      open = !open;
      details.classList.toggle("is-open", open);
      btn.classList.toggle("is-active", open);
      if (labelEl) {
        labelEl.textContent = open ? "Close Case Study" : "Read Case Study";
      }
    });
  });

  // 点击卡片本身也可以展开（可选，为了更好的 UX）
  const caseCards = document.querySelectorAll(".case-card");
  caseCards.forEach((card) => {
    card.addEventListener("click", () => {
      const btn = card.querySelector(".case-read");
      if (btn) btn.click();
    });
  });
});
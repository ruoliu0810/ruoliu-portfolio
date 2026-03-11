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
      
      // 检查是否是全屏 Hero，若是，滚动到顶部
      if (targetId === "about-intro") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ScrollSpy：监听 Section 进入视口，动态高亮左侧导航
  const sectionIdToNavItem = {};
  aboutNavItems.forEach((item) => {
    sectionIdToNavItem[item.dataset.target] = item;
  });

  const observerOptions = {
    root: null,
    threshold: 0,
    rootMargin: "-40% 0px -50% 0px" // 重点：将判定区域集中在屏幕中上部
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        aboutNavItems.forEach((item) => {
          item.classList.toggle("active", item.dataset.target === id);
        });
      }
    });
  }, observerOptions);

  aboutSections.forEach((section) => observer.observe(section));

  // 初始调用一次，确保初始状态正确
  initHeroParticleSystem();

  // ===== Chatbot Logic (Refactored for API) =====
  // 绑定到扑克牌触发按钮，因为它也是聊天入口
  const chatTrigger = document.getElementById("poker-trigger-btn"); 
  const chatOverlay = document.getElementById("chat-overlay");
  const chatClose = document.getElementById("chat-close");
  const messagesEl = document.getElementById("chat-messages");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const sendBtn = document.querySelector(".chat-send");

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

  // Helper: Append Message Bubble
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

  // Helper: Typewriter Effect
  function typeMessage(element, text, speed = 30) {
      let i = 0;
      element.textContent = "";
      const interval = setInterval(() => {
          element.textContent += text.charAt(i);
          i++;
          if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
          if (i >= text.length) {
              clearInterval(interval);
          }
      }, speed);
  }

  if (form && input) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;

      // 1. 显示用户提问
      appendMessage(value, "user");
      input.value = "";
      
      // 2. 锁定输入，防止重复提交
      input.disabled = true;
      if (sendBtn) sendBtn.disabled = true;
      input.placeholder = "Vera 正在思考...";

      // 3. 添加 Loading 状态气泡
      const loadingId = "loading-" + Date.now();
      const loadingRow = document.createElement("div");
      loadingRow.className = "chat-row bot";
      loadingRow.id = loadingId;
      loadingRow.innerHTML = `<div class="chat-bubble">Vera 正在思考...</div>`;
      messagesEl.appendChild(loadingRow);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      try {
        // 4. 调用后端 API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: value })
        });

        // 移除 Loading 气泡
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const botReply = data.reply || "我似乎遇到了一些连接问题，请稍后再试。";

        // 5. 创建回复气泡并执行打字机效果
        const row = document.createElement("div");
        row.className = "chat-row bot";
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble";
        row.appendChild(bubble);
        messagesEl.appendChild(row);
        
        typeMessage(bubble, botReply);

      } catch (error) {
        console.error("Chat Error:", error);
        // 移除 Loading (如果还在)
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        appendMessage("抱歉，我暂时无法连接到服务器，请稍后再试。", "bot");
      } finally {
        // 6. 恢复输入状态
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.placeholder = "输入你的问题…";
        input.focus();
      }
    });
  }

  // ===== Global Interactive Pixel Stardust (Upgraded) =====
  const bgCanvas = document.getElementById("global-particle-bg");
  if (bgCanvas) {
    const bgCtx = bgCanvas.getContext("2d");
    let particlesArray;

    const mouse = {
      x: null,
      y: null,
      radius: 120, // 增大互动半径
    };

    window.addEventListener("mousemove", (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    });

    function setupBgCanvas() {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
      particlesArray = [];
      // 数量核爆：密度分母降至 300，粒子数量激增
      const numberOfParticles = (bgCanvas.width * bgCanvas.height) / 300; 
      
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new BgParticle());
      }
    }

    class BgParticle {
      constructor() {
        this.centerX = bgCanvas.width / 2;
        this.centerY = bgCanvas.height / 2;
        
        const maxRadius = Math.max(bgCanvas.width, bgCanvas.height);
        this.orbitRadius = Math.random() * maxRadius;
        
        this.angle = Math.random() * Math.PI * 2;
        // 旋转速度微调：保持较快，确保肉眼可见
        this.angularSpeed = 0.001 + (100 / (this.orbitRadius + 100)) * 0.002;
        
        this.offsetX = 0;
        this.offsetY = 0;
        
        // 随机漂移参数
        this.driftX = 0;
        this.driftY = 0;
        this.driftSpeedX = (Math.random() - 0.5) * 0.2;
        this.driftSpeedY = (Math.random() - 0.5) * 0.2;
 
        // 尺寸范围拉大：0.5px - 2.5px
        this.size = Math.random() * 2 + 0.5; 
        
        // 闪烁参数
        this.opacity = Math.random() * 0.5 + 0.3; // 基础不透明度 0.3-0.8
        this.blinkSpeed = Math.random() * 0.02 + 0.005;
        this.blinkDir = 1; // 1变亮，-1变暗
        
        // 颜色基础值（蓝/紫/白）
        const colorType = Math.random();
        if (colorType < 0.6) {
            this.baseColor = {r: 255, g: 255, b: 255}; // 白
        } else if (colorType < 0.8) {
            this.baseColor = {r: 180, g: 220, b: 255}; // 蓝
        } else {
            this.baseColor = {r: 220, g: 200, b: 255}; // 紫
        }
        
        this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius;
      }

      update() {
        // 1. 轨道旋转
        this.angle += this.angularSpeed;
        
        // 2. 随机漂移 (Drift)
        this.driftX += this.driftSpeedX;
        this.driftY += this.driftSpeedY;
        
        // 3. 闪烁呼吸 (Twinkle)
        this.opacity += this.blinkSpeed * this.blinkDir;
        if (this.opacity >= 0.9 || this.opacity <= 0.2) {
            this.blinkDir *= -1; // 反向
        }
        // 限制范围防止过曝或完全消失
        if (this.opacity > 1) this.opacity = 1;
        if (this.opacity < 0.1) this.opacity = 0.1;

        // 计算基础位置
        const orbitX = this.centerX + Math.cos(this.angle) * this.orbitRadius + this.driftX;
        const orbitY = this.centerY + Math.sin(this.angle) * this.orbitRadius + this.driftY;

        // 4. 鼠标交互
        let currentX = orbitX + this.offsetX;
        let currentY = orbitY + this.offsetY;

        let dx = mouse.x - currentX;
        let dy = mouse.y - currentY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // 优化交互手感：更滑顺
        if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            // 斥力
            this.offsetX -= forceDirectionX * force * 5; 
            this.offsetY -= forceDirectionY * force * 5;
        } else {
            // 缓慢复位
            if (this.offsetX !== 0 || this.offsetY !== 0) {
                this.offsetX *= 0.95;
                this.offsetY *= 0.95;
            }
        }
        
        this.x = orbitX + this.offsetX;
        this.y = orbitY + this.offsetY;
      }

      draw() {
        // 动态更新颜色的 alpha 值
        bgCtx.fillStyle = `rgba(${this.baseColor.r}, ${this.baseColor.g}, ${this.baseColor.b}, ${this.opacity})`;
        bgCtx.beginPath();
        // 圆形粒子
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
      }
    }

    function animateBg() {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      requestAnimationFrame(animateBg);
    }

    window.addEventListener("resize", setupBgCanvas);
    setupBgCanvas();
    animateBg();
  }

  // ===== Background Floating Particles =====
  function initFloatingParticles() {
      const container = document.getElementById("hero-floating-particles");
      if (!container) return;
      
      // 创建 15 个浮动粒子
      for (let i = 0; i < 15; i++) {
          const dot = document.createElement("div");
          dot.classList.add("float-dot");
          
          const size = Math.random() * 4 + 2; // 2-6px
          dot.style.width = `${size}px`;
          dot.style.height = `${size}px`;
          
          dot.style.left = `${Math.random() * 100}%`;
          dot.style.top = `${Math.random() * 100}%`;
          
          dot.style.animationDuration = `${Math.random() * 5 + 5}s`;
          dot.style.animationDelay = `${Math.random() * 5}s`;
          
          container.appendChild(dot);
      }
  }
  
  initFloatingParticles();

  // ===== Hero Title Particle System (Refactored for Fullscreen & Fixed Size) =====
  function initHeroParticleSystem() {
    const canvas = document.getElementById("hero-title-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement; 
    let particlesArray = [];

    // 鼠标交互位置
    const mouse = {
      x: null,
      y: null,
      radius: 100
    };

    window.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.5 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        
        // 粒子颜色：纯白为主，带一点点呼吸感
        this.color = "rgba(255, 255, 255, 0.9)"; 
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX * 3;
          this.y -= directionY * 3;
        } else {
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 20;
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 20;
          }
        }
      }
    }

    function init() {
      particlesArray = [];
      // 强制高度 200px，宽度跟随容器
      canvas.width = container.offsetWidth; 
      canvas.height = 200; 

      // 字体设置：极大，极粗
      // 动态计算字号，确保不撑破屏幕
      let fontSize = 140; // 放大字号
      if (canvas.width < 600) fontSize = 70;
      
      ctx.fillStyle = "white";
      ctx.font = `900 ${fontSize}px "Montserrat", "Arial Black", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const text = "Hi, I'm Ruoliu.";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // 密集点阵：增大 gap 使粒子看起来密度“小”一点（更稀疏透气），或者减小 gap 使其更密？
      // 用户说“粒子密度小一点”，通常指粒子间距大一点，看起来没那么拥挤，或者粒子本身少一点。
      // 这里我们将 gap 从 3 改为 5，让粒子更稀疏空灵。
      const gap = 5; 

      for (let y = 0; y < textCoordinates.height; y += gap) {
        for (let x = 0; x < textCoordinates.width; x += gap) {
          if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
            particlesArray.push(new Particle(x, y));
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
      }
      requestAnimationFrame(animate);
    }

    document.fonts.ready.then(() => {
        init();
        animate();
    });

    window.addEventListener("resize", () => {
      clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(init, 100);
    });
  }

  // ===== Poker Burst Interaction (Enhanced) =====
  const pokerTrigger = document.getElementById("poker-trigger-btn");
  const pokerContainer = document.getElementById("poker-burst-container");
  
  if (pokerTrigger && pokerContainer) {
    let isAnimating = false; // 动画锁
    let flipTimers = [];

    pokerTrigger.addEventListener("mouseenter", () => {
      // 每次进入前，强制重置状态
      clearTimers();
      const cards = pokerContainer.querySelectorAll(".burst-card");
      cards.forEach(card => {
          card.classList.remove("flipped");
          card.style.opacity = ""; // 清除内联样式
      });
      
      // 强制重绘，确保 CSS transition 重新触发
      void pokerContainer.offsetWidth; 

      pokerContainer.classList.add("active");
      createPixelParticles(pokerTrigger); 
      
      isAnimating = true;

      // 延迟翻牌
      const mainTimer = setTimeout(() => {
          if (!pokerContainer.classList.contains("active")) return;
          
          const indices = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
          indices.forEach((index, i) => {
              const t = setTimeout(() => {
                  if (pokerContainer.classList.contains("active")) {
                      cards[index].classList.add("flipped");
                  }
              }, 100 + i * 150);
              flipTimers.push(t);
          });
      }, 300);
      flipTimers.push(mainTimer);
    });
    
    pokerTrigger.addEventListener("mouseleave", () => {
      // 离开时立即重置，为了下一次
      pokerContainer.classList.remove("active");
      clearTimers();
      const cards = pokerContainer.querySelectorAll(".burst-card");
      cards.forEach(card => {
          card.classList.remove("flipped");
          // 关键修复：必须清除内联透明度，否则 CSS 的 opacity: 0 不生效
          card.style.opacity = ""; 
      });
      isAnimating = false;
    });

    function clearTimers() {
        flipTimers.forEach(t => clearTimeout(t));
        flipTimers = [];
    }
  }

  // ===== Pixel Particle Effect for Poker (Exaggerated Storm) =====
  function createPixelParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 创建 60 个粒子 (粒子风暴)
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement("div");
        particle.classList.add("pixel-particle");
        
        // 随机形状：圆形、方形、空心
        const shapeType = Math.random();
        if (shapeType < 0.3) {
            particle.style.borderRadius = "50%"; // 圆
        } else if (shapeType < 0.6) {
            particle.style.borderRadius = "0"; // 方
        } else {
            particle.style.background = "transparent";
            particle.style.border = "1px solid white"; // 空心
        }
        
        document.body.appendChild(particle);
        
        // 随机颜色 (神圣色系 + 少量金色点缀)
        const colors = ["#e0e7ff", "#f3e8ff", "#ffffff", "#c7d2fe", "#fffbeb"]; // 增加淡金
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        if (particle.style.background !== "transparent") {
            particle.style.backgroundColor = color;
        } else {
            particle.style.borderColor = color;
        }
        
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        // 随机大小 (6px - 14px)
        const size = Math.random() * 8 + 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // 动画：自由轨迹 (模拟重力与旋涡)
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 100; // 更快的速度
        
        // 终点计算
        const moveX = Math.cos(angle) * velocity;
        const moveY = Math.sin(angle) * velocity;
        
        // 旋转与缩放
        const rotate = Math.random() * 720 - 360;
        
        const animation = particle.animate([
            { transform: `translate(0, 0) scale(0) rotate(0deg)`, opacity: 0 },
            { transform: `translate(${moveX * 0.2}px, ${moveY * 0.2}px) scale(1.2) rotate(${rotate * 0.3}deg)`, opacity: 1, offset: 0.2 },
            { transform: `translate(${moveX}px, ${moveY + 100}px) scale(0) rotate(${rotate}deg)`, opacity: 0 } // y+100 模拟重力下落
        ], {
            duration: 1000 + Math.random() * 800,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            fill: 'forwards'
        });
        
        animation.onfinish = () => particle.remove();
    }
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

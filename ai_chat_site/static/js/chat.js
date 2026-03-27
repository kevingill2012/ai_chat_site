(function () {
  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  const app = document.getElementById("chatApp");
  if (!app) return;

  const GREETINGS = [
    "今天的你，比昨天更接近答案一点点。",
    "别急，AI 不会跑，你的问题也不会过期。",
    "先把问题说清楚，胜过把答案猜对。",
    "世界很吵，你只需要一个清晰的问题。",
    "勇敢一点，把困惑打成文字。",
    "你已经在解决问题的路上了：你来问了。",
    "别怕问傻问题，傻的是不问。",
    "今天也要保持好奇心，像猫一样。",
    "把大问题切成小问题，像切西瓜一样。",
    "你可以慢慢来，但别停。",
    "如果你卡住了，先把你“以为的前提”列出来。",
    "灵感不靠等，靠试。",
    "先写出第一版，再写出更好的一版。",
    "别担心完美，担心的是不开始。",
    "你不需要天赋，你需要一次发送按钮。",
    "今天的目标：把“我不知道”变成“我知道下一步”。",
    "你问得越具体，我回得越像人。",
    "自律的秘诀：把任务缩小到不想做也能做。",
    "有时候，答案就在你的问题里。",
    "别和困难硬刚，换个角度就通了。",
    "你不是拖延，你是在等待一个更清晰的切入点。",
    "把情绪放一边，把步骤摆出来。",
    "别把自己当成 BUG，最多算个 feature request。",
    "先写，再改；先做，再优。",
    "今天也可以犯错，但别重复犯。",
    "你离解决方案，只差一次“为什么”。",
    "不用一口气登顶，先把鞋带系好。",
    "当你不知道怎么做，就先写下你能做的。",
    "成长就是：以前不会的，现在会一点点。",
    "别怕复杂，怕的是不拆解。",
    "问对问题，比记住答案更重要。",
    "你越认真，世界越配合。",
    "你不需要动力，你需要流程。",
    "把“我做不到”换成“我先做 10 分钟”。",
    "今天也要对自己友好一点。",
    "如果它能被描述，它就能被改进。",
    "别把压力当敌人，把它当提醒。",
    "你不是一个人，至少我在线。",
    "想清楚目标，再考虑工具。",
    "你可以质疑一切，包括你现在的想法。",
    "今天的你，值得一个清晰的计划。",
    "别怕慢，怕的是绕圈。",
    "把不确定写出来，它就开始变确定。",
    "你已经很棒了，现在让我们更棒一点。",
    "如果你愿意，我可以把复杂变成步骤。",
    "让我们用一条最短路径，走向可执行。",
    "你的问题越真实，答案越有力量。",
    "先把“要做什么”搞定，再考虑“怎么做得更酷”。",
    "把焦虑交给输入框，把行动交给下一步。",
    "今天也要做一个有解的人。",
  ];

  const WAIT_JOKES = [
    "我不是卡顿，我是在思考人生的第 7 个宇宙。",
    "加载中…这不是延迟，是优雅的等待。",
    "AI 正在翻书，请稍等，它还没翻到目录。",
    "思考中…我先把咖啡续上。",
    "别急，答案正在排队进场。",
    "正在召唤灵感，请保持信号畅通。",
    "我在算概率，顺便算算晚饭吃什么。",
    "系统正在努力：把胡思乱想变成答案。",
    "处理中…像猫一样，先伸个懒腰。",
    "马上好，AI 正在把逻辑系成蝴蝶结。",
    "我们都在等待，答案也在等待被发现。",
    "正在加载智慧，请别眨眼。",
    "思考中…键盘都冒烟了。",
    "不着急，答案从不迟到。",
    "我在整理思路，像整理衣柜一样。",
    "答案路上堵车，请稍候。",
    "先深呼吸，AI 正在深度思考。",
    "系统正在做梦，梦醒就给你答案。",
    "处理中…AI 也需要一点点仪式感。",
    "我在召集小脑袋们开会。",
    "正在推理：把复杂变成简单。",
    "答案正在穿衣服，马上到。",
    "等一下，AI 还在修饰词汇。",
    "思考中…我在找最聪明的那个答案。",
    "处理中…让子弹飞一会儿。",
    "AI 正在写草稿，你先喝口水。",
    "答案正在热身，准备登场。",
    "快好了，逻辑已就位。",
    "别急，答案在路上，没迷路。",
    "系统正在快速思考，请勿惊扰。",
    "处理中…我在排除错误选项。",
    "AI 在脑补，请稍后。",
    "让我把问题拆一下，不用锤子。",
    "思考中…我先把重点画个圈。",
    "加载中…像星际旅行一样酷。",
    "答案正在打磨边角。",
    "我在找一个既正确又好懂的说法。",
    "处理中…就像烤面包，稍等会更香。",
    "AI 正在与灵感谈判。",
    "快好了，逻辑已经排队。",
    "我在把线索串起来，像串糖葫芦。",
    "思考中…做完这道题就下课。",
    "处理中…别走开，我马上回来。",
    "答案正在下载，速度取决于宇宙心情。",
    "我在把碎片拼成答案。",
    "思考中…像马拉松最后 100 米。",
    "快好了，我已经在写结论。",
    "处理中…AI 也有“哦对了”的时刻。",
    "别急，答案正在穿越时空。",
    "思考中…我在把复杂翻译成中文。",
  ];

  const input = document.getElementById("userInput");
  const btnSend = document.getElementById("btnSend");
  const btnClear = document.getElementById("btnClear");
  const btnNewConversation = document.getElementById("btnNewConversation");
  const conversationList = document.getElementById("conversationList");
  const chatBox = document.getElementById("chatBox");
  const hint = document.getElementById("hint");
  const fileHint = document.getElementById("fileHint");
  const btnAttach = document.getElementById("btnAttach");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const modelSelect = document.getElementById("modelSelect");
  const memoryToggle = document.getElementById("memoryToggle");
  const tokenStats = document.getElementById("tokenStats");
  const currentConversationTitle = document.getElementById("currentConversationTitle");
  const tokChat = document.getElementById("tokChat");
  const tokWeek = document.getElementById("tokWeek");
  const tokMonth = document.getElementById("tokMonth");
  const tokTotal = document.getElementById("tokTotal");

  let activeConversationId = parseInt(app.dataset.currentConversationId || "0", 10) || 0;
  let activeConversationTotalTokens = 0;
  const defaultModel = app.dataset.defaultModel || "gemini-2.5-flash";
  const maxFiles = parseInt(app.dataset.maxFiles || "5", 10) || 5;
  const allowedModels = (() => {
    try {
      return JSON.parse(app.dataset.allowedModels || "[]");
    } catch (_e) {
      return [];
    }
  })();
  let selectedFiles = [];

  function pickGreeting() {
    return GREETINGS[Math.floor(Math.random() * GREETINGS.length)] || "开始提问吧。";
  }

  function append(role, text) {
    const isUser = role === "user";
    const wrapper = document.createElement("div");
    wrapper.className = `d-flex flex-row justify-content-${isUser ? "end" : "start"} mb-3`;

    const bubble = document.createElement("div");
    bubble.className = `msg ${isUser ? "msg-user" : "msg-ai"}`;

    const p = document.createElement("div");
    p.className = "msg-text";
    p.textContent = text;

    bubble.appendChild(p);
    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
    return p;
  }

  function setTokenStats(text) {
    if (tokenStats) tokenStats.textContent = text || "";
  }

  function setTokenWidget(chat, week, month, total) {
    if (tokChat) tokChat.textContent = String(chat ?? 0);
    if (tokWeek) tokWeek.textContent = String(week ?? 0);
    if (tokMonth) tokMonth.textContent = String(month ?? 0);
    if (tokTotal) tokTotal.textContent = String(total ?? 0);
  }

  function formatSize(bytes) {
    const n = Number(bytes || 0);
    if (n < 1024) return `${n}B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
    return `${(n / (1024 * 1024)).toFixed(1)}MB`;
  }

  function renderFiles() {
    if (!fileList) return;
    fileList.innerHTML = "";
    for (const f of selectedFiles) {
      const chip = document.createElement("div");
      chip.className = "file-chip";
      chip.innerHTML = `<span class="name">${f.name}</span><span class="meta">${formatSize(f.size)}</span><button class="remove" title="移除">×</button>`;
      chip.querySelector(".remove")?.addEventListener("click", async () => {
        try {
          await fetch(`/api/upload/${encodeURIComponent(f.id)}`, { method: "DELETE" });
        } catch (_e) {}
        selectedFiles = selectedFiles.filter((x) => x.id !== f.id);
        renderFiles();
      });
      fileList.appendChild(chip);
    }
  }

  async function uploadFile(file) {
    if (!file) return;
    if (selectedFiles.length >= maxFiles) {
      if (fileHint) fileHint.textContent = `最多上传 ${maxFiles} 个文件`;
      return;
    }
    if (fileHint) fileHint.textContent = `正在上传：${file.name}`;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (fileHint) fileHint.textContent = data.error || "上传失败";
        return;
      }
      selectedFiles.push({
        id: data.id,
        name: data.name || file.name,
        size: data.size || file.size || 0,
        mime: data.mime || "",
        isImage: !!data.is_image,
      });
      if (fileHint) fileHint.textContent = `已上传 ${selectedFiles.length} 个文件`;
      renderFiles();
    } catch (_e) {
      if (fileHint) fileHint.textContent = "上传失败，请重试";
    }
  }

  function pickWaitJoke() {
    return WAIT_JOKES[Math.floor(Math.random() * WAIT_JOKES.length)] || "处理中…";
  }

  function startWaitJokes(node) {
    if (!node) return null;
    node.textContent = pickWaitJoke();
    const timer = setInterval(() => {
      node.textContent = pickWaitJoke();
    }, 2200);
    return timer;
  }

  async function refreshStats() {
    if (!activeConversationId) return;
    try {
      const res = await fetch(`/api/stats?conversation_id=${encodeURIComponent(activeConversationId)}`, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      activeConversationTotalTokens = parseInt(data.current_chat_tokens || "0", 10) || 0;
      const week = parseInt(data.week_tokens || "0", 10) || 0;
      const month = parseInt(data.month_tokens || "0", 10) || 0;
      const total = parseInt(data.total_tokens || "0", 10) || 0;
      setTokenWidget(activeConversationTotalTokens, week, month, total);
      setTokenStats(`本对话 ${activeConversationTotalTokens} | 本周 ${week} | 本月 ${month} | 累计 ${total}`);
    } catch (_e) {}
  }

  function setBusy(busy) {
    input.disabled = busy;
    btnSend.disabled = busy;
    if (!busy) input.focus();
  }

  function getSelectedModel() {
    const v = (modelSelect?.value || "").trim();
    return v || defaultModel;
  }

  function renderConversationList(items) {
    if (!conversationList) return;
    conversationList.innerHTML = "";
    for (const c of items || []) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "list-group-item list-group-item-action d-flex align-items-center justify-content-between" +
        (String(c.id) === String(activeConversationId) ? " active" : "");
      btn.dataset.conversationId = String(c.id);

      const title = document.createElement("span");
      title.className = "text-truncate me-2";
      title.textContent = c.title || "未命名";

      const actions = document.createElement("span");
      actions.className = "d-flex gap-2 align-items-center";
      const tok = parseInt(c.total_tokens || "0", 10) || 0;
      const badgeClass = String(c.id) === String(activeConversationId) ? "text-bg-light" : "text-bg-secondary";
      const badge = `<span class="badge ${badgeClass}" title="累计 tokens">${tok}</span>`;
      actions.innerHTML =
        badge +
        '<i class="fa-solid fa-pen-to-square chat-conv-action" data-action="rename" title="重命名"></i>' +
        '<i class="fa-solid fa-trash chat-conv-action" data-action="delete" title="删除"></i>';

      btn.appendChild(title);
      btn.appendChild(actions);
      conversationList.appendChild(btn);
    }
  }

  async function fetchConversations() {
    const res = await fetch("/api/conversations", { method: "GET" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "加载会话失败");
    const list = data.conversations || [];
    renderConversationList(list);
    if (!activeConversationId && list.length) activeConversationId = list[0].id;
    const active = list.find((x) => String(x.id) === String(activeConversationId)) || list[0];
    if (active && currentConversationTitle) currentConversationTitle.textContent = active.title || "";
    return list;
  }

  async function fetchMessages(conversationId) {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, { method: "GET" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "加载消息失败");
    return data.messages || [];
  }

  async function loadActiveConversation() {
    hint.textContent = "";
    chatBox.innerHTML = "";
    setTokenStats("");
    selectedFiles = [];
    renderFiles();
    if (fileHint) fileHint.textContent = "";
    try {
      const msgs = await fetchMessages(activeConversationId);
      if (!msgs.length) {
        await refreshStats();
        append("ai", pickGreeting());
        return;
      }
      for (const m of msgs) {
        append(m.role === "user" ? "user" : "ai", m.content || "");
      }
      await refreshStats();
    } catch (e) {
      append("ai", "加载失败，请刷新重试。");
      hint.textContent = e?.message || "加载失败";
    }
  }

  async function sendMessage() {
    const text = (input.value || "").trim();
    if (!text && !selectedFiles.length) return;

    if (text) {
      append("user", text);
    } else {
      append("user", "（上传了文件，正在分析…）");
    }
    input.value = "";
    setBusy(true);

    const loadingNode = append("ai", "引擎思考中…");
    const waitTimer = startWaitJokes(loadingNode);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({
          message: text,
          conversation_id: activeConversationId,
          model: getSelectedModel(),
          memory_enabled: !!memoryToggle?.checked,
          file_ids: selectedFiles.map((x) => x.id),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        loadingNode.textContent = data.error || "请求失败";
      } else {
        loadingNode.textContent = data.reply || "（空）";
        if (data.conversation_id) activeConversationId = data.conversation_id;
        fetchConversations().catch(() => {});
        refreshStats().catch(() => {});
        selectedFiles = [];
        renderFiles();
        if (fileHint) fileHint.textContent = "";
      }
    } catch (_e) {
      loadingNode.textContent = "连接失败，请稍后重试。";
    } finally {
      if (waitTimer) clearInterval(waitTimer);
      setBusy(false);
    }
  }

  async function clearChat() {
    hint.textContent = "";
    btnClear.disabled = true;
    try {
      const res = await fetch("/api/chat/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({ conversation_id: activeConversationId }),
      });
      if (res.ok) {
        chatBox.innerHTML = "";
        append("ai", pickGreeting());
        fetchConversations().catch(() => {});
        refreshStats().catch(() => {});
      } else {
        hint.textContent = "清空失败";
      }
    } catch (_e) {
      hint.textContent = "清空失败";
    } finally {
      btnClear.disabled = false;
    }
  }

  async function newConversation() {
    hint.textContent = "";
    btnNewConversation.disabled = true;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({ title: "新对话" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "新建失败");
      activeConversationId = data.id;
      await fetchConversations();
      await loadActiveConversation();
      await refreshStats();
      selectedFiles = [];
      renderFiles();
      if (fileHint) fileHint.textContent = "";
    } catch (e) {
      hint.textContent = e?.message || "新建失败";
    } finally {
      btnNewConversation.disabled = false;
    }
  }

  async function renameConversation(conversationId) {
    const title = window.prompt("输入新标题（最多80字）");
    if (!title) return;
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf,
      },
      body: JSON.stringify({ title }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      hint.textContent = data.error || "重命名失败";
      return;
    }
    await fetchConversations();
    refreshStats().catch(() => {});
  }

  async function deleteConversation(conversationId) {
    if (!window.confirm("确认删除该对话？此操作不可恢复。")) return;
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrf,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      hint.textContent = data.error || "删除失败";
      return;
    }
    activeConversationId = 0;
    const list = await fetchConversations();
    if (list.length) activeConversationId = list[0].id;
    await loadActiveConversation();
    refreshStats().catch(() => {});
  }

  btnSend?.addEventListener("click", sendMessage);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  btnClear?.addEventListener("click", clearChat);
  btnNewConversation?.addEventListener("click", newConversation);
  btnAttach?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    fileInput.value = "";
    for (const f of files) uploadFile(f);
  });

  conversationList?.addEventListener("click", (e) => {
    const target = e.target;
    const item = target?.closest?.("[data-conversation-id]");
    if (!item) return;
    const conversationId = parseInt(item.dataset.conversationId || "0", 10) || 0;
    const action = target?.dataset?.action || "";
    if (action === "rename") return void renameConversation(conversationId);
    if (action === "delete") return void deleteConversation(conversationId);
    activeConversationId = conversationId;
    fetchConversations().catch(() => {});
    loadActiveConversation().catch(() => {});
    refreshStats().catch(() => {});
  });

  if (modelSelect) {
    const saved = localStorage.getItem("ai_chat_site_model") || "";
    const options = (allowedModels && allowedModels.length ? allowedModels : [defaultModel]).map((m) => String(m));
    modelSelect.innerHTML = "";
    for (const m of options) {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      modelSelect.appendChild(opt);
    }
    modelSelect.value = options.includes(saved) ? saved : defaultModel;
    modelSelect.addEventListener("change", () => {
      localStorage.setItem("ai_chat_site_model", modelSelect.value || defaultModel);
    });
  }

  fetchConversations()
    .then(() => loadActiveConversation().then(() => refreshStats()))
    .catch(() => loadActiveConversation());
  input?.focus();
})();

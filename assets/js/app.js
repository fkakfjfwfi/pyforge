/* PyForge — 应用主逻辑
   课程渲染 / 进度存储 / 浏览器内 Python 运行 / 练习判题 */
(function () {
  "use strict";

  const CURRICULUM = window.CURRICULUM || { modules: [] };
  const MODULES = CURRICULUM.modules;
  const ALL_LESSONS = MODULES.flatMap((m) =>
    m.lessons.map((l) => Object.assign({}, l, { moduleId: m.id, moduleTitle: m.title, accent: m.accent }))
  );
  const PROJECTS = window.PROJECTS || [];
  const fileRegistry = new Map();
  const STORE_KEY = "pyforge.progress.v1";
  const app = document.getElementById("app");
  const toastStack = document.getElementById("toast-stack");
  const cmMap = new Map();

  /* ------------------------------------------------------------------
     工具
     ------------------------------------------------------------------ */
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const pad2 = (n) => String(n).padStart(2, "0");
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };

  function loadProgress() {
    const empty = { done: {}, lessons: {}, last: null, dates: [] };
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return empty;
      const data = JSON.parse(raw);
      return Object.assign(empty, data, {
        done: data.done || {},
        lessons: data.lessons || {},
        dates: Array.isArray(data.dates) ? data.dates : [],
      });
    } catch (e) {
      return empty;
    }
  }

  let progress = loadProgress();

  function saveProgress() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(progress));
    } catch (e) {
      /* 隐私模式下忽略 */
    }
  }

  function touchDate() {
    const t = todayKey();
    if (!progress.dates.includes(t)) {
      progress.dates.push(t);
      if (progress.dates.length > 90) progress.dates = progress.dates.slice(-90);
      saveProgress();
    }
  }

  function isDone(exId) {
    return !!progress.done[exId];
  }

  function markDone(exId, note) {
    if (progress.done[exId]) return false;
    progress.done[exId] = { at: Date.now() };
    touchDate();
    saveProgress();
    if (note) toast(note);
    return true;
  }

  function lessonStats(lesson) {
    const total = lesson.exercises.length;
    const done = lesson.exercises.filter((e) => isDone(e.id)).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function moduleStats(mod) {
    let total = 0;
    let done = 0;
    mod.lessons.forEach((l) => {
      const s = lessonStats(l);
      total += s.total;
      done += s.done;
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function overallStats() {
    const lessonTotal = ALL_LESSONS.reduce((n, l) => n + l.exercises.length, 0);
    const projectTotal = PROJECTS.reduce((n, p) => n + p.exercises.length, 0);
    const total = lessonTotal + projectTotal;
    const done = Object.keys(progress.done).length;
    const lessonsDone = ALL_LESSONS.filter((l) => lessonStats(l).done === l.exercises.length).length;
    const projectsDone = PROJECTS.filter((p) => lessonStats(p).done === p.exercises.length).length;
    // 连续学习天数
    let streak = 0;
    const d = new Date();
    for (;;) {
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      if (progress.dates.includes(key)) {
        streak += 1;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return {
      total,
      done,
      pct: total ? Math.round((done / total) * 100) : 0,
      lessonsDone,
      projectsDone,
      lessonTotal,
      projectTotal,
      streak,
    };
  }

  function toast(message, type) {
    const el = document.createElement("div");
    el.className = "toast" + (type === "error" ? " error" : "");
    el.innerHTML = `<span class="toast-mark">${type === "error" ? "!" : "OK"}</span><span>${esc(message)}</span>`;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

  function findLesson(id) {
    return ALL_LESSONS.find((l) => l.id === id);
  }
  function findModule(id) {
    return MODULES.find((m) => m.id === id);
  }
  function lessonIndexGlobal(id) {
    return ALL_LESSONS.findIndex((l) => l.id === id);
  }
  function firstUnfinished() {
    return ALL_LESSONS.find((l) => lessonStats(l).done < l.exercises.length) || ALL_LESSONS[0];
  }
  function findProject(id) {
    return PROJECTS.find((p) => p.id === id);
  }
  function projectIndexGlobal(id) {
    return PROJECTS.findIndex((p) => p.id === id);
  }

  /* ------------------------------------------------------------------
     Python 语法高亮（静态代码块）
     ------------------------------------------------------------------ */
  const KEYWORDS = new Set(
    ("False None True and as assert async await break class continue def del elif else except finally for from " +
      "global if import in is lambda nonlocal not or pass raise return try while with yield match case").split(" ")
  );
  const BUILTINS = new Set(
    ("print len range str int float list dict set tuple bool sum min max sorted enumerate zip map filter open input " +
      "type isinstance issubclass super object property staticmethod classmethod repr abs all any round divmod pow id " +
      "hash iter next reversed slice frozenset bytes bytearray Exception ValueError TypeError KeyError IndexError " +
      "AttributeError NameError FileNotFoundError OSError RuntimeError StopIteration NotImplementedError")
      .split(" ")
      .filter(Boolean)
  );

  function highlightPython(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    const isWord = (c) => /[A-Za-z_]/.test(c);
    const isWordChar = (c) => /[A-Za-z0-9_]/.test(c);

    while (i < n) {
      const c = src[i];
      if (c === "#") {
        let j = src.indexOf("\n", i);
        if (j < 0) j = n;
        out += `<span class="tok-com">${esc(src.slice(i, j))}</span>`;
        i = j;
        continue;
      }
      if (c === '"' || c === "'") {
        const q = c;
        const triple = src.slice(i, i + 3) === q + q + q;
        let j = i + 3;
        if (triple) {
          while (j < n && !(src[j] === q && src[j + 1] === q && src[j + 2] === q)) {
            if (src[j] === "\\") j += 1;
            j += 1;
          }
          j = Math.min(j + 3, n);
        } else {
          j = i + 1;
          while (j < n && src[j] !== q && src[j] !== "\n") {
            if (src[j] === "\\") j += 1;
            j += 1;
          }
          j = Math.min(j + 1, n);
        }
        out += `<span class="tok-str">${esc(src.slice(i, j))}</span>`;
        i = j;
        continue;
      }
      if (isWord(c)) {
        let j = i;
        while (j < n && isWordChar(src[j])) j += 1;
        const word = src.slice(i, j);
        let cls = "";
        if (KEYWORDS.has(word)) cls = "tok-kw";
        else if (word === "self" || word === "cls") cls = "tok-self";
        else if (BUILTINS.has(word)) cls = "tok-bi";
        else if (src[j] === "(") cls = "tok-fn";
        out += cls ? `<span class="${cls}">${word}</span>` : esc(word);
        i = j;
        continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < n && /[0-9._xXa-fA-F]/.test(src[j])) j += 1;
        out += `<span class="tok-num">${esc(src.slice(i, j))}</span>`;
        i = j;
        continue;
      }
      if (c === "@") {
        let j = i + 1;
        while (j < n && /[A-Za-z0-9_.]/.test(src[j])) j += 1;
        out += `<span class="tok-dec">${esc(src.slice(i, j))}</span>`;
        i = j;
        continue;
      }
      out += esc(c);
      i += 1;
    }
    return out;
  }

  function codeBlock(code, options) {
    const opts = options || {};
    const lines = code.split("\n");
    const gutter = lines.map((_, i) => i + 1).join("\n");
    const out = opts.output
      ? `<div class="code-out"><b>OUT</b><span>${esc(opts.output)}</span></div>`
      : "";
    return `<div class="codeblock">
      <div class="code-head">
        <span class="dots"><i></i><i></i><i></i></span>
        <span class="lang">${opts.lang || "python"}</span>
        ${opts.file ? `<span class="file">${esc(opts.file)}</span>` : ""}
        ${opts.downloadKey ? `<button class="copy" type="button" data-download="${opts.downloadKey}">下载</button>` : ""}
        <button class="copy" type="button" data-copy>复制</button>
      </div>
      <div class="code-body"><div class="gutter">${gutter}</div><pre><code>${opts.plain ? esc(code) : highlightPython(code)}</code></pre></div>
      ${out}
    </div>`;
  }

  /* ------------------------------------------------------------------
     Pyodide 运行时（Web Worker）
     ------------------------------------------------------------------ */
  const runtimeUI = {
    dot: document.getElementById("runtime-dot"),
    text: document.getElementById("runtime-text"),
  };

  class PyRunner {
    constructor() {
      this.worker = null;
      this.readyPromise = null;
      this.readyResolve = null;
      this.readyReject = null;
      this.pending = new Map();
      this.seq = 0;
      this.status = "idle";
    }

    setStatus(status, detail) {
      this.status = status;
      const labels = {
        idle: "Python 待命",
        loading: "Python 加载中…",
        ready: "Python 就绪",
        error: "Python 加载失败",
      };
      runtimeUI.dot.className = "status-dot " + (status === "idle" ? "" : status);
      runtimeUI.text.textContent = detail || labels[status] || labels.idle;
    }

    init() {
      if (this.readyPromise) return this.readyPromise;
      this.setStatus("loading");
      this.worker = new Worker("assets/js/pyworker.js?v=8");
      this.readyPromise = new Promise((resolve, reject) => {
        this.readyResolve = resolve;
        this.readyReject = reject;
      });

      this.worker.onmessage = (event) => {
        const msg = event.data || {};
        if (msg.type === "status") {
          if (msg.status === "ready") {
            this.setStatus("ready");
            if (this.readyResolve) this.readyResolve(true);
          } else if (msg.status === "loading") {
            this.setStatus("loading");
          } else if (msg.status === "error") {
            this.setStatus("error");
            if (this.readyReject) this.readyReject(new Error(msg.message || "运行时加载失败"));
          }
          return;
        }
        if (msg.type === "result") {
          const task = this.pending.get(msg.id);
          if (!task) return;
          clearTimeout(task.timer);
          this.pending.delete(msg.id);
          task.resolve(msg);
        }
      };

      this.worker.onerror = (err) => {
        this.setStatus("error");
        if (this.readyReject) this.readyReject(err);
        this.pending.forEach((task) => {
          clearTimeout(task.timer);
          task.resolve({ ok: false, out: "", error: "Python 运行时加载失败。请检查网络后刷新页面。" });
        });
        this.pending.clear();
      };

      return this.readyPromise;
    }

    resetWorker() {
      if (this.worker) this.worker.terminate();
      this.worker = null;
      this.readyPromise = null;
      this.readyResolve = null;
      this.readyReject = null;
      this.setStatus("idle");
    }

    async run(code, tests) {
      await this.init();
      const id = ++this.seq;
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          this.pending.delete(id);
          this.resetWorker();
          resolve({
            ok: false,
            out: "",
            error: "运行超时（10 秒），进程已终止。检查一下是不是写出了死循环。",
            timedOut: true,
          });
        }, 10000);
        this.pending.set(id, { resolve, timer });
        this.worker.postMessage({ type: "run", id, code, tests });
      });
    }
  }

  const runner = new PyRunner();

  function consoleMarkup(state) {
    if (state.loading) {
      return `<div class="console-head"><span>OUTPUT</span><span class="right"><span class="loading">● 运行中</span></span></div>
        <pre class="loading">正在加载 Python 运行时（首次约 10MB，之后走浏览器缓存）…</pre>`;
    }
    const chunks = [];
    if (state.out) chunks.push(`<div class="ok">${esc(state.out)}</div>`);
    if (state.error) chunks.push(`<div class="err">${esc(state.error)}</div>`);
    if (!chunks.length) chunks.push(`<div class="hint">（没有输出。用 print() 打印结果，或点击「检查答案」运行判题脚本。）</div>`);
    const okLabel = state.ok ? `<span class="ok">通过</span>` : `<span class="err">未通过</span>`;
    return `<div class="console-head"><span>OUTPUT</span><span class="right"><span class="t">${okLabel}</span></span></div>
      <pre>${chunks.join("\n")}</pre>`;
  }

  function setConsole(article, state) {
    const el = article.querySelector(".console");
    el.hidden = false;
    el.innerHTML = consoleMarkup(state);
  }

  /* ------------------------------------------------------------------
     HTML 片段
     ------------------------------------------------------------------ */
  function renderSections(sections, accent) {
    let hIndex = 0;
    return sections
      .map((s) => {
        switch (s.type) {
          case "h":
            hIndex += 1;
            return `<h2><span class="hn">${pad2(hIndex)}</span><span>${s.html || esc(s.text)}</span></h2>`;
          case "p":
            return `<p>${s.html}</p>`;
          case "code":
            return codeBlock(s.code, {
              file: s.file,
              output: s.output,
              lang: s.lang,
              plain: s.plain,
              downloadKey: s.downloadKey,
            });
          case "list":
            return `<ul>${s.items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
          case "table":
            return `<div class="table-wrap"><table class="ref"><thead><tr>${s.head
              .map((h) => `<th>${h}</th>`)
              .join("")}</tr></thead><tbody>${s.rows
              .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
              .join("")}</tbody></table></div>`;
          case "callout": {
            const ico = { tip: "i", warn: "!", deep: "★", good: "✓" }[s.tone] || "i";
            return `<aside class="callout ${s.tone || "tip"}"><span class="co-icon">${ico}</span>
              <p>${s.title ? `<span class="co-title">${s.title}</span>` : ""}${s.html}</p></aside>`;
          }
          default:
            return "";
        }
      })
      .join("");
  }

  function exerciseStatusMarkup(ex) {
    const done = isDone(ex.id);
    if (ex.kind === "quiz") {
      return `<span class="quiz-status ${done ? "pass" : ""}">${done ? "已答对" : "未作答"}</span>`;
    }
    return `<span class="ex-status ${done ? "pass" : ""}">${done ? "已通过" : "未完成"}</span>`;
  }

  function renderCodeExercise(ex, index, label) {
    const done = isDone(ex.id);
    return `<article class="exercise ${done ? "passed" : ""}" id="ex-${ex.id}" data-ex="${ex.id}">
      <div class="ex-head">
        <span class="ex-badge">${label || "练习"} ${pad2(index)}</span>
        <span class="ex-title">${ex.title}</span>
        <span class="ex-diff">${ex.difficulty || "★★☆"}</span>
        ${exerciseStatusMarkup(ex)}
      </div>
      <div class="ex-body">
        <div class="ex-prompt">${ex.prompt}</div>
        <div class="editor-shell" id="shell-${ex.id}">
          <div class="ed-bar"><span>main.py</span><span class="live" id="live-${ex.id}">${window.CodeMirror ? "CODEMIRROR" : "PLAIN"}</span></div>
          <div id="editor-${ex.id}"></div>
        </div>
        <div class="ex-toolbar">
          <button class="btn btn-accent btn-sm" type="button" data-act="run">▶ 运行</button>
          <button class="btn btn-primary btn-sm" type="button" data-act="check">检查答案</button>
          <button class="btn btn-outline btn-sm" type="button" data-act="hint">提示</button>
          <button class="btn btn-ghost btn-sm" type="button" data-act="solution">参考答案</button>
          <button class="btn btn-ghost btn-sm" type="button" data-act="reset">重置</button>
          <span class="spacer"></span>
          <span class="hint-key">Ctrl / ⌘ + Enter 运行</span>
        </div>
        <div class="hints" hidden></div>
        <div class="solution" hidden>
          <div class="solution-head"><span>SOLUTION</span><button class="btn btn-ghost btn-sm" type="button" data-act="load-solution">载入编辑器</button></div>
          <pre>${esc(ex.solution || "")}</pre>
        </div>
        <div class="console" hidden></div>
      </div>
    </article>`;
  }

  function renderQuiz(ex) {
    const done = isDone(ex.id);
    return `<article class="quiz" id="ex-${ex.id}" data-ex="${ex.id}">
      <div class="quiz-head">
        <span class="quiz-kind">自测</span>
        <span class="quiz-status ${done ? "pass" : ""}">${done ? "已答对" : "未作答"}</span>
      </div>
      <p class="quiz-q">${ex.question}</p>
      <div class="quiz-options">
        ${ex.options
          .map(
            (opt, i) =>
              `<button class="quiz-opt" type="button" data-opt="${i}"><span class="letter">${"ABCD"[i]}</span><span>${opt}</span></button>`
          )
          .join("")}
      </div>
      <div class="quiz-explain">${ex.explain || ""}</div>
    </article>`;
  }

  /* ------------------------------------------------------------------
     首页
     ------------------------------------------------------------------ */
  function renderHome() {
    const stats = overallStats();
    const next = firstUnfinished();
    const nextStats = lessonStats(next);
    const heroCode = `class Learner:
    def __init__(self, name):
        self.name = name
        self.streak = 0

    def practice(self, minutes: int) -> str:
        self.streak += 1
        return f"{self.name} 连续练习 {minutes} 分钟"

you = Learner("你")
print(you.practice(25))`;

    const modulesHtml = MODULES.map((mod) => {
      const s = moduleStats(mod);
      return `<article class="module-card" style="--accent:${mod.accent}">
        <div class="module-card-head">
          <div>
            <span class="module-index">MODULE ${mod.index}</span>
            <h3>${mod.title}</h3>
            <p class="tagline">${mod.tagline}</p>
          </div>
          <div class="ring" style="--p:${s.pct}">${s.pct}%</div>
        </div>
        <p class="module-desc">${mod.description}</p>
        <div class="lesson-chips">
          ${mod.lessons
            .map((l, i) => {
              const ls = lessonStats(l);
              const done = ls.done === ls.total;
              return `<a class="lesson-chip ${done ? "done" : ""}" href="#/lesson/${l.id}">
                <span class="dot"></span><span class="n">${pad2(i + 1)}</span>
                <span>${l.title}</span>
                <span class="go">${done ? "完成" : ls.done + "/" + ls.total}</span>
              </a>`;
            })
            .join("")}
        </div>
      </article>`;
    }).join("");

    app.innerHTML = `<div class="page">
      <section class="hero">
        <div>
          <span class="eyebrow">Python · ${ALL_LESSONS.length} lessons · ${PROJECTS.length} projects</span>
          <h1>不再“看过”，<br>而是<span class="mark">真的写会</span>。</h1>
          <p class="hero-lead">为有一点基础、却总在同一个地方卡住的你准备。讲解只占 <strong>45%</strong>，剩下 <strong>55%</strong> 是可直接运行的练习——真实 Python 解释器跑在你的浏览器里。</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="#/lesson/${next.id}">${nextStats.done ? "继续学习" : "从第一课开始"} <span aria-hidden="true">→</span></a>
            <a class="btn btn-outline btn-lg" href="#/projects">进入项目工坊</a>
            <a class="btn btn-ghost btn-lg" href="#/books">参考书单</a>
          </div>
          <div class="hero-meta">
            <span><b>${ALL_LESSONS.length}</b> 节精讲</span>
            <span><b>${PROJECTS.length}</b> 个简历项目</span>
            <span><b>${stats.total}</b> 个练习 / 检查点</span>
            <span><b>0</b> 依赖安装</span>
          </div>
        </div>
        <div class="hero-term">
          <div class="term-head">
            <span class="term-dot"></span><span class="term-dot"></span><span class="term-dot"></span>
            <span class="term-title">lesson_01.py</span>
          </div>
          <div class="term-body">
            <pre>${highlightPython(heroCode)}</pre>
            <div class="term-out"><span>python lesson_01.py</span><b>你 连续练习 25 分钟</b></div>
          </div>
        </div>
      </section>

      <section class="stat-strip">
        <div class="stat"><b>${stats.done}</b><span>已完成练习</span></div>
        <div class="stat"><b>${stats.lessonsDone} / ${stats.projectsDone}</b><span>通关课程 / 项目</span></div>
        <div class="stat"><b>${stats.pct}%</b><span>总进度</span></div>
        <div class="stat"><b>${stats.streak}</b><span>连续学习天数</span></div>
      </section>

      <section>
        <div class="section-head">
          <div>
            <h2>学习路径</h2>
            <p>四个模块按顺序推进。每节课都配 3–4 个动手任务和至少 1 道概念自测，全部通过才算通关。</p>
          </div>
          <span class="side">14 lessons / 4 modules</span>
        </div>
        <div class="path-grid">${modulesHtml}</div>
        <div class="daily">
          <div class="daily-txt"><b>不知道从哪开始？</b> 随机抽一道还没通过的题，直接练手。</div>
          <button class="btn btn-outline" type="button" id="random-ex">随机一题 →</button>
        </div>
      </section>

      <section style="margin-top:64px">
        <div class="section-head">
          <div>
            <span class="eyebrow">Project Lab · 简历级实战</span>
            <h2>把知识点做成能展示的项目</h2>
            <p>不是 Todo List 复刻。每个项目都有明确需求、分阶段里程碑、可运行的核心逻辑和完整参考实现，最后附简历写法与扩展方向。</p>
          </div>
          <a class="btn btn-outline" href="#/projects">全部 ${PROJECTS.length} 个项目 →</a>
        </div>
        <div class="project-grid">${PROJECTS.map(projectCardMarkup).join("")}</div>
      </section>

      <section style="margin-top:64px">
        <div class="section-head">
          <div>
            <h2>为什么这样设计</h2>
            <p>内容对标经典教材的章节骨架，练习则是把书上的“看懂”变成“写对”。</p>
          </div>
        </div>
        <div class="path-grid">
          <div class="module-card" style="--accent:var(--teal)">
            <span class="module-index">METHOD · 01</span>
            <h3>先暴露问题，再给答案</h3>
            <p class="module-desc">每节课从一个真实的坑开始：可变默认参数、闭包延迟绑定、GIL、可变类属性……练习会立刻验证你的修复是否成立，而不是只给一句“注意一下”。</p>
            <div class="lesson-chips">
              <div class="lesson-chip"><span class="dot"></span><span>判题脚本基于断言，结果只有“过 / 不过”</span></div>
              <div class="lesson-chip"><span class="dot"></span><span>超时自动终止，死循环不会卡死页面</span></div>
            </div>
          </div>
          <div class="module-card" style="--accent:var(--amber)">
            <span class="module-index">METHOD · 02</span>
            <h3>书单作为“第二条腿”</h3>
            <p class="module-desc">每节课末尾给出对应书目章节：图灵社区的《流畅的 Python》《Python 工匠》，以及 GitHub 上高星的开源教程。网站负责练，书负责深。</p>
            <div class="lesson-chips">
              <div class="lesson-chip"><span class="dot"></span><span><a href="#/books">查看 15 本参考书 / 仓库</a></span></div>
            </div>
          </div>
        </div>
      </section>
    </div>`;

    document.querySelector("#random-ex").addEventListener("click", () => {
      const pool = [
        ...ALL_LESSONS.flatMap((l) => l.exercises.filter((e) => !isDone(e.id)).map((e) => ({ unit: l, type: "lesson", ex: e }))),
        ...PROJECTS.flatMap((p) => p.exercises.filter((e) => !isDone(e.id)).map((e) => ({ unit: p, type: "project", ex: e }))),
      ];
      if (!pool.length) {
        toast("所有练习都通过了，去练习场自由发挥吧。");
        return;
      }
      const pick = pool[Math.floor(Math.random() * pool.length)];
      location.hash =
        pick.type === "project" ? `#/project/${pick.unit.id}?focus=${pick.ex.id}` : `#/lesson/${pick.unit.id}?focus=${pick.ex.id}`;
    });
  }

  /* ------------------------------------------------------------------
     课程页
     ------------------------------------------------------------------ */
  function renderLesson(lessonId, params) {
    const lesson = findLesson(lessonId);
    if (!lesson) {
      location.hash = "#/";
      return;
    }
    const mod = findModule(lesson.moduleId);
    const stats = lessonStats(lesson);
    const globalIdx = lessonIndexGlobal(lesson.id);
    const prev = ALL_LESSONS[globalIdx - 1];
    const next = ALL_LESSONS[globalIdx + 1];
    const codeCount = lesson.exercises.filter((e) => e.kind === "code").length;
    const quizCount = lesson.exercises.filter((e) => e.kind === "quiz").length;

    progress.lessons[lesson.id] = { at: Date.now() };
    progress.last = lesson.id;
    touchDate();
    saveProgress();

    const sideLinks = mod.lessons
      .map((l, i) => {
        const s = lessonStats(l);
        const isCurrent = l.id === lesson.id;
        return `<a class="side-link ${isCurrent ? "current" : ""} ${s.done === s.total ? "done" : ""}"
          href="#/lesson/${l.id}" data-lesson="${l.id}" ${isCurrent ? 'style="--accent:' + mod.accent + '"' : ""}>
          <span class="idx">${pad2(i + 1)}</span><span>${l.title}</span></a>`;
      })
      .join("");

    app.innerHTML = `<div class="lesson-layout" style="--accent:${mod.accent}">
      <aside class="sidebar">
        <a class="sidebar-back" href="#/">← 全部课程</a>
        <p class="side-title">Module ${mod.index}</p>
        <p class="side-module-name">${mod.title}</p>
        <nav class="side-list">${sideLinks}</nav>
        <div class="side-progress">
          <div class="bar"><i class="js-lesson-bar" style="width:${stats.pct}%"></i></div>
          <div class="meta"><span>本课进度</span><span class="js-lesson-count">${stats.done}/${stats.total}</span></div>
        </div>
      </aside>

      <div>
        <header class="lesson-head">
          <div class="lesson-crumb">${mod.title}<span class="sep">/</span>Lesson ${pad2(globalIdx + 1)}<span class="sep">/</span>${lesson.level}</div>
          <h1>${lesson.title}</h1>
          <p class="lesson-summary">${lesson.summary}</p>
          <div class="meta-row">
            <span class="meta-pill level">${lesson.level}</span>
            <span class="meta-pill">${lesson.minutes} 分钟</span>
            <span class="meta-pill ratio">讲解 45% · 练习 55%</span>
            <span class="meta-pill">${codeCount} 编码 + ${quizCount} 自测</span>
          </div>
        </header>

        <div class="objectives">
          <span class="obj-head">学完这一节，你应该能</span>
          <ul>${lesson.objectives.map((o) => `<li>${o}</li>`).join("")}</ul>
        </div>

        <div class="prose">${renderSections(lesson.sections, mod.accent)}</div>

        <div class="practice-head">
          <span class="badge">PRACTICE</span>
          <h2>动手环节</h2>
          <span class="ratio-note">${codeCount} 编码题 · ${quizCount} 自测 · 全对即通关</span>
        </div>
        ${lesson.exercises
          .map((ex, i) => (ex.kind === "quiz" ? renderQuiz(ex, i + 1) : renderCodeExercise(ex, i + 1)))
          .join("")}

        ${
          lesson.further && lesson.further.length
            ? `<div class="further">
          <div class="f-head">FURTHER READING · 对应书目章节</div>
          <ul>${lesson.further.map((f) => `<li>${f}</li>`).join("")}</ul>
        </div>`
            : ""
        }

        <nav class="lesson-foot">
          ${prev ? `<a class="next-card" href="#/lesson/${prev.id}"><small>← 上一课</small><b>${prev.title}</b></a>` : `<span></span>`}
          ${next ? `<a class="next-card" href="#/lesson/${next.id}" style="text-align:right"><small>下一课 →</small><b>${next.title}</b></a>` : `<a class="next-card" href="#/progress" style="text-align:right"><small>全部完成</small><b>查看我的进度</b></a>`}
        </nav>
      </div>
    </div>`;

    // 初始化所有编码练习
    lesson.exercises.forEach((ex, i) => {
      if (ex.kind === "quiz") bindQuiz(ex, lesson);
      else initCodeExercise(ex, lesson, i);
    });

    // 聚焦某道题（来自“随机一题”）
    const focus = params && params.get("focus");
    if (focus) {
      const target = document.getElementById("ex-" + focus);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.style.boxShadow = "0 0 0 2px var(--blue)";
          setTimeout(() => (target.style.boxShadow = ""), 1600);
          const btn = target.querySelector('[data-act="run"]');
          if (btn) btn.focus({ preventScroll: true });
        }, 120);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /* ------------------------------------------------------------------
     项目工坊
     ------------------------------------------------------------------ */
  function projectCardMarkup(p) {
    const s = lessonStats(p);
    return `<a class="project-card" href="#/project/${p.id}" style="--accent:${p.accent}">
      <div class="project-card-top">
        <span class="project-index">PROJECT ${p.index}</span>
        <span class="project-mode ${p.mode}">${p.modeLabel}</span>
      </div>
      <h3>${p.title}</h3>
      <p class="project-sub">${p.subtitle}</p>
      <p class="project-sum">${p.summary}</p>
      <div class="stack-pills">${p.stack.slice(0, 4).map((x) => `<span>${x}</span>`).join("")}</div>
      <div class="project-card-foot">
        <span class="project-progress"><i style="width:${s.pct}%"></i></span>
        <span class="project-pct">${s.done}/${s.total}</span>
      </div>
      <div class="project-resume">${p.resumeLine}</div>
    </a>`;
  }

  function renderProjects() {
    const checkpoints = PROJECTS.reduce((n, p) => n + p.exercises.length, 0);
    const completed = PROJECTS.filter((p) => lessonStats(p).done === p.exercises.length).length;
    const generalRefs = [
      {
        name: "practical-tutorials/project-based-learning",
        url: "https://github.com/practical-tutorials/project-based-learning",
        why: "按语言和技术栈索引的项目式教程清单，适合找练手题目。",
      },
      {
        name: "MunGell/awesome-for-beginners",
        url: "https://github.com/MunGell/awesome-for-beginners",
        why: "对新手友好的开源项目清单，可以练习读别人的代码与提 PR。",
      },
      {
        name: "vinta/awesome-python",
        url: "https://github.com/vinta/awesome-python",
        why: "Python 生态总览，做项目选库时先来这里看社区选择。",
      },
    ];

    app.innerHTML = `<div class="page">
      <span class="eyebrow">Project Lab · ${PROJECTS.length} projects · ${checkpoints} checkpoints</span>
      <div class="section-head">
        <div>
          <h2 style="font-size:34px">项目工坊</h2>
          <p>从“会写函数”到“能交付一个项目”。每个项目都拆成 4 个里程碑，核心逻辑可以在浏览器里直接验证；完整参考实现可下载，本地跑起来就能放进 GitHub。</p>
        </div>
        <span class="side">${completed}/${PROJECTS.length} 已完成</span>
      </div>

      <div class="project-grid">${PROJECTS.map(projectCardMarkup).join("")}</div>

      <section style="margin-top:48px">
        <div class="section-head">
          <div><h2>怎么用这些项目</h2><p>不要一次性复制完整代码。按里程碑写，写完一个检查点再进入下一个。</p></div>
        </div>
        <div class="path-grid">
          <div class="module-card" style="--accent:var(--blue)">
            <span class="module-index">STEP · 01</span>
            <h3>先跑通核心逻辑</h3>
            <p class="module-desc">每个检查点都是项目里真实存在的一小块：模型校验、SQL 聚合、TF-IDF 排序、重试逻辑。判题通过，说明这一块行为正确。</p>
            <div class="lesson-chips">
              <div class="lesson-chip"><span class="dot"></span><span>检查点可独立运行，不依赖上一题</span></div>
              <div class="lesson-chip"><span class="dot"></span><span>参考答案通过后可以对照改写</span></div>
            </div>
          </div>
          <div class="module-card" style="--accent:var(--amber)">
            <span class="module-index">STEP · 02</span>
            <h3>下载完整实现，补上工程外壳</h3>
            <p class="module-desc">参考实现包含 CLI、测试、依赖与运行说明。把它放进自己的仓库，改数据、加命令、补 README，再截图写进简历。</p>
            <div class="lesson-chips">
              <div class="lesson-chip"><span class="dot"></span><span>每个项目都附“简历写法”和量化占位符</span></div>
              <div class="lesson-chip"><span class="dot"></span><span>扩展方向足够你继续迭代两周</span></div>
            </div>
          </div>
        </div>
      </section>

      <section style="margin-top:48px">
        <div class="section-head">
          <div><h2>选题原则</h2><p>简历上的项目不在多，而在“能讲清楚问题、方案和结果”。</p></div>
        </div>
        <div class="callout warn" style="margin-top:0">
          <span class="co-icon">!</span>
          <p><span class="co-title">不要写“Todo List”</span>除非它真的有你自己的东西：权限、并发、审计日志、离线同步、性能数据。否则面试官很难从中问出有区分度的问题。这 5 个项目都刻意选了有明确技术主题的方向：数据建模、ETL、检索、异步调度、API 工程化。</p>
        </div>
        <div class="ref-list">
          ${generalRefs
            .map(
              (r) => `<a class="ref-link" href="${r.url}" target="_blank" rel="noopener">
                <b>${r.name}</b><span>${r.why}</span><i>↗</i>
              </a>`
            )
            .join("")}
        </div>
      </section>
    </div>`;
  }

  function projectFilesMarkup(p) {
    return p.files
      .map((f, i) => {
        const key = `dl-${p.id}-${i}`;
        fileRegistry.set(key, { filename: f.name, code: f.code });
        return `<details class="file-card">
          <summary>
            <span class="file-name">${f.name}</span>
            <span class="file-note">${f.note || ""}</span>
            <span class="file-expand">展开</span>
          </summary>
          <div class="file-body">${codeBlock(f.code, {
            file: f.name,
            lang: f.lang || "python",
            plain: f.plain,
            downloadKey: key,
          })}</div>
        </details>`;
      })
      .join("");
  }

  function renderProject(projectId, params) {
    const p = findProject(projectId);
    if (!p) {
      location.hash = "#/projects";
      return;
    }
    const stats = lessonStats(p);
    const globalIdx = projectIndexGlobal(p.id);
    const prev = PROJECTS[globalIdx - 1];
    const next = PROJECTS[globalIdx + 1];

    progress.lessons[p.id] = { at: Date.now() };
    progress.last = p.id;
    touchDate();
    saveProgress();

    const milestoneSide = p.milestones
      .map((m, i) => {
        const done = m.exIds.every(isDone);
        return `<div class="side-milestone ${done ? "done" : ""}" data-milestone data-ex-ids="${m.exIds.join(",")}">
          <span class="idx">M${i + 1}</span><span>${m.title}</span>
        </div>`;
      })
      .join("");

    const milestones = p.milestones
      .map((m, mi) => {
        const exs = m.exIds.map((id) => p.exercises.find((e) => e.id === id)).filter(Boolean);
        const done = m.exIds.every(isDone);
        return `<div class="milestone ${done ? "done" : ""}" data-milestone data-ex-ids="${m.exIds.join(",")}">
          <div class="milestone-head">
            <span class="m-badge">M${mi + 1}</span>
            <div><h3>${m.title}</h3><p>${m.desc}</p></div>
            <span class="m-status ${done ? "pass" : ""}">${done ? "已通过" : "待完成"}</span>
          </div>
          ${exs.map((ex) => renderCodeExercise(ex, p.exercises.indexOf(ex) + 1, "检查点")).join("")}
        </div>`;
      })
      .join("");

    app.innerHTML = `<div class="lesson-layout project-layout" style="--accent:${p.accent}">
      <aside class="sidebar">
        <a class="sidebar-back" href="#/projects">← 项目工坊</a>
        <p class="side-title">Project ${p.index}</p>
        <p class="side-module-name">${p.title}</p>
        <div class="side-milestones">${milestoneSide}</div>
        <div class="side-progress">
          <div class="bar"><i class="js-lesson-bar" style="width:${stats.pct}%"></i></div>
          <div class="meta"><span>项目进度</span><span class="js-lesson-count">${stats.done}/${stats.total}</span></div>
        </div>
      </aside>

      <div>
        <header class="lesson-head project-head">
          <div class="lesson-crumb">项目工坊<span class="sep">/</span>Project ${p.index}<span class="sep">/</span>${p.level}</div>
          <h1>${p.title}</h1>
          <p class="lesson-summary">${p.subtitle} — ${p.summary}</p>
          <div class="meta-row">
            <span class="meta-pill level">${p.level}</span>
            <span class="meta-pill">${p.duration}</span>
            <span class="meta-pill ratio">${p.modeLabel}</span>
            <span class="meta-pill">${p.exercises.length} 个检查点 · ${p.milestones.length} 个里程碑</span>
          </div>
          <div class="stack-pills" style="margin-top:12px">${p.stack.map((x) => `<span>${x}</span>`).join("")}</div>
        </header>

        <section class="resume-card" style="--accent:${p.accent}">
          <div class="resume-head">
            <span class="eyebrow">RESUME VALUE</span>
            <span class="resume-badge">可写进简历</span>
          </div>
          <p class="resume-line">${p.resumeLine}</p>
          <div class="resume-keywords">${p.resume.keywords.map((k) => `<span>${k}</span>`).join("")}</div>
          <ul>${p.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
        </section>

        <div class="prose">${renderSections(p.sections, p.accent)}</div>

        <section class="proj-block">
          <h2><span class="hn">01</span><span>架构与目录</span></h2>
          <pre class="arch-tree">${esc(p.architecture.tree)}</pre>
          <ul>${p.architecture.notes.map((n) => `<li>${n}</li>`).join("")}</ul>
        </section>

        <div class="practice-head">
          <span class="badge">MILESTONES</span>
          <h2>分阶段完成</h2>
          <span class="ratio-note">按顺序写 · 每个检查点独立判题</span>
        </div>
        ${milestones}

        <div class="practice-head">
          <span class="badge">SOURCE</span>
          <h2>完整参考实现</h2>
          <span class="ratio-note">可展开 · 可复制 · 可下载</span>
        </div>
        <p class="block-lead">先自己写，再对照参考实现。文件里的注释标注了关键决策，不只是“能跑”。</p>
        <div class="file-list">${projectFilesMarkup(p)}</div>

        <section class="proj-block">
          <h2><span class="hn">02</span><span>本地运行</span></h2>
          ${codeBlock(p.localSetup.join("\n"), { file: "terminal", lang: "shell", plain: true })}
          ${p.localNotes && p.localNotes.length ? `<ul>${p.localNotes.map((n) => `<li>${n}</li>`).join("")}</ul>` : ""}
        </section>

        <section class="proj-block">
          <h2><span class="hn">03</span><span>写进简历</span></h2>
          <div class="callout tip" style="margin-top:0">
            <span class="co-icon">i</span>
            <p><span class="co-title">把占位符换成你的真实数据</span>例如“处理 [N] 行日志、P95 耗时 [X] ms、测试覆盖 [Y] 个用例”。没有实测就删掉数字，不要编。</p>
          </div>
          <ul class="resume-bullets">${p.resume.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
        </section>

        <section class="proj-block">
          <h2><span class="hn">04</span><span>继续扩展</span></h2>
          <ul>${p.extensions.map((e) => `<li>${e}</li>`).join("")}</ul>
        </section>

        <section class="proj-block">
          <h2><span class="hn">05</span><span>参考仓库与文档</span></h2>
          <div class="ref-list">
            ${p.refs
              .map(
                (r) => `<a class="ref-link" href="${r.url}" target="_blank" rel="noopener">
                  <b>${r.name}</b><span>${r.why}</span><i>↗</i>
                </a>`
              )
              .join("")}
          </div>
        </section>

        <nav class="lesson-foot">
          ${prev ? `<a class="next-card" href="#/project/${prev.id}"><small>← 上一个项目</small><b>${prev.title}</b></a>` : `<span></span>`}
          ${next ? `<a class="next-card" href="#/project/${next.id}" style="text-align:right"><small>下一个项目 →</small><b>${next.title}</b></a>` : `<a class="next-card" href="#/projects" style="text-align:right"><small>全部项目</small><b>返回项目工坊</b></a>`}
        </nav>
      </div>
    </div>`;

    p.exercises.forEach((ex, i) => {
      if (ex.kind === "quiz") bindQuiz(ex, p);
      else initCodeExercise(ex, p, i);
    });

    const focus = params && params.get("focus");
    if (focus) {
      const target = document.getElementById("ex-" + focus);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.style.boxShadow = "0 0 0 2px var(--blue)";
          setTimeout(() => (target.style.boxShadow = ""), 1600);
          const btn = target.querySelector('[data-act="run"]');
          if (btn) btn.focus({ preventScroll: true });
        }, 120);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /* ------------------------------------------------------------------
     编码练习
     ------------------------------------------------------------------ */
  function initCodeExercise(ex, lesson, index) {
    const article = document.getElementById("ex-" + ex.id);
    const shell = document.getElementById("shell-" + ex.id);
    const mount = document.getElementById("editor-" + ex.id);
    const live = document.getElementById("live-" + ex.id);
    let editor;
    let getValue;
    let setValue;

    if (window.CodeMirror) {
      const textarea = document.createElement("textarea");
      textarea.value = ex.starter;
      mount.appendChild(textarea);
      const runRef = () => runExercise(ex, article, lesson, getValue, "run");
      const checkRef = () => runExercise(ex, article, lesson, getValue, "check");
      editor = window.CodeMirror.fromTextArea(textarea, {
        mode: { name: "python", version: 3 },
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: false,
        autoCloseBrackets: true,
        styleActiveLine: true,
        viewportMargin: 60,
        extraKeys: {
          Tab: (cm) => cm.replaceSelection("    "),
          "Ctrl-Enter": runRef,
          "Cmd-Enter": runRef,
          "Shift-Ctrl-Enter": checkRef,
          "Shift-Cmd-Enter": checkRef,
        },
      });
      editor.on("focus", () => shell.classList.add("focus"));
      editor.on("blur", () => shell.classList.remove("focus"));
      getValue = () => editor.getValue();
      setValue = (v) => editor.setValue(v);
      live.textContent = "PYODIDE";
      cmMap.set(ex.id, editor);
    } else {
      const textarea = document.createElement("textarea");
      textarea.className = "fallback-editor";
      textarea.value = ex.starter;
      textarea.spellcheck = false;
      textarea.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          runExercise(ex, article, lesson, () => textarea.value, e.shiftKey ? "check" : "run");
        }
        if (e.key === "Tab") {
          e.preventDefault();
          const start = textarea.selectionStart;
          textarea.setRangeText("    ", start, textarea.selectionEnd, "end");
        }
      });
      mount.appendChild(textarea);
      getValue = () => textarea.value;
      setValue = (v) => (textarea.value = v);
      live.textContent = "PLAIN";
    }

    const hintsEl = article.querySelector(".hints");
    hintsEl.innerHTML = (ex.hints || [])
      .map((h, i) => `<div class="hint"><span class="h-index">H${i + 1}</span><span>${h}</span></div>`)
      .join("");

    article.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "run" || act === "check") {
        runExercise(ex, article, lesson, getValue, act);
      } else if (act === "hint") {
        hintsEl.hidden = !hintsEl.hidden;
      } else if (act === "solution") {
        article.querySelector(".solution").hidden = false;
        article.querySelector('[data-act="solution"]').disabled = true;
      } else if (act === "load-solution") {
        setValue(ex.solution || "");
        toast("参考答案已载入编辑器，改成自己的写法再跑一次。");
      } else if (act === "reset") {
        setValue(ex.starter);
        toast("已恢复初始代码。已通过的记录不会丢失。");
      }
    });

    if (isDone(ex.id)) {
      article.classList.add("passed");
    }
  }

  async function runExercise(ex, article, lesson, getValue, mode) {
    if (article.dataset.busy === "1") return;
    const code = getValue();
    if (!code.trim()) {
      toast("编辑器是空的，先写点代码。", "error");
      return;
    }
    article.dataset.busy = "1";
    const buttons = article.querySelectorAll("[data-act]");
    buttons.forEach((b) => (b.disabled = true));
    setConsole(article, { loading: true });

    const isCheck = mode === "check";
    let result;
    try {
      result = await runner.run(code, isCheck ? ex.check : null);
    } catch (err) {
      result = { ok: false, out: "", error: "运行时启动失败：" + (err && err.message ? err.message : String(err)) };
    }

    setConsole(article, result);
    article.dataset.busy = "";

    const statusEl = article.querySelector(".ex-status");
    if (isCheck) {
      buttons.forEach((b) => (b.disabled = false));
      if (result.ok) {
        article.classList.add("passed");
        article.classList.remove("failed");
        statusEl.className = "ex-status pass";
        statusEl.textContent = "已通过";
        if (markDone(ex.id)) {
          updateLessonUI(lesson);
          toast("通过 · " + ex.title);
        }
      } else if (!isDone(ex.id)) {
        article.classList.add("failed");
        article.classList.remove("passed");
        statusEl.className = "ex-status fail";
        statusEl.textContent = "未通过";
      }
    } else {
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  function updateLessonUI(lesson) {
    const s = lessonStats(lesson);
    document.querySelectorAll(".js-lesson-bar").forEach((el) => (el.style.width = s.pct + "%"));
    document.querySelectorAll(".js-lesson-count").forEach((el) => (el.textContent = `${s.done}/${s.total}`));
    const sideLink = document.querySelector(`.side-link[data-lesson="${lesson.id}"]`);
    if (sideLink && s.done === s.total) sideLink.classList.add("done");

    document.querySelectorAll("[data-milestone]").forEach((el) => {
      const ids = (el.dataset.exIds || "").split(",").filter(Boolean);
      const done = ids.length > 0 && ids.every(isDone);
      el.classList.toggle("done", done);
      const status = el.querySelector(".m-status");
      if (status) {
        status.textContent = done ? "已通过" : "待完成";
        status.className = "m-status " + (done ? "pass" : "");
      }
    });

    if (s.done === s.total && !progress.celebrated?.[lesson.id]) {
      progress.celebrated = progress.celebrated || {};
      progress.celebrated[lesson.id] = true;
      saveProgress();
      toast(lesson.type === "project" ? "项目全部检查点通过，可以整理进简历了。" : "本节全部练习通过，可以进入下一课了。");
    }
  }

  /* ------------------------------------------------------------------
     自测题
     ------------------------------------------------------------------ */
  function bindQuiz(ex, lesson) {
    const article = document.getElementById("ex-" + ex.id);
    const options = article.querySelectorAll(".quiz-opt");
    const explain = article.querySelector(".quiz-explain");
    const status = article.querySelector(".quiz-status");

    if (isDone(ex.id)) {
      options[ex.answer].classList.add("correct");
      explain.classList.add("show");
    }

    options.forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosen = Number(btn.dataset.opt);
        if (chosen === ex.answer) {
          btn.classList.add("correct");
          article.querySelectorAll(".quiz-opt").forEach((o, i) => {
            o.classList.remove("wrong");
            if (i === ex.answer) o.classList.add("correct");
          });
          explain.classList.add("show");
          status.className = "quiz-status pass";
          status.textContent = "已答对";
          if (markDone(ex.id)) {
            updateLessonUI(lesson);
            toast("答对了 · 继续下一题");
          }
        } else {
          btn.classList.add("wrong");
          options[ex.answer].classList.add("reveal");
          explain.classList.add("show");
          status.className = "quiz-status";
          status.textContent = "再想一想";
          toast("这个选项不对，解析已经展开。", "error");
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     书单
     ------------------------------------------------------------------ */
  let bookFilter = "all";
  let bookQuery = "";

  function renderBooks() {
    const BOOKS = window.BOOKS || [];
    const stages = [
      { id: "all", label: "全部" },
      { id: "entry", label: "入门 / 复习" },
      { id: "mid", label: "中级核心" },
      { id: "adv", label: "进阶 / 工程" },
      { id: "ref", label: "参考 / 文档" },
    ];

    const list = BOOKS.filter((b) => {
      const okStage = bookFilter === "all" || b.stage === bookFilter;
      const q = bookQuery.trim().toLowerCase();
      const okQuery =
        !q ||
        (b.title + " " + b.author + " " + (b.tags || []).join(" ") + " " + b.why).toLowerCase().includes(q);
      return okStage && okQuery;
    });

    app.innerHTML = `<div class="page">
      <div class="section-head" style="margin-bottom:16px">
        <div>
          <span class="eyebrow">Reading list · 图灵社区 / GitHub / 官方文档</span>
          <h2 style="font-size:34px">把书读薄，把代码写厚</h2>
          <p>课程负责给出骨架和练习，这些书负责补细节。按阶段挑选，不用一次全买。每本都标注了“对应模块”，学完哪节卡住了就翻哪章。</p>
        </div>
      </div>
      <div class="filter-row">
        ${stages
          .map(
            (s) =>
              `<button class="filter-chip ${bookFilter === s.id ? "active" : ""}" type="button" data-stage="${s.id}">${s.label}</button>`
          )
          .join("")}
        <div class="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input id="book-search" type="search" placeholder="搜索书名、作者、主题" value="${esc(bookQuery)}">
        </div>
      </div>
      <div class="books-grid" id="books-grid">
        ${
          list.length
            ? list
                .map(
                  (b) => `<article class="book-card" style="--spine:${b.color}">
            <div class="book-spine"></div>
            <div class="book-inner">
              <div class="book-top">
                <span class="book-stage ${b.stage}">${b.stageLabel}</span>
                <span class="book-type">${b.type}</span>
              </div>
              <h3>${b.title}</h3>
              <div class="book-author">${b.author}${b.publisher ? " · " + b.publisher : ""}</div>
              <p class="book-why">${b.why}</p>
              <div class="book-tags">${(b.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>
              <div class="book-foot">
                <span class="rel">对应：${b.related}</span>
                <a href="${b.link}" target="_blank" rel="noopener">${b.linkLabel || "查看"} ↗</a>
              </div>
            </div>
          </article>`
                )
                .join("")
            : `<div class="empty-state" style="grid-column:1/-1">没有匹配的书，换个关键词试试。</div>`
        }
      </div>
      <div class="daily" style="margin-top:26px">
        <div class="daily-txt"><b>选书原则：</b>同一阶段只精读一本，其余当字典查。练习量不足时，优先回到课程做题，而不是继续买书。</div>
        <a class="btn btn-outline" href="#/cheatsheet">打开速查表 →</a>
      </div>
    </div>`;

    app.querySelectorAll("[data-stage]").forEach((btn) =>
      btn.addEventListener("click", () => {
        bookFilter = btn.dataset.stage;
        renderBooks();
      })
    );
    const search = app.querySelector("#book-search");
    let composing = false;
    search.addEventListener("compositionstart", () => (composing = true));
    search.addEventListener("compositionend", () => {
      composing = false;
      bookQuery = search.value;
      renderBooks();
    });
    search.addEventListener("input", () => {
      if (composing) return;
      bookQuery = search.value;
      const pos = search.selectionStart;
      renderBooks();
      const again = app.querySelector("#book-search");
      again.focus();
      again.setSelectionRange(pos, pos);
    });
  }

  /* ------------------------------------------------------------------
     速查表
     ------------------------------------------------------------------ */
  let sheetQuery = "";

  function renderCheatsheet() {
    const DATA = window.CHEATSHEET || [];
    const q = sheetQuery.trim().toLowerCase();
    const filtered = DATA.map((cat) => {
      const items = cat.items.filter(
        (it) => !q || (it.t + " " + it.code + " " + (it.note || "")).toLowerCase().includes(q)
      );
      return Object.assign({}, cat, { items });
    }).filter((cat) => cat.items.length);

    app.innerHTML = `<div class="page">
      <span class="eyebrow">Cheatsheet · 可搜索</span>
      <div class="section-head">
        <div>
          <h2 style="font-size:34px">常用写法速查</h2>
          <p>写代码时想不起来语法，来这里找。每一条都能直接复制到练习场运行。</p>
        </div>
        <div class="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input id="sheet-search" type="search" placeholder="搜索：推导式 / 装饰器 / 路径" value="${esc(sheetQuery)}">
        </div>
      </div>
      <div class="cheat-grid">
        ${
          filtered.length
            ? filtered
                .map(
                  (cat) => `<section class="cheat-card">
            <div class="cheat-head"><h3>${cat.name}</h3><span class="n">${cat.items.length}</span></div>
            ${cat.items
              .map(
                (it) => `<div class="cheat-item">
                <div class="t">${it.t}<button class="copy-mini" type="button" data-copy>COPY</button></div>
                <pre>${esc(it.code)}</pre>
                ${it.note ? `<div class="note">${it.note}</div>` : ""}
              </div>`
              )
              .join("")}
          </section>`
                )
                .join("")
            : `<div class="empty-state" style="grid-column:1/-1">没有找到，试试更短的关键词。</div>`
        }
      </div>
      <div class="daily" style="margin-top:26px">
        <div class="daily-txt"><b>提示：</b>速查表只是索引，真正的记忆来自手写。复制之后，试着不看屏幕再敲一遍。</div>
        <a class="btn btn-outline" href="#/playground">去练习场验证 →</a>
      </div>
    </div>`;

    const search = app.querySelector("#sheet-search");
    let composing = false;
    search.addEventListener("compositionstart", () => (composing = true));
    search.addEventListener("compositionend", () => {
      composing = false;
      sheetQuery = search.value;
      renderCheatsheet();
    });
    search.addEventListener("input", () => {
      if (composing) return;
      sheetQuery = search.value;
      const pos = search.selectionStart;
      renderCheatsheet();
      const again = app.querySelector("#sheet-search");
      again.focus();
      again.setSelectionRange(pos, pos);
    });
  }

  /* ------------------------------------------------------------------
     练习场
     ------------------------------------------------------------------ */
  const PG_EXAMPLES = [
    {
      name: "数据处理：分组统计",
      tag: "dict / defaultdict",
      code: `from collections import defaultdict

records = [
    ("北京", 120), ("上海", 95), ("北京", 88),
    ("广州", 70), ("上海", 110), ("广州", 60),
]

groups = defaultdict(list)
for city, score in records:
    groups[city].append(score)

report = {
    city: {"count": len(scores), "avg": round(sum(scores) / len(scores), 1)}
    for city, scores in groups.items()
}
print(report)`,
    },
    {
      name: "生成器：分批读取",
      tag: "yield",
      code: `def chunks(items, size):
    for start in range(0, len(items), size):
        yield items[start:start + size]

data = list(range(1, 13))
for batch in chunks(data, 4):
    print(batch)`,
    },
    {
      name: "装饰器：计时 + 缓存",
      tag: "functools",
      code: `import time
from functools import wraps, lru_cache

def timed(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        print(f"{fn.__name__} 用时 {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timed
@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))`,
    },
    {
      name: "数据类：任务模型",
      tag: "dataclass",
      code: `from dataclasses import dataclass, field
from datetime import date

@dataclass
class Task:
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

    def finish(self) -> "Task":
        self.done = True
        return self

tasks = [Task("看完生成器", 1), Task("复习装饰器", 2, tags=["重点"])]
tasks[0].finish()
for t in sorted(tasks, key=lambda x: (x.done, x.priority)):
    print(t)`,
    },
    {
      name: "asyncio：并发协程",
      tag: "async / await",
      code: `import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name} 完成"

async def main():
    results = await asyncio.gather(
        fetch("A", 0.2),
        fetch("B", 0.1),
        fetch("C", 0.3),
    )
    for r in results:
        print(r)

await main()`,
    },
    {
      name: "SQLite 内存数据库",
      tag: "sqlite3",
      code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER)")
conn.executemany(
    "INSERT INTO tasks (title, done) VALUES (?, ?)",
    [("复习生成器", 0), ("写周报", 1), ("跑步", 1)],
)
for row in conn.execute("SELECT id, title, done FROM tasks ORDER BY id"):
    print(row)
print(conn.execute("SELECT COUNT(*) FROM tasks WHERE done = 1").fetchone()[0])`,
    },
    {
      name: "JSON 读写",
      tag: "pathlib / json",
      code: `import json
from pathlib import Path

path = Path("demo.json")
data = {"name": "PyForge", "lessons": 14, "tags": ["python", "practice"]}
path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

loaded = json.loads(path.read_text(encoding="utf-8"))
print(loaded["name"], loaded["lessons"])`,
    },
  ];

  function renderPlayground() {
    app.innerHTML = `<div class="page">
      <span class="eyebrow">Playground · 真实 Python 3</span>
      <div class="section-head">
        <div>
          <h2 style="font-size:34px">自由练习场</h2>
          <p>不判题，随便写。支持标准库、asyncio、文件读写（浏览器虚拟文件系统）。代码只在本地执行。</p>
        </div>
        <span class="side">Ctrl / ⌘ + Enter 运行</span>
      </div>
      <div class="playground-layout">
        <div class="pg-main">
          <div class="pg-head">
            <span class="pg-title">main.py</span>
            <span class="spacer"></span>
            <button class="btn btn-accent btn-sm" type="button" id="pg-run">▶ 运行</button>
            <button class="btn btn-ghost btn-sm" type="button" id="pg-clear">清空</button>
          </div>
          <div id="pg-editor"></div>
          <div class="console" id="pg-console" hidden></div>
        </div>
        <aside class="pg-side">
          <div class="pg-card">
            <h4>示例片段</h4>
            <div class="example-list">
              ${PG_EXAMPLES.map(
                (e, i) =>
                  `<button class="example-btn" type="button" data-example="${i}"><b>${e.name}</b><span>${e.tag}</span></button>`
              ).join("")}
            </div>
          </div>
          <div class="pg-card">
            <h4>能用到什么</h4>
            <p>Python 3.13 标准库的大部分模块、<code class="inline-code">asyncio</code>、<code class="inline-code">json</code>、<code class="inline-code">pathlib</code>。第三方库（requests、numpy）默认不可用，课程练习全部基于标准库，保证随处可跑。</p>
          </div>
          <div class="pg-card">
            <h4>运行限制</h4>
            <p>单次执行超过 10 秒会被终止（防止死循环）。不支持 <code class="inline-code">input()</code> 交互输入，练习请用预置数据。</p>
          </div>
        </aside>
      </div>
    </div>`;

    const mount = document.getElementById("pg-editor");
    const initial = PG_EXAMPLES[0].code;
    let editor;
    let getValue;
    let setValue;

    if (window.CodeMirror) {
      const ta = document.createElement("textarea");
      ta.value = initial;
      mount.appendChild(ta);
      editor = window.CodeMirror.fromTextArea(ta, {
        mode: { name: "python", version: 3 },
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        autoCloseBrackets: true,
        styleActiveLine: true,
        viewportMargin: 200,
        extraKeys: { Tab: (cm) => cm.replaceSelection("    "), "Ctrl-Enter": () => runPG(), "Cmd-Enter": () => runPG() },
      });
      editor.setSize(null, 460);
      getValue = () => editor.getValue();
      setValue = (v) => editor.setValue(v);
    } else {
      const ta = document.createElement("textarea");
      ta.className = "fallback-editor";
      ta.style.minHeight = "460px";
      ta.value = initial;
      ta.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          runPG();
        }
      });
      mount.appendChild(ta);
      getValue = () => ta.value;
      setValue = (v) => (ta.value = v);
    }

    const consoleEl = document.getElementById("pg-console");
    let busy = false;

    async function runPG() {
      if (busy) return;
      busy = true;
      consoleEl.hidden = false;
      consoleEl.innerHTML = consoleMarkup({ loading: true });
      const res = await runner.run(getValue(), null);
      consoleEl.innerHTML = consoleMarkup(res);
      busy = false;
    }

    document.getElementById("pg-run").addEventListener("click", runPG);
    document.getElementById("pg-clear").addEventListener("click", () => {
      setValue("");
      editor && editor.focus();
      consoleEl.hidden = true;
    });
    app.querySelectorAll("[data-example]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setValue(PG_EXAMPLES[Number(btn.dataset.example)].code);
        consoleEl.hidden = true;
        toast("示例已载入，点运行看看结果。");
      });
    });
  }

  /* ------------------------------------------------------------------
     进度页
     ------------------------------------------------------------------ */
  function renderProgress() {
    const s = overallStats();
    const rows = MODULES.map((mod) => {
      const ms = moduleStats(mod);
      return `<div class="prog-row" style="--accent:${mod.accent}">
        <span class="idx">${mod.index}</span>
        <span class="name">${mod.title}</span>
        <div class="track"><i style="width:${ms.pct}%"></i></div>
        <span class="pct">${ms.pct}%</span>
      </div>`;
    }).join("");

    const doneLessons = ALL_LESSONS.filter((l) => lessonStats(l).done === l.exercises.length);
    const doneProjects = PROJECTS.filter((p) => lessonStats(p).done === p.exercises.length);
    const projectRows = PROJECTS.map((p) => {
      const ps = lessonStats(p);
      return `<a class="prog-row" href="#/project/${p.id}" style="--accent:${p.accent}">
        <span class="idx">${p.index}</span>
        <span class="name">${p.title}</span>
        <div class="track"><i style="width:${ps.pct}%"></i></div>
        <span class="pct">${ps.pct}%</span>
      </a>`;
    }).join("");

    app.innerHTML = `<div class="page">
      <span class="eyebrow">Progress · 本地保存</span>
      <div class="progress-hero">
        <div class="big-ring" style="--p:${s.pct}">
          <div class="big-ring-inner"><b>${s.pct}%</b><span>总完成度</span></div>
        </div>
        <div>
          <h2>${s.done === s.total ? "全部通关，接下来靠你自己的项目了" : "保持手感，比看懂更重要"}</h2>
          <p>进度只存在这台设备的浏览器里。清除站点数据会重置，换设备不会同步。</p>
          <div class="prog-stats">
            <div><b>${s.done}/${s.total}</b><span>练习与检查点</span></div>
            <div><b>${s.lessonsDone}/${ALL_LESSONS.length}</b><span>通关课程</span></div>
            <div><b>${s.projectsDone}/${PROJECTS.length}</b><span>通关项目</span></div>
            <div><b>${s.streak}</b><span>连续学习天数</span></div>
            <div><b>${progress.dates.length}</b><span>累计学习日</span></div>
          </div>
        </div>
      </div>

      <div class="section-head">
        <div><h2>模块进度</h2><p>点任意一行回到对应模块的第一课。</p></div>
      </div>
      <div class="prog-modules">${rows}</div>

      <div class="section-head" style="margin-top:40px">
        <div><h2>项目进度</h2><p>每个项目 4 个里程碑，全部通过才算完成。</p></div>
        <a class="btn btn-outline btn-sm" href="#/projects">项目工坊 →</a>
      </div>
      <div class="prog-modules">${projectRows}</div>

      <div class="section-head" style="margin-top:40px">
        <div><h2>已通关课程</h2><p>${doneLessons.length ? "这些课的练习全部通过。" : "还没有通关的课程，先完成一节。"}</p></div>
      </div>
      <div class="lesson-chips">
        ${
          doneLessons.length
            ? doneLessons
                .map(
                  (l) =>
                    `<a class="lesson-chip done" href="#/lesson/${l.id}"><span class="dot"></span><span>${l.title}</span><span class="go">复习 →</span></a>`
                )
                .join("")
            : `<div class="empty-state">从学习路径里选一节开始。</div>`
        }
      </div>

      <div class="section-head" style="margin-top:40px">
        <div><h2>已通关项目</h2><p>${doneProjects.length ? "这些项目的检查点全部通过，可以开始整理 README 与简历描述了。" : "项目不会自动变完整，选一个开始做。"}</p></div>
      </div>
      <div class="lesson-chips">
        ${
          doneProjects.length
            ? doneProjects
                .map(
                  (p) =>
                    `<a class="lesson-chip done" href="#/project/${p.id}"><span class="dot"></span><span>${p.title}</span><span class="go">回顾 →</span></a>`
                )
                .join("")
            : `<div class="empty-state">从项目工坊里选一个开始。</div>`
        }
      </div>

      <div class="danger-zone">
        <button class="btn btn-outline btn-sm" type="button" id="reset-progress">重置全部进度</button>
        <p>会清除练习通过记录与学习日期，代码不会上传，也没有云端副本。</p>
      </div>
    </div>`;

    document.getElementById("reset-progress").addEventListener("click", () => {
      if (!window.confirm("确定重置所有进度？此操作不可撤销。")) return;
      progress = { done: {}, lessons: {}, last: null, dates: [], celebrated: {} };
      saveProgress();
      toast("进度已重置。");
      renderProgress();
    });
  }

  /* ------------------------------------------------------------------
     路由
     ------------------------------------------------------------------ */
  function setNav(name) {
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === name));
  }

  function route() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [pathPart, queryPart] = raw.split("?");
    const params = new URLSearchParams(queryPart || "");
    const parts = pathPart.split("/").filter(Boolean);
    cmMap.clear();

    document.getElementById("nav").classList.remove("open");

    if (parts[0] === "lesson" && parts[1]) {
      setNav("");
      document.title = findLesson(parts[1]) ? `${findLesson(parts[1]).title} · PyForge` : "PyForge";
      renderLesson(parts[1], params);
      return;
    }

    if (parts[0] === "project" && parts[1]) {
      setNav("projects");
      document.title = findProject(parts[1]) ? `${findProject(parts[1]).title} · PyForge` : "项目工坊 · PyForge";
      renderProject(parts[1], params);
      return;
    }

    switch (parts[0]) {
      case "projects":
        setNav("projects");
        document.title = "项目工坊 · PyForge";
        renderProjects();
        break;
      case "books":
        setNav("books");
        document.title = "书单 · PyForge";
        renderBooks();
        break;
      case "cheatsheet":
        setNav("cheatsheet");
        document.title = "速查表 · PyForge";
        renderCheatsheet();
        break;
      case "playground":
        setNav("playground");
        document.title = "自由练习场 · PyForge";
        renderPlayground();
        break;
      case "progress":
        setNav("progress");
        document.title = "我的进度 · PyForge";
        renderProgress();
        break;
      default:
        setNav("home");
        document.title = "PyForge · Python 从基础到进阶训练场";
        renderHome();
        window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /* ------------------------------------------------------------------
     全局交互
     ------------------------------------------------------------------ */
  document.addEventListener("click", (e) => {
    const downloadBtn = e.target.closest("[data-download]");
    if (downloadBtn) {
      const file = fileRegistry.get(downloadBtn.dataset.download);
      if (file) {
        const blob = new Blob([file.code], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast("已下载 " + file.filename);
      }
    }

    const copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
      const host = copyBtn.closest(".cheat-item") || copyBtn.closest(".codeblock");
      const pre = host && host.querySelector("pre");
      const text = pre ? pre.innerText : "";
      const done = () => toast("已复制到剪贴板");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => toast("复制失败，请手动选择", "error"));
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        done();
      }
    }

    const navBtn = e.target.closest("#nav-toggle");
    if (navBtn) document.getElementById("nav").classList.toggle("open");

    const link = e.target.closest("a[href^='#']");
    if (link) {
      // 让移动端菜单在跳转后关闭
      document.getElementById("nav").classList.remove("open");
    }
  });

  window.addEventListener("hashchange", route);

  // 运行时提示
  runner.setStatus("idle");

  if (location.protocol === "file:") {
    document.getElementById("file-warning").hidden = false;
  }

  if (!MODULES.length) {
    app.innerHTML = `<div class="page"><div class="empty-state">课程数据未加载。请确认 assets/js/data 下的文件存在。</div></div>`;
    return;
  }

  try {
    route();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="page"><div class="callout warn">
      <span class="co-icon">!</span>
      <p><span class="co-title">页面渲染失败</span>${esc(err && err.message ? err.message : String(err))}</p>
    </div></div>`;
  }
})();

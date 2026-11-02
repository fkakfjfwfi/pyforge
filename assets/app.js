/* PyForge 前端逻辑：渲染、进度、代码高亮、自测、筛选 */
(function () {
  "use strict";

  var KEY = "pyforge.progress.v1";
  var LAST = "pyforge.last.v1";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var KW = "False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|match|case";
  var BI = "print|len|range|enumerate|zip|map|filter|sum|min|max|sorted|reversed|list|dict|set|tuple|str|int|float|bool|bytes|bytearray|open|isinstance|issubclass|type|getattr|setattr|hasattr|delattr|super|property|staticmethod|classmethod|iter|next|any|all|vars|dir|id|hash|repr|format|input|abs|round|divmod|pow|chr|ord|frozenset|complex|object|callable|slice|Exception|BaseException|ValueError|TypeError|KeyError|IndexError|StopIteration|StopAsyncIteration|RuntimeError|AttributeError|ZeroDivisionError|TimeoutError|ConnectionError|OSError|FileNotFoundError|NotImplementedError";

  var TOKEN_RE = new RegExp(
    "(#[^\\n]*)" +
    "|((?:[rRbBuUfF]{0,2})(?:\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'))" +
    "|(@[A-Za-z_]\\w*(?:\\.\\w+)*)" +
    "|\\b(" + KW + ")\\b" +
    "|\\b(" + BI + ")\\b" +
    "|\\b(\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)\\b" +
    "|\\b(self|cls)\\b",
    "g"
  );

  function highlight(code) {
    var escaped = escapeHtml(code);
    return escaped.replace(TOKEN_RE, function (m, cm, st, dec, kw, bi, num, sc) {
      if (cm) return '<span class="tk-cm">' + cm + "</span>";
      if (st) return '<span class="tk-st">' + st + "</span>";
      if (dec) return '<span class="tk-dec">' + dec + "</span>";
      if (kw) return '<span class="tk-kw">' + kw + "</span>";
      if (bi) return '<span class="tk-bi">' + bi + "</span>";
      if (num) return '<span class="tk-num">' + num + "</span>";
      if (sc) return '<span class="tk-self">' + sc + "</span>";
      return m;
    });
  }

  function codeBlock(b) {
    var raw = String(b.x || "").replace(/^\n/, "").replace(/\s+$/, "");
    return '<div class="code-block">' +
      '<div class="code-head"><span class="code-title">' + escapeHtml(b.title || "python3") + "</span>" +
      '<button class="copy-btn" type="button">复制</button></div>' +
      "<pre><code>" + highlight(raw) + "</code></pre>" +
      (b.out ? '<div class="code-out"><b>输出</b>' + escapeHtml(b.out).replace(/\n/g, "<br>") + "</div>" : "") +
      "</div>";
  }

  function blockHtml(b) {
    switch (b.t) {
      case "lead":
        return '<p class="sec-p" style="font-size:15.5px;color:#dbe5f4">' + b.x + "</p>";
      case "h":
        return '<h3 class="sec-title">' + b.x + "</h3>";
      case "p":
        return '<p class="sec-p">' + b.x + "</p>";
      case "list":
        return '<ul class="sec-list">' + b.x.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>";
      case "code":
        return codeBlock(b);
      case "note":
        return '<div class="callout ' + (b.kind || "info") + '">' +
          '<div class="co-ico">' + ({ tip: "✓", warn: "!", danger: "×", info: "i" }[b.kind || "info"]) + "</div>" +
          '<div><div class="callout-t">' + (b.title || "") + '</div><div class="callout-b">' + b.x + "</div></div></div>";
      case "table":
        return '<div class="table-wrap"><table><thead><tr>' +
          b.head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
          "</tr></thead><tbody>" +
          b.rows.map(function (r) {
            return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
          }).join("") +
          "</tbody></table></div>";
      case "steps":
        return '<div class="steps">' + b.x.map(function (s, i) {
          return '<div class="step"><span class="sn">' + (i + 1) + "</span><div><b>" + s.title + "</b><p>" + s.body + "</p></div></div>";
        }).join("") + "</div>";
      case "compare":
        return '<div class="grid g2">' + b.x.map(function (c, i) {
          return '<div class="card" style="padding:18px"><div class="card-title" style="color:' + (i === 0 ? "var(--rose)" : "var(--lime)") + '">' + c.title + "</div>" +
            '<ul class="sec-list" style="font-size:13px;margin:8px 0 0">' + c.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul></div>";
        }).join("") + "</div>";
      default:
        return "";
    }
  }

  /* ---------------- 进度 ---------------- */
  function getProgress() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function setProgress(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {}
  }
  function isDone(id) { return !!getProgress()[id]; }
  function setDone(id, val) {
    var p = getProgress();
    if (val) p[id] = true; else delete p[id];
    setProgress(p);
    return p;
  }
  function setLast(id) {
    try { localStorage.setItem(LAST, id); } catch (e) {}
  }
  function getLast() {
    try { return localStorage.getItem(LAST) || ""; } catch (e) { return ""; }
  }
  function doneCount() { return Object.keys(getProgress()).filter(function (k) { return /^ch\d+$/.test(k); }).length; }
  function pct() { return Math.round((doneCount() / 12) * 100); }

  /* ---------------- 章节渲染 ---------------- */
  function renderBlocks(blocks) {
    return blocks.map(blockHtml).join("");
  }

  function chapterHTML(ch, idx, total) {
    var prev = idx > 0 ? chapterById(chapters[idx - 1].id) : null;
    var next = idx < total - 1 ? chapterById(chapters[idx + 1].id) : null;

    var html = '<div class="ch-head">' +
      '<div class="ch-tags">' +
        '<span class="tag tag-cyan">第 ' + ch.no + " 章</span>" +
        '<span class="tag tag-violet">' + ch.stageName + "</span>" +
        ch.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("") +
      "</div>" +
      "<h1>" + ch.title + "</h1>" +
      '<p class="sub">' + ch.subtitle + "</p>" +
      '<div class="ch-meta"><span>建议用时 <b>' + ch.time + "</b></span><span>难度 <b>" + ch.level + "</b></span><span>代码示例 <b>" + countCode(ch) + " 个</b></span></div>" +
      "</div>";

    html += '<div class="scene"><b>CRAWLER SCENE</b><p>' + ch.crawlerScene + "</p></div>";

    html += '<div class="goals"><h4>本章目标</h4><ul>' +
      ch.goals.map(function (g) { return "<li>" + g + "</li>"; }).join("") + "</ul></div>";

    html += ch.blocks.map(blockHtml).join("");

    if (ch.pitfalls && ch.pitfalls.length) {
      html += '<h3 class="sec-title">避坑清单</h3>';
      html += ch.pitfalls.map(function (p) {
        return '<div class="pitfall"><span class="pi">PITFALL</span><div><b>' + p.title + "</b><p>" + p.body + "</p></div></div>";
      }).join("");
    }

    if (ch.cheatsheet && ch.cheatsheet.length) {
      html += '<h3 class="sec-title">速查表</h3><div class="cheat">' +
        ch.cheatsheet.map(function (r) {
          return '<div class="cheat-row"><div class="k">' + r[0] + '</div><div class="v">' + r[1] + "</div></div>";
        }).join("") + "</div>";
    }

    if (ch.quiz && ch.quiz.length) {
      html += '<div class="quiz-wrap"><div class="quiz-title"><span class="qi">?</span>章节自测 · 共 ' + ch.quiz.length + " 题</div>";
      ch.quiz.forEach(function (q, qi) {
        html += '<div class="quiz" data-answered="0"><div class="quiz-q"><span class="qn">Q' + (qi + 1) + "</span>" + q.q + "</div><div class=\"quiz-opts\">";
        q.options.forEach(function (o, oi) {
          html += '<button class="qopt" type="button" data-answer="' + q.answer + '" data-idx="' + oi + '"><span class="ol">' + String.fromCharCode(65 + oi) + "</span><span>" + o + "</span></button>";
        });
        html += '</div><div class="qexp"><b>解析</b>' + q.explain + "</div></div>";
      });
      html += "</div>";
    }

    if (ch.tasks && ch.tasks.length) {
      html += '<h3 class="sec-title">动手练习</h3><div class="tasks">';
      ch.tasks.forEach(function (t) {
        var lv = t.level === "简单" ? "easy" : (t.level === "挑战" ? "hard" : "mid");
        html += '<div class="task"><div class="task-top"><b>' + t.title + '</b><span class="task-level ' + lv + '">' + (t.level || "进阶") + "</span></div>" +
          "<p>" + t.desc + "</p>" +
          (t.file ? '<div class="file">本地练习文件：<code>' + t.file + "</code></div>" : "") +
          "</div>";
      });
      html += "</div>";
    }

    html += '<button class="mark-done' + (isDone(ch.id) ? " is-done" : "") + '" type="button" data-mark="' + ch.id + '">' +
      (isDone(ch.id) ? "✓ 已完成本章（点击取消）" : "标记本章已学完") + "</button>";

    html += '<div class="ch-nav">' +
      (prev ? '<a href="#' + prev.id + '" data-goto="' + prev.id + '"><small>← 上一章</small><b>' + prev.title + "</b></a>" : "<span></span>") +
      (next ? '<a class="next" href="#' + next.id + '" data-goto="' + next.id + '"><small>下一章 →</small><b>' + next.title + "</b></a>" : "<span></span>") +
      "</div>";

    return html;
  }

  function countCode(ch) { return ch.blocks.filter(function (b) { return b.t === "code"; }).length; }
  function chapterById(id) { return chapters.filter(function (c) { return c.id === id; })[0]; }

  var chapters = window.CHAPTERS || [];

  /* ---------------- 学习页 ---------------- */
  function initLearn() {
    if (!chapters.length) return;
    var sidebar = $("#sbList"), mount = $("#chapterMount"), search = $("#sbSearch");
    if (!sidebar || !mount) return;

    var bar = document.createElement("div");
    bar.className = "read-bar";
    document.body.appendChild(bar);

    function sidebarHTML(filter) {
      var groups = {};
      chapters.forEach(function (c) {
        if (filter) {
          var hay = (c.title + c.subtitle + c.tags.join(" ") + c.stageName).toLowerCase();
          if (hay.indexOf(filter.toLowerCase()) === -1) return;
        }
        if (!groups[c.stage]) groups[c.stage] = { name: c.stageName, items: [] };
        groups[c.stage].items.push(c);
      });
      var out = "";
      Object.keys(groups).forEach(function (g) {
        out += '<div class="sb-stage">STAGE ' + g + " · " + groups[g].name + "</div>";
        groups[g].items.forEach(function (c) {
          out += '<div class="sb-item' + (isDone(c.id) ? " done" : "") + '" data-ch="' + c.id + '">' +
            '<span class="dot"></span><span class="n">' + String(c.no).padStart(2, "0") + "</span><span>" + c.title + "</span></div>";
        });
      });
      if (!out) out = '<div class="sb-hint">没有匹配的章节，换个关键词试试。</div>';
      return out;
    }

    function paintSidebar(filter) {
      sidebar.innerHTML = sidebarHTML(filter);
      var sp = $("#sbPercent");
      if (sp) sp.textContent = doneCount() + "/12";
      var sbBar = $("#sbBar");
      if (sbBar) sbBar.style.width = pct() + "%";
    }

    function render(id, push) {
      var ch = chapterById(id) || chapters[0];
      var idx = chapters.indexOf(ch);
      mount.innerHTML = chapterHTML(ch, idx, chapters.length);
      $$(".sb-item").forEach(function (el) {
        el.classList.toggle("active", el.getAttribute("data-ch") === ch.id);
      });
      setLast(ch.id);
      mount.setAttribute("data-current", ch.id);
      var topY = mount.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top: Math.max(0, topY), behavior: "auto" });
      if (push && location.hash !== "#" + ch.id) {
        try { history.replaceState(null, "", "#" + ch.id); } catch (e) {}
      }
      $$(".reveal", mount).forEach(function (el) { el.classList.add("in"); });
    }

    paintSidebar("");

    sidebar.addEventListener("click", function (e) {
      var item = e.target.closest(".sb-item");
      if (!item) return;
      render(item.getAttribute("data-ch"), true);
    });

    if (search) {
      search.addEventListener("input", function () {
        paintSidebar(this.value.trim());
        $$(".sb-item").forEach(function (el) {
          var cur = $("#chapterMount").getAttribute("data-current");
          el.classList.toggle("active", el.getAttribute("data-ch") === cur);
        });
      });
    }

    mount.addEventListener("click", function (e) {
      var qopt = e.target.closest(".qopt");
      if (qopt) {
        var quiz = qopt.closest(".quiz");
        if (!quiz || quiz.getAttribute("data-answered") === "1") return;
        quiz.setAttribute("data-answered", "1");
        var answer = parseInt(qopt.getAttribute("data-answer"), 10);
        var picked = parseInt(qopt.getAttribute("data-idx"), 10);
        $$(".qopt", quiz).forEach(function (b) {
          b.disabled = true;
          var i = parseInt(b.getAttribute("data-idx"), 10);
          if (i === answer) b.classList.add("right");
        });
        if (picked !== answer) qopt.classList.add("wrong");
        var exp = $(".qexp", quiz);
        if (exp) exp.classList.add("show");
        return;
      }

      var nav = e.target.closest("[data-goto]");
      if (nav) {
        e.preventDefault();
        render(nav.getAttribute("data-goto"), true);
        return;
      }

      var mark = e.target.closest("[data-mark]");
      if (mark) {
        var id = mark.getAttribute("data-mark");
        var now = !isDone(id);
        setDone(id, now);
        mark.classList.toggle("is-done", now);
        mark.textContent = now ? "✓ 已完成本章（点击取消）" : "标记本章已学完";
        paintSidebar(search ? search.value.trim() : "");
        var current = chapterById(id);
        $$(".sb-item").forEach(function (el) {
          el.classList.toggle("active", el.getAttribute("data-ch") === id);
        });
        return;
      }
    });

    window.addEventListener("hashchange", function () {
      var id = location.hash.replace("#", "");
      if (chapterById(id)) render(id, false);
    });

    window.addEventListener("scroll", function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }, { passive: true });

    var initial = location.hash.replace("#", "");
    if (!chapterById(initial)) {
      var last = getLast();
      initial = chapterById(last) ? last : chapters[0].id;
    }
    render(initial, true);
    mount.setAttribute("data-current", initial);
  }

  /* ---------------- 首页 ---------------- */
  function initHome() {
    var mount = $("#roadmapMount");
    if (mount && chapters.length) {
      var groups = {};
      chapters.forEach(function (c) {
        if (!groups[c.stage]) groups[c.stage] = { name: c.stageName, items: [], desc: c.stageDesc || "" };
        groups[c.stage].items.push(c);
      });
      mount.innerHTML = Object.keys(groups).map(function (g) {
        var grp = groups[g];
        return '<div class="stage"><div class="stage-head"><span class="stage-no">' + g + '</span><h3>Stage ' + g + " · " + grp.name + "</h3><span>" + grp.items.length + " CHAPTERS</span></div>" +
          '<div class="chapter-grid">' +
          grp.items.map(function (c) {
            return '<a class="chapter-card' + (isDone(c.id) ? " done" : "") + '" href="learn.html#' + c.id + '">' +
              '<div class="cc-top"><span class="cc-no">CH ' + String(c.no).padStart(2, "0") + '</span><span class="cc-time">' + c.time + "</span></div>" +
              "<h4>" + c.title + "</h4><p>" + c.subtitle + '</p><span class="cc-done">✓ 已学完</span></a>';
          }).join("") + "</div></div>";
      }).join("");
    }

    var hp = $("#homeProgress");
    if (hp) {
      hp.textContent = pct() + "%";
      var txt = $("#homeProgressText");
      if (txt) txt.textContent = doneCount() + " / 12 章已完成";
    }
    var cont = $("#continueLink");
    if (cont) {
      var last = chapterById(getLast()) ? getLast() : "ch01";
      cont.setAttribute("href", "learn.html#" + last);
      var lab = $("#continueLabel");
      if (lab) {
        var c = chapterById(last);
        lab.textContent = c ? "继续：" + c.title : "从第 1 章开始";
      }
    }
  }

  /* ---------------- 书单 ---------------- */
  function initBooks() {
    var grid = $("#bookGrid");
    if (!grid) return;
    var books = window.BOOKS || [];
    grid.innerHTML = books.map(function (b) {
      return '<div class="book reveal" data-cat="' + b.cats.join(" ") + '">' +
        '<div class="book-top"><div class="spine"><span>' + (b.spine || "PY") + "</span></div>" +
        "<div><h3>" + b.title + "</h3>" + (b.orig ? '<div class="orig">' + b.orig + "</div>" : "") +
        '<div class="author">' + b.author + "</div>" +
        (b.rating ? '<div class="rating">★ ' + b.rating + "</div>" : "") + "</div></div>" +
        '<p class="why">' + b.why + "</p>" +
        '<div class="meta">' + b.meta.map(function (m) { return '<span class="tag">' + m + "</span>"; }).join("") + "</div>" +
        '<div class="readhow">读法：' + b.how + "</div>" +
        '<a class="link" href="' + b.link + '" target="_blank" rel="noopener">' + b.linkText + " ↗</a>" +
        "</div>";
    }).join("");

    $$(".chip[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        $$(".chip[data-filter]").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var f = chip.getAttribute("data-filter");
        $$("#bookGrid .book").forEach(function (el) {
          el.classList.toggle("hide", f !== "all" && el.getAttribute("data-cat").indexOf(f) === -1);
        });
      });
    });

    var gh = $("#ghGrid");
    if (gh && window.GITHUB_RESOURCES) {
      gh.innerHTML = window.GITHUB_RESOURCES.map(function (r) {
        return '<a class="gh-card reveal" href="' + r.link + '" target="_blank" rel="noopener">' +
          '<span class="star">' + r.star + "</span><div><b>" + r.title + "</b><span>" + r.desc + "</span></div></a>";
      }).join("");
    }
    observeReveal();
  }

  /* ---------------- 视频 ---------------- */
  function initVideos() {
    var grid = $("#videoGrid");
    if (!grid) return;
    var videos = window.VIDEOS || [];
    grid.innerHTML = videos.map(function (v) {
      return '<div class="video reveal">' +
        '<div class="video-cover"><span class="vc-tag">' + v.platform + '</span><span class="play">▶</span></div>' +
        '<div class="video-body"><h3>' + v.title + "</h3>" +
        '<div class="author">' + v.author + " · " + v.level + "</div>" +
        '<ul class="takeaways">' + v.takeaways.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" +
        '<div class="video-meta"><span class="vm">' + v.length + '</span><span class="vm">对应 ' + v.chapter + "</span>" +
        '<a href="' + v.link + '" target="_blank" rel="noopener">观看原课 ↗</a></div></div></div>';
    }).join("");
    observeReveal();
  }

  /* ---------------- 脚本拆解 ---------------- */
  function initScripts() {
    var mount = $("#scriptMount");
    if (!mount) return;
    var list = window.SCRIPTS || [];

    function draw(cat) {
      var out = list.filter(function (s) { return !cat || cat === "all" || s.cat === cat; });
      mount.innerHTML = out.map(function (s, i) {
        var lv = s.level === "基础" ? "easy" : s.level === "挑战" ? "hard" : "mid";
        return '<article class="script-card' + (i === 0 ? " open" : "") + '">' +
          '<div class="script-head" role="button" tabindex="0">' +
            '<span class="eno">SCRIPT ' + s.no + "</span>" +
            "<h2>" + s.title + "</h2>" +
            '<span class="tag">' + s.cat + "</span>" +
            '<span class="task-level ' + lv + '">' + s.level + "</span>" +
            '<span class="arrow">▶</span>' +
          "</div>" +
          '<div class="script-body">' +
            '<p class="script-sub">' + s.subtitle + '</p>' +
            '<div class="scene"><b>为什么值得拆</b><p>' + s.scene + "</p></div>" +
            '<div class="script-meta"><span>' + s.time + '</span><span>' + s.tags.join(" · ") + "</span></div>" +
            '<h3 class="sec-title">需求拆解</h3><ul class="reqs">' +
              s.requirements.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul>" +
            '<h3 class="sec-title">逻辑流程</h3><div class="steps">' +
              s.flow.map(function (f, fi) {
                return '<div class="step"><span class="sn">' + (fi + 1) + '</span><div><b>' + f.title + "</b><p>" + f.body + "</p></div></div>";
              }).join("") + "</div>" +
            '<h3 class="sec-title">完整脚本</h3>' +
              codeBlock({ x: s.code, title: s.id + ".py" }) +
            '<h3 class="sec-title">逐段讲解</h3><div class="walk-grid">' +
              s.walkthrough.map(function (w, wi) {
                return '<div class="walk-item"><span class="wn">' + (wi + 1) + '</span><div><b>' + w.title + "</b><p>" + w.body + "</p></div></div>";
              }).join("") + "</div>" +
            '<h3 class="sec-title">逻辑写错会怎样</h3>' +
              s.wrong.map(function (w) {
                return '<div class="pitfall"><span class="pi">LOGIC</span><div><b>' + w.title + "</b><p>" + w.body + "</p></div></div>";
              }).join("") +
            '<h3 class="sec-title">可复用点</h3><div class="reuse">' +
              s.reuse.map(function (r) { return '<span class="tag tag-lime">' + r + "</span>"; }).join("") + "</div>" +
            '<div class="callout tip" style="margin-top:22px"><div class="co-ico">✓</div><div><div class="callout-t">写之前先问自己</div><div class="callout-b">' + s.tip + "</div></div></div>" +
          "</div></article>";
      }).join("") || '<div class="card"><p>这个分类下还没有脚本。</p></div>';

      $$(".script-head", mount).forEach(function (h) {
        function toggle() { h.parentNode.classList.toggle("open"); }
        h.addEventListener("click", toggle);
        h.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
        });
      });
    }

    $$(".chip[data-scfilter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        $$(".chip[data-scfilter]").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        draw(chip.getAttribute("data-scfilter"));
      });
    });
    draw("all");

    var repos = $("#scriptRepos");
    if (repos && window.SCRIPT_REPOS) {
      repos.innerHTML = window.SCRIPT_REPOS.map(function (r) {
        return '<a class="gh-card reveal" href="' + r.link + '" target="_blank" rel="noopener">' +
          '<span class="star">GH</span><div><b>' + r.name + "</b><span>" + r.desc + "</span></div></a>";
      }).join("");
    }
    observeReveal();
  }

  /* ---------------- 练习 ---------------- */
  function initPractice() {
    var mount = $("#exerMount");
    if (!mount) return;
    var list = window.EXERCISES || [];

    function draw(filter, level) {
      var out = list.filter(function (e) {
        var okF = !filter || filter === "all" || String(e.group) === filter;
        var okL = !level || level === "all" || e.level === level;
        return okF && okL;
      });
      mount.innerHTML = out.length ? out.map(function (e) {
        return '<div class="exer"><div class="exer-head" role="button" tabindex="0">' +
          '<span class="eno">CH ' + String(e.ch).padStart(2, "0") + " · " + e.no + '</span><h3>' + e.title + '</h3>' +
          '<span class="task-level ' + (e.level === "基础" ? "easy" : e.level === "挑战" ? "hard" : "mid") + '">' + e.level + "</span>" +
          '<span class="arrow">▶</span></div>' +
          '<div class="exer-body"><div class="exer-scene">' + e.scene + "</div>" +
          '<div class="sec-p" style="font-size:13px;color:var(--muted);margin-bottom:6px">要求</div>' +
          '<ul class="reqs">' + e.reqs.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul>" +
          '<details class="fold"><summary>提示</summary><div class="sec-p" style="font-size:13px">' + e.hint + "</div></details>" +
          '<details class="fold"><summary>参考答案</summary>' + codeBlock({ x: e.answer, title: e.file || "solution.py" }) + "</details>" +
          "</div></div>";
      }).join("") : '<div class="card"><p>没有匹配的练习。</p></div>';

      $$(".exer-head", mount).forEach(function (h) {
        h.addEventListener("click", function () { h.parentNode.classList.toggle("open"); });
        h.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); h.parentNode.classList.toggle("open"); }
        });
      });
    }

    var curCh = "all", curLv = "all";
    $$(".chip[data-chfilter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        $$(".chip[data-chfilter]").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        curCh = chip.getAttribute("data-chfilter");
        draw(curCh, curLv);
      });
    });
    $$(".chip[data-lvfilter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        $$(".chip[data-lvfilter]").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        curLv = chip.getAttribute("data-lvfilter");
        draw(curCh, curLv);
      });
    });
    draw("all", "all");
  }

  /* ---------------- 通用交互 ---------------- */
  function initNav() {
    var toggle = $(".nav-toggle"), links = $(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    }
    var file = (location.pathname.split("/").pop() || "index.html");
    $$(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.split("#")[0] === file && !a.classList.contains("nav-cta")) a.classList.add("active");
    });
  }

  function initCopy() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".copy-btn");
      if (!btn) return;
      var block = btn.closest(".code-block");
      var code = block ? $("code", block) : null;
      if (!code) return;
      var text = code.textContent;
      function done() {
        btn.textContent = "已复制";
        btn.classList.add("ok");
        setTimeout(function () { btn.textContent = "复制"; btn.classList.remove("ok"); }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
    function fallback(text, done) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (err) {}
      document.body.removeChild(ta);
    }
  }

  function observeReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initCopy();
    observeReveal();
    var page = document.body.getAttribute("data-page");
    if (page === "home") initHome();
    if (page === "learn") initLearn();
    if (page === "books") initBooks();
    if (page === "videos") initVideos();
    if (page === "practice") initPractice();
    if (page === "scripts") initScripts();
  });

  window.PY = {
    highlight: highlight,
    escapeHtml: escapeHtml,
    codeBlock: codeBlock,
    renderBlocks: renderBlocks,
    getProgress: getProgress,
    setDone: setDone,
    isDone: isDone,
    pct: pct,
    doneCount: doneCount,
    chapterById: chapterById
  };
})();

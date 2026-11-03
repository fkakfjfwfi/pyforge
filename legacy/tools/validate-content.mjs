#!/usr/bin/env node
/**
 * 内容校验：章节 / 脚本 / 练习 / 书单 / 视频 的结构与引用检查。
 *
 * 用法：
 *   node tools/validate-content.mjs
 *
 * 失败时退出码 1，并打印精确字段路径。
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function fail(message) {
  errors.push(message);
}
function need(cond, message) {
  if (!cond) fail(message);
}
function isStr(value, message, min = 1) {
  need(typeof value === "string" && value.trim().length >= min, message);
}
function isArr(value, message, min = 1) {
  need(Array.isArray(value) && value.length >= min, message);
}
function isHttp(value, message) {
  need(typeof value === "string" && /^https?:\/\//.test(value), message);
}

function loadData(files) {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    need(fs.existsSync(abs), `缺少数据文件: ${rel}`);
    if (!fs.existsSync(abs)) continue;
    try {
      vm.runInContext(fs.readFileSync(abs, "utf8"), sandbox, { filename: rel });
    } catch (err) {
      fail(`${rel} 执行失败: ${err.message}`);
    }
  }
  return sandbox.window;
}

const W = loadData([
  "data/chapters-1.js",
  "data/chapters-2.js",
  "data/scripts.js",
  "data/labs.js",
  "data/practice.js",
  "data/books.js",
  "data/videos.js",
]);

/* ---------------- 章节 ---------------- */
const chapters = W.CHAPTERS || [];
need(chapters.length === 12, `章节数量应为 12，实际 ${chapters.length}`);
const chapterIds = new Set();

chapters.forEach((ch, i) => {
  const p = `chapter[${i}](${(ch && ch.id) || "?"})`;
  need(/^ch\d{2}$/.test(ch.id || ""), `${p}.id 格式应为 ch01`);
  need(!chapterIds.has(ch.id), `${p}.id 重复: ${ch.id}`);
  chapterIds.add(ch.id);
  need(Number.isInteger(ch.no) && ch.no >= 1 && ch.no <= 12, `${p}.no 应为 1..12`);
  need([1, 2, 3].includes(ch.stage), `${p}.stage 应为 1..3`);
  isStr(ch.stageName, `${p}.stageName 不能为空`);
  isStr(ch.title, `${p}.title 不能为空`);
  isStr(ch.subtitle, `${p}.subtitle 不能为空`);
  isStr(ch.crawlerScene, `${p}.crawlerScene 不能为空`);
  isStr(ch.time, `${p}.time 不能为空`);
  isStr(ch.level, `${p}.level 不能为空`);
  isArr(ch.tags, `${p}.tags 至少 2 个`, 2);
  isArr(ch.goals, `${p}.goals 至少 3 条`, 3);
  isArr(ch.blocks, `${p}.blocks 至少 4 块`, 4);
  isArr(ch.quiz, `${p}.quiz 至少 3 题`, 3);
  isArr(ch.tasks, `${p}.tasks 至少 1 个`, 1);
  isArr(ch.cheatsheet, `${p}.cheatsheet 至少 4 行`, 4);

  (ch.blocks || []).forEach((b, bi) => {
    const bp = `${p}.blocks[${bi}]`;
    const allowed = ["lead", "h", "p", "list", "code", "note", "table", "steps", "compare"];
    need(allowed.includes(b.t), `${bp}.t 未知类型: ${b.t}`);
    if (b.t === "code") isStr(b.x, `${bp}.x 代码不能为空`);
    if (["h", "p", "lead", "note"].includes(b.t)) isStr(b.x, `${bp}.x 不能为空`);
    if (b.t === "list") isArr(b.x, `${bp}.x 应为数组`);
    if (b.t === "table") {
      isArr(b.head, `${bp}.head 不能为空`);
      isArr(b.rows, `${bp}.rows 不能为空`);
      (b.rows || []).forEach((r, ri) => need(r.length === b.head.length, `${bp}.rows[${ri}] 列数与 head 不一致`));
    }
    if (b.t === "steps" || b.t === "compare") isArr(b.x, `${bp}.x 应为数组`);
  });

  (ch.quiz || []).forEach((q, qi) => {
    const qp = `${p}.quiz[${qi}]`;
    isStr(q.q, `${qp}.q 不能为空`);
    isArr(q.options, `${qp}.options 至少 2 个`, 2);
    need(Number.isInteger(q.answer), `${qp}.answer 应为整数`);
    need(q.answer >= 0 && q.answer < (q.options || []).length, `${qp}.answer 越界`);
    isStr(q.explain, `${qp}.explain 不能为空`);
  });

  (ch.tasks || []).forEach((t, ti) => {
    isStr(t.title, `${p}.tasks[${ti}].title 不能为空`);
    isStr(t.desc, `${p}.tasks[${ti}].desc 不能为空`);
  });

  (ch.cheatsheet || []).forEach((r, ri) => {
    need(Array.isArray(r) && r.length === 2, `${p}.cheatsheet[${ri}] 应为 [语法, 说明]`);
  });
});

/* ---------------- 脚本拆解 ---------------- */
const scripts = W.SCRIPTS || [];
need(scripts.length === 6, `脚本数量应为 6，实际 ${scripts.length}`);
const scriptIds = new Set();

scripts.forEach((s, i) => {
  const p = `script[${i}](${(s && s.id) || "?"})`;
  need(!scriptIds.has(s.id), `${p}.id 重复`);
  scriptIds.add(s.id);
  isStr(s.no, `${p}.no 不能为空`);
  need(["文件", "数据", "网络"].includes(s.cat), `${p}.cat 应为 文件/数据/网络`);
  need(["基础", "进阶", "挑战"].includes(s.level), `${p}.level 非法`);
  isStr(s.title, `${p}.title 不能为空`);
  isStr(s.subtitle, `${p}.subtitle 不能为空`);
  isStr(s.scene, `${p}.scene 不能为空`);
  isStr(s.code, `${p}.code 脚本不能为空`);
  isStr(s.tip, `${p}.tip 不能为空`);
  isArr(s.tags, `${p}.tags 至少 2 个`, 2);
  isArr(s.requirements, `${p}.requirements 至少 3 条`, 3);
  isArr(s.flow, `${p}.flow 至少 3 步`, 3);
  isArr(s.walkthrough, `${p}.walkthrough 至少 3 条`, 3);
  isArr(s.wrong, `${p}.wrong 至少 2 条`, 2);
  isArr(s.reuse, `${p}.reuse 至少 2 条`, 2);
  (s.flow || []).forEach((f, fi) => {
    isStr(f.title, `${p}.flow[${fi}].title 不能为空`);
    isStr(f.body, `${p}.flow[${fi}].body 不能为空`);
  });
  (s.walkthrough || []).forEach((w, wi) => {
    isStr(w.title, `${p}.walkthrough[${wi}].title 不能为空`);
    isStr(w.body, `${p}.walkthrough[${wi}].body 不能为空`);
  });
  (s.wrong || []).forEach((w, wi) => {
    isStr(w.title, `${p}.wrong[${wi}].title 不能为空`);
    isStr(w.body, `${p}.wrong[${wi}].body 不能为空`);
  });
});

/* ---------------- 交互实验室 ---------------- */
const labs = W.LABS || [];
need(labs.length === 9, `实验室数量应为 9，实际 ${labs.length}`);
const labIds = new Set();

labs.forEach((lab, i) => {
  const p = `lab[${i}](${(lab && lab.id) || "?"})`;
  need(!labIds.has(lab.id), `${p}.id 重复`);
  labIds.add(lab.id);
  isStr(lab.title, `${p}.title 不能为空`);
  isStr(lab.subtitle, `${p}.subtitle 不能为空`);
  isStr(lab.setup, `${p}.setup 不能为空`);
  isStr(lab.code, `${p}.code 不能为空`);
  isArr(lab.params, `${p}.params 不能为空`);

  const keys = new Set();
  (lab.params || []).forEach((param, pi) => {
    const pp = `${p}.params[${pi}]`;
    isStr(param.key, `${pp}.key 不能为空`);
    need(!keys.has(param.key), `${pp}.key 重复: ${param.key}`);
    keys.add(param.key);
    isStr(param.label, `${pp}.label 不能为空`);
    need(["text", "number", "checkbox", "select"].includes(param.type), `${pp}.type 非法`);
    if (param.type === "select") {
      isArr(param.options, `${pp}.options 不能为空`, 2);
      need(param.options.some((o) => o.value === param.value), `${pp}.value 不在 options 中`);
    }
    if (param.type === "number") {
      need(typeof param.value === "number" && !Number.isNaN(param.value), `${pp}.value 应为数字`);
    }
  });
});

/* ---------------- 练习 ---------------- */
const exercises = W.EXERCISES || [];
need(exercises.length === 19, `练习数量应为 19，实际 ${exercises.length}`);
exercises.forEach((e, i) => {
  const p = `exercise[${i}](${e.no})`;
  need(Number.isInteger(e.ch) && e.ch >= 1 && e.ch <= 12, `${p}.ch 应为 1..12`);
  need([1, 2, 3].includes(e.group), `${p}.group 应为 1..3`);
  need(["基础", "进阶", "挑战"].includes(e.level), `${p}.level 非法`);
  isStr(e.title, `${p}.title 不能为空`);
  isStr(e.scene, `${p}.scene 不能为空`);
  isStr(e.hint, `${p}.hint 不能为空`);
  isStr(e.answer, `${p}.answer 不能为空`);
  isArr(e.reqs, `${p}.reqs 至少 2 条`, 2);
  isStr(e.file, `${p}.file 不能为空`);
  if (e.file) need(fs.existsSync(path.join(ROOT, e.file)), `${p}.file 不存在: ${e.file}`);
});

/* ---------------- 书单 ---------------- */
const books = W.BOOKS || [];
need(books.length === 16, `书籍数量应为 16，实际 ${books.length}`);
books.forEach((b, i) => {
  const p = `book[${i}](${b.title})`;
  isStr(b.title, `${p}.title 不能为空`);
  isStr(b.author, `${p}.author 不能为空`);
  isStr(b.why, `${p}.why 不能为空`);
  isStr(b.how, `${p}.how 不能为空`);
  isArr(b.cats, `${p}.cats 不能为空`);
  isArr(b.meta, `${p}.meta 不能为空`);
  isHttp(b.link, `${p}.link 应为 http(s) 链接`);
});

const repos = W.GITHUB_RESOURCES || [];
need(repos.length === 7, `GitHub 仓库应为 7，实际 ${repos.length}`);
repos.forEach((r, i) => {
  isStr(r.title, `repo[${i}].title 不能为空`);
  isStr(r.desc, `repo[${i}].desc 不能为空`);
  need(/^https:\/\/github\.com\//.test(r.link || ""), `repo[${i}].link 应为 github.com 链接`);
});

/* ---------------- 视频 ---------------- */
const videos = W.VIDEOS || [];
need(videos.length === 10, `视频数量应为 10，实际 ${videos.length}`);
videos.forEach((v, i) => {
  const p = `video[${i}](${v.title})`;
  isStr(v.title, `${p}.title 不能为空`);
  isStr(v.author, `${p}.author 不能为空`);
  isStr(v.chapter, `${p}.chapter 不能为空`);
  isHttp(v.link, `${p}.link 应为 http(s) 链接`);
  isArr(v.takeaways, `${p}.takeaways 至少 3 条`, 3);
});

/* ---------------- 页面引用 ---------------- */
const pages = ["index.html", "learn.html", "scripts.html", "books.html", "videos.html", "practice.html"];
pages.forEach((page) => {
  const abs = path.join(ROOT, page);
  need(fs.existsSync(abs), `缺少页面: ${page}`);
  if (!fs.existsSync(abs)) return;
  const html = fs.readFileSync(abs, "utf8");
  need(html.includes('href="scripts.html"'), `${page} 导航缺少 scripts.html`);

  const refs = [...html.matchAll(/(?:href|src)="([^"#?]+)"/g)].map((m) => m[1]);
  refs.forEach((ref) => {
    if (/^(https?:|mailto:|data:|javascript:)/.test(ref)) return;
    const target = path.resolve(ROOT, path.dirname(page), ref);
    need(fs.existsSync(target), `${page} 引用了不存在的文件: ${ref}`);
  });
});

/* ---------------- 输出 ---------------- */
const stats = [
  ["章节", chapters.length],
  ["脚本", scripts.length],
  ["实验", labs.length],
  ["练习", exercises.length],
  ["书籍", books.length],
  ["视频", videos.length],
];
console.log(stats.map(([k, v]) => `${k} ${v}`).join(" · "));

if (errors.length) {
  console.error(`\n发现 ${errors.length} 个问题：`);
  errors.slice(0, 60).forEach((e) => console.error(" - " + e));
  if (errors.length > 60) console.error(` ... 其余 ${errors.length - 60} 条省略`);
  process.exit(1);
}

console.log("内容校验通过");

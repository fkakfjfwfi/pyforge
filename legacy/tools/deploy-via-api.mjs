#!/usr/bin/env node
/**
 * 通过 GitHub REST API 部署静态站（适用于 github.com 的 git HTTPS 被阻断的环境）。
 *
 * 用法：
 *   GH_TOKEN=... node tools/deploy-via-api.mjs
 *   GH_TOKEN=... node tools/deploy-via-api.mjs --dry-run
 *   GH_TOKEN=... node tools/deploy-via-api.mjs -m "feat: 新增章节"
 *
 * 环境变量：
 *   GH_TOKEN       必填，repo 权限（可用 `gh auth token` 获取）
 *   GH_OWNER       可选，默认从 origin 解析
 *   GH_REPO        可选，默认从 origin 解析
 *   GITHUB_BRANCH  可选，默认当前分支
 *
 * 行为：读取 `git ls-files` 的工作区内容 → 逐个创建 blob → 生成 tree →
 * 创建 commit（父提交为远端当前 HEAD）→ 快进更新分支。
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");

function getArg(name, fallback = "") {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const TOKEN = process.env.GH_TOKEN || "";
const MESSAGE = getArg("-m", getArg("--message", `chore: deploy ${new Date().toISOString().slice(0, 10)}`));

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function detectRepo() {
  const owner = process.env.GH_OWNER;
  const repo = process.env.GH_REPO;
  if (owner && repo) return { owner, repo };

  const url = run("git remote get-url origin");
  const m = url.match(/github\.com[:/]+([^/]+)\/(.+)$/);
  if (!m) throw new Error("无法从 origin 解析 owner/repo，请设置 GH_OWNER 与 GH_REPO");
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

const { owner, repo } = detectRepo();
const branch = process.env.GITHUB_BRANCH || run("git branch --show-current") || "main";
const API = "https://api.github.com";

async function api(endpoint, method = "GET", body) {
  const res = await fetch(API + endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent": "pyforge-deploy",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`${method} ${endpoint} -> ${res.status}: ${text.slice(0, 400)}`);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

const files = run("git ls-files")
  .split(/\r?\n/)
  .filter(Boolean);

const untracked = run("git ls-files --others --exclude-standard")
  .split(/\r?\n/)
  .filter(Boolean);

console.log(`目标: ${owner}/${repo} @ ${branch}`);
console.log(`文件: ${files.length} 个`);
if (untracked.length) {
  console.log(`提示: ${untracked.length} 个未跟踪文件不会被部署（先 git add）`);
  untracked.slice(0, 10).forEach((f) => console.log("  - " + f));
}

if (DRY) {
  console.log("\n[dry-run] 不会调用 GitHub API。将上传：");
  files.forEach((f) => console.log("  " + f));
  process.exit(0);
}

if (!TOKEN) {
  console.error("缺少 GH_TOKEN。运行: GH_TOKEN=$(gh auth token) node tools/deploy-via-api.mjs");
  process.exit(1);
}

let parent = null;

try {
  await api(`/repos/${owner}/${repo}`);
} catch (err) {
  console.error(`仓库不可访问: ${owner}/${repo}`);
  console.error(err.message);
  process.exit(1);
}

try {
  const ref = await api(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  parent = ref.object.sha;
  console.log("远端 HEAD:", parent.slice(0, 8));
} catch (err) {
  if (err.status !== 404) throw err;
  console.log("仓库为空，先创建初始提交");
  const boot = await api(`/repos/${owner}/${repo}/contents/.nojekyll`, "PUT", {
    message: "chore: initialize repository",
    content: Buffer.from("\n").toString("base64"),
    branch,
  });
  parent = boot.commit.sha;
}

const tree = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(process.cwd(), file));
  const blob = await api(`/repos/${owner}/${repo}/git/blobs`, "POST", {
    content: content.toString("base64"),
    encoding: "base64",
  });
  tree.push({ path: file.replace(/\\/g, "/"), mode: "100644", type: "blob", sha: blob.sha });
  console.log("blob", file);
}

const newTree = await api(`/repos/${owner}/${repo}/git/trees`, "POST", { tree });
const commit = await api(`/repos/${owner}/${repo}/git/commits`, "POST", {
  message: MESSAGE,
  tree: newTree.sha,
  parents: [parent],
});
console.log("commit", commit.sha);

await api(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, "PATCH", {
  sha: commit.sha,
  force: true,
});

console.log(`\n完成: https://github.com/${owner}/${repo}/commit/${commit.sha}`);

try {
  const pages = await api(`/repos/${owner}/${repo}/pages`);
  console.log("站点:", pages.html_url);
} catch (err) {
  if (err.status !== 404) throw err;
  console.log("尚未开启 GitHub Pages，可在仓库 Settings → Pages 中启用");
}

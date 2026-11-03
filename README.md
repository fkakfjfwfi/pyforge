# PyForge · Python 训练场

面向“有一点基础、想系统补漏”的学习者的 Python 教学网站。讲解约 45%，练习约 55%；所有代码在浏览器里用真实 Python 解释器执行。

在线访问：**https://fkakfjfwfi.github.io/pyforge/**

旧版站点（12 章课程 / 脚本拆解 / 视频 / 工具）归档在 **https://fkakfjfwfi.github.io/pyforge/legacy/**，源码同时保留在仓库 `legacy/` 目录与本仓库的 `archive-legacy-2026-11-02` 标签中。

## 包含什么

- 4 个模块、14 节课：基础重塑 → 中级核心 → 进阶 → 实战
- 58 个动手任务：43 道编码题 + 15 道概念自测
- 浏览器内真实 Python 3.13（Pyodide + Web Worker），代码不上传
- 断言判题、提示、参考答案、10 秒超时保护
- 进度保存在 localStorage：练习通过、课程通关、连续学习天数
- 15 本参考书 / 开源仓库（图灵社区、GitHub、官方文档）
- 12 类可搜索速查表 + 自由练习场

## 本地运行

浏览器内 Python 需要通过 HTTP 加载 WebAssembly，不能直接双击 `index.html`。

```bash
python serve.py
# 打开 http://localhost:8000
```

只需要 Python 3，无第三方依赖。

## 目录结构

```
index.html                 页面外壳
serve.py                   本地服务器
assets/css/style.css       视觉系统与响应式布局
assets/js/app.js           路由、渲染、进度、判题交互
assets/js/pyworker.js      Pyodide Web Worker 运行时
assets/js/data/            课程与书单数据（改内容主要改这里）
  module-foundations.js
  module-intermediate.js
  module-advanced.js
  module-projects.js
  books.js
  cheatsheet.js
```

## 修改课程

课程是纯数据，不需要改渲染逻辑。每节课的结构：

```js
{
  id: "objects",              // URL 标识，全局唯一
  title: "对象、名字与类型",
  summary: "…",
  level: "基础重塑",
  minutes: 22,
  objectives: ["…"],          // 学完能做到什么
  sections: [                 // 正文块：h / p / code / callout / table / list
    { type: "h", text: "…" },
    { type: "p", html: "…" },
    { type: "code", code: "…", output: "…" }
  ],
  exercises: [
    {
      id: "f1-1",             // 全局唯一，进度按它记录
      kind: "code",
      title: "…",
      prompt: "…",
      starter: "初始代码",
      solution: "参考答案",
      hints: ["…"],
      check: "断言脚本：通过则静默，失败抛 AssertionError"
    },
    { id: "f1-4", kind: "quiz", question: "…", options: ["…"], answer: 1, explain: "…" }
  ],
  further: ["对应书目章节"]
}
```

新增编码题的判题脚本运行在用户代码同一个命名空间里，直接对变量、函数或输出做断言即可。示例：

```python
assert add_item([1, 2], 3) == [1, 2, 3]
print("通过：…")
```

改完 `assets/js/data/*.js` 后刷新页面即可。若修改了 `pyworker.js`，请同时更新 `app.js` 里的 `pyworker.js?v=...` 版本号，避免浏览器继续使用缓存的 Worker 脚本。

## 部署

仓库推送到 `main` 后，GitHub Pages 直接从仓库根目录发布（已包含 `.nojekyll`）。

- 站点地址：https://fkakfjfwfi.github.io/pyforge/
- 仓库：https://github.com/fkakfjfwfi/pyforge

GitHub Pages 的发布通常需要几十秒；在仓库 Actions / Pages 页面能看到部署状态。

## 外部依赖

| 依赖 | 版本 | 来源 |
| --- | --- | --- |
| Pyodide | 0.29.5 | jsDelivr CDN |
| CodeMirror | 5.65.16 | jsDelivr CDN |

首次运行会下载约 10MB 的 Python 运行时，之后使用浏览器缓存。离线环境下练习不可用。

## 已知限制

- 不支持 `input()` 交互输入，练习使用预置数据
- 只提供标准库，第三方库（requests、numpy 等）不可用
- 进度只保存在当前浏览器，换设备不同步
- 判题基于断言，只验证行为，不检查实现方式

## 内容参考

- [Python 官方教程（中文）](https://docs.python.org/zh-cn/3/tutorial/)
- [图灵社区](https://www.ituring.com.cn/)
- [Python-100-Days](https://github.com/jackfrued/Python-100-Days)
- [Effective Python](https://effectivepython.com/)

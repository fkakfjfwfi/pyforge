/* Pyodide 运行时 Worker
   在主线程之外执行用户代码：避免卡死 UI，可被超时终止。
   所有代码仅在本地浏览器执行，不上传。 */
"use strict";

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/";
let pyodidePromise = null;
let queue = Promise.resolve();

function boot() {
  if (pyodidePromise) return pyodidePromise;
  self.postMessage({ type: "status", status: "loading", message: "正在加载 Python 运行时" });

  importScripts(PYODIDE_BASE + "pyodide.js");

  pyodidePromise = loadPyodide({ indexURL: PYODIDE_BASE })
    .then((py) => {
      self.postMessage({ type: "status", status: "ready" });
      return py;
    })
    .catch((err) => {
      self.postMessage({
        type: "status",
        status: "error",
        message: String((err && err.message) || err),
      });
      throw err;
    });
  return pyodidePromise;
}

boot();

async function handleRun(pyodide, msg) {
  const output = [];
  pyodide.setStdout({ batched: (line) => output.push(line) });
  pyodide.setStderr({ batched: (line) => output.push(line) });

  // 每次运行使用独立的命名空间，避免上一次的变量泄漏到下一次
  const globals = pyodide.runPython("{}");
  let ok = true;
  let error = "";

  try {
    globals.set("__name__", "__main__");
    await pyodide.runPythonAsync(msg.code || "", { globals });
    if (msg.tests) {
      await pyodide.runPythonAsync(msg.tests, { globals });
    }
  } catch (err) {
    ok = false;
    error = String((err && err.message) || err);
  } finally {
    try {
      globals.destroy();
    } catch (e) {
      /* 已被回收 */
    }
  }

  self.postMessage({
    id: msg.id,
    type: "result",
    ok,
    out: output.join("\n"),
    error,
  });
}

self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type !== "run") return;
  // 串行执行：Pyodide 实例不可重入
  queue = queue
    .then(async () => {
      const pyodide = await boot();
      await handleRun(pyodide, msg);
    })
    .catch((err) => {
      self.postMessage({
        id: msg.id,
        type: "result",
        ok: false,
        out: "",
        error: "运行时异常：" + String((err && err.message) || err),
      });
    });
});

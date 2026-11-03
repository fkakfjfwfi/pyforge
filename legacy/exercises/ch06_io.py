"""第 6 章练习：异常、文件与持久化

运行：python exercises/ch06_io.py

注意：脚本会在临时目录里读写，不会污染项目。
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path


# ------------------------------------------------------------
# 练习 1：读取状态
# 要求：state.json 存在则解析，否则返回 {"done": []}；
# 文件损坏（JSONDecodeError）也返回默认值。
# ------------------------------------------------------------
def load_state(path: Path) -> dict:
    # TODO: path.exists + json.loads(path.read_text(encoding="utf-8"))
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：安全追加一条 JSONL
# 要求：父目录自动创建；ensure_ascii=False；以换行结尾。
# ------------------------------------------------------------
def append_jsonl(path: Path, item: dict) -> None:
    # TODO: path.parent.mkdir(parents=True, exist_ok=True)
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 3：断点续写
# 要求：跳过 state 中已完成的 URL，返回本次新处理的数量。
# ------------------------------------------------------------
def run_tasks(tasks: list[str], state_path: Path, out_path: Path) -> int:
    # TODO: load_state -> for task: if in done: continue
    #       写入 JSONL 后把 task 写回 state
    raise NotImplementedError


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        state_path = tmp / "state.json"
        out_path = tmp / "data" / "items.jsonl"

        assert load_state(state_path) == {"done": []}
        state_path.write_text("{broken", encoding="utf-8")
        assert load_state(state_path) == {"done": []}

        append_jsonl(out_path, {"title": "键盘", "price": 199.0})
        lines = out_path.read_text(encoding="utf-8").splitlines()
        assert len(lines) == 1
        assert json.loads(lines[0])["title"] == "键盘"
        assert "\\u" not in lines[0], "中文不应被转义"

        count = run_tasks(["a", "b"], state_path, out_path)
        assert count == 2
        count = run_tasks(["a", "b", "c"], state_path, out_path)
        assert count == 1, "已完成的 a/b 应被跳过"
        state = load_state(state_path)
        assert state["done"] == ["a", "b", "c"]

    print("ch06 全部通过")

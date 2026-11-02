"""模板：可断点续跑的长任务（checkpoint + 重试 + 幂等）

复制这个文件，把 fetch_page 换成你的真实任务。
运行：python scripts/template_resume.py
"""

from __future__ import annotations

import json
import time
from pathlib import Path

STATE = Path(".template_state.json")


def fetch_page(page: int) -> list[int]:
    """模拟：第 2 页第一次失败，用于演示重试；第 4 页之后返回空。"""
    if page == 2 and not STATE.with_suffix(".retried").exists():
        STATE.with_suffix(".retried").touch()
        raise TimeoutError("模拟网络超时")
    if page >= 4:
        return []
    return list(range((page - 1) * 5, page * 5))


def load_next_page() -> int:
    if STATE.exists():
        return json.loads(STATE.read_text(encoding="utf-8"))["next_page"]
    return 1


def save_next_page(page: int) -> None:
    STATE.write_text(json.dumps({"next_page": page}), encoding="utf-8")


def run() -> int:
    page = load_next_page()
    seen: set[int] = set()
    total = 0

    while True:
        for attempt in range(3):
            try:
                items = fetch_page(page)
                break
            except Exception as exc:
                if attempt == 2:
                    raise
                wait = 2 ** attempt
                print(f"page {page} 失败，{wait}s 后重试: {exc}")
                time.sleep(wait)

        if not items:              # 唯一终止条件
            break

        for item in items:
            if item in seen:
                continue
            seen.add(item)
            total += 1

        page += 1
        save_next_page(page)       # 处理完成后才记账
        print(f"page {page - 1}: {len(items)} 条，累计 {total}")

    print("总处理", total)
    STATE.unlink(missing_ok=True)
    STATE.with_suffix(".retried").unlink(missing_ok=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(run())

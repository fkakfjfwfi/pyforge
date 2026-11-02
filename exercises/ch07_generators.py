"""第 7 章练习：迭代器与生成器

运行：python exercises/ch07_generators.py
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path


# ------------------------------------------------------------
# 练习 1：分批
# 要求：按 size 分批；最后不足一批也要产出；空输入不产出。
# ------------------------------------------------------------
def chunked(iterable, size: int = 3):
    # TODO: 维护 batch，满 size 就 yield
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：惰性解析管道
# 要求：逐行读取 -> 解析 JSON -> 过滤价格 -> 只保留 title/price。
# 解析失败的行跳过，不能中断整个流。
# ------------------------------------------------------------
def read_lines(path: Path):
    # TODO: with path.open(...) as f: for line in f: if line.strip(): yield line
    raise NotImplementedError


def parse_json_lines(lines):
    # TODO: for line in lines: try yield json.loads(line) except JSONDecodeError: continue
    raise NotImplementedError


def cheap(items, limit: float = 500):
    # TODO: 过滤 price <= limit
    raise NotImplementedError


def project(items):
    # TODO: 只 yield {"title", "price"}
    raise NotImplementedError


def pipeline(path: Path):
    return project(cheap(parse_json_lines(read_lines(path))))


if __name__ == "__main__":
    assert list(chunked(range(7), 3)) == [[0, 1, 2], [3, 4, 5], [6]]
    assert list(chunked([], 3)) == []
    assert list(chunked([1], 3)) == [[1]]

    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "items.jsonl"
        rows = [
            {"title": "A", "price": 100},
            {"title": "B", "price": 900},
            {"title": "C", "price": 300},
        ]
        path.write_text(
            "\n".join(json.dumps(r, ensure_ascii=False) for r in rows) + "\n{bad json}\n",
            encoding="utf-8",
        )

        result = list(pipeline(path))
        assert result == [
            {"title": "A", "price": 100},
            {"title": "C", "price": 300},
        ], result

    print("ch07 全部通过")

"""第 3 章练习：字符串、编码与正则

运行：python exercises/ch03_text.py
"""

from __future__ import annotations

import re

PRICE_RE = re.compile(r"[\d,]+(?:\.\d+)?")
LOG_RE = re.compile(
    r"(?P<date>\d{4}-\d{2}-\d{2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\s+"
    r"(?P<level>INFO|WARNING|ERROR)\s+"
    r"(?P<message>.*)"
)


# ------------------------------------------------------------
# 练习 1：清洗文本
# 要求：全角空格转普通空格，压缩连续空白，去掉首尾空白。
# ------------------------------------------------------------
def clean_text(raw: str) -> str:
    # TODO: replace("\u3000", " ") + " ".join(raw.split())
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：价格解析
# 要求：返回 float；没有数字或格式错误返回 None（不要抛异常）。
# 覆盖：￥1,299.00 / 1299 / N/A / 空字符串
# ------------------------------------------------------------
def parse_price(raw) -> float | None:
    # TODO: 先 clean_text，再 search，再去逗号转 float
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 3：命名分组解析日志
# 要求：成功返回 dict，失败返回 None。
# ------------------------------------------------------------
def parse_log(line: str) -> dict | None:
    # TODO: LOG_RE.match(line.strip()) -> groupdict()
    raise NotImplementedError


if __name__ == "__main__":
    assert clean_text("  \u3000 2026-11-02\t iPhone  ") == "2026-11-02 iPhone"

    assert parse_price("￥1,299.00") == 1299.0
    assert parse_price("1299") == 1299.0
    assert parse_price("N/A") is None
    assert parse_price("") is None
    assert parse_price(None) is None

    record = parse_log("2026-11-02 10:23:45 ERROR timeout on https://a.com/1")
    assert record is not None
    assert record["level"] == "ERROR"
    assert record["message"] == "timeout on https://a.com/1"
    assert parse_log("broken") is None

    print("ch03 全部通过")

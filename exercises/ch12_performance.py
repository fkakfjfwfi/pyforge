"""第 12 章练习：性能分析与优化

运行：python exercises/ch12_performance.py
"""

from __future__ import annotations

import timeit


# ------------------------------------------------------------
# 练习 1：交集
# 要求：两个实现返回相同结果；set 版本明显更快。
# ------------------------------------------------------------
def intersection_with_list(base: list[str], targets: list[str]) -> list[str]:
    # TODO: 用列表成员判断
    raise NotImplementedError


def intersection_with_set(base: list[str], targets: list[str]) -> list[str]:
    # TODO: 先 set(base)，再推导式过滤
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：消除循环内的重复工作
# 要求：预编译正则，循环内只 search。
# ------------------------------------------------------------
import re

PRICE_RE = re.compile(r"￥([\d.]+)")


def extract_prices(rows: list[str]) -> list[float]:
    # TODO: 用 PRICE_RE，不要每次 re.search 传模式串
    raise NotImplementedError


if __name__ == "__main__":
    base = [f"https://a.com/{i}" for i in range(5_000)]
    targets = base[::2]

    fast = intersection_with_set(base, targets)
    slow = intersection_with_list(base, targets)
    assert fast == slow == targets

    t_fast = timeit.timeit(lambda: intersection_with_set(base, targets), number=3) / 3
    t_slow = timeit.timeit(lambda: intersection_with_list(base, targets), number=3) / 3
    assert t_fast < t_slow / 5, (t_fast, t_slow)

    rows = ["价格 ￥199.00", "无价格", "￥299.5 元"]
    assert extract_prices(rows) == [199.0, 299.5]

    print("ch12 全部通过", round(t_fast, 4), round(t_slow, 4))

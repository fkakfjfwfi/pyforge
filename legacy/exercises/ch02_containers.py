"""第 2 章练习：序列与映射

运行：python exercises/ch02_containers.py
"""

from __future__ import annotations

from collections import Counter
from urllib.parse import urlparse


# ------------------------------------------------------------
# 练习 1：保序去重
# 要求：去掉重复 URL，保留首次出现的顺序。
# ------------------------------------------------------------
def dedupe(urls: list[str]) -> list[str]:
    # TODO: 提示 list(dict.fromkeys(urls))
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：域名 Top-N
# 要求：返回出现次数最多的前 n 个 (域名, 次数)。
# ------------------------------------------------------------
def top_domains(urls: list[str], n: int = 3) -> list[tuple[str, int]]:
    # TODO: urlparse(u).netloc -> Counter(...).most_common(n)
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 3：按价格升序、销量降序排序（不修改原列表）
# ------------------------------------------------------------
def sort_items(items: list[dict]) -> list[dict]:
    # TODO: sorted(items, key=lambda x: (x["price"], -x["sales"]))
    raise NotImplementedError


if __name__ == "__main__":
    urls = [
        "https://a.com/1", "https://b.com/2", "https://a.com/1",
        "https://a.com/3", "https://c.com/4", "https://b.com/5",
    ]
    unique = dedupe(urls)
    assert unique == [
        "https://a.com/1", "https://b.com/2",
        "https://a.com/3", "https://c.com/4", "https://b.com/5",
    ], unique

    assert top_domains(urls, 2) == [("a.com", 3), ("b.com", 2)]

    items = [
        {"title": "B", "price": 299, "sales": 10},
        {"title": "A", "price": 199, "sales": 50},
        {"title": "C", "price": 199, "sales": 20},
    ]
    ordered = sort_items(items)
    assert [i["title"] for i in ordered] == ["A", "C", "B"], ordered
    assert items[0]["title"] == "B", "原列表不应被修改"

    print("ch02 全部通过")

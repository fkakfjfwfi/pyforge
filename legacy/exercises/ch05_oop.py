"""第 5 章练习：面向对象与数据模型

运行：python exercises/ch05_oop.py
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field


# ------------------------------------------------------------
# 练习 1：Item 数据模型
# 要求：tags 用 default_factory=list；
# from_dict 缺少关键字段或价格非法时返回 None。
# ------------------------------------------------------------
@dataclass
class Item:
    title: str
    price: float
    url: str
    tags: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: dict):
        # TODO: try/except (KeyError, ValueError, AttributeError)
        raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：上下文计时器
# 要求：with 结束时打印耗时；异常时打印异常类型但不吞异常。
# ------------------------------------------------------------
class Timer:
    def __enter__(self):
        # TODO: 记录开始时间，返回 self
        raise NotImplementedError

    def __exit__(self, exc_type, exc, tb):
        # TODO: 打印耗时；返回 False
        raise NotImplementedError


if __name__ == "__main__":
    item = Item.from_dict({"title": " 键盘 ", "price": "199", "url": "https://a.com/1"})
    assert item is not None
    assert item.title == "键盘"
    assert item.price == 199.0
    assert item.tags == []

    a = Item.from_dict({"title": "a", "price": "1", "url": "u"})
    b = Item.from_dict({"title": "b", "price": "2", "url": "u"})
    a.tags.append("x")
    assert b.tags == [], "tags 不应在实例间共享"

    assert Item.from_dict({"price": "199"}) is None
    assert Item.from_dict({"title": "x", "price": "N/A", "url": "u"}) is None

    with Timer():
        sum(range(1000))

    try:
        with Timer():
            raise ValueError("boom")
    except ValueError:
        pass

    print("ch05 全部通过")

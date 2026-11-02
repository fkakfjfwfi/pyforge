"""第 10 章练习：类型注解与校验

运行：python exercises/ch10_typing.py
"""

from __future__ import annotations

from typing import TypedDict


class _ItemRequired(TypedDict):
    title: str
    price: float
    url: str


class Item(_ItemRequired, total=False):
    """tags 为可选字段（3.9 兼容写法）"""
    tags: list[str]


# ------------------------------------------------------------
# 练习：校验外部数据
# 要求：
#   - 缺字段、类型错误、价格 < 0、空标题、非 http(s) URL 都返回 None
#   - price 允许字符串数字
#   - tags 可选，存在时必须是 list[str]
# ------------------------------------------------------------
def validate(raw: dict) -> Item | None:
    # TODO: 先取值转换，再逐项校验
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：配置读取
# 要求：从环境变量读取 CONCURRENCY/TIMEOUT，非法值回退默认值。
# ------------------------------------------------------------
def read_int_env(environ: dict, key: str, default: int) -> int:
    # TODO: try int(environ.get(key, default)) except (TypeError, ValueError)
    raise NotImplementedError


if __name__ == "__main__":
    assert validate({"title": "键盘", "price": "199", "url": "https://a.com"}) == {
        "title": "键盘", "price": 199.0, "url": "https://a.com"
    }
    assert validate({"title": "键盘", "price": "199", "url": "https://a.com", "tags": ["数码"]}) == {
        "title": "键盘", "price": 199.0, "url": "https://a.com", "tags": ["数码"]
    }
    assert validate({"title": "", "price": 1, "url": "https://a.com"}) is None
    assert validate({"title": "x", "price": -1, "url": "https://a.com"}) is None
    assert validate({"title": "x", "price": 1, "url": "ftp://a.com"}) is None
    assert validate({"title": "x", "price": "abc", "url": "https://a.com"}) is None
    assert validate({"price": 1, "url": "https://a.com"}) is None

    assert read_int_env({"CONCURRENCY": "20"}, "CONCURRENCY", 10) == 20
    assert read_int_env({}, "CONCURRENCY", 10) == 10
    assert read_int_env({"CONCURRENCY": "abc"}, "CONCURRENCY", 10) == 10

    print("ch10 全部通过")

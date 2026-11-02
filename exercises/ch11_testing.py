"""第 11 章练习：测试与调试

本文件同时是一个最简 pytest 测试文件：
    pytest exercises/ch11_testing.py -q
也可以直接运行：
    python exercises/ch11_testing.py

不依赖第三方库：网络请求用本地 http_get 桩函数模拟。
"""

from __future__ import annotations

import re
import sys
import unittest
from dataclasses import dataclass
from unittest.mock import Mock, patch


@dataclass
class Item:
    title: str
    price: float | None


PRICE_RE = re.compile(r"￥([\d.]+)")


def parse_item(html: str) -> Item | None:
    title = re.search(r"<h1>(.*?)</h1>", html, re.S)
    if not title:
        return None
    m = PRICE_RE.search(html)
    price = float(m.group(1)) if m else None
    return Item(title=title.group(1).strip(), price=price)


# ------------------------------------------------------------
# 被测试的请求函数：真实项目里会调用 requests
# ------------------------------------------------------------
def http_get(url: str):
    """桩函数：测试时会被 mock 替换"""
    raise RuntimeError("测试环境不应该发真实请求")


def fetch_title(url: str) -> str:
    resp = http_get(url)
    return resp.text


# ------------------------------------------------------------
# 练习 1：补全测试用例
# 要求：至少覆盖「正常、缺价格、缺标题」三种情况。
# ------------------------------------------------------------
try:
    import pytest

    @pytest.mark.parametrize("html, expected_title, expected_price", [
        ("<h1>键盘</h1><span>￥199.00</span>", "键盘", 199.0),
        # TODO: 补「缺价格」「缺标题」两个用例
    ])
    def test_parse_item(html, expected_title, expected_price):
        item = parse_item(html)
        if expected_title is None:
            assert item is None
        else:
            assert item.title == expected_title
            assert item.price == expected_price

except ImportError:
    pass


# ------------------------------------------------------------
# 练习 2：用 mock 替换 http_get，验证只调用一次且超时参数正确
# ------------------------------------------------------------
class FetchTest(unittest.TestCase):
    def test_fetch_ok(self):
        fake = Mock()
        fake.text = "<h1>hi</h1>"
        module = sys.modules[__name__]
        with patch.object(module, "http_get", return_value=fake) as get:
            self.assertEqual(fetch_title("https://example.com"), "<h1>hi</h1>")
            get.assert_called_once_with("https://example.com")


if __name__ == "__main__":
    assert parse_item("<h1>键盘</h1><span>￥199.00</span>") == Item("键盘", 199.0)
    assert parse_item("<h1>鼠标</h1>") == Item("鼠标", None)
    assert parse_item("<div>无标题</div>") is None

    fake = Mock()
    fake.text = "<h1>hi</h1>"
    module = sys.modules[__name__]
    with patch.object(module, "http_get", return_value=fake) as get:
        assert fetch_title("https://example.com") == "<h1>hi</h1>"
        get.assert_called_once_with("https://example.com")

    print("ch11 全部通过")

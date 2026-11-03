"""第 4 章练习：函数、闭包与装饰器

运行：python exercises/ch04_functions.py
"""

from __future__ import annotations

import functools
import time


# ------------------------------------------------------------
# 练习 1：计时装饰器
# 要求：保留原函数元信息，支持任意参数，返回原结果。
# ------------------------------------------------------------
def timer(func):
    # TODO: 用 functools.wraps + perf_counter
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：指数退避重试
# 要求：times 次尝试；第 n 次失败后等待 base_delay * 2**(n-1)
# 成功立即返回；全部失败抛出最后一次异常。
# ------------------------------------------------------------
def retry(times: int = 3, base_delay: float = 0.1, exceptions=(Exception,)):
    # TODO: 三层结构 decorator -> wrapper
    raise NotImplementedError


@timer
def slow_sum(n: int) -> int:
    """求和，用于测试装饰器"""
    return sum(range(n))


if __name__ == "__main__":
    assert slow_sum(100) == 4950
    assert slow_sum.__name__ == "slow_sum"
    assert slow_sum.__doc__ == "求和，用于测试装饰器"

    calls = {"n": 0}

    @retry(times=3, base_delay=0.01)
    def flaky() -> str:
        calls["n"] += 1
        if calls["n"] < 3:
            raise ConnectionError("not yet")
        return "ok"

    assert flaky() == "ok"
    assert calls["n"] == 3

    calls["n"] = 0

    @retry(times=2, base_delay=0.01)
    def always_fail():
        calls["n"] += 1
        raise TimeoutError("always")

    try:
        always_fail()
    except TimeoutError:
        pass
    else:
        raise AssertionError("应当抛出最后一次异常")
    assert calls["n"] == 2

    print("ch04 全部通过")

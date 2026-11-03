"""第 9 章练习：asyncio

运行：python exercises/ch09_asyncio.py
"""

from __future__ import annotations

import asyncio
import time

running = 0
peak = 0


# ------------------------------------------------------------
# 练习 1：限流
# 要求：100 个任务，最多 10 个同时执行；返回 (峰值并发, 总耗时)。
# ------------------------------------------------------------
async def limited_task(i: int, sem: asyncio.Semaphore) -> int:
    # TODO: async with sem: 维护 running/peak，await asyncio.sleep(0.05)
    raise NotImplementedError


async def run_limited(n: int = 100, limit: int = 10):
    global running, peak
    running = 0
    peak = 0
    sem = asyncio.Semaphore(limit)
    start = time.perf_counter()
    # TODO: await asyncio.gather(*(limited_task(i, sem) for i in range(n)))
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：阻塞 vs 非阻塞
# 要求：两者都并发 10 个 0.1 秒任务，返回各自耗时。
# ------------------------------------------------------------
async def blocking_job(i: int):
    time.sleep(0.1)          # 错误示范
    return i


async def async_job(i: int):
    await asyncio.sleep(0.1)
    return i


async def compare_blocking():
    start = time.perf_counter()
    await asyncio.gather(*(blocking_job(i) for i in range(10)))
    blocking_cost = time.perf_counter() - start

    start = time.perf_counter()
    await asyncio.gather(*(async_job(i) for i in range(10)))
    async_cost = time.perf_counter() - start
    return blocking_cost, async_cost


if __name__ == "__main__":
    peak_n, cost = asyncio.run(run_limited(100, 10))
    assert peak_n == 10, f"峰值并发应为 10，实际 {peak_n}"
    assert cost < 1.0, cost

    blocking_cost, async_cost = asyncio.run(compare_blocking())
    assert blocking_cost > 0.9, blocking_cost
    assert async_cost < 0.3, async_cost

    print("ch09 全部通过")

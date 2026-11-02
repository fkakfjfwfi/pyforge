"""第 8 章练习：线程、进程与 GIL

运行：python exercises/ch08_concurrency.py
"""

from __future__ import annotations

import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed


# ------------------------------------------------------------
# 练习 1：线程安全计数器
# 要求：use_lock=True 时必须精确累加；False 用于观察竞态。
# ------------------------------------------------------------
def count_with_threads(threads_n: int = 4, per_thread: int = 100_000, use_lock: bool = True) -> int:
    counter = 0
    lock = threading.Lock()

    def worker():
        nonlocal counter
        for _ in range(per_thread):
            if use_lock:
                with lock:
                    counter += 1
            else:
                counter += 1

    threads = [threading.Thread(target=worker) for _ in range(threads_n)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return counter


# ------------------------------------------------------------
# 练习 2：并发抓取骨架（用 sleep 模拟网络）
# 要求：固定并发；提交端限速；失败收集 URL 与异常类型。
# ------------------------------------------------------------
def fake_fetch(url: str) -> int:
    time.sleep(0.02)
    if url.endswith("7"):
        raise ConnectionError("模拟失败")
    return len(url)


def crawl(urls: list[str], workers: int = 8, interval: float = 0.01):
    results, errors = [], []
    # TODO: ThreadPoolExecutor + submit + as_completed
    raise NotImplementedError


if __name__ == "__main__":
    assert count_with_threads(4, 10_000, True) == 40_000

    urls = [f"https://a.com/{i}" for i in range(40)]
    results, errors = crawl(urls)
    assert len(results) + len(errors) == 40
    assert all(u.endswith("7") for u, _ in errors), errors
    assert len(errors) == 4, errors

    print("ch08 全部通过")

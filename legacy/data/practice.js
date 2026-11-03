/* 练习数据：题目、提示与参考答案 */
const RAW3 = String.raw;

window.EXERCISES = [
  {
    no: "01", ch: 1, group: 1, level: "基础", file: "exercises/ch01_objects.py",
    title: "安全合并请求头",
    scene: "写一个 merge_headers(base, extra)，返回合并后的新字典，且不能修改传入的 base。这是修复「全局 headers 被污染」的最小改动。",
    reqs: [
      "返回新 dict，包含 base 的所有键",
      "extra 中的同名键覆盖 base",
      "调用后 base 的内容保持不变（用 id/内容验证）"
    ],
    hint: "先 dict(base)，再 update(extra)。不要用 base.update(extra)。",
    answer: RAW3`
def merge_headers(base, extra):
    merged = dict(base)     # 浅拷贝第一层即可，headers 的值都是字符串
    merged.update(extra)
    return merged

BASE = {"User-Agent": "PyForge/1.0"}
new = merge_headers(BASE, {"Cookie": "sid=abc"})
print(new)          # {'User-Agent': ..., 'Cookie': ...}
print(BASE)         # 只有 User-Agent
print(new is BASE)  # False
`
  },
  {
    no: "02", ch: 1, group: 1, level: "进阶", file: "exercises/ch01_objects.py",
    title: "深拷贝嵌套配置",
    scene: "一份三层嵌套的配置，修改副本的最内层，原配置不能受影响。",
    reqs: [
      "构造三层嵌套 dict",
      "分别用赋值、copy.copy、copy.deepcopy 生成副本",
      "修改最内层字段，打印三个副本与原配置，并用 id() 解释差异"
    ],
    hint: "id() 比较最内层对象；deepcopy 之后 id 不同。",
    answer: RAW3`
import copy

config = {"a": {"b": {"c": 1}}}

alias = config
shallow = copy.copy(config)
deep = copy.deepcopy(config)

alias["a"]["b"]["c"] = 99
shallow["a"]["b"]["c"] = 88
deep["a"]["b"]["c"] = 77

print(config["a"]["b"]["c"])    # 99（alias 与 shallow 共享内层）
print(shallow["a"]["b"]["c"])   # 88
print(deep["a"]["b"]["c"])      # 77
print(id(config["a"]["b"]), id(deep["a"]["b"]))   # 不同
`
  },
  {
    no: "03", ch: 2, group: 1, level: "基础", file: "exercises/ch02_containers.py",
    title: "URL 保序去重 + 域名 Top3",
    scene: "10 万个 URL 里有大量重复，需要保留首次出现顺序，并统计出现最多的 3 个域名。",
    reqs: [
      "用 dict.fromkeys 或等价方式保序去重",
      "用 urlparse 提取域名",
      "用 Counter 输出 Top 3"
    ],
    hint: "list(dict.fromkeys(urls))；Counter(domains).most_common(3)。",
    answer: RAW3`
from collections import Counter
from urllib.parse import urlparse

urls = [
    "https://a.com/1", "https://b.com/2", "https://a.com/1",
    "https://a.com/3", "https://c.com/4", "https://b.com/5",
]

unique = list(dict.fromkeys(urls))
domains = [urlparse(u).netloc for u in unique]
print(len(urls), len(unique))          # 6 5
print(Counter(domains).most_common(3)) # [('a.com', 2), ('b.com', 2), ('c.com', 1)]
`
  },
  {
    no: "04", ch: 3, group: 1, level: "进阶", file: "exercises/ch03_text.py",
    title: "清洗脏文本并提取价格",
    scene: "抓下来的价格文本混着全角空格、千分位逗号、货币符号，需要统一清洗后转成 float。",
    reqs: [
      "去掉全角空格与首尾空白",
      "用正则提取数字部分（允许千分位逗号与小数）",
      "解析失败返回 None，不抛异常",
      "至少覆盖 ￥1,299.00 / 1299 / N/A 三种输入"
    ],
    hint: "re.compile(r\"[\\d,]+(?:\\.\\d+)?\")；replace(\",\", \"\") 后再 float。",
    answer: RAW3`
import re

PRICE_RE = re.compile(r"[\d,]+(?:\.\d+)?")

def parse_price(raw):
    if not isinstance(raw, str):
        return None
    text = raw.replace("\u3000", " ").strip()
    m = PRICE_RE.search(text)
    if not m:
        return None
    try:
        return float(m.group().replace(",", ""))
    except ValueError:
        return None

for s in ["￥1,299.00", "1299", "N/A", "  6,999.50 元 "]:
    print(repr(s), "->", parse_price(s))
`
  },
  {
    no: "05", ch: 3, group: 1, level: "进阶", file: "exercises/ch03_text.py",
    title: "命名分组解析日志",
    scene: "把一行日志拆成 date、time、level、message 四个字段；解析失败的行不能中断整个文件处理。",
    reqs: [
      "使用命名分组 (?P<name>...)",
      "成功返回 dict，失败返回 None",
      "批量解析时统计成功与失败条数"
    ],
    hint: "pattern.match 返回 None 表示失败；m.groupdict() 直接给字典。",
    answer: RAW3`
import re

LOG_RE = re.compile(
    r"(?P<date>\d{4}-\d{2}-\d{2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\s+"
    r"(?P<level>INFO|WARNING|ERROR)\s+"
    r"(?P<message>.*)"
)

def parse_log(line):
    m = LOG_RE.match(line.strip())
    return m.groupdict() if m else None

lines = [
    "2026-11-02 10:23:45 ERROR timeout on https://a.com/1",
    "broken line without fields",
]
ok = fail = 0
for line in lines:
    record = parse_log(line)
    if record:
        ok += 1
        print(record)
    else:
        fail += 1
print("ok", ok, "fail", fail)
`
  },
  {
    no: "06", ch: 4, group: 1, level: "基础", file: "exercises/ch04_functions.py",
    title: "计时装饰器",
    scene: "统计任意函数的执行耗时，并保留原函数名与文档。",
    reqs: [
      "使用 functools.wraps",
      "支持任意位置参数与关键字参数",
      "返回原函数结果，同时打印耗时"
    ],
    hint: "三层结构：timer(func) → wrapper(*args, **kwargs)。",
    answer: RAW3`
import time
import functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        cost = time.perf_counter() - start
        print(f"{func.__name__} 耗时 {cost:.4f}s")
        return result
    return wrapper

@timer
def parse(n):
    """模拟解析"""
    return sum(range(n))

print(parse(1_000_000))
print(parse.__name__)
`
  },
  {
    no: "07", ch: 4, group: 1, level: "挑战", file: "exercises/ch04_functions.py",
    title: "指数退避重试装饰器",
    scene: "请求失败后按 0.5s、1s、2s 的间隔重试，最终失败时抛出最后一次异常。",
    reqs: [
      "装饰器参数：times、base_delay、exceptions",
      "第 n 次失败后等待 base_delay * 2**(n-1)",
      "成功立即返回，不继续等待",
      "保留原函数元信息"
    ],
    hint: "外层收配置，中层收函数，内层循环 + try/except + sleep。",
    answer: RAW3`
import time
import functools

def retry(times=3, base_delay=0.5, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last = None
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:
                    last = exc
                    if attempt == times - 1:
                        break
                    delay = base_delay * (2 ** attempt)
                    print(f"retry {attempt + 1}/{times} after {delay}s: {exc}")
                    time.sleep(delay)
            raise last
        return wrapper
    return decorator

@retry(times=3, base_delay=0.2)
def unstable(n):
    if not hasattr(unstable, "calls"):
        unstable.calls = 0
    unstable.calls += 1
    if unstable.calls < 3:
        raise ConnectionError("not yet")
    return "ok"

print(unstable())
`
  },
  {
    no: "08", ch: 5, group: 1, level: "基础", file: "exercises/ch05_oop.py",
    title: "用 dataclass 建模 Item",
    scene: "解析结果需要稳定的数据模型：字段固定、可打印、可比较，缺字段时返回 None 而不是抛异常。",
    reqs: [
      "使用 @dataclass(slots=True)",
      "tags 用 field(default_factory=list)",
      "实现 from_dict 类方法，缺关键字段返回 None",
      "打印实例时字段清晰可读"
    ],
    hint: "try: return cls(title=d[\"title\"], ...) except KeyError: return None。",
    answer: RAW3`
from dataclasses import dataclass, field

@dataclass(slots=True)
class Item:
    title: str
    price: float
    url: str
    tags: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d):
        try:
            return cls(
                title=d["title"].strip(),
                price=float(d["price"]),
                url=d["url"],
                tags=d.get("tags", []),
            )
        except (KeyError, ValueError, AttributeError):
            return None

print(Item.from_dict({"title": "键盘", "price": "199", "url": "https://a.com/1"}))
print(Item.from_dict({"price": "199"}))   # None
`
  },
  {
    no: "09", ch: 5, group: 1, level: "进阶", file: "exercises/ch05_oop.py",
    title: "上下文计时器",
    scene: "用 with 语句统计代码块耗时；异常退出时打印异常类型，但不吞异常。",
    reqs: [
      "实现 __enter__ 与 __exit__",
      "__exit__ 返回 False",
      "正常与异常两种路径都打印耗时"
    ],
    hint: "在 __enter__ 里记录 start，在 __exit__ 里用 finally 逻辑打印。",
    answer: RAW3`
import time

class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        cost = time.perf_counter() - self.start
        if exc_type is None:
            print(f"耗时 {cost:.4f}s")
        else:
            print(f"异常 {exc_type.__name__}，耗时 {cost:.4f}s")
        return False      # 不吞异常

with Timer():
    sum(range(10_000_000))

try:
    with Timer():
        raise ValueError("boom")
except ValueError:
    print("异常已传播")
`
  },
  {
    no: "10", ch: 6, group: 1, level: "挑战", file: "exercises/ch06_io.py",
    title: "JSONL 断点续写",
    scene: "给一批任务，跳过已完成的；每成功一条就追加写入并更新状态；进程重启后不重复执行。",
    reqs: [
      "state.json 记录 done 列表",
      "items.jsonl 追加写入，中文不转义",
      "模拟第 3 条抛异常，重新运行后只处理剩余任务",
      "读取时逐行解析，能跳过损坏的半行"
    ],
    hint: "先 load_state，再 for task: if done: continue；成功后追加并 save_state。",
    answer: RAW3`
import json
from pathlib import Path

DATA = Path("data")
STATE = DATA / "state.json"
OUT = DATA / "items.jsonl"

def load_state():
    if STATE.exists():
        return json.loads(STATE.read_text(encoding="utf-8"))
    return {"done": []}

def save_state(done):
    DATA.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps({"done": done}, ensure_ascii=False), encoding="utf-8")

def run(tasks):
    done = load_state()["done"]
    DATA.mkdir(parents=True, exist_ok=True)
    with OUT.open("a", encoding="utf-8") as f:
        for i, task in enumerate(tasks):
            if task in done:
                continue
            if i == 2 and task not in done:
                raise RuntimeError("模拟中断")
            f.write(json.dumps({"url": task}, ensure_ascii=False) + "\n")
            done.append(task)
            save_state(done)

tasks = ["a", "b", "c", "d"]
try:
    run(tasks)
except RuntimeError as exc:
    print("中断:", exc)
print("再次运行")
run(tasks)
`
  },
  {
    no: "11", ch: 7, group: 2, level: "基础", file: "exercises/ch07_generators.py",
    title: "手写 chunked 分批",
    scene: "把任意可迭代对象按固定大小分批，最后不足一批也要产出。",
    reqs: [
      "不使用 itertools.batched",
      "支持生成器输入",
      "最后一批不足 size 时也要 yield",
      "空输入不产出任何批次"
    ],
    hint: "维护 batch 列表，满 size 就 yield 并清空；循环结束后再判断一次。",
    answer: RAW3`
def chunked(iterable, size=3):
    batch = []
    for item in iterable:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch

print(list(chunked(range(7), 3)))   # [[0,1,2], [3,4,5], [6]]
print(list(chunked([], 3)))         # []
`
  },
  {
    no: "12", ch: 7, group: 2, level: "进阶", file: "exercises/ch07_generators.py",
    title: "惰性解析管道",
    scene: "从 JSONL 读数据，逐条解析、过滤价格、只保留字段，最后分批写入；全程不构建完整列表。",
    reqs: [
      "read_lines / parse / filter / project 四层生成器",
      "解析失败的行跳过",
      "输出时只保留 title、price",
      "处理 10 万行内存保持稳定"
    ],
    hint: "每层 for + yield；用 itertools.islice 验证只处理前 N 条。",
    answer: RAW3`
import json
from itertools import islice

def read_lines(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                yield line

def parse(lines):
    for line in lines:
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            continue

def cheap(items, limit=500):
    for item in items:
        if item.get("price", 0) <= limit:
            yield item

def project(items):
    for item in items:
        yield {"title": item.get("title"), "price": item.get("price")}

def pipeline(path):
    return project(cheap(parse(read_lines(path))))

for row in islice(pipeline("data/items.jsonl"), 5):
    print(row)
`
  },
  {
    no: "13", ch: 8, group: 2, level: "进阶", file: "exercises/ch08_concurrency.py",
    title: "线程安全计数器",
    scene: "4 个线程各自累加 10 万次，对比无锁与加锁的结果。",
    reqs: [
      "无锁版本重复 5 轮，记录最终值",
      "Lock 版本结果必须等于 400000",
      "解释为什么 += 不是原子操作"
    ],
    hint: "counter += 1 是 LOAD/ADD/STORE 三步，线程可能在中间切换。",
    answer: RAW3`
import threading

def run(use_lock):
    counter = 0
    lock = threading.Lock()

    def worker():
        nonlocal counter
        for _ in range(100_000):
            if use_lock:
                with lock:
                    counter += 1
            else:
                counter += 1

    threads = [threading.Thread(target=worker) for _ in range(4)]
    for t in threads: t.start()
    for t in threads: t.join()
    return counter

for i in range(3):
    print("no lock:", run(False), "lock:", run(True))
`
  },
  {
    no: "14", ch: 8, group: 2, level: "挑战", file: "exercises/ch08_concurrency.py",
    title: "带限速与异常收集的并发抓取",
    scene: "100 个任务，固定 8 并发，提交端限速，每条失败记录 URL 与异常类型。",
    reqs: [
      "ThreadPoolExecutor + as_completed",
      "submit 之间 sleep 0.02s",
      "成功/失败分别统计",
      "模拟 20% 任务抛异常"
    ],
    hint: "futures 字典保存 url；fut.result() 放 try/except。",
    answer: RAW3`
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

def fake_fetch(url):
    time.sleep(random.uniform(0.05, 0.2))
    if random.random() < 0.2:
        raise ConnectionError("模拟失败")
    return len(url)

def crawl(urls, workers=8, interval=0.02):
    results, errors = [], []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {}
        for url in urls:
            futures[pool.submit(fake_fetch, url)] = url
            time.sleep(interval)
        for fut in as_completed(futures):
            url = futures[fut]
            try:
                results.append(fut.result())
            except Exception as exc:
                errors.append((url, type(exc).__name__))
    return results, errors

urls = [f"https://a.com/{i}" for i in range(100)]
ok, bad = crawl(urls)
print(len(ok), len(bad), bad[:3])
`
  },
  {
    no: "15", ch: 9, group: 2, level: "进阶", file: "exercises/ch09_asyncio.py",
    title: "证明阻塞调用拖垮异步",
    scene: "对比协程里 time.sleep 与 await asyncio.sleep 并发 10 个任务的总耗时。",
    reqs: [
      "两个版本都并发 10 个任务",
      "记录并打印总耗时",
      "解释为什么阻塞版本接近 10 秒"
    ],
    hint: "阻塞版本会让事件循环无法切换，任务退化为串行。",
    answer: RAW3`
import asyncio
import time

async def blocking(i):
    time.sleep(1)          # 错误示范：阻塞事件循环
    return i

async def non_blocking(i):
    await asyncio.sleep(1)
    return i

async def run(coro, label):
    start = time.perf_counter()
    await asyncio.gather(*(coro(i) for i in range(10)))
    print(label, round(time.perf_counter() - start, 2))

asyncio.run(run(blocking, "blocking"))
asyncio.run(run(non_blocking, "non-blocking"))
`
  },
  {
    no: "16", ch: 9, group: 2, level: "挑战", file: "exercises/ch09_asyncio.py",
    title: "Semaphore 限流的异步抓取",
    scene: "100 个异步任务，最多 10 个同时在跑，记录最大并发数验证限流生效。",
    reqs: [
      "asyncio.Semaphore(10)",
      "统计运行中的任务数峰值",
      "所有任务完成后打印峰值与耗时"
    ],
    hint: "进入 sem 前后维护 running 计数与 peak。",
    answer: RAW3`
import asyncio
import time

running = 0
peak = 0
sem = asyncio.Semaphore(10)

async def task(i):
    global running, peak
    async with sem:
        running += 1
        peak = max(peak, running)
        await asyncio.sleep(0.2)
        running -= 1
    return i

async def main():
    start = time.perf_counter()
    await asyncio.gather(*(task(i) for i in range(100)))
    print("peak", peak, "cost", round(time.perf_counter() - start, 2))

asyncio.run(main())
`
  },
  {
    no: "17", ch: 10, group: 3, level: "进阶", file: "exercises/ch10_typing.py",
    title: "TypedDict + 显式校验",
    scene: "外部 JSON 结构不可信，要求用 TypedDict 描述结构，并在入口处校验必填字段。",
    reqs: [
      "定义 Item TypedDict（title/price/url，tags 可选）",
      "实现 validate(raw) -> Item | None",
      "price 支持字符串转 float，负数拒绝",
      "给 mypy 一个明确的返回类型"
    ],
    hint: "NotRequired（3.11+）或 total=False；校验后再构造返回值。",
    answer: RAW3`
from typing import TypedDict, NotRequired

class Item(TypedDict):
    title: str
    price: float
    url: str
    tags: NotRequired[list[str]]

def validate(raw: dict) -> Item | None:
    try:
        title = str(raw["title"]).strip()
        price = float(raw["price"])
        url = str(raw["url"])
    except (KeyError, ValueError, TypeError):
        return None
    if not title or price < 0 or not url.startswith("http"):
        return None
    result: Item = {"title": title, "price": price, "url": url}
    tags = raw.get("tags")
    if isinstance(tags, list):
        result["tags"] = [str(t) for t in tags]
    return result

print(validate({"title": "键盘", "price": "199", "url": "https://a.com"}))
print(validate({"title": "", "price": -1, "url": "https://a.com"}))
`
  },
  {
    no: "18", ch: 11, group: 3, level: "进阶", file: "exercises/ch11_testing.py",
    title: "pytest 参数化测试解析器",
    scene: "为 parse_item 写测试：正常、缺价格、缺标题三种情况；要求断言具体字段。",
    reqs: [
      "使用 @pytest.mark.parametrize",
      "覆盖三种 HTML 样本",
      "缺标题时断言 item is None",
      "测试不依赖网络"
    ],
    hint: "html/title/price 三列参数；if title is None 分支断言 None。",
    answer: RAW3`
import pytest
from spider.parse import parse_item

@pytest.mark.parametrize("html, expected_title, expected_price", [
    ("<h1>键盘</h1><span>￥199.00</span>", "键盘", 199.0),
    ("<h1>鼠标</h1>", "鼠标", None),
    ("<div>无标题</div>", None, None),
])
def test_parse_item(html, expected_title, expected_price):
    item = parse_item(html)
    if expected_title is None:
        assert item is None
    else:
        assert item.title == expected_title
        assert item.price == expected_price
`
  },
  {
    no: "19", ch: 12, group: 3, level: "挑战", file: "exercises/ch12_performance.py",
    title: "从 O(n²) 到 O(n)",
    scene: "两个大列表求交集，分别用 list 与 set 实现，用 timeit 量化差距。",
    reqs: [
      "构造 5 万个元素的列表",
      "实现 list 版本与 set 版本",
      "用 timeit 重复 3 次取平均",
      "解释复杂度差异"
    ],
    hint: "set(list) 建哈希表，成员判断 O(1)；list 每次扫描 O(n)。",
    answer: RAW3`
import timeit

base = [f"https://a.com/{i}" for i in range(5_000)]
targets = base[::2]

def with_list():
    return [x for x in targets if x in base]

def with_set():
    pool = set(base)
    return [x for x in targets if x in pool]

for fn in (with_list, with_set):
    cost = timeit.timeit(fn, number=3) / 3
    print(fn.__name__, round(cost, 4), "s", len(fn()))

print(with_list() == with_set())   # True
`
  }
];

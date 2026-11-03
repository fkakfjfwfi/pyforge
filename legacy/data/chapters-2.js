/* 课程数据 · 第二部分（第 7–12 章） */
(function () {
const RAW = String.raw;

window.CHAPTERS = (window.CHAPTERS || []).concat([

/* ================= 第 7 章 ================= */
{
  id: "ch07", no: 7, stage: 2, stageName: "并发进阶",
  stageDesc: "让抓取从「一条一条」变成「成批流动」",
  title: "迭代器与生成器",
  subtitle: "用「惰性」处理百万级数据，内存不涨",
  time: "110 分钟", level: "进阶", tags: ["迭代协议", "yield", "itertools", "惰性求值"],
  crawlerScene: "你一次性把 50 万条 URL 读进 list，再解析成 dict 存起来，内存直接冲到 8 GB，机器开始交换内存，程序像卡死一样。",
  goals: [
    "分清可迭代对象与迭代器，理解 for 循环背后发生了什么",
    "用生成器把「读取 → 解析 → 过滤」串成惰性管道",
    "掌握 itertools 常用工具，写出恒定内存的数据流"
  ],
  blocks: [
    { t: "lead", x: "生成器不是「省代码的技巧」，而是处理海量数据的基本模型：一次只生产一个元素，消费完就丢。爬虫面对的分页、日志、几十万条 URL，天生适合这种流式结构。" },
    { t: "h", x: "7.1 可迭代对象与迭代器" },
    { t: "p", x: "可迭代对象实现了 <code>__iter__</code>，能返回迭代器；迭代器同时实现 <code>__iter__</code> 和 <code>__next__</code>，每次产出一个值，耗尽后抛 <code>StopIteration</code>。for 循环就是不断调用 next 并捕获这个异常。" },
    { t: "code", title: "iter_protocol.py", x: RAW`
nums = [10, 20]

it = iter(nums)          # list 是可迭代对象，不是迭代器
print(next(it))          # 10
print(next(it))          # 20
# print(next(it))        # StopIteration

print(iter(nums) is nums)   # False，每次 iter 都新建迭代器

# 手动模拟 for
it = iter(nums)
while True:
    try:
        value = next(it)
    except StopIteration:
        break
    print("拿到", value)
` },
    { t: "p", x: "文件对象本身就是迭代器：<code>for line in f</code> 逐行读取，不会把整个文件读进内存。这是处理大日志、大 JSONL 的标准方式。" },
    { t: "h", x: "7.2 生成器函数：yield 会暂停" },
    { t: "code", title: "generator.py", x: RAW`
def countdown(n):
    print("开始")
    while n > 0:
        yield n          # 产出一个值并暂停，保留局部变量
        n -= 1
    print("结束")

g = countdown(3)
print(next(g))           # 开始 / 3
print(next(g))           # 2
print(list(g))           # [1]  —— 从暂停处继续，结束后不再产出
` },
    { t: "p", x: "调用生成器函数不会执行函数体，只创建一个生成器对象。每次 <code>next()</code> 才运行到下一个 yield。函数体执行完毕后自动抛 StopIteration，for 循环负责结束。" },
    { t: "note", kind: "tip", title: "return 的值拿不到", x: "生成器里 <code>return x</code> 会写入 StopIteration 的 value，但 for 循环拿不到。需要返回值就用普通函数，或把结果 yield 出来。" },
    { t: "h", x: "7.3 生成器表达式与内存" },
    { t: "code", title: "genexpr.py", x: RAW`
import sys

squares_list = [x * x for x in range(100_000)]
squares_gen = (x * x for x in range(100_000))

print(sys.getsizeof(squares_list))   # 约 800 KB
print(sys.getsizeof(squares_gen))    # 约 200 B，恒定

print(sum(x * x for x in range(100_000)))   # 不建中间列表
` },
    { t: "p", x: "生成器表达式适合「只消费一次」的场景：求和、求最大值、写文件。需要反复遍历、索引、求长度时，还是得用 list。" },
    { t: "h", x: "7.4 惰性管道：读 → 解析 → 过滤 → 输出" },
    { t: "code", title: "pipeline.py", x: RAW`
import json
from pathlib import Path

def read_lines(path):
    with Path(path).open(encoding="utf-8") as f:
        for line in f:
            if line.strip():
                yield line

def parse(lines):
    for line in lines:
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            continue

def cheap(items, max_price=500):
    for item in items:
        if item.get("price", 0) <= max_price:
            yield item

pipeline = cheap(parse(read_lines("data/items.jsonl")))
for item in pipeline:
    print(item["title"])
` },
    { t: "p", x: "每一层只做一件事，元素一个个流过，任何时刻内存里只有当前这一条。要加一层过滤、加一层字段清洗，直接再包一层生成器，不影响上下游。" },
    { t: "h", x: "7.5 yield from：把子生成器摊平" },
    { t: "code", title: "yield_from.py", x: RAW`
def fetch_page(page):
    return [f"item-{page}-{i}" for i in range(3)]

def paginate(total_pages):
    for page in range(1, total_pages + 1):
        yield from fetch_page(page)     # 把列表逐个产出

print(list(paginate(3)))
# ['item-1-0', 'item-1-1', 'item-1-2', 'item-2-0', ...]
` },
    { t: "p", x: "<code>yield from</code> 还会把子生成器的 return 值、异常、send 一并转发，是组合生成器的标准写法。" },
    { t: "h", x: "7.6 itertools：标准库里的流式工具" },
    { t: "code", title: "itertools_demo.py", x: RAW`
import itertools

# islice：只取前 N 个，不消费后面
first_three = list(itertools.islice(itertools.count(10), 3))
print(first_three)        # [10, 11, 12]

# chain：拼接多个可迭代对象
print(list(itertools.chain([1, 2], [3], [4, 5])))   # [1, 2, 3, 4, 5]

# groupby：按 key 分组（要求输入已按同一 key 排序）
data = [("A", 1), ("A", 2), ("B", 3), ("A", 4)]
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(key, list(group))
# A [(A,1),(A,2)] / B [(B,3)] / A [(A,4)] —— 没有排序，A 出现了两次

# 分批（3.12+）
try:
    print(list(itertools.batched(range(7), 3)))
except AttributeError:
    print("Python < 3.12 需要自己写 chunk")
` },
    { t: "note", kind: "warn", title: "groupby 只合并相邻元素", x: "输入没按 key 排序时，同一个 key 会被拆成多组。先 <code>sorted(data, key=...)</code> 再 groupby，否则统计结果必然错。" },
    { t: "h", x: "7.7 生成器只能消费一次" },
    { t: "code", title: "exhausted.py", x: RAW`
g = (x for x in range(3))
print(list(g))      # [0, 1, 2]
print(list(g))      # [] —— 已经耗尽，不会重新开始

def gen():
    yield 1
    yield 2

g1 = gen()
print(next(g1), next(g1))
# print(next(g1))   # StopIteration
` },
    { t: "p", x: "这是新手最常踩的坑：函数里返回生成器，调用方遍历两次，第二次永远是空。需要多次消费就返回 list，或在函数内部重新创建生成器。" },
    { t: "h", x: "7.8 爬虫实战：分页抓取 + 分批入库" },
    { t: "code", title: "paginate_crawl.py", x: RAW`
def fetch_page(page, size=20):
    # 伪代码：真实项目里换成 requests.get(...).json()
    if page > 5:
        return []
    return [{"id": (page - 1) * size + i, "title": f"item-{i}"} for i in range(size)]

def crawl_pages(max_pages=5):
    for page in range(1, max_pages + 1):
        items = fetch_page(page)
        if not items:
            break
        yield from items

def chunked(iterable, size=50):
    batch = []
    for item in iterable:
        batch.append(item)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:
        yield batch

for batch in chunked(crawl_pages(), 50):
    print(f"写入 {len(batch)} 条")
` },
    { t: "p", x: "这种结构的好处是：抓取节奏由数据流控制，写入批量进行，任何一步失败都可以只重跑那一段，不需要把全部结果堆在内存里。" }
  ],
  pitfalls: [
    { title: "把生成器当列表反复遍历", body: "第二次遍历永远为空。需要复用就 return list，或每次调用重新生成。" },
    { title: "在生成器里打开文件却不关闭", body: "生成器被提前丢弃时，文件句柄可能悬空。在生成器内部用 with，或让调用方负责资源生命周期。" },
    { title: "以为生成器函数调用就会执行", body: "调用只创建对象，函数体要到第一次 next 才运行；初始化逻辑放在生成器外或用显式启动。" },
    { title: "groupby 前不排序", body: "只合并相邻的相同 key，未排序会导致同一个 key 被拆成多组，统计结果错乱。" },
    { title: "把生成器转 list 再处理", body: "等于放弃惰性优势，内存又回到峰值。能在流水线里处理就不要落地。" }
  ],
  cheatsheet: [
    ["<code>iter(x)</code> / <code>next(it)</code>", "手动迭代"],
    ["<code>yield</code>", "产出值并暂停函数"],
    ["<code>yield from sub</code>", "把子生成器摊平"],
    ["<code>(f(x) for x in seq)</code>", "生成器表达式，省内存"],
    ["<code>itertools.islice(it, n)</code>", "惰性取前 n 个"],
    ["<code>itertools.chain(a, b)</code>", "拼接多个流"],
    ["<code>itertools.groupby(data, key)</code>", "分组，要求先排序"],
    ["<code>itertools.batched(it, n)</code>", "3.12+ 分批"]
  ],
  quiz: [
    { q: "调用一个含 yield 的函数，会发生什么？", options: ["立即执行函数体", "返回一个生成器对象，函数体尚未执行", "返回 None", "抛出 StopIteration"], answer: 1, explain: "生成器函数调用只创建生成器对象；函数体在第一次 next/for 迭代时才运行到第一个 yield。" },
    { q: "生成器表达式相比列表推导式的主要优势是？", options: ["语法更短", "可以索引", "惰性求值、内存恒定", "速度一定更快"], answer: 2, explain: "生成器按需产出，不构建完整列表；代价是不能索引、不能重复遍历。" },
    { q: "用 itertools.groupby 前为什么通常要先排序？", options: ["groupby 要求输入是 list", "它只合并相邻的相同 key", "排序能提升内存", "不排序会报错"], answer: 1, explain: "groupby 遇到 key 变化就切组，未排序时同一个 key 会分散在多组，统计结果不正确。" }
  ],
  tasks: [
    { title: "写一条惰性数据处理管道", level: "进阶", desc: "从 JSONL 读数据，逐条解析、过滤价格区间、只保留指定字段，最后分批写入新文件；全程不允许出现完整 list。", file: "exercises/ch07_generators.py" },
    { title: "实现分批工具", level: "基础", desc: "不用 itertools.batched，自己写 chunked(iterable, size)，并测试最后一批不足 size 时也能正确产出。", file: "exercises/ch07_generators.py" }
  ]
},

/* ================= 第 8 章 ================= */
{
  id: "ch08", no: 8, stage: 2, stageName: "并发进阶",
  title: "并发：线程、进程与 GIL",
  subtitle: "1000 个请求从 15 分钟到 40 秒，还要不被封",
  time: "130 分钟", level: "进阶", tags: ["GIL", "线程池", "进程池", "限速"],
  crawlerScene: "串行抓 1000 个页面要 15 分钟。你直接开 200 个线程，结果目标站把你封了，内存也爆了，出错还查不出是哪个 URL。",
  goals: [
    "说清 GIL 的影响边界：为什么 IO 密集能用线程，CPU 密集不行",
    "用 ThreadPoolExecutor 写出带限速、重试、异常收集的并发爬虫",
    "知道什么时候该换进程池，以及 Windows 上的启动陷阱"
  ],
  blocks: [
    { t: "lead", x: "并发不是「开更多线程就更快」。目标站有速率限制，你的机器有内存上限，网络有超时。真正的并发控制是：固定并发数、限制速率、收集每一条失败原因。" },
    { t: "h", x: "8.1 GIL 到底是什么" },
    { t: "p", x: "CPython 解释器同一时刻只允许一个线程执行 Python 字节码，这把锁叫 GIL。但线程执行阻塞式 IO（网络请求、读写文件、sleep）时会释放 GIL，其他线程可以继续跑。所以：「等网络」用线程有效，「算数据」用线程没用。" },
    { t: "table", head: ["任务类型", "特征", "推荐方案"], rows: [
      ["IO 密集", "等网络、等磁盘、等数据库", "线程池 / asyncio"],
      ["CPU 密集", "解析大 JSON、正则、图像处理", "多进程 / 向量化 / C 扩展"],
      ["混合", "抓取 + 重解析", "异步抓取 + 进程池解析"],
      ["超大规模 IO", "几千并发连接", "asyncio + aiohttp（第 9 章）"]
    ] },
    { t: "h", x: "8.2 先看串行有多慢" },
    { t: "code", title: "serial.py", x: RAW`
import time
import requests

urls = [f"https://httpbin.org/delay/1?i={i}" for i in range(10)]

start = time.perf_counter()
for url in urls:
    requests.get(url, timeout=10)
print(f"串行耗时 {time.perf_counter() - start:.1f}s")   # 约 10s+
` },
    { t: "h", x: "8.3 ThreadPoolExecutor 的基本用法" },
    { t: "code", title: "thread_pool.py", x: RAW`
from concurrent.futures import ThreadPoolExecutor
import time
import requests

def fetch(url):
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    return len(resp.text)

urls = [f"https://httpbin.org/delay/1?i={i}" for i in range(10)]

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    results = list(pool.map(fetch, urls))
print(f"并发耗时 {time.perf_counter() - start:.1f}s", results)
` },
    { t: "p", x: "<code>pool.map</code> 保持输入顺序返回结果，遇到异常会在取结果时抛出。它简单，但无法知道「哪个 URL 失败了」。生产代码用 <code>submit + as_completed</code>。" },
    { t: "h", x: "8.4 生产级骨架：限速 + 异常收集" },
    { t: "code", title: "crawl_threads.py", x: RAW`
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_one(url, session, retries=2):
    for attempt in range(retries + 1):
        try:
            resp = session.get(url, timeout=(3, 10))
            resp.raise_for_status()
            return {"url": url, "status": resp.status_code, "length": len(resp.text)}
        except (requests.Timeout, requests.ConnectionError) as exc:
            if attempt == retries:
                raise
            time.sleep(0.5 * (attempt + 1))
        except requests.HTTPError as exc:
            raise RuntimeError(f"HTTP {exc.response.status_code}") from exc

def crawl(urls, max_workers=8, min_interval=0.2):
    results, errors = [], []
    session = requests.Session()
    session.headers.update({"User-Agent": "PyForge/1.0"})

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {}
        for url in urls:
            futures[pool.submit(fetch_one, url, session)] = url
            time.sleep(min_interval)          # 提交端限速，简单有效
        for fut in as_completed(futures):
            url = futures[fut]
            try:
                results.append(fut.result())
            except Exception as exc:
                errors.append({"url": url, "error": repr(exc)})
    return results, errors

results, errors = crawl(["https://httpbin.org/get"], max_workers=8)
print(len(results), len(errors))
` },
    { t: "note", kind: "warn", title: "Session 不是线程安全的", x: "requests 官方文档明确说 Session 不是线程安全的。一个 Session 被多线程共享，连接池与 cookie 可能出问题。稳妥做法：每个线程一个 Session（用 <code>threading.local()</code>），或者干脆不用 Session，牺牲连接复用。" },
    { t: "code", title: "thread_local_session.py", x: RAW`
import threading
import requests

local = threading.local()

def get_session():
    if not hasattr(local, "session"):
        local.session = requests.Session()
    return local.session
` },
    { t: "h", x: "8.5 限速：信号量比 sleep 更精确" },
    { t: "code", title: "semaphore.py", x: RAW`
import threading
import time

sem = threading.BoundedSemaphore(3)   # 同时最多 3 个在跑

def task(i):
    with sem:
        print("start", i)
        time.sleep(1)
        print("end", i)

threads = [threading.Thread(target=task, args=(i,)) for i in range(6)]
for t in threads:
    t.start()
for t in threads:
    t.join()
` },
    { t: "p", x: "信号量控制「同时执行数」，sleep 控制「启动间隔」，两者解决不同问题。目标站返回 429 时，优先降低并发并加退避，而不是继续加线程。" },
    { t: "h", x: "8.6 线程安全：哪些操作会出问题" },
    { t: "p", x: "在 CPython 里，单个 <code>list.append</code>、<code>dict[k] = v</code> 不会被 GIL 打断，看起来「原子」。但「先检查再修改」的组合不是原子的：" },
    { t: "code", title: "race.py", x: RAW`
import threading

counter = 0
lock = threading.Lock()

def increase_bad():
    global counter
    for _ in range(100_000):
        counter += 1          # += 是读-改-写三步，可能交错

def increase_good():
    global counter
    for _ in range(100_000):
        with lock:
            counter += 1

threads = [threading.Thread(target=increase_bad) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print("bad:", counter)        # 通常小于 400000

counter = 0
threads = [threading.Thread(target=increase_good) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print("good:", counter)       # 400000
` },
    { t: "p", x: "结论：只做单次容器操作不用锁；「读-判断-写」、计数器累加、文件写入，需要锁或改用线程安全结构（<code>queue.Queue</code>）。" },
    { t: "h", x: "8.7 进程池：绕开 GIL，但有代价" },
    { t: "code", title: "process_pool.py", x: RAW`
from concurrent.futures import ProcessPoolExecutor
import re

def count_links(html):
    return len(re.findall(r"href=", html))

def main():
    pages = ["<a href='1'></a>"] * 1000
    with ProcessPoolExecutor(max_workers=4) as pool:
        print(sum(pool.map(count_links, pages)))

if __name__ == "__main__":      # Windows 必须，否则子进程重复导入模块
    main()
` },
    { t: "note", kind: "danger", title: "Windows 的 spawn 陷阱", x: "Windows 用 spawn 启动子进程，会重新导入主模块。所有进程池创建代码必须放在 <code>if __name__ == \"__main__\":</code> 下，否则子进程会无限递归创建进程。传给进程的参数和返回值必须可 pickle。" },
    { t: "h", x: "8.8 怎么选" },
    { t: "steps", x: [
      { title: "几十到几百个页面，解析简单", body: "ThreadPoolExecutor，8–16 个 worker，提交端 sleep 限速。" },
      { title: "几千到几万，主要等网络", body: "asyncio + aiohttp，50–200 并发，配合 Semaphore。" },
      { title: "解析/计算是瓶颈", body: "抓取用线程或异步，解析丢给进程池；或者先 profile 再决定。" },
      { title: "目标站有严格风控", body: "降低并发、加随机间隔、换代理，比堆线程更重要。" }
    ] }
  ],
  pitfalls: [
    { title: "无界提交任务", body: "一次性 submit 十万个任务，内存里全是 Future 和响应。用有界队列分批提交。" },
    { title: "多个线程共享一个 Session", body: "requests.Session 非线程安全，可能导致连接错乱与 cookie 污染。用 threading.local 每线程一个。" },
    { title: "以为超时能杀死线程", body: "requests 的 timeout 只控制网络等待；线程里的解析死循环不会被 timeout 终止。" },
    { title: "在子进程里再创建进程池", body: "Windows spawn 下会无限递归。进程池入口必须放在 __main__ 保护里。" },
    { title: "忽略 429 / 503 的退避", body: "继续全速重试只会让封禁升级。指数退避 + 降低并发才是正解。" }
  ],
  cheatsheet: [
    ["<code>ThreadPoolExecutor(n)</code>", "IO 密集并发"],
    ["<code>ProcessPoolExecutor(n)</code>", "CPU 密集并发"],
    ["<code>pool.submit(fn, *a)</code>", "提交单个任务，拿 Future"],
    ["<code>as_completed(fs)</code>", "谁先完成先处理"],
    ["<code>fut.result()</code>", "取结果或抛出任务异常"],
    ["<code>Semaphore(n)</code>", "限制同时执行数"],
    ["<code>threading.Lock()</code>", "保护读-改-写"],
    ["<code>threading.local()</code>", "每线程独立 Session"]
  ],
  quiz: [
    { q: "为什么多线程对 CPU 密集任务几乎无效？", options: ["线程创建太慢", "GIL 保证同一时刻只有一个线程执行字节码", "CPU 不支持多线程", "Python 线程是假的"], answer: 1, explain: "CPython 的 GIL 让字节码串行执行；CPU 密集任务不会主动释放 GIL，所以加速有限。" },
    { q: "requests.Session 多线程共享的主要风险是？", options: ["速度变慢", "Session 非线程安全，连接池/cookie 可能错乱", "无法设置 headers", "自动断开"], answer: 1, explain: "官方明确 Session 不是线程安全的；共享可能导致请求串数据，建议每线程一个或使用锁。" },
    { q: "Windows 上创建进程池必须加 if __name__ == '__main__' 的原因是？", options: ["语法要求", "spawn 会重新导入模块，避免递归创建子进程", "提升速度", "防止内存泄漏"], answer: 1, explain: "Windows 使用 spawn 启动方式，子进程重新导入主模块；没有保护会继续创建进程，形成递归。" }
  ],
  tasks: [
    { title: "1000 个请求的并发爬虫", level: "进阶", desc: "用线程池抓取 1000 个 URL（可先用本地 sleep 模拟），要求固定 10 并发、每条失败记录 URL 与异常、最后统计成功率和平均耗时。", file: "exercises/ch08_concurrency.py" },
    { title: "验证计数器的线程安全问题", level: "挑战", desc: "分别用无锁和 Lock 让 4 个线程各自累加 10 万次，重复 5 轮，观察无锁版本的结果偏差。", file: "exercises/ch08_concurrency.py" }
  ]
},

/* ================= 第 9 章 ================= */
{
  id: "ch09", no: 9, stage: 2, stageName: "并发进阶",
  title: "asyncio 异步编程",
  subtitle: "单线程撑起 100 并发，把等待变成切换",
  time: "140 分钟", level: "挑战", tags: ["事件循环", "协程", "aiohttp", "Semaphore"],
  crawlerScene: "线程池开到 100 后内存告警、上下文切换开销明显；换成 asyncio + aiohttp，50 并发稳定跑完，CPU 占用还更低。",
  goals: [
    "理解事件循环与协程：await 不是阻塞，是让出控制权",
    "用 gather / TaskGroup / Semaphore 组织高并发抓取",
    "写出带超时、重试、连接池复用的 aiohttp 爬虫骨架"
  ],
  blocks: [
    { t: "lead", x: "异步的核心不是「更快的 Python」，而是「等待网络时去干别的」。单线程 + 事件循环，把成千上万个等待中的请求挂在队列上，谁的数据到了就处理谁。" },
    { t: "h", x: "9.1 事件循环与协程" },
    { t: "p", x: "事件循环是一个调度器：维护就绪任务队列，遇到 <code>await</code> 就把当前协程挂起，去跑其他任务。协程是「可以暂停和恢复的函数」，由 <code>async def</code> 定义。" },
    { t: "code", title: "hello_async.py", x: RAW`
import asyncio

async def hello(name, delay):
    print("start", name)
    await asyncio.sleep(delay)      # 非阻塞等待，事件循环去跑别的
    print("end", name)

async def main():
    await asyncio.gather(
        hello("A", 1),
        hello("B", 2),
    )

asyncio.run(main())
# start A / start B / end A (1s) / end B (2s)，总耗时约 2s
` },
    { t: "note", kind: "warn", title: "调用协程函数不会执行", x: "<code>hello(\"A\", 1)</code> 只创建协程对象，必须 <code>await</code>、<code>asyncio.create_task</code> 或 <code>gather</code> 才会运行。忘了 await 会得到 <code>RuntimeWarning: coroutine was never awaited</code>。" },
    { t: "h", x: "9.2 顺序 await vs 并发 gather" },
    { t: "code", title: "sequential_vs_gather.py", x: RAW`
import asyncio
import time

async def job(i):
    await asyncio.sleep(1)
    return i

async def sequential():
    start = time.perf_counter()
    results = []
    for i in range(5):
        results.append(await job(i))       # 一个等完再下一个
    print("sequential", round(time.perf_counter() - start, 1), results)

async def concurrent():
    start = time.perf_counter()
    results = await asyncio.gather(*(job(i) for i in range(5)))
    print("concurrent", round(time.perf_counter() - start, 1), results)

asyncio.run(sequential())     # 约 5.0s
asyncio.run(concurrent())     # 约 1.0s
` },
    { t: "p", x: "在循环里 <code>await</code> 是串行；先创建任务再 gather 才是并发。这是异步代码最常见的「写了但没并」。" },
    { t: "h", x: "9.3 Task、gather 与异常" },
    { t: "code", title: "tasks.py", x: RAW`
import asyncio

async def risky(i):
    await asyncio.sleep(0.5)
    if i == 2:
        raise ValueError("boom")
    return i

async def main():
    tasks = [asyncio.create_task(risky(i)) for i in range(4)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for r in results:
        if isinstance(r, Exception):
            print("失败:", repr(r))
        else:
            print("成功:", r)

asyncio.run(main())
` },
    { t: "p", x: "<code>gather</code> 默认遇到第一个异常就整体抛出，其余任务仍在后台跑（可能泄漏）。加 <code>return_exceptions=True</code> 收集全部结果，逐个判断；或者用 3.11 的 <code>TaskGroup</code> 获得结构化并发。" },
    { t: "code", title: "task_group.py", x: RAW`
import asyncio

async def fetch(i):
    await asyncio.sleep(0.3)
    return i

async def main():
    async with asyncio.TaskGroup() as tg:      # Python 3.11+
        tasks = [tg.create_task(fetch(i)) for i in range(5)]
    print([t.result() for t in tasks])

asyncio.run(main())
` },
    { t: "h", x: "9.4 用 Semaphore 限流" },
    { t: "code", title: "semaphore_async.py", x: RAW`
import asyncio

sem = asyncio.Semaphore(3)

async def limited(i):
    async with sem:                 # 最多 3 个同时进入
        print("enter", i)
        await asyncio.sleep(1)
        print("leave", i)

async def main():
    await asyncio.gather(*(limited(i) for i in range(9)))

asyncio.run(main())
` },
    { t: "p", x: "不要用 <code>asyncio.sleep</code> 做限速，它只延迟当前协程；要控制「同时在飞的请求数」，信号量是标准答案。目标站要求 QPS 上限时，可以在信号量外再叠加令牌桶。" },
    { t: "h", x: "9.5 aiohttp 完整骨架" },
    { t: "code", title: "aio_spider.py", x: RAW`
import asyncio
import aiohttp

HEADERS = {"User-Agent": "PyForge/1.0"}

async def fetch(session, url, sem, retries=2):
    async with sem:
        for attempt in range(retries + 1):
            try:
                timeout = aiohttp.ClientTimeout(total=10, connect=3)
                async with session.get(url, headers=HEADERS, timeout=timeout) as resp:
                    resp.raise_for_status()
                    return url, await resp.text()
            except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
                if attempt == retries:
                    return url, f"ERROR: {exc!r}"
                await asyncio.sleep(0.5 * 2 ** attempt)   # 指数退避

async def main(urls):
    sem = asyncio.Semaphore(50)
    connector = aiohttp.TCPConnector(limit=100, ttl_dns_cache=300)
    async with aiohttp.ClientSession(connector=connector) as session:
        results = await asyncio.gather(*(fetch(session, u, sem) for u in urls))
    return results

if __name__ == "__main__":
    urls = ["https://httpbin.org/get"] * 100
    data = asyncio.run(main(urls))
    print(len(data), sum(1 for _, t in data if not t.startswith("ERROR")))
` },
    { t: "note", kind: "danger", title: "禁止在协程里调用 requests", x: "<code>requests.get</code> 是阻塞调用，会卡住整个事件循环，所有并发瞬间退化成串行，还看不出原因。要么全异步（aiohttp/httpx.AsyncClient），要么用 <code>asyncio.to_thread</code> 包一层。" },
    { t: "h", x: "9.6 超时、取消与 to_thread" },
    { t: "code", title: "timeout_cancel.py", x: RAW`
import asyncio
import requests

async def slow():
    await asyncio.sleep(10)
    return "done"

async def main():
    try:
        result = await asyncio.wait_for(slow(), timeout=2)
    except asyncio.TimeoutError:
        print("超时了，任务已被取消")

    # 阻塞函数放进线程池，避免卡住事件循环
    html = await asyncio.to_thread(requests.get, "https://example.com", timeout=5)
    print(html.status_code)

asyncio.run(main())
` },
    { t: "p", x: "<code>asyncio.wait_for</code> 超时会取消内部任务并抛 TimeoutError。被取消的协程应在清理逻辑里处理 <code>asyncio.CancelledError</code>，不要吞掉它。" },
    { t: "h", x: "9.7 异步的边界" },
    { t: "table", head: ["场景", "适合 asyncio", "说明"], rows: [
      ["纯网络 IO、高并发", "是", "aiohttp/httpx 异步客户端"],
      ["需要大量 CPU 解析", "否", "解析放进程池，或 to_thread"],
      ["依赖同步 SDK", "谨慎", "用 to_thread 包，否则阻塞循环"],
      ["简单几十个请求", "不必", "线程池代码更短、更好维护"]
    ] },
    { t: "p", x: "异步的收益在「大量并发等待」时最明显。只有 20 个请求，线程池的可读性和调试体验更好；不要为了用异步而用异步。" }
  ],
  pitfalls: [
    { title: "在协程里调用阻塞函数", body: "requests、time.sleep、同步数据库驱动都会卡住事件循环，让并发失效。改用异步库或 to_thread。" },
    { title: "每次请求新建 ClientSession", body: "连接池无法复用，性能急剧下降，还可能出现连接泄漏。整个应用共用一个 Session。" },
    { title: "gather 不处理异常", body: "一个任务失败会抛出，其余任务可能仍在后台运行。用 return_exceptions=True 或 TaskGroup 统一处理。" },
    { title: "忘记 await", body: "协程对象不会执行，只看到 RuntimeWarning，数据永远为空。" },
    { title: "在 Jupyter 里 asyncio.run", body: "事件循环已在运行，会报 RuntimeError。Notebook 里直接用 await，或 nest_asyncio。" }
  ],
  cheatsheet: [
    ["<code>async def</code> / <code>await</code>", "定义与等待协程"],
    ["<code>asyncio.run(main())</code>", "程序入口，创建并关闭事件循环"],
    ["<code>asyncio.gather(*aws)</code>", "并发等待多个协程"],
    ["<code>asyncio.create_task(coro)</code>", "立即调度任务"],
    ["<code>asyncio.Semaphore(n)</code>", "限制并发数"],
    ["<code>asyncio.wait_for(coro, t)</code>", "超时取消"],
    ["<code>aiohttp.ClientSession</code>", "复用连接池"],
    ["<code>asyncio.to_thread(fn, ...)</code>", "包装阻塞函数"]
  ],
  quiz: [
    { q: "在协程里直接调用 requests.get 会怎样？", options: ["自动变成异步", "阻塞事件循环，所有并发退化", "报语法错误", "速度更快"], answer: 1, explain: "requests 是同步阻塞库，调用期间事件循环无法调度其他任务，整个程序的并发能力被破坏。" },
    { q: "asyncio.gather 加 return_exceptions=True 的作用是？", options: ["让任务变快", "把异常作为结果返回，而不是立即抛出", "忽略所有异常", "自动重试"], answer: 1, explain: "异常会作为返回值放进结果列表，调用方可以逐项判断，不会因第一个失败而丢失其他结果。" },
    { q: "控制同时在飞的请求数量，应该用？", options: ["asyncio.sleep", "Semaphore", "time.sleep", "更多 Task"], answer: 1, explain: "Semaphore 限制进入临界区的协程数量，从而控制并发度；sleep 只延迟当前协程，不控制总量。" }
  ],
  tasks: [
    { title: "异步爬虫骨架", level: "挑战", desc: "用 aiohttp 实现 100 个 URL 的抓取：50 并发、10 秒超时、失败重试 2 次并指数退避、返回成功/失败统计。", file: "exercises/ch09_asyncio.py" },
    { title: "证明阻塞调用会拖垮异步", level: "挑战", desc: "写两个版本：一个在协程里 time.sleep(1)，一个用 await asyncio.sleep(1)；各并发 10 个任务，对比总耗时。", file: "exercises/ch09_asyncio.py" }
  ]
},

/* ================= 第 10 章 ================= */
{
  id: "ch10", no: 10, stage: 3, stageName: "工程质量",
  stageDesc: "从「能跑」到「能维护、能上线」",
  title: "类型注解与工程化",
  subtitle: "让编辑器提前发现 None 崩溃，让项目能交付",
  time: "120 分钟", level: "进阶", tags: ["typing", "mypy", "pydantic", "项目结构"],
  crawlerScene: "线上突然报 TypeError: 'NoneType' object is not subscriptable，查了两小时，发现某个页面缺了 price 字段，下游一直默认它存在。",
  goals: [
    "用类型注解表达「可能为 None」「字段结构」，让 IDE 和 mypy 提前报错",
    "用 pydantic 校验外部数据，把脏数据挡在业务层之外",
    "搭出一个能交付的项目结构：配置、日志、依赖、入口"
  ],
  blocks: [
    { t: "lead", x: "注解不改变运行时行为，但它是一份可执行的文档：编辑器能补全、mypy 能检查、同事能看懂数据形状。爬虫的数据来自外部，形状不可信，更需要把「假设」写出来并校验。" },
    { t: "h", x: "10.1 注解的基本写法" },
    { t: "code", title: "annotations.py", x: RAW`
from typing import Optional

def parse_price(raw: str) -> float | None:
    cleaned = raw.replace(",", "").replace("￥", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None

def fetch_all(urls: list[str], timeout: int = 10) -> dict[str, list[str]]:
    ...
` },
    { t: "p", x: "Python 3.10+ 可以直接写 <code>float | None</code>；3.9 用 <code>Optional[float]</code>。3.8 及更早必须在文件顶部加 <code>from __future__ import annotations</code>，否则 <code>list[str]</code> 会报错。" },
    { t: "h", x: "10.2 常用类型工具" },
    { t: "table", head: ["写法", "表达的含义", "爬虫里的用途"], rows: [
      ["<code>Optional[T]</code> / <code>T | None</code>", "可能为 None", "缺失字段、解析失败"],
      ["<code>Union[A, B]</code> / <code>A | B</code>", "多种类型之一", "价格可能是数字或字符串"],
      ["<code>Literal[\"get\", \"post\"]</code>", "限定字面量", "请求方法"],
      ["<code>TypedDict</code>", "固定键的字典", "解析结果的结构"],
      ["<code>Protocol</code>", "结构化接口", "可替换的 Fetcher/Storage"],
      ["<code>TypeVar</code>", "泛型参数", "通用重试/批处理函数"],
      ["<code>Any</code>", "放弃检查", "第三方库边界，尽量少用"]
    ] },
    { t: "code", title: "typed_item.py", x: RAW`
from typing import TypedDict, NotRequired

class Item(TypedDict):
    title: str
    price: float
    url: str
    tags: NotRequired[list[str]]      # 3.11+

def parse_item(raw: dict[str, str]) -> Item | None:
    try:
        return {
            "title": raw["title"].strip(),
            "price": float(raw["price"]),
            "url": raw["url"],
            "tags": raw.get("tags", "").split(","),
        }
    except (KeyError, ValueError):
        return None
` },
    { t: "note", kind: "warn", title: "注解不会在运行时校验", x: "给函数标了 <code>Item</code>，传进去一个缺字段的 dict 照样能跑。运行时校验要靠 pydantic 或手写检查；注解只负责让静态检查器发现问题。" },
    { t: "h", x: "10.3 mypy：把错误提前到编辑器" },
    { t: "code", title: "pyproject.toml（片段）", x: RAW`
[tool.mypy]
python_version = "3.11"
strict = true
warn_unused_ignores = true
warn_return_any = true
exclude = ["tests/"]
` },
    { t: "code", title: "terminal", x: RAW`
pip install mypy
mypy src/
# src/parser.py:12: error: Item "None" of "float | None" has no attribute "__round__"
` },
    { t: "p", x: "mypy 报错最多的地方通常是「可能为 None」没有处理。这不是麻烦，而是它替你找到了线上会崩的那条路径。可以先用 <code>strict = false</code> 渐进收紧。" },
    { t: "h", x: "10.4 pydantic：在边界处校验" },
    { t: "code", title: "pydantic_item.py", x: RAW`
from pydantic import BaseModel, Field, ValidationError

class Item(BaseModel):
    title: str = Field(min_length=1)
    price: float = Field(ge=0)
    url: str
    tags: list[str] = []

raw = {"title": "键盘", "price": "199.0", "url": "https://a.com/1"}
try:
    item = Item.model_validate(raw)
    print(item.price, type(item.price))      # 199.0 <class 'float'>
except ValidationError as exc:
    print(exc.errors())
` },
    { t: "p", x: "pydantic 会把字符串 <code>\"199.0\"</code> 自动转成 float，缺字段/负数/空标题会抛出带字段路径的错误列表。外部数据（接口响应、CSV、配置）进入业务层之前，统一过一遍模型，后面就不用到处写 <code>if price is not None</code>。" },
    { t: "h", x: "10.5 项目结构" },
    { t: "code", title: "项目结构", x: RAW`
spider/
├── pyproject.toml          # 依赖 + 工具配置（ruff/mypy/pytest）
├── .env.example            # 配置样例，不提交真实密钥
├── src/spider/
│   ├── __init__.py
│   ├── config.py           # 读取环境变量，集中配置
│   ├── models.py           # dataclass / pydantic 模型
│   ├── fetch.py            # 请求层：重试、代理、限速
│   ├── parse.py            # 解析层：纯函数，输入 HTML，输出 Item
│   ├── storage.py          # 落地：JSONL / SQLite
│   └── main.py             # 入口：组装流程
├── tests/
│   ├── fixtures/           # 固定 HTML 样本
│   └── test_parse.py
└── data/                   # 运行产物，不进 git
` },
    { t: "p", x: "分层的关键是「解析层不依赖网络」。<code>parse(html) -> Item</code> 是纯函数，可以用固定样本测试，可以在进程池里跑，也可以换网站时单独重写。" },
    { t: "h", x: "10.6 配置与密钥" },
    { t: "code", title: "config.py", x: RAW`
import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    concurrency: int = 10
    timeout: int = 10
    proxy: str | None = None
    cookie: str | None = None

def load_settings() -> Settings:
    return Settings(
        concurrency=int(os.getenv("CONCURRENCY", "10")),
        timeout=int(os.getenv("TIMEOUT", "10")),
        proxy=os.getenv("PROXY"),
        cookie=os.getenv("COOKIE"),
    )
` },
    { t: "note", kind: "danger", title: "Cookie 不要写进代码", x: "提交到 Git 的 Cookie 等于公开账号。用环境变量或 <code>.env</code>（加入 .gitignore），并提供 <code>.env.example</code> 说明字段。已经泄漏的密钥要立即失效并更换。" },
    { t: "h", x: "10.7 工具链最小集合" },
    { t: "list", x: [
      "<b>ruff</b>：格式化 + lint，替代 black/flake8/isort，速度快",
      "<b>mypy</b>：静态类型检查，抓 None 与参数错用",
      "<b>pytest</b>：测试，第 11 章展开",
      "<b>pre-commit</b>：提交前自动跑 ruff/mypy，避免把问题推给 CI",
      "<b>uv / pip-tools</b>：锁定依赖版本，保证换机器能复现"
    ] }
  ],
  pitfalls: [
    { title: "Any 满天飞", body: "注解里到处 Any，等于没写。只在第三方库边界用 Any，并尽快转成具体类型。" },
    { title: "把注解当运行时校验", body: "函数签名标了类型，传错照样运行。外部数据用 pydantic 或显式校验。" },
    { title: "3.8 直接写 list[str]", body: "运行时报 TypeError。加 <code>from __future__ import annotations</code> 或使用 typing.List。" },
    { title: "配置硬编码在代码里", body: "换环境要改代码，密钥还会进 Git。统一从环境变量读取。" },
    { title: "解析层依赖网络", body: "无法离线测试、无法并发、无法复用。解析函数只接收 HTML/JSON，不自己发请求。" }
  ],
  cheatsheet: [
    ["<code>x: str</code> / <code>def f() -> int</code>", "变量与返回值注解"],
    ["<code>T | None</code>", "可能为空"],
    ["<code>TypedDict</code>", "描述字典的键与类型"],
    ["<code>Literal[...]</code>", "限定取值"],
    ["<code>Protocol</code>", "结构化接口，鸭子类型可检查"],
    ["<code>BaseModel.model_validate(d)</code>", "pydantic 校验并转换"],
    ["<code>mypy src/</code>", "静态检查"],
    ["<code>ruff check --fix</code>", "lint 并自动修复"]
  ],
  quiz: [
    { q: "函数注解（如 def f(x: int) -> str）在运行时的作用是？", options: ["强制类型转换", "参数类型不符就抛 TypeError", "只是元数据，不参与校验", "自动生成文档网站"], answer: 2, explain: "注解保存在 __annotations__ 里，解释器不会强制校验；校验要靠 mypy（静态）或 pydantic（运行时）。" },
    { q: "外部接口返回的 JSON 字段不可信，最合适的处理是？", options: ["直接 dict 取值", "用 pydantic 模型校验后再使用", "全部标注为 Any", "用 assert 判断"], answer: 1, explain: "pydantic 在边界处统一做类型转换与约束校验，错误集中且可读，业务层就不用反复判空。" },
    { q: "表达式 float | None 表示？", options: ["float 或 None", "float 除以 None", "只能是 None", "float 的绝对值"], answer: 0, explain: "这是 Python 3.10+ 的联合类型语法，等价于 Optional[float]，表示可能是 float 也可能是 None。" }
  ],
  tasks: [
    { title: "给解析器加类型与校验", level: "进阶", desc: "为 Item 写 TypedDict 或 pydantic 模型，解析函数返回 Item | None；对缺失字段、负价格、空标题分别构造用例并验证行为。", file: "exercises/ch10_typing.py" },
    { title: "搭一个最小项目骨架", level: "挑战", desc: "创建 src/spider/{config,models,fetch,parse,storage,main}.py 与 pyproject.toml，要求 parse 层是纯函数，配置从环境变量读取。", file: "exercises/ch10_typing.py" }
  ]
},

/* ================= 第 11 章 ================= */
{
  id: "ch11", no: 11, stage: 3, stageName: "工程质量",
  title: "测试、调试与可观测性",
  subtitle: "网站一改版就全挂？用固定样本提前发现",
  time: "120 分钟", level: "进阶", tags: ["pytest", "mock", "pdb", "logging"],
  crawlerScene: "目标站悄悄改了 HTML 结构，你的解析器静默返回空列表，跑了三天才发现数据库里一条新数据都没有。",
  goals: [
    "用 pytest + 固定 HTML 样本，离线验证解析逻辑",
    "用 fixture / parametrize / mock 覆盖异常与边界",
    "用 pdb 和结构化日志定位问题，而不是到处加 print"
  ],
  blocks: [
    { t: "lead", x: "爬虫的依赖在外部：页面结构、接口字段、网络状态都会变。你无法控制它们，但可以把「样本」固化下来，把解析逻辑变成可重复验证的纯函数。测试不是为了覆盖率，是为了改代码时敢动手。" },
    { t: "h", x: "11.1 把解析逻辑变成纯函数" },
    { t: "code", title: "parse.py", x: RAW`
from dataclasses import dataclass
import re

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
` },
    { t: "p", x: "这个函数不发请求、不读文件、不依赖时间，给同样的 HTML 永远返回同样的结果。这种函数最容易测，也最值得测。" },
    { t: "h", x: "11.2 pytest：从三个用例开始" },
    { t: "code", title: "tests/test_parse.py", x: RAW`
import pytest
from spider.parse import parse_item

@pytest.mark.parametrize("html, title, price", [
    ("<h1>键盘</h1><span>￥199.00</span>", "键盘", 199.0),
    ("<h1> 鼠标 </h1>", "鼠标", None),
    ("<div>没有标题</div>", None, None),
])
def test_parse_item(html, title, price):
    item = parse_item(html)
    if title is None:
        assert item is None
    else:
        assert item.title == title
        assert item.price == price
` },
    { t: "code", title: "terminal", x: RAW`
pip install pytest
pytest -q
# 3 passed in 0.02s
` },
    { t: "p", x: "<code>parametrize</code> 把「正常、缺价格、缺标题」三种情况压成一个测试函数，新增边界只需要加一行数据。测试文件放在 <code>tests/</code>，文件名以 <code>test_</code> 开头。" },
    { t: "h", x: "11.3 fixture：复用样本与临时目录" },
    { t: "code", title: "tests/conftest.py", x: RAW`
from pathlib import Path
import pytest

@pytest.fixture
def sample_html():
    return Path("tests/fixtures/item.html").read_text(encoding="utf-8")

@pytest.fixture
def tmp_jsonl(tmp_path):
    path = tmp_path / "items.jsonl"
    path.write_text("", encoding="utf-8")
    return path
` },
    { t: "p", x: "<code>tmp_path</code> 是 pytest 内置 fixture，每个测试一个独立临时目录，测文件写入不会污染项目。样本 HTML 放在 <code>tests/fixtures/</code>，用真实页面另存一份，遇到改版只需更新样本并补用例。" },
    { t: "h", x: "11.4 mock：不发真实请求" },
    { t: "code", title: "tests/test_fetch.py", x: RAW`
from unittest.mock import patch, Mock
import requests

def fetch_title(url):
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    return resp.text

def test_fetch_title_ok():
    fake = Mock()
    fake.status_code = 200
    fake.text = "<h1>hi</h1>"
    with patch("tests.test_fetch.requests.get", return_value=fake) as get:
        assert fetch_title("https://example.com") == "<h1>hi</h1>"
        get.assert_called_once_with("https://example.com", timeout=10)

def test_fetch_title_http_error():
    fake = Mock()
    fake.raise_for_status.side_effect = requests.HTTPError("500")
    with patch("tests.test_fetch.requests.get", return_value=fake):
        with pytest.raises(requests.HTTPError):
            fetch_title("https://example.com")
` },
    { t: "note", kind: "warn", title: "patch 的目标是「使用处」", x: "要 patch 模块里 import 进来的名字，而不是 <code>requests.get</code> 的字面来源。例如 <code>from spider.fetch import requests</code> 时，patch <code>spider.fetch.requests.get</code>。" },
    { t: "h", x: "11.5 调试：pdb 与 breakpoint()" },
    { t: "code", title: "debug.py", x: RAW`
def parse(items):
    for i, item in enumerate(items):
        breakpoint()          # 3.7+，等价于 import pdb; pdb.set_trace()
        print(i, item)

# pdb 常用命令：
# l        查看当前代码
# p expr   打印表达式
# n        下一行（不进函数）
# s        进入函数
# c        继续运行
# q        退出
` },
    { t: "p", x: "调试循环里的第 N 个元素，可以写条件断点：<code>breakpoint()</code> 外面包 <code>if i == 5:</code>。比反复 print 快得多，也不会污染代码。" },
    { t: "h", x: "11.6 异常链与日志：定位根因" },
    { t: "code", title: "exception_chain.py", x: RAW`
import logging

log = logging.getLogger(__name__)

def parse_price(raw):
    try:
        return float(raw)
    except ValueError as exc:
        raise ValueError(f"价格格式错误: {raw!r}") from exc

try:
    parse_price("N/A")
except ValueError:
    log.exception("解析失败")     # 日志里会同时出现两层异常栈
` },
    { t: "p", x: "日志要带上下文：URL、页码、字段名、原始值。只写「解析失败」，等于没写。" },
    { t: "h", x: "11.7 可观测性：三个最小指标" },
    { t: "code", title: "metrics.py", x: RAW`
from collections import Counter

metrics = Counter()
metrics["requests_total"] += 1
metrics["requests_failed"] += 1
metrics["parse_failed"] += 1

# 运行时定期打印或上报
def success_rate():
    total = metrics["requests_total"]
    return 1.0 if total == 0 else 1 - metrics["requests_failed"] / total
` },
    { t: "list", x: [
      "成功率：失败数 / 总数，低于阈值就告警",
      "耗时 P95：大部分请求正常但尾部极慢，往往才是瓶颈",
      "解析失败率：页面改版的早期信号，比「数据为空」更早暴露"
    ] },
    { t: "p", x: "不需要一上来就接 Prometheus。先用 Counter 定期打印到日志，跑一段时间就能看出趋势。指标的价值在于「变化」，而不是绝对值。" }
  ],
  pitfalls: [
    { title: "测试依赖真实网络", body: "网络抖动、目标站限流会让测试随机失败。解析测 HTML 样本，请求测 mock。" },
    { title: "只测正常路径", body: "缺字段、空页面、异常编码才是线上常见情况。每个解析器至少覆盖这三种。" },
    { title: "断言太宽", body: "assert result 不为空就算通过，字段错了也发现不了。断言具体字段值。" },
    { title: "patch 错路径", body: "patch 模块导入处，不是定义处；路径错了 mock 不生效，测试仍然发真实请求。" },
    { title: "用 print 当日志", body: "没有级别、没有时间、无法关闭、并发时乱序。用 logging。" }
  ],
  cheatsheet: [
    ["<code>pytest -q</code>", "安静模式跑测试"],
    ["<code>@pytest.mark.parametrize</code>", "表驱动用例"],
    ["<code>@pytest.fixture</code>", "复用测试数据/资源"],
    ["<code>tmp_path</code>", "内置临时目录 fixture"],
    ["<code>patch(\"mod.requests.get\")</code>", "替换网络调用"],
    ["<code>pytest.raises(E)</code>", "断言抛出异常"],
    ["<code>breakpoint()</code>", "进入 pdb"],
    ["<code>log.exception(...)</code>", "记录异常栈"]
  ],
  quiz: [
    { q: "爬虫解析器最适合怎么测？", options: ["每次跑真实请求", "用固定 HTML 样本做纯函数测试", "只测线上日志", "靠人工点页面"], answer: 1, explain: "固定样本让测试离线、稳定、可重复；真实请求慢且受外部影响，只适合少量集成测试。" },
    { q: "unittest.mock.patch 应该指向？", options: ["库的源码位置", "被测模块中使用该对象的名字", "随便哪个路径", "Python 内置模块"], answer: 1, explain: "patch 替换的是名字查找结果，所以要改「被测模块里 import 进来的那个名字」。" },
    { q: "解析失败率这个指标为什么有价值？", options: ["能提升速度", "页面改版时它会先于「数据为空」暴露问题", "可以直接替代测试", "只用于计费"], answer: 1, explain: "改版导致选择器失效时，解析会开始返回空/None，失败率上升是最早的预警信号。" }
  ],
  tasks: [
    { title: "给解析器补三个边界测试", level: "基础", desc: "为 parse_item 增加：缺标题、缺价格、价格带千分位逗号三种用例，要求断言具体字段。", file: "exercises/ch11_testing.py" },
    { title: "用 mock 测试重试逻辑", level: "进阶", desc: "模拟前两次请求超时、第三次成功，验证 fetch 最终返回数据且只调用了 3 次。", file: "exercises/ch11_testing.py" }
  ]
},

/* ================= 第 12 章 ================= */
{
  id: "ch12", no: 12, stage: 3, stageName: "工程质量",
  title: "性能分析与优化",
  subtitle: "先测量再动手，把 30 分钟压到 3 分钟",
  time: "130 分钟", level: "挑战", tags: ["cProfile", "复杂度", "缓存", "内存"],
  crawlerScene: "解析 10 万条数据要 30 分钟。你以为是「Python 太慢」，实际是循环里重复编译正则、用 list 做成员判断、每条数据都开关一次文件。",
  goals: [
    "用 timeit / cProfile 定位真正的热点，而不是凭感觉优化",
    "识别常见的 O(n²) 写法，并用 set/dict/批量 IO 消除",
    "理解内存与并发的边界，知道什么时候优化已经够用"
  ],
  blocks: [
    { t: "lead", x: "性能优化的第一原则：不要猜。人的直觉在性能问题上几乎总是错的。先测量，找到占比最大的那段代码，改掉它，再测量。三步之外都是浪费时间。" },
    { t: "h", x: "12.1 测量工具" },
    { t: "code", title: "timeit_demo.py", x: RAW`
import timeit

print(timeit.timeit("'-'.join(['a','b','c'])", number=100_000))
print(timeit.timeit("'a' + '-' + 'b' + '-' + 'c'", number=100_000))
# 用相对比较，不要纠结绝对秒数
` },
    { t: "p", x: "<code>timeit</code> 适合比较小片段；整个程序的热点用 cProfile。不要用 <code>time.time()</code> 包一段毫秒级代码，精度和噪声都会骗你。" },
    { t: "code", title: "profile.py", x: RAW`
import cProfile
import pstats

cProfile.run("main()", "prof.out")
stats = pstats.Stats("prof.out")
stats.sort_stats("cumtime").print_stats(15)
# 关注 cumtime 最高的函数，以及它被调用了多少次
` },
    { t: "code", title: "terminal", x: RAW`
python -m cProfile -s cumtime spider/main.py
# 输出按累计耗时排序，先看前 10 行
` },
    { t: "h", x: "12.2 常见 O(n²)：list 成员判断" },
    { t: "code", title: "membership.py", x: RAW`
urls = [f"https://a.com/{i}" for i in range(100_000)]
targets = urls[::2]

# 反例：每个 target 都线性扫描整个 urls
def slow():
    found = []
    for t in targets:
        if t in urls:
            found.append(t)
    return found

# 正例：先转 set
def fast():
    pool = set(urls)
    return [t for t in targets if t in pool]
` },
    { t: "table", head: ["操作", "list", "set/dict"], rows: [
      ["成员判断 x in c", "O(n)", "平均 O(1)"],
      ["去重", "O(n²) 手写", "O(n)"],
      ["计数", "O(n²)", "O(n)"],
      ["按 key 查找", "O(n)", "平均 O(1)"]
    ] },
    { t: "p", x: "同样的逻辑，换成 set 常常是几十倍到上百倍的差距。这是爬虫代码里性价比最高的一处优化。" },
    { t: "h", x: "12.3 别在循环里做重复工作" },
    { t: "code", title: "loop_waste.py", x: RAW`
import re

# 反例：每次迭代都重新编译正则
def slow(rows):
    out = []
    for row in rows:
        m = re.search(r"￥([\d.]+)", row)
        if m:
            out.append(float(m.group(1)))
    return out

# 正例：模块级预编译
PRICE_RE = re.compile(r"￥([\d.]+)")

def fast(rows):
    return [float(m.group(1)) for row in rows if (m := PRICE_RE.search(row))]
` },
    { t: "p", x: "Python 的 re 模块有内部缓存，但显式预编译更稳定，也让代码意图更清楚。同理：把不变的属性查找、字典构造、格式化模板移到循环外。" },
    { t: "h", x: "12.4 缓存：用空间换时间" },
    { t: "code", title: "cache_hot.py", x: RAW`
from functools import lru_cache
import time

@lru_cache(maxsize=1000)
def clean_domain(domain):
    time.sleep(0.01)          # 模拟昂贵操作
    return domain.strip().lower()

domains = ["A.com", "a.com", "A.COM"] * 100
print([clean_domain(d) for d in domains])
print(clean_domain.cache_info())   # hits 299, misses 1
` },
    { t: "p", x: "缓存只对纯函数有效。参数是可变对象（list/dict）不能直接做 key；有副作用或依赖时间的函数不要缓存。缓存要设上限，否则内存会反向爆炸。" },
    { t: "h", x: "12.5 IO 批量与连接复用" },
    { t: "code", title: "io_batch.py", x: RAW`
# 反例：每条都开关文件
def slow_write(items, path):
    for it in items:
        with open(path, "a", encoding="utf-8") as f:
            f.write(str(it) + "\n")

# 正例：一次打开，批量写
def fast_write(items, path):
    with open(path, "a", encoding="utf-8") as f:
        f.writelines(str(it) + "\n" for it in items)

# 请求层同理：复用 Session / 连接池，别每次新建
` },
    { t: "p", x: "网络请求的优化往往不在「解析」上，而在减少请求次数、复用连接、批量接口。先看请求总数，再看单次耗时。" },
    { t: "h", x: "12.6 内存：看不见的瓶颈" },
    { t: "code", title: "memory.py", x: RAW`
import tracemalloc

tracemalloc.start()
data = [{"id": i, "text": "x" * 100} for i in range(100_000)]
current, peak = tracemalloc.get_traced_memory()
print(f"current={current/1e6:.1f}MB peak={peak/1e6:.1f}MB")
tracemalloc.stop()

# 优化：生成器 + slots + 只保留必要字段
` },
    { t: "list", x: [
      "用生成器替代中间 list，内存从 O(n) 降到 O(1)",
      "百万级对象用 <code>@dataclass(slots=True)</code> 或 <code>__slots__</code>，省掉 __dict__",
      "只保留解析后的字段，不要长期持有整页 HTML",
      "大文件用逐行读取，不要 read() 整个文件"
    ] },
    { t: "h", x: "12.7 完整案例：30 分钟到 3 分钟" },
    { t: "steps", x: [
      { title: "先 profile", body: "cProfile 显示 70% 时间在 in 判断，20% 在正则，10% 在写文件。" },
      { title: "去重换 set", body: "URL 池转 set，成员判断从 O(n) 变 O(1)。" },
      { title: "正则预编译", body: "模块级 compile，循环里只调用 search。" },
      { title: "批量写 JSONL", body: "每 500 条打开一次文件，或全程持有一个句柄。" },
      { title: "最后再考虑并发", body: "解析是 CPU 瓶颈时用进程池；是网络瓶颈时用异步。不要在没测量前上并发。" }
    ] },
    { t: "note", kind: "tip", title: "优化的验收标准", x: "每次只改一处，改完复测并记录前后数字。没有度量数据的「优化」，很可能只是把代码写复杂了。" },
    { t: "p", x: "当 P95 耗时、内存峰值、成功率都达到目标，就停止。继续压榨 10% 性能，往往要用三倍的代码复杂度去换，不划算。" }
  ],
  pitfalls: [
    { title: "凭直觉优化", body: "猜中的概率很低，还容易把可读代码改成难维护的「奇技淫巧」。先 profile。" },
    { title: "用 time.time 测短耗时", body: "精度不足且受系统调度影响。小片段用 timeit，重复足够多次。" },
    { title: "只优化解析，忽略请求", body: "如果 80% 时间在等网络，把解析优化快 10 倍也只提升 2%。先分清瓶颈类型。" },
    { title: "缓存无上限", body: "lru_cache 不设 maxsize 会无限增长，长跑进程内存持续上涨。" },
    { title: "盲目上多进程", body: "进程创建、序列化、内存复制都有成本；小任务用进程池可能比串行更慢。" }
  ],
  cheatsheet: [
    ["<code>timeit.timeit(stmt, number=N)</code>", "微基准测试"],
    ["<code>cProfile.run(...)</code>", "函数级耗时分析"],
    ["<code>pstats.Stats(...).sort_stats(\"cumtime\")</code>", "按累计耗时排序"],
    ["<code>tracemalloc</code>", "内存分配追踪"],
    ["<code>set(seq)</code>", "消除 O(n) 成员判断"],
    ["<code>re.compile</code>", "循环外预编译"],
    ["<code>lru_cache(maxsize=...)</code>", "纯函数缓存"],
    ["<code>f.writelines(gen)</code>", "批量写入"]
  ],
  quiz: [
    { q: "性能优化的正确顺序是？", options: ["先上并发，再测量", "先测量定位，再改一处，再复测", "先把所有代码重写", "先换语言"], answer: 1, explain: "profile 找到热点，单点修改并复测，才能确认优化有效且没有引入新问题。" },
    { q: "把 `if url in urls` 中的 urls 从 list 换成 set，复杂度变化是？", options: ["O(n) → O(1) 平均", "O(1) → O(n)", "没有变化", "O(n²) → O(n³)"], answer: 0, explain: "set 基于哈希表，平均成员判断 O(1)；list 需要线性扫描。" },
    { q: "关于 lru_cache，正确的是？", options: ["任何函数都能安全缓存", "只适合纯函数，且应设置 maxsize", "缓存会自动持久化到磁盘", "它比手动缓存慢"], answer: 1, explain: "缓存假设相同输入产生相同输出；有副作用/依赖时间的函数缓存后行为错误，且必须限制容量。" }
  ],
  tasks: [
    { title: "给慢函数做一次 profile", level: "进阶", desc: "构造一个含 list 成员判断与循环内正则的函数，用 cProfile 找出热点，改成 set + 预编译，记录前后耗时。", file: "exercises/ch12_performance.py" },
    { title: "批量写入优化", level: "基础", desc: "对比「每条开关文件」与「一次打开批量写」写入 1 万条数据的耗时，并解释差异来源。", file: "exercises/ch12_performance.py" }
  ]
}

]);
})();

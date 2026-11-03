/* 项目 04 · 异步爬虫调度器
   重试与退避 → 并发上限与去重 → 断点续爬 → HTML 链接与 BFS。 */
window.PROJECTS.push({
  id: "async-crawler",
  type: "project",
  index: "04",
  title: "异步爬虫调度器",
  subtitle: "限流、重试与断点续爬",
  summary: "用 asyncio 写一个可解释的调度器：指数退避、Semaphore 并发上限、URL 去重、JSON 断点续爬、BFS 深度控制。",
  level: "简历级 · 进阶",
  duration: "6–8 小时",
  mode: "hybrid",
  modeLabel: "浏览器练核心 · 本地接真实站点",
  accent: "#0d7a55",
  stack: ["Python", "asyncio", "aiohttp", "html.parser", "json"],
  resumeLine: "asyncio 异步调度器：指数退避重试、Semaphore 并发控制、URL 去重、JSON 断点续爬与 BFS 抓取上限。",
  highlights: [
    "能讲清并发上限、退避与失败隔离，而不是“开一堆任务”",
    "有断点续爬与去重，能处理中途失败",
    "本地 aiohttp 版可以接真实站点，并明确遵守 robots.txt 与速率限制",
  ],
  sections: [
    {
      type: "h",
      text: "为什么爬虫项目容易写坏",
    },
    {
      type: "p",
      html: "初学者写爬虫常见的三个问题：<strong>并发开太大</strong>把站点打挂；<strong>失败就丢</strong>导致数据不完整；<strong>重复抓取</strong>浪费请求。这个项目不追求“抓多少页”，而是把调度器写成一个可恢复、可限流、可解释的系统。",
    },
    {
      type: "list",
      items: [
        "重试：指数退避，最多 N 次；最后一次仍失败就抛出，由上层决定。",
        "并发：Semaphore 限制同时进行的请求数。",
        "去重：输入层面去重 + 已访问集合，避免重复抓取。",
        "断点：每成功一页就写 JSON，重启后跳过已完成 URL。",
        "发现链接：解析 HTML 的 href，urljoin 归一化，跳过 mailto / javascript / 锚点。",
        "边界：BFS 最大深度与最大页数，避免无限扩散。",
      ],
    },
    {
      type: "callout",
      tone: "warn",
      title: "先读规则再写代码",
      html: "真实站点要遵守 <code>robots.txt</code>、服务条款与速率限制；设置可识别的 User-Agent，不要抓取个人数据或绕过登录。项目演示请用本地模拟页或自己搭建的站点。",
    },
    {
      type: "table",
      head: ["机制", "不用它会怎样"],
      rows: [
        ["Semaphore", "几百个并发请求，目标站点或本机先崩"],
        ["指数退避", "失败立刻重试，放大故障"],
        ["已访问集合", "同一页面被反复抓取，数据重复"],
        ["checkpoint", "中断后从头再来，时间与请求都浪费"],
      ],
    },
    {
      type: "callout",
      tone: "deep",
      title: "浏览器里怎么练",
      html: "站内检查点使用<strong>模拟 fetch</strong>，不访问真实网络；并发、重试、断点、BFS 的代码与本地版一致。完整参考实现里提供 aiohttp 版本，下载后可在本地接真实站点。",
    },
  ],
  architecture: {
    tree: String.raw`async-crawler/
├─ crawler.py            # 调度器 + 解析 + CLI（模拟 / aiohttp）
├─ test_crawler.py       # 重试、并发、断点、链接解析
├─ requirements.txt      # aiohttp
├─ checkpoint.json       # 运行时生成
└─ README.md`,
    notes: [
      "`fetch` 以参数注入，测试时传假函数，生产时传 aiohttp 包装；调度逻辑不依赖网络。",
      "`crawl` 负责并发与去重，`crawl_resume` 负责持久化，`bfs_crawl` 负责发现链接。每层都能单独测试。",
      "checkpoint 只记录成功 URL；失败页下次仍会重试。",
    ],
  },
  milestones: [
    {
      title: "M1 重试与指数退避",
      desc: "失败不要立刻放弃；按 2 的幂等待，最后一次失败向上抛。",
      exIds: ["pr4-1"],
    },
    {
      title: "M2 并发上限与失败隔离",
      desc: "Semaphore 限制同时在跑的请求；单个 URL 失败不拖垮整批。",
      exIds: ["pr4-2"],
    },
    {
      title: "M3 断点续爬",
      desc: "成功一页写一次 JSON，重启后只抓没完成的。",
      exIds: ["pr4-3"],
    },
    {
      title: "M4 HTML 链接与 BFS",
      desc: "解析 href、归一化 URL、限制同域、深度与页数。",
      exIds: ["pr4-4"],
    },
  ],
  exercises: [
    {
      id: "pr4-1",
      kind: "code",
      title: "重试与指数退避",
      difficulty: "★★☆",
      prompt:
        "实现 <code>fetch_with_retry(fetch, url, max_attempts=3, base_delay=0.01)</code>：调用 <code>await fetch(url)</code>；失败时若还有次数，等待 <code>base_delay * 2**(attempt-1)</code> 后重试；最后一次失败直接抛出。",
      starter: String.raw`import asyncio

async def fetch_with_retry(fetch, url, max_attempts=3, base_delay=0.01):
    pass

async def demo(url):
    if url == "bad":
        raise RuntimeError("network down")
    return "ok"

print(await fetch_with_retry(demo, "good"))`,
      hints: [
        "用 <code>for attempt in range(1, max_attempts + 1)</code>。",
        "成功直接 return；失败且 attempt 未到上限就 sleep。",
        "最后一次失败让异常自然抛出，不要吞掉。",
      ],
      solution: String.raw`import asyncio

async def fetch_with_retry(fetch, url, max_attempts=3, base_delay=0.01):
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            return await fetch(url)
        except Exception as exc:
            last_error = exc
            if attempt >= max_attempts:
                raise
            await asyncio.sleep(base_delay * (2 ** (attempt - 1)))
    raise last_error

async def demo(url):
    if url == "bad":
        raise RuntimeError("network down")
    return "ok"

print(await fetch_with_retry(demo, "good"))`,
      check: String.raw`calls = []

async def flaky(url):
    calls.append(url)
    if len(calls) < 3:
        raise RuntimeError("boom")
    return "ok"

assert await fetch_with_retry(flaky, "u") == "ok"
assert len(calls) == 3

async def always_fail(url):
    raise RuntimeError("always")

try:
    await fetch_with_retry(always_fail, "u", max_attempts=2, base_delay=0.001)
except RuntimeError:
    pass
else:
    raise AssertionError("重试耗尽后应抛出异常")

async def immediate(url):
    return "done"

assert await fetch_with_retry(immediate, "u", max_attempts=1) == "done"
print("通过：成功重试、耗尽抛出与单次调用都正确")`,
    },
    {
      id: "pr4-2",
      kind: "code",
      title: "Semaphore 并发与失败隔离",
      difficulty: "★★★",
      prompt:
        "实现 <code>crawl(urls, fetch, concurrency=3)</code>：先对输入去重并保持顺序，用 Semaphore 限制并发；返回 <code>{url: 内容}</code>，单个 URL 失败记为 None，不影响其他 URL。",
      starter: String.raw`import asyncio

async def crawl(urls, fetch, concurrency=3):
    pass

async def fake(url):
    await asyncio.sleep(0.01)
    return url.upper()

print(await crawl(["a", "b", "a", "c"], fake, concurrency=2))`,
      hints: [
        "去重：<code>list(dict.fromkeys(urls))</code>。",
        "每个 URL 的任务里 <code>async with sem:</code>，失败返回 <code>(url, None)</code>。",
        "用 <code>asyncio.gather</code> 收集，再 <code>dict(pairs)</code>。",
      ],
      solution: String.raw`import asyncio

async def crawl(urls, fetch, concurrency=3):
    unique = list(dict.fromkeys(urls))
    sem = asyncio.Semaphore(concurrency)

    async def one(url):
        async with sem:
            try:
                return url, await fetch(url)
            except Exception:
                return url, None

    pairs = await asyncio.gather(*(one(url) for url in unique))
    return dict(pairs)

async def fake(url):
    await asyncio.sleep(0.01)
    return url.upper()

print(await crawl(["a", "b", "a", "c"], fake, concurrency=2))`,
      check: String.raw`active = 0
peak = 0

async def fake(url):
    global active, peak
    active += 1
    peak = max(peak, active)
    await asyncio.sleep(0.02)
    active -= 1
    if url == "bad":
        raise RuntimeError("boom")
    return url.upper()

urls = ["a", "b", "bad", "a", "c", "d"]
result = await crawl(urls, fake, concurrency=2)
assert list(result) == ["a", "b", "bad", "c", "d"], result
assert result["a"] == "A"
assert result["bad"] is None
assert result["c"] == "C"
assert peak <= 2, f"并发峰值 {peak} 超过上限"
print("通过：去重、失败隔离与并发上限都正确")`,
    },
    {
      id: "pr4-3",
      kind: "code",
      title: "断点续爬",
      difficulty: "★★★",
      prompt:
        "实现 <code>save_checkpoint</code>、<code>load_checkpoint</code>、<code>crawl_resume</code>。只把成功 URL 写入 JSON；重启后跳过已完成项，只抓新增 URL，并返回本次抓取结果。",
      starter: String.raw`import asyncio
import json
from pathlib import Path

def save_checkpoint(path, done):
    pass

def load_checkpoint(path):
    pass

async def crawl_resume(urls, fetch, path, concurrency=3):
    pass

async def fake(url):
    return url

print(await crawl_resume(["a", "b"], fake, "checkpoint.json"))`,
      hints: [
        "checkpoint 文件不存在时返回 <code>set()</code>。",
        "待抓列表 = 输入去重后减去已完成集合。",
        "每个任务成功后把 URL 加入 done 并立即保存；失败只记 None，不写入。",
      ],
      solution: String.raw`import asyncio
import json
from pathlib import Path

def save_checkpoint(path, done):
    Path(path).write_text(
        json.dumps({"done": sorted(done)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

def load_checkpoint(path):
    file = Path(path)
    if not file.exists():
        return set()
    data = json.loads(file.read_text(encoding="utf-8"))
    return set(data.get("done", []))

async def crawl_resume(urls, fetch, path, concurrency=3):
    done = load_checkpoint(path)
    pending = [url for url in dict.fromkeys(urls) if url not in done]
    sem = asyncio.Semaphore(concurrency)
    results = {}

    async def one(url):
        async with sem:
            try:
                text = await fetch(url)
            except Exception:
                results[url] = None
                return
            results[url] = text
            done.add(url)
            save_checkpoint(path, done)

    await asyncio.gather(*(one(url) for url in pending))
    return results

async def fake(url):
    return url

print(await crawl_resume(["a", "b"], fake, "checkpoint.json"))`,
      check: String.raw`path = Path("check_resume.json")
if path.exists():
    path.unlink()

calls = []

async def fake(url):
    calls.append(url)
    return url

first = await crawl_resume(["a", "b"], fake, path)
assert set(first) == {"a", "b"}
assert load_checkpoint(path) == {"a", "b"}
assert len(calls) == 2

calls.clear()
second = await crawl_resume(["a", "b", "c"], fake, path)
assert set(second) == {"c"}
assert calls == ["c"]
assert load_checkpoint(path) == {"a", "b", "c"}
assert load_checkpoint("no-such.json") == set()
print("通过：只抓新增 URL，checkpoint 正确累加")`,
    },
    {
      id: "pr4-4",
      kind: "code",
      title: "解析链接并做 BFS",
      difficulty: "★★★",
      prompt:
        "实现 <code>extract_links(html, base_url)</code> 与异步 <code>bfs_crawl(start_url, fetch, max_depth=2, max_pages=10)</code>：解析 href、用 urljoin 归一化、跳过 mailto/javascript/锚点，只跟随同域链接；返回成功抓取的 <code>{url: html}</code>。",
      starter: String.raw`import asyncio
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            for key, value in attrs:
                if key == "href" and value:
                    self.links.append(value)

def extract_links(html, base_url):
    pass

async def bfs_crawl(start_url, fetch, max_depth=2, max_pages=10):
    pass

async def fake(url):
    return f"<html><a href='/next'>next</a></html>"

print(await bfs_crawl("https://example.com/", fake, max_depth=1))`,
      hints: [
        "先 <code>LinkParser().feed(html)</code>，再逐个 <code>urljoin(base_url, href)</code>。",
        "用 <code>urlparse(url).netloc</code> 限制同域；用 <code>split(\"#\")[0]</code> 去掉锚点。",
        "BFS 用 <code>queue.pop(0)</code> 或 deque，记录 (url, depth) 与 visited。",
      ],
      solution: String.raw`import asyncio
from collections import deque
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            for key, value in attrs:
                if key == "href" and value:
                    self.links.append(value)

def extract_links(html, base_url):
    parser = LinkParser()
    parser.feed(html)
    links = []
    for href in parser.links:
        href = href.strip()
        if href.startswith(("mailto:", "javascript:", "#")):
            continue
        url = urljoin(base_url, href).split("#")[0]
        if url not in links:
            links.append(url)
    return links

async def bfs_crawl(start_url, fetch, max_depth=2, max_pages=10):
    start = start_url.split("#")[0]
    netloc = urlparse(start).netloc
    queue = deque([(start, 0)])
    visited = {start}
    results = {}

    while queue and len(results) < max_pages:
        url, depth = queue.popleft()
        try:
            html = await fetch(url)
        except Exception:
            continue
        results[url] = html
        if depth >= max_depth:
            continue
        for link in extract_links(html, url):
            if urlparse(link).netloc != netloc or link in visited:
                continue
            visited.add(link)
            queue.append((link, depth + 1))
    return results

async def fake(url):
    return f"<html><a href='/next'>next</a></html>"

print(await bfs_crawl("https://example.com/", fake, max_depth=1))`,
      check: String.raw`html = '<a href="/a">A</a><a href="b">B</a><a href="#top">Top</a><a href="mailto:x@y">M</a>'
assert extract_links(html, "https://example.com/") == [
    "https://example.com/a",
    "https://example.com/b",
]

pages = {
    "https://example.com/": '<a href="/a">A</a><a href="/b">B</a>',
    "https://example.com/a": '<a href="/c">C</a>',
    "https://example.com/b": "",
    "https://example.com/c": "",
}

async def fake(url):
    return pages.get(url, "")

result = await bfs_crawl("https://example.com/", fake, max_depth=2, max_pages=10)
assert set(result) == {
    "https://example.com/",
    "https://example.com/a",
    "https://example.com/b",
    "https://example.com/c",
}, result
limited = await bfs_crawl("https://example.com/", fake, max_depth=1, max_pages=2)
assert len(limited) == 2
print("通过：链接归一化、同域 BFS、深度与页数上限都正确")`,
    },
  ],
  files: [
    {
      name: "crawler.py",
      note: "完整实现：调度器 + 链接解析 + 模拟/aiohttp",
      lang: "python",
      code: String.raw`"""异步爬虫调度器：默认使用模拟 fetch，--live 使用 aiohttp。

用法：
    python crawler.py --start https://example.com/ --depth 2 --max-pages 20
    python crawler.py --start https://quotes.toscrape.com/ --live --max-pages 10
"""
import argparse
import asyncio
import json
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse


async def fetch_with_retry(fetch, url, max_attempts=3, base_delay=0.05):
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            return await fetch(url)
        except Exception as exc:
            last_error = exc
            if attempt >= max_attempts:
                raise
            await asyncio.sleep(base_delay * (2 ** (attempt - 1)))
    raise last_error


async def crawl(urls, fetch, concurrency=3):
    unique = list(dict.fromkeys(urls))
    sem = asyncio.Semaphore(concurrency)

    async def one(url):
        async with sem:
            try:
                return url, await fetch(url)
            except Exception:
                return url, None

    pairs = await asyncio.gather(*(one(url) for url in unique))
    return dict(pairs)


def save_checkpoint(path, done):
    Path(path).write_text(
        json.dumps({"done": sorted(done)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def load_checkpoint(path):
    file = Path(path)
    if not file.exists():
        return set()
    return set(json.loads(file.read_text(encoding="utf-8")).get("done", []))


async def crawl_resume(urls, fetch, path, concurrency=3):
    done = load_checkpoint(path)
    pending = [url for url in dict.fromkeys(urls) if url not in done]
    sem = asyncio.Semaphore(concurrency)
    results = {}

    async def one(url):
        async with sem:
            try:
                text = await fetch(url)
            except Exception:
                results[url] = None
                return
            results[url] = text
            done.add(url)
            save_checkpoint(path, done)

    await asyncio.gather(*(one(url) for url in pending))
    return results


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            for key, value in attrs:
                if key == "href" and value:
                    self.links.append(value)


def extract_links(html, base_url):
    parser = LinkParser()
    parser.feed(html)
    links = []
    for href in parser.links:
        href = href.strip()
        if href.startswith(("mailto:", "javascript:", "#")):
            continue
        url = urljoin(base_url, href).split("#")[0]
        if url not in links:
            links.append(url)
    return links


async def bfs_crawl(start_url, fetch, max_depth=2, max_pages=10):
    start = start_url.split("#")[0]
    netloc = urlparse(start).netloc
    queue = deque([(start, 0)])
    visited = {start}
    results = {}

    while queue and len(results) < max_pages:
        url, depth = queue.popleft()
        try:
            html = await fetch(url)
        except Exception:
            continue
        results[url] = html
        if depth >= max_depth:
            continue
        for link in extract_links(html, url):
            if urlparse(link).netloc != netloc or link in visited:
                continue
            visited.add(link)
            queue.append((link, depth + 1))
    return results


async def fetch_live(session, url):
    async with session.get(url, timeout=15) as response:
        response.raise_for_status()
        return await response.text()


async def main(argv=None):
    parser = argparse.ArgumentParser(description="异步爬虫调度器")
    parser.add_argument("--start", required=True)
    parser.add_argument("--depth", type=int, default=1)
    parser.add_argument("--max-pages", type=int, default=10)
    parser.add_argument("--concurrency", type=int, default=3)
    parser.add_argument("--live", action="store_true", help="使用 aiohttp 访问真实站点")
    parser.add_argument("--checkpoint", default="checkpoint.json")
    args = parser.parse_args(argv)

    if args.live:
        import aiohttp

        headers = {"User-Agent": "PyForgeCrawler/1.0 (+learning project)"}
        async with aiohttp.ClientSession(headers=headers) as session:
            async def fetch(url):
                return await fetch_with_retry(lambda u: fetch_live(session, u), url)

            results = await bfs_crawl(args.start, fetch, args.depth, args.max_pages)
    else:
        async def fake(url):
            return f"<html><body>simulated {url}</body></html>"

        results = await bfs_crawl(args.start, fake, args.depth, args.max_pages)

    for url in results:
        print(url)
    print(f"fetched {len(results)} pages")
    save_checkpoint(args.checkpoint, set(results))


if __name__ == "__main__":
    asyncio.run(main())
`,
    },
    {
      name: "test_crawler.py",
      note: "重试、并发、断点与链接解析测试",
      lang: "python",
      code: String.raw`import unittest
from pathlib import Path

from crawler import (
    bfs_crawl,
    crawl,
    crawl_resume,
    extract_links,
    fetch_with_retry,
    load_checkpoint,
    save_checkpoint,
)


class CrawlerTest(unittest.IsolatedAsyncioTestCase):
    async def test_retry(self):
        calls = []

        async def flaky(url):
            calls.append(url)
            if len(calls) < 3:
                raise RuntimeError("boom")
            return "ok"

        self.assertEqual(await fetch_with_retry(flaky, "u", base_delay=0.001), "ok")
        self.assertEqual(len(calls), 3)

    async def test_concurrency(self):
        active = 0
        peak = 0

        async def fake(url):
            nonlocal active, peak
            active += 1
            peak = max(peak, active)
            await __import__("asyncio").sleep(0.02)
            active -= 1
            return url

        result = await crawl(["a", "b", "a", "c"], fake, concurrency=2)
        self.assertEqual(list(result), ["a", "b", "c"])
        self.assertLessEqual(peak, 2)

    async def test_checkpoint(self):
        path = Path("test_checkpoint.json")
        if path.exists():
            path.unlink()

        async def fake(url):
            return url

        first = await crawl_resume(["a", "b"], fake, path)
        self.assertEqual(set(first), {"a", "b"})
        second = await crawl_resume(["a", "b", "c"], fake, path)
        self.assertEqual(set(second), {"c"})
        self.assertEqual(load_checkpoint(path), {"a", "b", "c"})

    def test_links(self):
        html = '<a href="/a">A</a><a href="b">B</a><a href="#top">Top</a>'
        self.assertEqual(
            extract_links(html, "https://example.com/"),
            ["https://example.com/a", "https://example.com/b"],
        )


if __name__ == "__main__":
    unittest.main()
`,
    },
    {
      name: "requirements.txt",
      note: "本地真实抓取依赖",
      lang: "text",
      plain: true,
      code: String.raw`aiohttp>=3.9
`,
    },
    {
      name: "README.md",
      note: "运行说明与合规提醒",
      lang: "markdown",
      plain: true,
      code: String.raw`# 异步爬虫调度器

## 模拟运行

    python crawler.py --start https://example.com/ --depth 3 --max-pages 20

## 真实运行

    pip install -r requirements.txt
    python crawler.py --start https://quotes.toscrape.com/ --live --max-pages 10

## 机制

- fetch_with_retry：指数退避，最多 N 次
- crawl：Semaphore 并发上限 + 输入去重 + 失败隔离
- crawl_resume：成功 URL 写入 JSON，重启后跳过
- bfs_crawl：同域、深度、页数上限

## 合规

只抓取允许抓取的站点，遵守 robots.txt、服务条款与速率限制；
不要抓取个人数据或绕过登录。演示请优先使用本地模拟页。
`,
    },
  ],
  localSetup: [
    "python -m venv .venv",
    "# Windows: .venv\\Scripts\\activate",
    "python crawler.py --start https://example.com/ --depth 2 --max-pages 6",
    "pip install -r requirements.txt",
    "python crawler.py --start https://quotes.toscrape.com/ --live --max-pages 10",
    "python -m unittest -v",
  ],
  localNotes: [
    "站内检查点用模拟 fetch，不会发起真实网络请求；本地 `--live` 才会用 aiohttp。",
    "先小规模跑（max-pages 5），确认 robots.txt 与站点条款允许后再扩大。",
    "checkpoint.json 应加入 .gitignore；演示时展示“中断后继续”的日志。",
  ],
  resume: {
    keywords: ["Python", "asyncio", "aiohttp", "并发控制", "重试", "断点续爬"],
    bullets: [
      "实现异步爬虫调度器：Semaphore 控制并发上限，指数退避重试，单个 URL 失败不影响整批任务。",
      "设计 JSON checkpoint 断点续爬：只记录成功 URL，重启后跳过已完成页面，避免重复请求。",
      "实现 HTML 链接提取与同域 BFS，限制最大深度与页数；本地 aiohttp 版可接真实站点并设置可识别 UA。",
    ],
  },
  extensions: [
    "加入 robots.txt 解析与按域名的速率限制。",
    "把 checkpoint 从 JSON 换成 SQLite，支持按站点、状态查询。",
    "增加失败重试队列与指数退避上限，避免无限重试。",
    "把并发模型换成 asyncio 队列 + worker，支持动态追加 URL。",
    "接入真实站点前先写离线 fixture，保证测试不依赖网络。",
  ],
  refs: [
    {
      name: "scrapy/scrapy",
      url: "https://github.com/scrapy/scrapy",
      why: "工业级爬虫框架：调度器、去重、中间件、限速的完整实现，适合对照阅读。",
    },
    {
      name: "aio-libs/aiohttp",
      url: "https://github.com/aio-libs/aiohttp",
      why: "异步 HTTP 客户端；本地真实抓取版本使用它。",
    },
    {
      name: "Python 官方文档：asyncio",
      url: "https://docs.python.org/zh-cn/3/library/asyncio.html",
      why: "Semaphore、gather、wait_for 与事件循环的权威说明。",
    },
  ],
});

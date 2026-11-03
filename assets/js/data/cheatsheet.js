/* 速查表：按主题分组的短代码。所有片段均可在练习场直接运行。 */
window.CHEATSHEET = [
  {
    name: "字符串",
    items: [
      {
        t: "f-string 与调试输出",
        code: `name = "林"
age = 28
print(f"{name=}, {age=}")
print(f"{age:>5} | {age:<5} | {age:^5}")`,
        note: "= 会同时打印表达式文本；> < ^ 控制对齐宽度。",
      },
      {
        t: "多行字符串",
        code: `text = """第一行
第二行"""
print(text.splitlines())`,
        note: "三引号保留换行；splitlines() 按行切分。",
      },
      {
        t: "清洗与连接",
        code: `raw = "  Python,Web,Data  "
parts = [p.strip() for p in raw.split(",")]
print(" | ".join(parts))`,
        note: "split 后先 strip，再 join；不要用 += 反复拼接大字符串。",
      },
      {
        t: "反转与回文判断",
        code: `s = "level"
print(s[::-1])
print(s == s[::-1])`,
        note: "切片反转返回新字符串，原字符串不变。",
      },
    ],
  },
  {
    name: "列表 / 字典 / 集合",
    items: [
      {
        t: "安全取值",
        code: `data = {"name": "林"}
print(data.get("age", 0))
data.setdefault("tags", []).append("python")
print(data)`,
        note: "get 不抛 KeyError；setdefault 适合分组收集。",
      },
      {
        t: "排序：多条件",
        code: `rows = [("林", 88), ("陈", 95), ("周", 88)]
print(sorted(rows, key=lambda r: (-r[1], r[0])))`,
        note: "key 返回元组；负号实现降序。",
      },
      {
        t: "保序去重",
        code: `items = ["b", "a", "b", "c", "a"]
print(list(dict.fromkeys(items)))`,
        note: "dict 保持插入顺序，fromkeys 顺手去重。",
      },
      {
        t: "集合运算",
        code: `a = {1, 2, 3}
b = {3, 4}
print(a | b, a & b, a - b)`,
        note: "并集 / 交集 / 差集；成员判断平均 O(1)。",
      },
      {
        t: "解包与星号",
        code: `first, *rest = [1, 2, 3, 4]
print(first, rest)
merged = {**{"a": 1}, **{"b": 2}}
print(merged)`,
        note: "星号收集剩余元素；字典也可用 ** 合并。",
      },
    ],
  },
  {
    name: "控制流",
    items: [
      {
        t: "for-else",
        code: `target = 7
for n in [1, 3, 5]:
    if n == target:
        print("found")
        break
else:
    print("not found")`,
        note: "只有没被 break 打断才执行 else。",
      },
      {
        t: "enumerate 与 zip",
        code: `names = ["林", "陈"]
scores = [88, 95]
for i, (name, score) in enumerate(zip(names, scores), 1):
    print(i, name, score)`,
        note: "zip 默认以最短为准；3.10+ 可加 strict=True。",
      },
      {
        t: "三元表达式",
        code: `score = 72
level = "通过" if score >= 60 else "未通过"
print(level)`,
        note: "简单二选一用三元；嵌套多层就改回 if。",
      },
      {
        t: "海象运算符",
        code: `data = [1, 2, 3, 4]
if (n := len(data)) > 3:
    print("长度", n)`,
        note: "赋值表达式，适合“先算再用”的判断。",
      },
    ],
  },
  {
    name: "函数",
    items: [
      {
        t: "可变默认值正确写法",
        code: `def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket`,
        note: "默认值只求值一次；可变对象必须用 None 哨兵。",
      },
      {
        t: "可变参数与仅关键字",
        code: `def f(a, *args, sep="-", **kwargs):
    print(a, args, sep, kwargs)

f(1, 2, 3, sep="+", x=9)`,
        note: "* 之后的参数必须用关键字传入。",
      },
      {
        t: "闭包计数器",
        code: `def make_counter(start=0):
    count = start
    def next_value():
        nonlocal count
        count += 1
        return count
    return next_value

c = make_counter(10)
print(c(), c())`,
        note: "nonlocal 修改外层函数变量；返回函数本身。",
      },
      {
        t: "装饰器最小模板",
        code: `from functools import wraps

def logged(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print("call", fn.__name__)
        return fn(*args, **kwargs)
    return wrapper`,
        note: "永远加 wraps，保留原名与文档。",
      },
    ],
  },
  {
    name: "类与数据模型",
    items: [
      {
        t: "dataclass 模板",
        code: `from dataclasses import dataclass, field

@dataclass
class Task:
    title: str
    priority: int = 3
    tags: list[str] = field(default_factory=list)`,
        note: "可变默认值必须用 default_factory。",
      },
      {
        t: "property 校验",
        code: `class Product:
    def __init__(self, price):
        self.price = price

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("价格不能为负")
        self._price = value`,
        note: "构造时给 self.price 赋值也会走 setter。",
      },
      {
        t: "__repr__ 与 __eq__",
        code: `class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

    def __eq__(self, other):
        return isinstance(other, Point) and (self.x, self.y) == (other.x, other.y)`,
        note: "repr 面向开发者；eq 要处理类型不同的情况。",
      },
      {
        t: "让对象可迭代",
        code: `class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, i):
        return self._songs[i]`,
        note: "实现 len + getitem 后，索引、切片、for 都能用。",
      },
    ],
  },
  {
    name: "异常处理",
    items: [
      {
        t: "完整结构",
        code: `try:
    value = int("42")
except ValueError as exc:
    print("失败", exc)
else:
    print("成功", value)
finally:
    print("总会执行")`,
        note: "else 放成功分支；finally 放清理。",
      },
      {
        t: "抛异常并保留原因",
        code: `def parse(text):
    try:
        return int(text)
    except ValueError as exc:
        raise ValueError(f"非法输入: {text!r}") from exc`,
        note: "from exc 保留原始 traceback 链。",
      },
      {
        t: "自定义异常",
        code: `class AppError(Exception):
    pass

class ConfigError(AppError):
    def __init__(self, key):
        self.key = key
        super().__init__(f"缺少配置: {key}")`,
        note: "项目级基类便于统一处理与日志。",
      },
      {
        t: "忽略特定异常",
        code: `from contextlib import suppress

with suppress(FileNotFoundError):
    open("missing.txt")`,
        note: "只抑制明确知道的异常，不要 suppress(Exception)。",
      },
    ],
  },
  {
    name: "文件与路径",
    items: [
      {
        t: "Path 读写",
        code: `from pathlib import Path

p = Path("note.txt")
p.write_text("你好", encoding="utf-8")
print(p.read_text(encoding="utf-8"))`,
        note: "文本文件始终显式写 encoding。",
      },
      {
        t: "with 追加写入",
        code: `with open("log.txt", "a", encoding="utf-8") as f:
    f.write("一条日志")`,
        note: "追加模式 a；with 保证关闭。",
      },
      {
        t: "JSON 往返",
        code: `import json
from pathlib import Path

p = Path("data.json")
p.write_text(json.dumps({"name": "林"}, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.loads(p.read_text(encoding="utf-8")))`,
        note: "ensure_ascii=False 保留中文可读性。",
      },
      {
        t: "遍历目录",
        code: `from pathlib import Path

for path in Path(".").glob("**/*.py"):
    print(path)`,
        note: "glob 用 ** 递归；rglob 也可。",
      },
    ],
  },
  {
    name: "生成器与迭代",
    items: [
      {
        t: "生成器函数",
        code: `def count_down(n):
    while n > 0:
        yield n
        n -= 1

print(list(count_down(3)))`,
        note: "调用不执行，next 才推进；只能消费一次。",
      },
      {
        t: "取无限序列前 n 项",
        code: `from itertools import islice

def naturals():
    n = 0
    while True:
        yield n
        n += 1

print(list(islice(naturals(), 5)))`,
        note: "无限生成器必须配合 islice / 条件 break。",
      },
      {
        t: "yield from 展平",
        code: `def flatten(matrix):
    for row in matrix:
        yield from row

print(list(flatten([[1, 2], [3]])))`,
        note: "yield from 把子迭代器的元素逐个产出。",
      },
      {
        t: "生成器表达式",
        code: `nums = [1, 2, 3, 4]
total = sum(x * x for x in nums)
print(total)`,
        note: "省内存；但传给需要多次遍历的函数前要先 list()。",
      },
    ],
  },
  {
    name: "类型提示",
    items: [
      {
        t: "基础注解",
        code: `def average(nums: list[float]) -> float:
    return sum(nums) / len(nums) if nums else 0.0`,
        note: "运行时不校验，交给 mypy / pyright。",
      },
      {
        t: "可能为 None",
        code: `def find(uid: int) -> str | None:
    return {1: "林"}.get(uid)`,
        note: "3.10+ 用 | None；旧代码常见 Optional[str]。",
      },
      {
        t: "TypedDict",
        code: `from typing import TypedDict

class Book(TypedDict):
    title: str
    price: float

book: Book = {"title": "流畅的 Python", "price": 129.0}`,
        note: "描述有固定键的普通字典。",
      },
      {
        t: "Protocol",
        code: `from typing import Protocol

class SupportsLen(Protocol):
    def __len__(self) -> int: ...

def describe(obj: SupportsLen) -> str:
    return f"长度 {len(obj)}"`,
        note: "鸭子类型的静态表达，比抽象基类更轻。",
      },
    ],
  },
  {
    name: "并发",
    items: [
      {
        t: "asyncio.gather",
        code: `import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return name

async def main():
    result = await asyncio.gather(fetch("A", 0.1), fetch("B", 0.2))
    print(result)

asyncio.run(main())`,
        note: "gather 结果顺序与传入顺序一致。",
      },
      {
        t: "超时",
        code: `import asyncio

async def main():
    try:
        await asyncio.wait_for(asyncio.sleep(1), timeout=0.2)
    except asyncio.TimeoutError:
        print("超时")

asyncio.run(main())`,
        note: "超时会取消被等待的协程。",
      },
      {
        t: "线程池",
        code: `import time
from concurrent.futures import ThreadPoolExecutor

def fetch(name):
    time.sleep(0.2)
    return name

with ThreadPoolExecutor(max_workers=3) as pool:
    print(list(pool.map(fetch, ["A", "B", "C"])))`,
        note: "适合阻塞 IO；CPU 密集用进程池。",
      },
      {
        t: "协程里跑阻塞函数",
        code: `import asyncio
import time

async def main():
    result = await asyncio.to_thread(time.sleep, 0.1)
    print("done", result)

asyncio.run(main())`,
        note: "to_thread 把阻塞调用挪到线程，避免卡住事件循环。",
      },
    ],
  },
  {
    name: "测试与性能",
    items: [
      {
        t: "pytest 用例",
        code: `from mathkit import add

def test_add():
    assert add(2, 3) == 5

def test_empty():
    assert add(0, 0) == 0`,
        note: "文件名 test_*.py，函数名 test_*。",
      },
      {
        t: "参数化",
        code: `import pytest
from mathkit import add

@pytest.mark.parametrize("a,b,expected", [(1, 2, 3), (-1, 1, 0)])
def test_add(a, b, expected):
    assert add(a, b) == expected`,
        note: "一个用例覆盖多组输入，失败时定位到具体参数。",
      },
      {
        t: "timeit 微基准",
        code: `import timeit

print(timeit.timeit("[x * 2 for x in range(100)]", number=1000))`,
        note: "先优化复杂度，再考虑常数项。",
      },
      {
        t: "耗时测量",
        code: `import time

start = time.perf_counter()
sum(range(1000000))
print(time.perf_counter() - start)`,
        note: "perf_counter 比 time.time 更适合测耗时。",
      },
    ],
  },
  {
    name: "常用标准库",
    items: [
      {
        t: "Counter 计数",
        code: `from collections import Counter

counts = Counter(["a", "b", "a", "c", "a"])
print(counts.most_common(2))`,
        note: "most_common 按次数降序。",
      },
      {
        t: "defaultdict 分组",
        code: `from collections import defaultdict

groups = defaultdict(list)
for city, name in [("北京", "林"), ("上海", "陈"), ("北京", "周")]:
    groups[city].append(name)
print(dict(groups))`,
        note: "首次访问自动创建默认值。",
      },
      {
        t: "deque 双端队列",
        code: `from collections import deque

q = deque([1, 2, 3], maxlen=3)
q.append(4)
print(q)`,
        note: "两端 O(1)；maxlen 会自动丢弃旧元素。",
      },
      {
        t: "日期与格式化",
        code: `from datetime import date, timedelta

today = date.today()
print(today.isoformat())
print((today + timedelta(days=7)).isoformat())`,
        note: "日期计算用 timedelta；格式化用 strftime。",
      },
      {
        t: "组合与排列",
        code: `from itertools import combinations, permutations

print(list(combinations([1, 2, 3], 2)))
print(list(permutations([1, 2], 2)))`,
        note: "组合不考虑顺序，排列考虑顺序。",
      },
    ],
  },
];

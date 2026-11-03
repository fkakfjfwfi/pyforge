/* 模块 03 · 进阶
   类型系统、资源管理、并发模型、工程化。目标是写出可维护、可测试的代码。 */
window.CURRICULUM.modules.push({
  id: "advanced",
  index: "03",
  title: "进阶",
  tagline: "写出可维护、可测试的代码",
  description:
    "类型提示、上下文管理器、并发模型与工程化。这些不是“炫技”，而是让代码在三个月后还能被你自己看懂的基础设施。",
  accent: "#0b7d76",
  lessons: [
    /* ============================================================ 9 */
    {
      id: "typing",
      title: "类型提示与数据类",
      summary:
        "注解不会让 Python 变成静态语言，但能让编辑器、mypy 和未来的读者提前发现问题。配合 dataclass，还能顺手干掉大量样板代码。",
      level: "进阶",
      minutes: 28,
      objectives: [
        "给函数与容器加上可读的类型注解",
        "正确表达“可能为 None”与结构化字典",
        "用 Protocol 描述“鸭子类型”的接口",
        "用 dataclass 替代手写 __init__ / __repr__",
      ],
      sections: [
        {
          type: "h",
          text: "注解是给工具和读者看的",
        },
        {
          type: "p",
          html: "Python 在运行时不会检查注解，传错类型照样能跑。但 mypy / pyright 会在开发阶段报错，IDE 也能据此补全。注解同时是最不容易过期的文档。",
        },
        {
          type: "code",
          file: "annotations.py",
          code: String.raw`def greet(name: str, times: int = 1) -> str:
    return f"你好，{name}！" * times

print(greet("林", 2))
print(greet.__annotations__)`,
          output:
            "你好，林！你好，林！ / {'name': <class 'str'>, 'times': <class 'int'>, 'return': <class 'str'>}",
        },
        {
          type: "h",
          text: "常用类型写法",
        },
        {
          type: "table",
          head: ["写法", "含义"],
          rows: [
            ["<code>list[int]</code>", "整数列表"],
            ["<code>dict[str, int]</code>", "键为 str、值为 int 的字典"],
            ["<code>tuple[int, str]</code>", "固定两个元素，类型分别为 int、str"],
            ["<code>set[str]</code>", "字符串集合"],
            ["<code>int | None</code>", "可能是整数或 None（3.10+）"],
            ["<code>Callable[[int], str]</code>", "接收 int、返回 str 的函数"],
            ["<code>Literal[\"debug\", \"info\"]</code>", "只能是这两个字符串之一"],
            ["<code>Any</code>", "放弃检查，尽量少用"],
          ],
        },
        {
          type: "code",
          file: "optional.py",
          code: String.raw`def find_user(uid: int) -> dict[str, str] | None:
    users = {1: {"name": "林"}}
    return users.get(uid)

print(find_user(1))
print(find_user(2))`,
          output: "{'name': '林'} / None",
        },
        {
          type: "callout",
          tone: "tip",
          title: "Optional 与 | None",
          html: "<code>Optional[int]</code> 等价于 <code>int | None</code>，不是“可选参数”。3.10+ 的项目优先用 <code>|</code> 写法，少 import 一层。",
        },
        {
          type: "h",
          text: "TypedDict 与 Protocol",
        },
        {
          type: "p",
          html: "<code>TypedDict</code> 用来描述“有固定键的普通字典”，适合 JSON 配置、API 响应；<code>Protocol</code> 用来描述“只要具备某些方法就算合格”的接口，比抽象基类更贴近 Python 的鸭子类型。",
        },
        {
          type: "code",
          file: "typed_dict.py",
          code: String.raw`from typing import TypedDict

class Book(TypedDict):
    title: str
    price: float

def total(books: list[Book]) -> float:
    return sum(book["price"] for book in books)

print(total([{"title": "流畅的 Python", "price": 129.0}]))`,
          output: "129.0",
        },
        {
          type: "code",
          file: "protocol.py",
          code: String.raw`from typing import Protocol

class SupportsLen(Protocol):
    def __len__(self) -> int: ...

def describe(obj: SupportsLen) -> str:
    return f"长度 {len(obj)}"

print(describe([1, 2, 3]))
print(describe("abc"))`,
          output: "长度 3 / 长度 3",
        },
        {
          type: "h",
          text: "dataclass：自动生成样板方法",
        },
        {
          type: "code",
          file: "dataclass_demo.py",
          code: String.raw`from dataclasses import dataclass, field

@dataclass
class Task:
    title: str
    priority: int = 3
    tags: list[str] = field(default_factory=list)
    done: bool = False

t = Task("复习装饰器", 1, tags=["重点"])
print(t)
print(t == Task("复习装饰器", 1, tags=["重点"]))`,
          output:
            "Task(title='复习装饰器', priority=1, tags=['重点'], done=False) / True",
        },
        {
          type: "callout",
          tone: "warn",
          title: "可变默认值必须用 default_factory",
          html: "dataclass 不允许直接写 <code>tags: list[str] = []</code>，会抛 <code>ValueError</code>。正确写法是 <code>field(default_factory=list)</code>，每个实例才会拿到独立列表——又是“默认值只求值一次”的延伸。",
        },
        {
          type: "callout",
          tone: "deep",
          title: "frozen / slots / order",
          html: "<code>@dataclass(frozen=True)</code> 生成不可变对象，可安全作字典键；<code>slots=True</code> 减少内存占用；<code>order=True</code> 自动生成比较方法。按需组合，不要默认全开。",
        },
      ],
      exercises: [
        {
          id: "a9-1",
          kind: "code",
          title: "给函数补上注解",
          difficulty: "★★☆",
          prompt:
            "补全 <code>average(nums)</code> 的类型注解：参数标注为 <code>Sequence[float]</code>，返回值标注为 <code>float</code>；空列表返回 0.0。",
          starter: String.raw`from collections.abc import Sequence

def average(nums):
    if not nums:
        return 0.0
    return sum(nums) / len(nums)

print(average([1, 2, 3]))`,
          hints: [
            "函数签名改成 <code>def average(nums: Sequence[float]) -> float:</code>。",
            "注解只是写在签名里，不需要改函数体。",
          ],
          solution: String.raw`from collections.abc import Sequence

def average(nums: Sequence[float]) -> float:
    if not nums:
        return 0.0
    return sum(nums) / len(nums)

print(average([1, 2, 3]))`,
          check: String.raw`assert average([1, 2, 3]) == 2.0
assert average([2.5]) == 2.5
assert average([]) == 0.0
_ann = average.__annotations__
assert "Sequence" in str(_ann.get("nums", "")), "参数应标注 Sequence[float]"
assert "float" in str(_ann.get("return", "")), "返回值应标注 float"
print("通过：注解与计算结果都正确")`,
        },
        {
          id: "a9-2",
          kind: "code",
          title: "用 TypedDict 描述书籍",
          difficulty: "★★★",
          prompt:
            "定义 <code>Book</code>（TypedDict），包含 <code>title: str</code> 与 <code>price: float</code>；实现 <code>total_price(books: list[Book]) -> float</code> 计算总价。",
          starter: String.raw`from typing import TypedDict

class Book(TypedDict):
    pass

def total_price(books):
    pass

print(total_price([{"title": "流畅的 Python", "price": 129.0}]))`,
          hints: [
            "TypedDict 的字段就是类体里的注解，不需要赋默认值。",
            "总价用生成器 + <code>sum</code>。",
          ],
          solution: String.raw`from typing import TypedDict

class Book(TypedDict):
    title: str
    price: float

def total_price(books: list[Book]) -> float:
    return sum(book["price"] for book in books)

print(total_price([{"title": "流畅的 Python", "price": 129.0}]))`,
          check: String.raw`assert total_price([{"title": "A", "price": 10.0}, {"title": "B", "price": 20.0}]) == 30.0
assert total_price([]) == 0
assert set(Book.__annotations__) == {"title", "price"}, "Book 应包含 title 与 price"
assert "float" in str(Book.__annotations__["price"])
print("通过：TypedDict 字段与总价计算都正确")`,
        },
        {
          id: "a9-3",
          kind: "code",
          title: "用 dataclass 建任务模型",
          difficulty: "★★★",
          prompt:
            "定义 <code>Task</code> dataclass：<code>title</code>、<code>priority=3</code>、<code>tags</code>（默认为空列表，必须用 default_factory）、<code>done=False</code>。要求两个实例的 tags 互不影响，且内容相同的 Task 相等。",
          starter: String.raw`from dataclasses import dataclass, field

@dataclass
class Task:
    pass

t1 = Task("写周报")
t2 = Task("写周报")
t1.tags.append("工作")
print(t1)
print(t2)`,
          hints: [
            "字段顺序：title、priority、tags、done。",
            "<code>tags: list[str] = field(default_factory=list)</code>。",
            "有了 @dataclass，<code>__init__</code> 与 <code>__eq__</code> 都不用手写。",
          ],
          solution: String.raw`from dataclasses import dataclass, field

@dataclass
class Task:
    title: str
    priority: int = 3
    tags: list[str] = field(default_factory=list)
    done: bool = False

t1 = Task("写周报")
t2 = Task("写周报")
t1.tags.append("工作")
print(t1)
print(t2)`,
          check: String.raw`t1 = Task("写周报")
t2 = Task("写周报")
t1.tags.append("工作")
assert t2.tags == [], "每个实例应有独立的 tags 列表"
assert t1.priority == 3 and t1.done is False
assert Task("A", 1, ["x"], True) == Task("A", 1, ["x"], True)
assert "Task(title=" in repr(t1)
assert "工作" in repr(t1)
print("通过：dataclass 字段、独立默认值与相等性都正确")`,
        },
        {
          id: "a9-4",
          kind: "quiz",
          question: "在 dataclass 中，<code>tags: list[str] = []</code> 为什么不行？",
          options: [
            "dataclass 不支持列表字段",
            "列表是可变对象，会像默认参数一样被所有实例共享，应改用 <code>field(default_factory=list)</code>",
            "必须写成 tuple 才能通过类型检查",
            "因为 list 不是 hashable",
          ],
          answer: 1,
          explain:
            "<b>B。</b>这与函数默认参数的规则同源：默认值只求值一次。dataclass 直接拒绝可变默认值，要求用 <code>default_factory</code> 为每个实例新建容器。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 15 章：类型提示进阶",
        "《Effective Python（第 3 版）》条目 44–46：类型注解",
        "Python 官方文档：typing — 类型提示支持",
      ],
    },

    /* ============================================================ 10 */
    {
      id: "context-managers",
      title: "上下文管理器",
      summary:
        "with 不是“自动关文件”的语法糖，而是一套可扩展的进入/退出协议。自己实现之后，资源管理、计时、临时状态切换都能复用同一套写法。",
      level: "进阶",
      minutes: 24,
      objectives: [
        "实现 __enter__ / __exit__ 协议",
        "用 @contextmanager 把生成器变成上下文管理器",
        "理解 __exit__ 返回值对异常的影响",
        "用 suppress / redirect_stdout 处理常见场景",
      ],
      sections: [
        {
          type: "h",
          text: "with 到底调用了什么",
        },
        {
          type: "p",
          html: "进入 <code>with</code> 时调用对象的 <code>__enter__</code>，它的返回值绑定给 <code>as</code> 后面的名字；离开时调用 <code>__exit__(exc_type, exc_value, traceback)</code>。即使块内抛异常，<code>__exit__</code> 也会执行。",
        },
        {
          type: "code",
          file: "swap.py",
          code: String.raw`class Swap:
    def __init__(self, obj, attr, new_value):
        self.obj = obj
        self.attr = attr
        self.new_value = new_value

    def __enter__(self):
        self.old_value = getattr(self.obj, self.attr)
        setattr(self.obj, self.attr, self.new_value)
        return self

    def __exit__(self, exc_type, exc_value, tb):
        setattr(self.obj, self.attr, self.old_value)
        return False

class Config:
    debug = False

with Swap(Config, "debug", True):
    print(Config.debug)

print(Config.debug)`,
          output: "True / False",
        },
        {
          type: "callout",
          tone: "warn",
          title: "__exit__ 返回 True 会吞掉异常",
          html: "返回 <code>True</code> 表示“异常已处理”，外层不会再看到它；返回 <code>False</code> 或 <code>None</code> 则继续传播。除非你明确想吞掉某类异常，否则不要返回 True。",
        },
        {
          type: "h",
          text: "@contextmanager：少写一个类",
        },
        {
          type: "p",
          html: "用 <code>@contextmanager</code> 装饰一个生成器：<code>yield</code> 之前是进入逻辑，<code>yield</code> 之后是退出逻辑。异常会抛回 <code>yield</code> 处，所以退出逻辑要放在 <code>finally</code> 里。",
        },
        {
          type: "code",
          file: "timer.py",
          code: String.raw`import time
from contextlib import contextmanager

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label} 用时 {elapsed:.3f}s")

with timer("sleep"):
    time.sleep(0.05)`,
          output: "sleep 用时 0.050s（数值随机器略有差异）",
        },
        {
          type: "callout",
          tone: "tip",
          title: "yield 之后一定要 finally",
          html: "如果 <code>yield</code> 后面直接写清理代码，一旦块内抛异常，清理就不会执行。把清理放进 <code>finally</code>，才能和 <code>with</code> 的语义对齐。",
        },
        {
          type: "h",
          text: "标准库里的现成工具",
        },
        {
          type: "code",
          file: "suppress.py",
          code: String.raw`from contextlib import suppress

with suppress(FileNotFoundError):
    open("not-there.txt")

print("继续执行")`,
          output: "继续执行",
        },
        {
          type: "code",
          file: "redirect.py",
          code: String.raw`import io
from contextlib import redirect_stdout

buffer = io.StringIO()
with redirect_stdout(buffer):
    print("被捕获")

print(buffer.getvalue().strip())`,
          output: "被捕获",
        },
        {
          type: "p",
          html: "需要同时管理多个资源时，可以直接写一个括号内的多个 with（3.10+），或用 <code>ExitStack</code> 动态管理数量不定的资源。多个资源的退出顺序与进入顺序相反。",
        },
        {
          type: "callout",
          tone: "deep",
          title: "上下文管理器不等于 try/finally 的替代品",
          html: "它适合“成对出现的进入/退出”。如果只是一次性的错误处理，普通 try/except 更直接。判断标准是：这段清理逻辑是否值得被复用、被命名。",
        },
      ],
      exercises: [
        {
          id: "a10-1",
          kind: "code",
          title: "实现属性交换管理器",
          difficulty: "★★★",
          prompt:
            "实现 <code>Swap</code>：进入时保存对象的旧属性值并写入新值，退出时恢复旧值；即使块内抛异常也必须恢复。",
          starter: String.raw`class Swap:
    def __init__(self, obj, attr, new_value):
        self.obj = obj
        self.attr = attr
        self.new_value = new_value

    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc_value, tb):
        pass

class Config:
    debug = False

with Swap(Config, "debug", True):
    print(Config.debug)
print(Config.debug)`,
          hints: [
            "<code>__enter__</code> 里先 <code>getattr</code> 保存旧值，再 <code>setattr</code> 写新值。",
            "<code>__exit__</code> 无条件恢复旧值，返回 <code>False</code> 让异常继续传播。",
          ],
          solution: String.raw`class Swap:
    def __init__(self, obj, attr, new_value):
        self.obj = obj
        self.attr = attr
        self.new_value = new_value

    def __enter__(self):
        self.old_value = getattr(self.obj, self.attr)
        setattr(self.obj, self.attr, self.new_value)
        return self

    def __exit__(self, exc_type, exc_value, tb):
        setattr(self.obj, self.attr, self.old_value)
        return False

class Config:
    debug = False

with Swap(Config, "debug", True):
    print(Config.debug)
print(Config.debug)`,
          check: String.raw`class Box:
    value = "old"

b = Box()
with Swap(b, "value", "new") as ctx:
    assert b.value == "new"
assert b.value == "old"
try:
    with Swap(b, "value", "temp"):
        raise RuntimeError("boom")
except RuntimeError:
    pass
assert b.value == "old", "异常路径也必须恢复原值"
print("通过：正常与异常路径都能恢复属性")`,
        },
        {
          id: "a10-2",
          kind: "code",
          title: "把生成器变成上下文管理器",
          difficulty: "★★★",
          prompt:
            "用 <code>@contextmanager</code> 实现 <code>capture_stdout()</code>：进入后把 <code>print</code> 的输出收集到 <code>StringIO</code>，退出时恢复原来的 <code>sys.stdout</code>；<code>as</code> 拿到的是缓冲区对象。",
          starter: String.raw`import io
import sys
from contextlib import contextmanager

@contextmanager
def capture_stdout():
    pass

with capture_stdout() as buffer:
    print("hello")
print(buffer.getvalue().strip())`,
          hints: [
            "先 <code>old = sys.stdout</code>，再 <code>sys.stdout = io.StringIO()</code>。",
            "把缓冲区 <code>yield</code> 出去，恢复放 <code>finally</code>。",
          ],
          solution: String.raw`import io
import sys
from contextlib import contextmanager

@contextmanager
def capture_stdout():
    buffer = io.StringIO()
    old = sys.stdout
    sys.stdout = buffer
    try:
        yield buffer
    finally:
        sys.stdout = old

with capture_stdout() as buffer:
    print("hello")
print(buffer.getvalue().strip())`,
          check: String.raw`with capture_stdout() as buf:
    print("hello")
assert buf.getvalue().strip() == "hello"
with capture_stdout() as buf2:
    print("second")
assert buf2.getvalue().strip() == "second", "多次使用应各自独立"
print("通过：输出被捕获，且恢复后仍可正常打印")`,
        },
        {
          id: "a10-3",
          kind: "code",
          title: "用 suppress 跳过缺失文件",
          difficulty: "★★☆",
          prompt:
            "实现 <code>read_all(paths)</code>：返回能读到的文件内容列表，遇到不存在或不含读取权限的文件就跳过。使用 <code>contextlib.suppress</code> 与 <code>Path</code>。",
          starter: String.raw`from contextlib import suppress
from pathlib import Path

def read_all(paths):
    contents = []
    # 在这里实现
    return contents

Path("a.txt").write_text("A", encoding="utf-8")
Path("b.txt").write_text("B", encoding="utf-8")
print(read_all(["a.txt", "missing.txt", "b.txt"]))`,
          hints: [
            "用 <code>with suppress(OSError):</code> 包住读取。",
            "<code>Path(path).read_text(encoding=\"utf-8\")</code>。",
          ],
          solution: String.raw`from contextlib import suppress
from pathlib import Path

def read_all(paths):
    contents = []
    for path in paths:
        with suppress(OSError):
            contents.append(Path(path).read_text(encoding="utf-8"))
    return contents

Path("a.txt").write_text("A", encoding="utf-8")
Path("b.txt").write_text("B", encoding="utf-8")
print(read_all(["a.txt", "missing.txt", "b.txt"]))`,
          check: String.raw`Path("x.txt").write_text("X", encoding="utf-8")
assert read_all(["x.txt", "nope.txt"]) == ["X"]
assert read_all([]) == []
assert read_all(["nope.txt"]) == []
print("通过：缺失文件被跳过，正常文件按顺序读出")`,
        },
        {
          id: "a10-4",
          kind: "quiz",
          question: "上下文管理器的 <code>__exit__</code> 返回 <code>True</code> 意味着什么？",
          options: [
            "资源已经关闭",
            "块内异常会被吞掉，不再向外传播",
            "块内代码会重新执行一次",
            "必须配合 yield 使用",
          ],
          answer: 1,
          explain:
            "<b>B。</b>返回 True 表示异常已被处理，外层看不到它。返回 False/None 则异常继续传播。多数情况下应该返回 False，让错误暴露出来。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 18 章：with、match 和 else 块",
        "《Effective Python（第 3 版）》条目 44：用 contextlib 管理特殊上下文",
        "Python 官方文档：contextlib — 上下文管理器工具",
      ],
    },

    /* ============================================================ 11 */
    {
      id: "concurrency",
      title: "并发：线程、进程与 asyncio",
      summary:
        "先判断任务是 IO 密集还是 CPU 密集，再选模型。GIL 不是“Python 不能并发”的结论，而是“该用线程等待、用进程计算”的提示。",
      level: "进阶",
      minutes: 32,
      objectives: [
        "根据任务类型选择线程、进程或协程",
        "用 asyncio.gather 并发执行协程并保持顺序",
        "用 wait_for 给协程加超时",
        "识别协程中调用阻塞函数的危害",
      ],
      sections: [
        {
          type: "h",
          text: "先分类，再选工具",
        },
        {
          type: "p",
          html: "并发不是越快越好，而是“让等待重叠”。网络请求、磁盘读写大部分时间在等 IO；纯计算则一直占着 CPU。GIL 让同一进程内多个线程不能同时执行 Python 字节码，但线程在等待 IO 时会释放 GIL。",
        },
        {
          type: "table",
          head: ["场景", "首选", "原因"],
          rows: [
            ["网络请求、文件读写", "asyncio 或线程池", "等待时释放 CPU"],
            ["调用阻塞型第三方库", "线程池", "库本身不支持 async"],
            ["大量纯计算", "多进程 / 原生扩展", "绕开 GIL，真正并行"],
            ["简单脚本、一次性任务", "先写同步", "并发带来的复杂度可能不划算"],
          ],
        },
        {
          type: "h",
          text: "线程池：适合阻塞 IO",
        },
        {
          type: "code",
          file: "thread_pool.py",
          code: String.raw`import time
from concurrent.futures import ThreadPoolExecutor

def fetch(name):
    time.sleep(0.2)
    return f"{name} done"

with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(fetch, ["A", "B", "C"]))

print(results)`,
          output: "['A done', 'B done', 'C done']",
        },
        {
          type: "callout",
          tone: "tip",
          title: "map 保持输入顺序",
          html: "<code>pool.map</code> 的结果顺序与输入一致，即使完成顺序不同。需要“谁先完成先处理”时用 <code>as_completed</code>。",
        },
        {
          type: "h",
          text: "asyncio：单线程内的协作式并发",
        },
        {
          type: "p",
          html: "协程在 <code>await</code> 处主动让出控制权。事件循环在等待期间可以推进其他任务，所以少量线程就能支撑大量并发连接。",
        },
        {
          type: "code",
          file: "async_gather.py",
          code: String.raw`import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name} done"

async def main():
    results = await asyncio.gather(
        fetch("A", 0.2),
        fetch("B", 0.1),
        fetch("C", 0.3),
    )
    print(results)

asyncio.run(main())`,
          output: "['A done', 'B done', 'C done']",
        },
        {
          type: "callout",
          tone: "warn",
          title: "协程里不要调用阻塞函数",
          html: "<code>time.sleep(1)</code>、同步的 <code>requests.get</code> 会卡住整个事件循环，所有协程一起停摆。用 <code>await asyncio.sleep()</code>；非协程库用 <code>asyncio.to_thread()</code> 包一层。",
        },
        {
          type: "h",
          text: "超时、取消与任务结构",
        },
        {
          type: "code",
          file: "timeout.py",
          code: String.raw`import asyncio

async def slow():
    await asyncio.sleep(2)
    return "done"

async def main():
    try:
        result = await asyncio.wait_for(slow(), timeout=0.5)
        print(result)
    except asyncio.TimeoutError:
        print("超时，已取消")

asyncio.run(main())`,
          output: "超时，已取消",
        },
        {
          type: "p",
          html: "超时会取消被等待的协程，并抛 <code>TimeoutError</code>（3.11 起与内建 TimeoutError 同一类型）。不要用 <code>except Exception</code> 把取消异常一起吞掉，否则任务可能无法正确退出。",
        },
        {
          type: "callout",
          tone: "deep",
          title: "线程 vs 进程 vs 协程，一句话版",
          html: "等 IO 且库支持 async → 协程；等 IO但库是阻塞的 → 线程；纯计算 → 进程。先测量瓶颈，再决定要不要并发。",
        },
      ],
      exercises: [
        {
          id: "a11-1",
          kind: "code",
          title: "并发加载并保持顺序",
          difficulty: "★★★",
          prompt:
            "实现 <code>load_all(items)</code>：items 是由 <code>(name, delay)</code> 组成的列表；用 <code>asyncio.gather</code> 并发执行 <code>fetch</code>，返回结果列表，顺序与输入一致。",
          starter: String.raw`import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name} done"

async def load_all(items):
    pass

print(await load_all([("A", 0.1), ("B", 0.2), ("C", 0.3)]))`,
          hints: [
            "<code>asyncio.gather</code> 接收多个 awaitable，可以直接解包列表。",
            "写成 <code>await asyncio.gather(*(fetch(n, d) for n, d in items))</code>。",
          ],
          solution: String.raw`import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name} done"

async def load_all(items):
    return await asyncio.gather(*(fetch(name, delay) for name, delay in items))

print(await load_all([("A", 0.1), ("B", 0.2), ("C", 0.3)]))`,
          check: String.raw`result = await load_all([("A", 0.1), ("B", 0.2), ("C", 0.3)])
assert result == ["A done", "B done", "C done"], result
assert await load_all([]) == []
print("通过：并发结果顺序与输入一致")`,
        },
        {
          id: "a11-2",
          kind: "code",
          title: "给协程加超时",
          difficulty: "★★★",
          prompt:
            "实现 <code>run_with_timeout(coro, seconds)</code>：在限定时间内完成就返回结果，超时则取消并返回字符串 <code>\"timeout\"</code>。",
          starter: String.raw`import asyncio

async def slow():
    await asyncio.sleep(0.5)
    return "done"

async def run_with_timeout(coro, seconds):
    pass

print(await run_with_timeout(slow(), 0.1))`,
          hints: [
            "用 <code>asyncio.wait_for(coro, timeout=seconds)</code>。",
            "捕获 <code>asyncio.TimeoutError</code>，返回 \"timeout\"。",
          ],
          solution: String.raw`import asyncio

async def slow():
    await asyncio.sleep(0.5)
    return "done"

async def run_with_timeout(coro, seconds):
    try:
        return await asyncio.wait_for(coro, timeout=seconds)
    except asyncio.TimeoutError:
        return "timeout"

print(await run_with_timeout(slow(), 0.1))`,
          check: String.raw`fast = asyncio.sleep(0.01, result="fast")
assert await run_with_timeout(fast, 0.3) == "fast"
late = asyncio.sleep(0.3, result="late")
assert await run_with_timeout(late, 0.1) == "timeout"
assert await run_with_timeout(asyncio.sleep(0, result="now"), 0.2) == "now"
print("通过：正常返回与超时分支都正确")`,
        },
        {
          id: "a11-3",
          kind: "code",
          title: "串行 vs 并发，亲手测一遍",
          difficulty: "★★★",
          prompt:
            "实现 <code>serial(items)</code>（逐个 await）与 <code>concurrent(items)</code>（gather 并发）。用 <code>time.perf_counter()</code> 打印两者耗时，观察等待时间是否被重叠。",
          starter: String.raw`import asyncio
import time

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return name

async def serial(items):
    pass

async def concurrent(items):
    pass

items = [("A", 0.05), ("B", 0.05), ("C", 0.05), ("D", 0.05)]
start = time.perf_counter()
print(await serial(items), round(time.perf_counter() - start, 3))

start = time.perf_counter()
print(await concurrent(items), round(time.perf_counter() - start, 3))`,
          hints: [
            "serial 用 <code>for</code> 循环逐个 <code>await fetch(...)</code>。",
            "concurrent 用 <code>asyncio.gather</code> 收集所有协程。",
          ],
          solution: String.raw`import asyncio
import time

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return name

async def serial(items):
    results = []
    for name, delay in items:
        results.append(await fetch(name, delay))
    return results

async def concurrent(items):
    return list(await asyncio.gather(*(fetch(name, delay) for name, delay in items)))

items = [("A", 0.05), ("B", 0.05), ("C", 0.05), ("D", 0.05)]
start = time.perf_counter()
print(await serial(items), round(time.perf_counter() - start, 3))

start = time.perf_counter()
print(await concurrent(items), round(time.perf_counter() - start, 3))`,
          check: String.raw`items = [("A", 0.05), ("B", 0.05), ("C", 0.05), ("D", 0.05)]
start = time.perf_counter()
r1 = await serial(items)
t1 = time.perf_counter() - start
start = time.perf_counter()
r2 = await concurrent(items)
t2 = time.perf_counter() - start
assert r1 == ["A", "B", "C", "D"]
assert r2 == ["A", "B", "C", "D"]
assert t2 < t1 * 0.7, f"并发耗时 {t2:.3f}s，串行 {t1:.3f}s，没有重叠等待"
print(f"通过：串行 {t1:.2f}s，并发 {t2:.2f}s")`,
        },
        {
          id: "a11-4",
          kind: "quiz",
          question: "一个任务大部分时间在等待网络响应，且所用库不支持 async。应该优先选择？",
          options: ["多进程", "线程池", "手动分片计算", "把 GIL 关掉"],
          answer: 1,
          explain:
            "<b>B。</b>等待网络时线程会释放 GIL，线程池能有效重叠等待。多进程适合 CPU 密集；GIL 也不能手动关闭。",
        },
        {
          id: "a11-5",
          kind: "quiz",
          question: "在 <code>async def</code> 函数里直接调用 <code>time.sleep(1)</code>，会发生什么？",
          options: [
            "只暂停当前协程，其他协程继续运行",
            "整个事件循环被阻塞一秒，其他协程也无法推进",
            "自动转换成 <code>await asyncio.sleep(1)</code>",
            "立刻抛出 TypeError",
          ],
          answer: 1,
          explain:
            "<b>B。</b><code>time.sleep</code> 是阻塞调用，不会让出控制权。协程里应使用 <code>await asyncio.sleep()</code>；阻塞库用 <code>asyncio.to_thread()</code> 包一层。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 19–21 章：并发模型与 asyncio",
        "《Python 工匠》第 6 章：并发编程",
        "Python 官方文档：asyncio — 异步 I/O",
      ],
    },

    /* ============================================================ 12 */
    {
      id: "engineering",
      title: "工程化：模块、测试与性能",
      summary:
        "把代码拆成模块、用 pytest 固定行为、用测量代替猜测。这一节是从“能跑”跨到“能维护”的分水岭。",
      level: "进阶",
      minutes: 30,
      objectives: [
        "组织模块与包，理解 __name__ == \"__main__\"",
        "写出 pytest 风格的测试与参数化用例",
        "用 timeit / perf_counter 做基本性能测量",
        "识别低复杂度写法带来的数量级差异",
      ],
      sections: [
        {
          type: "h",
          text: "模块与包",
        },
        {
          type: "p",
          html: "一个 <code>.py</code> 文件就是一个模块；包含 <code>__init__.py</code> 的目录是常规包（3.3+ 也支持命名空间包）。导入时模块顶层代码会执行一次，因此顶层只放定义，把脚本行为放进 <code>if __name__ == \"__main__\":</code> 里。",
        },
        {
          type: "code",
          file: "mathkit.py",
          code: String.raw`def add(a, b):
    return a + b

def mul(a, b):
    return a * b

if __name__ == "__main__":
    print(add(2, 3))`,
          output: "直接运行：5；被导入：不打印",
        },
        {
          type: "code",
          file: "test_mathkit.py",
          code: String.raw`from mathkit import add

def test_add():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0`,
          output: "pytest -q  →  2 passed",
        },
        {
          type: "callout",
          tone: "tip",
          title: "测试函数只写断言",
          html: "pytest 靠文件名 <code>test_*.py</code>、函数名 <code>test_*</code> 自动发现用例。一个测试只验证一件事，失败时更容易定位。",
        },
        {
          type: "h",
          text: "依赖与虚拟环境",
        },
        {
          type: "code",
          file: "setup.sh",
          code: String.raw`python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt`,
          output: "（命令示例，非 Python）",
        },
        {
          type: "p",
          html: "项目依赖不要装进系统 Python。用 <code>venv</code> 隔离，用 <code>requirements.txt</code> 或 <code>pyproject.toml</code> 记录版本。部署时按锁文件安装，避免“我这儿能跑”。",
        },
        {
          type: "h",
          text: "测试：固定行为，而不是固定实现",
        },
        {
          type: "code",
          file: "test_param.py",
          code: String.raw`import pytest
from mathkit import add

@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add(a, b, expected):
    assert add(a, b) == expected`,
          output: "pytest -q  →  3 passed",
        },
        {
          type: "p",
          html: "测试应该断言“输入 → 输出”的契约，而不是断言内部调用了哪个函数。这样重构时测试才不会天天坏。边界值（空、负数、重复、超大）通常比正常路径更能暴露问题。",
        },
        {
          type: "h",
          text: "性能：先测量，再优化",
        },
        {
          type: "p",
          html: "优化前先回答两个问题：瓶颈在哪？优化后能好多少？<code>timeit</code> 适合微基准，<code>cProfile</code> 适合找函数级热点。多数情况下，把 O(n²) 改成 O(n) 比任何微优化都值。",
        },
        {
          type: "code",
          file: "perf.py",
          code: String.raw`import timeit

setup = "data = list(range(1000))"
stmt_loop = """
result = []
for x in data:
    result.append(x * 2)
"""
stmt_comp = "result = [x * 2 for x in data]"

print(timeit.timeit(stmt_loop, setup=setup, number=200))
print(timeit.timeit(stmt_comp, setup=setup, number=200))`,
          output: "两组耗时，推导式通常更快",
        },
        {
          type: "callout",
          tone: "warn",
          title: "micro-benchmark 的陷阱",
          html: "机器负载、解释器预热、数据规模都会影响结果。不要拿一次 <code>timeit</code> 的数字当结论；先确认算法复杂度，再看常数项。",
        },
        {
          type: "callout",
          tone: "deep",
          title: "值得优先检查的三件事",
          html: "循环内的重复 IO、列表里的反复成员判断（该用 set）、字符串反复拼接（该用 join）。这三类问题通常带来数量级差异，而不是 10% 的波动。",
        },
      ],
      exercises: [
        {
          id: "a12-1",
          kind: "code",
          title: "生成一个可导入的模块",
          difficulty: "★★★",
          prompt:
            "用 <code>Path</code> 写出 <code>mathkit.py</code>，其中定义 <code>add(a, b)</code> 与 <code>mul(a, b)</code>；随后导入并调用它们。",
          starter: String.raw`import sys
from pathlib import Path

sys.path.insert(0, ".")

def create_mathkit():
    pass

create_mathkit()

import mathkit
print(mathkit.add(2, 3), mathkit.mul(4, 5))`,
          hints: [
            "把源码写成一个三引号字符串，再 <code>Path(\"mathkit.py\").write_text(source, encoding=\"utf-8\")</code>。",
            "文件内容只需要两个函数，不必写 main 保护。",
          ],
          solution: String.raw`import sys
from pathlib import Path

sys.path.insert(0, ".")

def create_mathkit():
    source = '''def add(a, b):
    return a + b

def mul(a, b):
    return a * b
'''
    Path("mathkit.py").write_text(source, encoding="utf-8")

create_mathkit()

import mathkit
print(mathkit.add(2, 3), mathkit.mul(4, 5))`,
          check: String.raw`import sys
import importlib
sys.path.insert(0, ".")
sys.modules.pop("mathkit", None)
import mathkit
assert mathkit.add(2, 3) == 5
assert mathkit.mul(4, 5) == 20
assert Path("mathkit.py").exists(), "应生成 mathkit.py"
print("通过：模块文件已生成并可正常导入")`,
        },
        {
          id: "a12-2",
          kind: "code",
          title: "补全回文测试",
          difficulty: "★★★",
          prompt:
            "实现 <code>is_palindrome(text)</code>：只考虑字母和数字，忽略大小写；并补全 <code>test_is_palindrome()</code> 中的断言。",
          starter: String.raw`def is_palindrome(text):
    pass

def test_is_palindrome():
    assert is_palindrome("level") is True
    assert is_palindrome("Python") is False
    # 再补两个边界用例

test_is_palindrome()
print("本地测试通过")`,
          hints: [
            "用 <code>ch.isalnum()</code> 过滤，<code>ch.lower()</code> 统一大小写。",
            "清洗后的列表与其反转比较。",
            "边界用例可以试空字符串、带标点的句子。",
          ],
          solution: String.raw`def is_palindrome(text):
    cleaned = [ch.lower() for ch in text if ch.isalnum()]
    return cleaned == cleaned[::-1]

def test_is_palindrome():
    assert is_palindrome("level") is True
    assert is_palindrome("Python") is False
    assert is_palindrome("") is True
    assert is_palindrome("A man, a plan, a canal: Panama") is True

test_is_palindrome()
print("本地测试通过")`,
          check: String.raw`assert is_palindrome("level")
assert not is_palindrome("python")
assert is_palindrome("")
assert is_palindrome("A man, a plan, a canal: Panama")
assert not is_palindrome("ab")
test_is_palindrome()
print("通过：实现与测试函数都成立")`,
        },
        {
          id: "a12-3",
          kind: "code",
          title: "把 O(n²) 改成 O(n)",
          difficulty: "★★★",
          prompt:
            "<code>unique_slow</code> 用列表成员判断去重，复杂度 O(n²)。实现 <code>unique_fast</code>，保持首次出现顺序，并把复杂度降到 O(n)（提示：dict）。",
          starter: String.raw`import time

def unique_slow(items):
    result = []
    for x in items:
        if x not in result:
            result.append(x)
    return result

def unique_fast(items):
    pass

data = list(range(1200)) * 2
start = time.perf_counter()
a = unique_slow(data)
print("slow", round(time.perf_counter() - start, 4))

start = time.perf_counter()
b = unique_fast(data)
print("fast", round(time.perf_counter() - start, 4))
print(a == b)`,
          hints: [
            "<code>dict.fromkeys(items)</code> 天然保序去重。",
            "或者用 <code>seen = set()</code> 配合列表收集。",
          ],
          solution: String.raw`import time

def unique_slow(items):
    result = []
    for x in items:
        if x not in result:
            result.append(x)
    return result

def unique_fast(items):
    return list(dict.fromkeys(items))

data = list(range(1200)) * 2
start = time.perf_counter()
a = unique_slow(data)
print("slow", round(time.perf_counter() - start, 4))

start = time.perf_counter()
b = unique_fast(data)
print("fast", round(time.perf_counter() - start, 4))
print(a == b)`,
          check: String.raw`data = list(range(1200)) * 2
start = time.perf_counter()
slow = unique_slow(data)
t_slow = time.perf_counter() - start
start = time.perf_counter()
fast = unique_fast(data)
t_fast = time.perf_counter() - start
assert slow == fast == list(range(1200))
assert t_fast < t_slow * 0.6, f"fast={t_fast:.4f}s slow={t_slow:.4f}s，复杂度没有降下来"
print(f"通过：slow {t_slow:.3f}s / fast {t_fast:.4f}s")`,
        },
        {
          id: "a12-4",
          kind: "quiz",
          question: "下面哪个测试函数会被 pytest 自动发现？",
          options: [
            "<code>def check_add(): ...</code>",
            "<code>def test_add(): ...</code>",
            "<code>class AddCase:</code> 里的 <code>def verify(self): ...</code>",
            "<code>def add_test(): ...</code>",
          ],
          answer: 1,
          explain:
            "<b>B。</b>pytest 默认收集 <code>test_*.py</code> 或 <code>*_test.py</code> 文件里以 <code>test_</code> 开头的函数。<code>check_</code>、<code>verify</code>、<code>add_test</code> 都不在默认规则内。",
        },
      ],
      further: [
        "《Python 工匠》第 5 章：单元测试与工程实践",
        "《Effective Python（第 3 版）》条目 79–82：测试与调试",
        "pytest 官方文档：Getting Started",
      ],
    },
  ],
});

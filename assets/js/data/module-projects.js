/* 模块 04 · 实战
   把前面学到的容器、函数、异常、dataclass 与测试串成两个完整的小项目。 */
window.CURRICULUM.modules.push({
  id: "projects",
  index: "04",
  title: "实战",
  tagline: "把知识点串成能交付的东西",
  description:
    "一个数据处理流水线，一个带持久化的任务管理器。都只用标准库，保证你在任何环境里都能跑起来、改下去。",
  accent: "#b06a12",
  lessons: [
    /* ============================================================ 13 */
    {
      id: "data-pipeline",
      title: "数据处理实战：从 CSV 到报表",
      summary:
        "读入、清洗、转换、汇总、输出。五步流水线听起来简单，真正难的是缺失值、类型错误和可复现的排序规则。",
      level: "实战",
      minutes: 32,
      objectives: [
        "用 csv.DictReader 安全读取带表头的数据",
        "在清洗阶段跳过坏行而不是让程序崩溃",
        "用 defaultdict 完成分组聚合",
        "输出排序稳定、可读的报表",
      ],
      sections: [
        {
          type: "h",
          text: "流水线的五个阶段",
        },
        {
          type: "p",
          html: "任何数据处理任务都可以拆成：读入 → 清洗 → 转换 → 汇总 → 输出。每一阶段都应该是可单独测试的函数，而不是一大段从上到下执行的脚本。这样数据出问题时，你能快速定位是哪一步坏了。",
        },
        {
          type: "h",
          text: "读入：不要手写 split(\",\")",
        },
        {
          type: "p",
          html: "CSV 的字段里可能包含逗号、引号、换行。手写 <code>line.split(\",\")</code> 一定会在某一天坏掉。标准库的 <code>csv</code> 模块处理了引号转义；<code>DictReader</code> 直接把每行变成以表头为键的字典。",
        },
        {
          type: "code",
          file: "read_csv.py",
          code: String.raw`import csv
import io

raw = """name,city,score
林,北京,88
陈,上海,95
周,北京,76
"""

reader = csv.DictReader(io.StringIO(raw))
rows = list(reader)
print(rows[0]["city"], rows[0]["score"])`,
          output: "北京 88",
        },
        {
          type: "callout",
          tone: "tip",
          title: "编码问题要显式处理",
          html: "读真实文件时写 <code>open(path, newline=\"\", encoding=\"utf-8\")</code>，再交给 <code>csv.DictReader</code>。<code>newline=\"\"</code> 是为了让 csv 模块自己处理换行。",
        },
        {
          type: "h",
          text: "清洗：跳过坏行，保留证据",
        },
        {
          type: "p",
          html: "真实数据总有空值、类型错误、重复行。清洗函数应该明确规则：哪些行跳过、哪些字段补默认值、哪些异常需要记录。不要用一句 <code>except: pass</code> 把问题藏起来。",
        },
        {
          type: "code",
          file: "clean.py",
          code: String.raw`def clean(rows):
    cleaned = []
    for row in rows:
        try:
            score = int(row["score"])
        except (TypeError, ValueError):
            continue
        city = (row.get("city") or "未知").strip()
        name = (row.get("name") or "").strip()
        cleaned.append({"name": name, "city": city, "score": score})
    return cleaned`,
        },
        {
          type: "h",
          text: "汇总：defaultdict 比手动判断好用",
        },
        {
          type: "code",
          file: "group.py",
          code: String.raw`from collections import defaultdict

def group_average(rows):
    groups = defaultdict(list)
    for row in rows:
        groups[row["city"]].append(row["score"])

    return {
        city: {"count": len(scores), "avg": round(sum(scores) / len(scores), 1)}
        for city, scores in groups.items()
    }`,
        },
        {
          type: "h",
          text: "输出：排序规则要写死",
        },
        {
          type: "code",
          file: "report.py",
          code: String.raw`def render_report(summary):
    ordered = sorted(
        summary.items(),
        key=lambda item: (-item[1]["avg"], item[0]),
    )
    lines = [f"{'城市':<6}{'人数':>4}{'平均分':>8}"]
    for city, data in ordered:
        lines.append(f"{city:<6}{data['count']:>4}{data['avg']:>8.1f}")
    return "\n".join(lines)

print(render_report({"北京": {"count": 2, "avg": 82.0}, "上海": {"count": 1, "avg": 95.0}}))`,
          output: "按平均分降序、同分按城市名升序的文本表",
        },
        {
          type: "callout",
          tone: "deep",
          title: "为什么排序要显式写第二条件",
          html: "Python 的排序是稳定的，但“稳定”只保证相等元素保持输入顺序，而字典的输入顺序又依赖插入顺序。想得到可复现的报表，就把并列条件写进 key，而不是依赖数据进入顺序。",
        },
      ],
      exercises: [
        {
          id: "p13-1",
          kind: "code",
          title: "解析 CSV 文本",
          difficulty: "★★☆",
          prompt:
            "实现 <code>parse_csv(text)</code>：用 <code>csv.DictReader</code> 解析带表头的文本，返回字典列表（字段值保持字符串）。",
          starter: String.raw`import csv
import io

def parse_csv(text):
    pass

raw = "name,city,score\n林,北京,88\n陈,上海,95\n"
print(parse_csv(raw))`,
          hints: [
            "把文本包进 <code>io.StringIO</code>，再交给 <code>csv.DictReader</code>。",
            "返回 <code>list(reader)</code>。",
          ],
          solution: String.raw`import csv
import io

def parse_csv(text):
    reader = csv.DictReader(io.StringIO(text))
    return list(reader)

raw = "name,city,score\n林,北京,88\n陈,上海,95\n"
print(parse_csv(raw))`,
          check: String.raw`raw = "name,city,score\n林,北京,88\n陈,上海,95\n"
rows = parse_csv(raw)
assert len(rows) == 2
assert rows[0] == {"name": "林", "city": "北京", "score": "88"}
assert rows[1]["city"] == "上海"
assert parse_csv("name,city\n") == []
print("通过：CSV 解析为字典列表，字段保持字符串")`,
        },
        {
          id: "p13-2",
          kind: "code",
          title: "清洗脏数据",
          difficulty: "★★★",
          prompt:
            "实现 <code>clean_rows(rows)</code>：<code>score</code> 无法转成整数的行直接跳过；<code>name</code> 与 <code>city</code> 去首尾空格；<code>city</code> 为空时填 <code>\"未知\"</code>；返回新列表，元素为 <code>{\"name\", \"city\", \"score\"}</code> 且 score 为 int。",
          starter: String.raw`def clean_rows(rows):
    pass

rows = [
    {"name": " 林 ", "city": "北京", "score": "88"},
    {"name": "陈", "city": "", "score": "abc"},
    {"name": " 周 ", "city": " 北京 ", "score": "76"},
]
print(clean_rows(rows))`,
          hints: [
            "用 <code>try/except (TypeError, ValueError)</code> 包住 <code>int(...)</code>。",
            "城市为空时用 <code>or \"未知\"</code>，再做 <code>strip</code>。",
            "跳过用 <code>continue</code>，不要抛异常。",
          ],
          solution: String.raw`def clean_rows(rows):
    cleaned = []
    for row in rows:
        try:
            score = int(row["score"])
        except (TypeError, ValueError):
            continue
        name = (row.get("name") or "").strip()
        city = (row.get("city") or "未知").strip()
        cleaned.append({"name": name, "city": city, "score": score})
    return cleaned

rows = [
    {"name": " 林 ", "city": "北京", "score": "88"},
    {"name": "陈", "city": "", "score": "abc"},
    {"name": " 周 ", "city": " 北京 ", "score": "76"},
]
print(clean_rows(rows))`,
          check: String.raw`rows = [
    {"name": " 林 ", "city": "北京", "score": "88"},
    {"name": "陈", "city": "", "score": "abc"},
    {"name": " 周 ", "city": " 北京 ", "score": "76"},
    {"name": "赵", "city": None, "score": "90"},
]
result = clean_rows(rows)
assert result == [
    {"name": "林", "city": "北京", "score": 88},
    {"name": "周", "city": "北京", "score": 76},
    {"name": "赵", "city": "未知", "score": 90},
], result
assert clean_rows([]) == []
print("通过：坏行跳过、空格清理、空城市补默认值")`,
        },
        {
          id: "p13-3",
          kind: "code",
          title: "按城市汇总",
          difficulty: "★★★",
          prompt:
            "实现 <code>summarize(rows)</code>：输入清洗后的行，返回 <code>{城市: {\"count\": 人数, \"avg\": 平均分（保留 1 位小数）}}</code>。",
          starter: String.raw`from collections import defaultdict

def summarize(rows):
    pass

data = [
    {"name": "林", "city": "北京", "score": 88},
    {"name": "陈", "city": "上海", "score": 95},
    {"name": "周", "city": "北京", "score": 76},
]
print(summarize(data))`,
          hints: [
            "先用 <code>defaultdict(list)</code> 把分数按城市收集。",
            "再用字典推导式计算 <code>len</code> 与 <code>round(sum/len, 1)</code>。",
          ],
          solution: String.raw`from collections import defaultdict

def summarize(rows):
    groups = defaultdict(list)
    for row in rows:
        groups[row["city"]].append(row["score"])
    return {
        city: {"count": len(scores), "avg": round(sum(scores) / len(scores), 1)}
        for city, scores in groups.items()
    }

data = [
    {"name": "林", "city": "北京", "score": 88},
    {"name": "陈", "city": "上海", "score": 95},
    {"name": "周", "city": "北京", "score": 76},
]
print(summarize(data))`,
          check: String.raw`data = [
    {"name": "林", "city": "北京", "score": 88},
    {"name": "陈", "city": "上海", "score": 95},
    {"name": "周", "city": "北京", "score": 76},
]
result = summarize(data)
assert result == {"北京": {"count": 2, "avg": 82.0}, "上海": {"count": 1, "avg": 95.0}}, result
assert summarize([]) == {}
print("通过：分组人数与平均分都正确")`,
        },
        {
          id: "p13-4",
          kind: "quiz",
          question: "为什么解析 CSV 不建议用 <code>line.split(\",\")</code>？",
          options: [
            "split 速度太慢",
            "字段值里可能包含逗号、引号或换行，手写拆分会产生错误结果",
            "split 只能处理英文",
            "csv 模块会自动做类型转换",
          ],
          answer: 1,
          explain:
            "<b>B。</b>CSV 有引号转义规则，字段内部可以合法地包含逗号甚至换行。标准库 <code>csv</code> 正确处理这些情况；<code>split</code> 会在第一次遇到带逗号的字段时出错。",
        },
      ],
      further: [
        "《Python 编程：从入门到实践（第 3 版）》项目 2：数据可视化（数据读取部分）",
        "《Python Cookbook（第 3 版）》5.1–5.4：文件与 IO",
        "Python 官方文档：csv — CSV 文件读写",
      ],
    },

    /* ============================================================ 14 */
    {
      id: "task-manager",
      title: "小项目：可测试的任务管理器",
      summary:
        "用 dataclass 建模型、用 JSON 做持久化、用纯函数做排序。最后一节把前 13 节的知识串成一个能继续扩展的小项目。",
      level: "实战",
      minutes: 40,
      objectives: [
        "把需求拆成模型、存储、命令三层",
        "用 dataclass 定义带默认值的实体",
        "完成 JSON 持久化与恢复",
        "为排序与状态流转写断言测试",
      ],
      sections: [
        {
          type: "h",
          text: "需求与分层",
        },
        {
          type: "p",
          html: "目标是一个最小的任务管理器：能添加任务、完成任务、删除任务、按优先级查看未完成项，并把数据存进 JSON。为了避免一坨代码，拆成三层：<strong>Task 模型</strong>负责数据形状，<strong>TaskStore</strong>负责集合操作与持久化，<strong>命令层</strong>负责解析输入。前两层不依赖任何 UI，方便测试。",
        },
        {
          type: "code",
          file: "model.py",
          code: String.raw`from dataclasses import dataclass, field, asdict

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, data):
        return cls(**data)`,
        },
        {
          type: "callout",
          tone: "tip",
          title: "asdict 与 from_dict 的价值",
          html: "持久化时不要把 dataclass 对象直接塞给 JSON；先转成普通字典，读回时再显式构造。这样字段增减、旧数据兼容都有明确的处理点。",
        },
        {
          type: "h",
          text: "存储：所有集合操作集中在一个类",
        },
        {
          type: "code",
          file: "store.py",
          code: String.raw`import json
from pathlib import Path

class TaskStore:
    def __init__(self, path="tasks.json"):
        self.path = Path(path)
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        title = title.strip()
        if not title:
            raise ValueError("标题不能为空")
        task = Task(self._next_id, title, priority)
        self._next_id += 1
        self.tasks.append(task)
        return task

    def complete(self, task_id):
        for task in self.tasks:
            if task.id == task_id:
                task.done = True
                return task
        raise KeyError(f"任务 {task_id} 不存在")

    def pending(self):
        return [task for task in self.tasks if not task.done]

    def sorted_pending(self):
        return sorted(self.pending(), key=lambda task: (task.priority, task.id))

    def save(self):
        data = {
            "next_id": self._next_id,
            "tasks": [task.to_dict() for task in self.tasks],
        }
        self.path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, path="tasks.json"):
        store = cls(path)
        if not store.path.exists():
            return store
        data = json.loads(store.path.read_text(encoding="utf-8"))
        store.tasks = [Task.from_dict(item) for item in data["tasks"]]
        store._next_id = data["next_id"]
        return store`,
        },
        {
          type: "p",
          html: "把 <code>save</code> 与 <code>load</code> 放在同一个类里，命令层就不需要知道 JSON 细节。以后要换成 SQLite 或远程 API，只改这一层。",
        },
        {
          type: "h",
          text: "命令层：真实项目里用 argparse",
        },
        {
          type: "code",
          file: "cli.py",
          code: String.raw`import argparse

parser = argparse.ArgumentParser(description="最小任务管理器")
sub = parser.add_subparsers(dest="command", required=True)

add_cmd = sub.add_parser("add", help="添加任务")
add_cmd.add_argument("title")
add_cmd.add_argument("-p", "--priority", type=int, default=3)

list_cmd = sub.add_parser("list", help="查看未完成任务")

args = parser.parse_args()
# 这里再调用 TaskStore 的对应方法`,
          output: "python tasks.py add \"复习生成器\" -p 1",
        },
        {
          type: "p",
          html: "在浏览器环境里没有命令行参数，所以我们把命令层简化成函数调用。但“解析输入”和“执行业务逻辑”依然是两层——这保证了 <code>TaskStore</code> 可以被独立测试。",
        },
        {
          type: "h",
          text: "排序与状态流转",
        },
        {
          type: "code",
          file: "sorting.py",
          code: String.raw`def sorted_pending(tasks):
    return sorted(
        (task for task in tasks if not task.done),
        key=lambda task: (task.priority, task.id),
    )`,
        },
        {
          type: "p",
          html: "优先级数字越小越靠前，同优先级按创建顺序。把排序规则写成 key 元组，比在多个地方写 if 判断可靠得多。",
        },
        {
          type: "callout",
          tone: "deep",
          title: "下一步可以加什么",
          html: "截止日期（用 <code>datetime.date</code>，排序 key 加上日期）、标签过滤（一行推导式）、重复任务检测（用 set）。每加一个功能，先写一个失败的测试，再写实现。",
        },
      ],
      exercises: [
        {
          id: "p14-1",
          kind: "code",
          title: "实现添加任务",
          difficulty: "★★☆",
          prompt:
            "补全 <code>TaskStore.add(title, priority=3)</code>：标题去首尾空格，空标题抛 <code>ValueError</code>；分配自增 id（从 1 开始），创建 Task 并返回。",
          starter: String.raw`from dataclasses import dataclass, field
from pathlib import Path
import json

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

class TaskStore:
    def __init__(self, path="tasks.json"):
        self.path = Path(path)
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        pass

store = TaskStore()
print(store.add("复习生成器", 2))
print(store.add("写周报"))`,
          hints: [
            "先 <code>title = title.strip()</code>，再判断空值。",
            "用 <code>self._next_id</code> 创建任务，然后自增。",
            "别忘了 <code>self.tasks.append(task)</code>。",
          ],
          solution: String.raw`from dataclasses import dataclass, field
from pathlib import Path
import json

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

class TaskStore:
    def __init__(self, path="tasks.json"):
        self.path = Path(path)
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        title = title.strip()
        if not title:
            raise ValueError("标题不能为空")
        task = Task(self._next_id, title, priority)
        self._next_id += 1
        self.tasks.append(task)
        return task

store = TaskStore()
print(store.add("复习生成器", 2))
print(store.add("写周报"))`,
          check: String.raw`store = TaskStore()
t1 = store.add("  复习生成器  ", 2)
assert t1.id == 1
assert t1.title == "复习生成器"
assert t1.priority == 2
assert t1.done is False
t2 = store.add("写周报")
assert t2.id == 2
assert t2.priority == 3
try:
    store.add("   ")
except ValueError:
    pass
else:
    raise AssertionError("空标题应抛 ValueError")
assert len(store.tasks) == 2
print("通过：id 自增、标题清理与空值校验都正确")`,
        },
        {
          id: "p14-2",
          kind: "code",
          title: "完成与筛选",
          difficulty: "★★★",
          prompt:
            "补全 <code>complete(task_id)</code> 与 <code>pending()</code>：完成任务时把 <code>done</code> 置为 True 并返回该任务；id 不存在时抛 <code>KeyError</code>；<code>pending()</code> 返回未完成任务列表。",
          starter: String.raw`from dataclasses import dataclass, field
from pathlib import Path

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

class TaskStore:
    def __init__(self, path="tasks.json"):
        self.path = Path(path)
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        title = title.strip()
        task = Task(self._next_id, title, priority)
        self._next_id += 1
        self.tasks.append(task)
        return task

    def complete(self, task_id):
        pass

    def pending(self):
        pass

store = TaskStore()
a = store.add("A", 1)
b = store.add("B", 3)
store.complete(b.id)
print([t.title for t in store.pending()])`,
          hints: [
            "遍历 <code>self.tasks</code> 找 id，找到就 <code>done = True</code> 并返回。",
            "循环结束还没找到，抛 <code>KeyError</code>。",
            "<code>pending</code> 用列表推导式过滤 <code>not task.done</code>。",
          ],
          solution: String.raw`from dataclasses import dataclass, field
from pathlib import Path

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

class TaskStore:
    def __init__(self, path="tasks.json"):
        self.path = Path(path)
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        title = title.strip()
        task = Task(self._next_id, title, priority)
        self._next_id += 1
        self.tasks.append(task)
        return task

    def complete(self, task_id):
        for task in self.tasks:
            if task.id == task_id:
                task.done = True
                return task
        raise KeyError(f"任务 {task_id} 不存在")

    def pending(self):
        return [task for task in self.tasks if not task.done]

store = TaskStore()
a = store.add("A", 1)
b = store.add("B", 3)
store.complete(b.id)
print([t.title for t in store.pending()])`,
          check: String.raw`store = TaskStore()
a = store.add("A", 1)
b = store.add("B", 3)
c = store.add("C", 2)
store.complete(c.id)
assert store.tasks[2].done is True
assert [t.title for t in store.pending()] == ["A", "B"]
try:
    store.complete(999)
except KeyError:
    pass
else:
    raise AssertionError("不存在的 id 应抛 KeyError")
assert [t.title for t in store.pending()] == ["A", "B"]
print("通过：状态流转与筛选正确")`,
        },
        {
          id: "p14-3",
          kind: "code",
          title: "按优先级排序",
          difficulty: "★★★",
          prompt:
            "实现 <code>sorted_pending()</code>：只取未完成任务，按 <code>(priority, id)</code> 升序返回新列表；不要修改原列表。",
          starter: String.raw`from dataclasses import dataclass, field

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

class TaskStore:
    def __init__(self):
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        task = Task(self._next_id, title, priority)
        self._next_id += 1
        self.tasks.append(task)
        return task

    def pending(self):
        return [task for task in self.tasks if not task.done]

    def sorted_pending(self):
        pass

store = TaskStore()
store.add("写周报", 3)
store.add("复习装饰器", 1)
store.add("跑步", 2)
print([(t.title, t.priority) for t in store.sorted_pending()])`,
          hints: [
            "<code>sorted</code> 的 key 返回 <code>(task.priority, task.id)</code>。",
            "直接 <code>sorted(self.pending(), key=...)</code> 会返回新列表。",
          ],
          solution: String.raw`from dataclasses import dataclass, field

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

class TaskStore:
    def __init__(self):
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        task = Task(self._next_id, title, priority)
        self._next_id += 1
        self.tasks.append(task)
        return task

    def pending(self):
        return [task for task in self.tasks if not task.done]

    def sorted_pending(self):
        return sorted(self.pending(), key=lambda task: (task.priority, task.id))

store = TaskStore()
store.add("写周报", 3)
store.add("复习装饰器", 1)
store.add("跑步", 2)
print([(t.title, t.priority) for t in store.sorted_pending()])`,
          check: String.raw`store = TaskStore()
store.add("写周报", 3)
store.add("复习装饰器", 1)
store.add("跑步", 2)
store.add("同优先级 A", 2)
store.tasks[0].done = True
result = store.sorted_pending()
assert [(t.title, t.priority) for t in result] == [
    ("复习装饰器", 1),
    ("跑步", 2),
    ("同优先级 A", 2),
]
assert len(store.tasks) == 4, "排序不应修改原列表"
print("通过：优先级与创建顺序都正确")`,
        },
        {
          id: "p14-4",
          kind: "code",
          title: "保存并恢复",
          difficulty: "★★★",
          prompt:
            "补全 <code>save()</code> 与 <code>load(path)</code>：把任务列表与 <code>_next_id</code> 写入 UTF-8 JSON（中文可读、缩进 2）；读取时恢复 Task 实例与下一个可用 id。",
          starter: String.raw`import json
from pathlib import Path
from dataclasses import dataclass, field, asdict

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

class TaskStore:
    def __init__(self, path="tasks.json"):
        self.path = Path(path)
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        task = Task(self._next_id, title, priority)
        self._next_id += 1
        self.tasks.append(task)
        return task

    def save(self):
        pass

    @classmethod
    def load(cls, path="tasks.json"):
        pass

store = TaskStore("demo_tasks.json")
store.add("复习生成器", 1)
store.add("写周报", 2)
store.save()
loaded = TaskStore.load("demo_tasks.json")
print([(t.id, t.title) for t in loaded.tasks], loaded._next_id)`,
          hints: [
            "保存的数据结构：<code>{\"next_id\": self._next_id, \"tasks\": [asdict(t) for t in self.tasks]}</code>。",
            "读取时用 <code>Task(**item)</code> 还原实例。",
            "文件不存在时返回空 store，而不是报错。",
          ],
          solution: String.raw`import json
from pathlib import Path
from dataclasses import dataclass, field, asdict

@dataclass
class Task:
    id: int
    title: str
    priority: int = 3
    done: bool = False
    tags: list[str] = field(default_factory=list)

class TaskStore:
    def __init__(self, path="tasks.json"):
        self.path = Path(path)
        self.tasks = []
        self._next_id = 1

    def add(self, title, priority=3):
        task = Task(self._next_id, title, priority)
        self._next_id += 1
        self.tasks.append(task)
        return task

    def save(self):
        data = {
            "next_id": self._next_id,
            "tasks": [asdict(task) for task in self.tasks],
        }
        self.path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, path="tasks.json"):
        store = cls(path)
        if not store.path.exists():
            return store
        data = json.loads(store.path.read_text(encoding="utf-8"))
        store.tasks = [Task(**item) for item in data["tasks"]]
        store._next_id = data["next_id"]
        return store

store = TaskStore("demo_tasks.json")
store.add("复习生成器", 1)
store.add("写周报", 2)
store.save()
loaded = TaskStore.load("demo_tasks.json")
print([(t.id, t.title) for t in loaded.tasks], loaded._next_id)`,
          check: String.raw`store = TaskStore("roundtrip.json")
store.add("复习生成器", 1)
store.add("写周报", 2)
store.tasks[1].done = True
store.save()
loaded = TaskStore.load("roundtrip.json")
assert [(t.id, t.title, t.done) for t in loaded.tasks] == [
    (1, "复习生成器", False),
    (2, "写周报", True),
]
assert loaded._next_id == 3
assert Path("roundtrip.json").read_text(encoding="utf-8").count("复习生成器") == 1
assert TaskStore.load("no-such-file.json").tasks == []
print("通过：JSON 往返、状态与自增 id 都恢复正确")`,
        },
        {
          id: "p14-5",
          kind: "quiz",
          question: "把 JSON 读写集中在 <code>TaskStore</code>，而不是散落在每个命令里，主要好处是？",
          options: [
            "运行速度更快",
            "业务逻辑可以脱离存储独立测试，替换存储方式也只改一处",
            "Python 会自动做类型检查",
            "可以绕开 GIL",
          ],
          answer: 1,
          explain:
            "<b>B。</b>集中存储细节是一种边界设计：命令层只依赖 <code>TaskStore</code> 的接口，测试时可以用内存实现替换 JSON，迁移到数据库也只改这一层。",
        },
      ],
      further: [
        "《Python 编程：从入门到实践（第 3 版）》项目 3：Web 应用（分层思想）",
        "《Python 工匠》第 5 章：工程实践与测试",
        "《Effective Python（第 3 版）》条目 79：用测试固定行为",
      ],
    },
  ],
});

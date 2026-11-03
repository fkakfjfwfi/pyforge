/* 项目 01 · 记账 CLI（SQLite）
   目标：数据模型 → 持久化 → 聚合报表 → CSV 与 CLI，全部可在浏览器验证。 */
window.PROJECTS = window.PROJECTS || [];
window.PROJECTS.push({
  id: "ledger-cli",
  type: "project",
  index: "01",
  title: "记账 CLI",
  subtitle: "SQLite 数据建模、报表与 CSV",
  summary: "用标准库做一个真正能用的记账工具：数据校验、SQLite 唯一约束、月度与分类报表、预算告警、CSV 导入导出。",
  level: "简历级 · 中级",
  duration: "6–8 小时",
  mode: "browser",
  modeLabel: "浏览器可完整练习",
  accent: "#2458e6",
  stack: ["Python 3.11+", "sqlite3", "argparse", "csv", "unittest"],
  resumeLine: "Python CLI + SQLite 数据建模：支持收支录入、月度/分类报表、预算告警与 CSV 导入导出，配套单元测试。",
  highlights: [
    "能讲清 schema 设计与唯一约束如何防止重复导入",
    "能展示聚合 SQL、报表排序规则与金额精度处理",
    "有可运行的 CLI、测试与 README，而不是一段脚本",
  ],
  sections: [
    {
      type: "h",
      text: "项目要解决什么",
    },
    {
      type: "p",
      html: "很多人记账记了两天就放弃，原因是录入麻烦、月底看不到有用的结论。这个项目的目标不是“做一个表格”，而是把<strong>流水数据变成可行动的信息</strong>：这个月花了多少、钱花在哪些类别、哪些类别超预算。",
    },
    {
      type: "list",
      items: [
        "录入收入 / 支出：日期、类别、金额、备注；金额必须为正，类别不能为空。",
        "用 SQLite 持久化；同一天、同类别、同金额、同备注的流水视为重复，导入时自动跳过。",
        "输出月度收支汇总、分类占比（按金额降序）、预算超支提醒。",
        "支持 CSV 导入导出，坏行跳过并统计数量。",
        "提供 argparse 命令行与 unittest 测试。",
      ],
    },
    {
      type: "h",
      text: "你会练到什么",
    },
    {
      type: "table",
      head: ["能力", "在本项目中的落点"],
      rows: [
        ["数据建模", "Transaction 校验、SQLite schema、唯一约束"],
        ["SQL 聚合", "按月份与类别 SUM / GROUP BY，生成占比"],
        ["边界处理", "坏日期、空类别、负数金额、重复行"],
        ["工程化", "argparse 子命令、文件路径、测试隔离"],
      ],
    },
    {
      type: "callout",
      tone: "warn",
      title: "先控制范围",
      html: "第一版不要做图表、不要接银行 API、不要做 Web。把“录入 → 存储 → 汇总 → 导入导出”跑通，再考虑多账户、预算周期、可视化。简历项目最怕半成品铺得很大。",
    },
    {
      type: "h",
      text: "完成标准",
    },
    {
      type: "list",
      items: [
        "4 个检查点全部通过，且你能不看参考答案重写核心函数。",
        "下载 `ledger.py` 与 `test_ledger.py`，本地 `python -m unittest` 全绿。",
        "README 写清安装、命令示例、数据文件位置与已知限制。",
        "简历里能用 3 句话讲清：问题、方案、结果（有数字就写数字）。",
      ],
    },
  ],
  architecture: {
    tree: String.raw`ledger-cli/
├─ ledger.py            # 模型 + SQLite + 报表 + CLI
├─ test_ledger.py       # unittest 用例
├─ README.md            # 运行说明与命令示例
└─ data/
   └─ ledger.db         # 运行时生成，不提交到 Git`,
    notes: [
      "模型层只做校验，不直接碰 SQL；持久化层接收 conn，方便测试时用 `:memory:`。",
      "报表函数只读数据库，不打印；CLI 负责格式化输出。这样报表可以单独测试。",
      "数据库文件不应提交到 Git；用 .gitignore 忽略 `*.db`。",
    ],
  },
  milestones: [
    {
      title: "M1 领域模型与内存账本",
      desc: "先把 Transaction 的校验规则和余额计算写对，不急着上数据库。",
      exIds: ["pr1-1"],
    },
    {
      title: "M2 SQLite schema 与聚合",
      desc: "建表、插入、用 SUM + GROUP BY 算月度收支；用唯一约束挡住重复流水。",
      exIds: ["pr1-2"],
    },
    {
      title: "M3 报表与预算告警",
      desc: "分类占比、排序规则、预算超支，这些才是用户真正会看的部分。",
      exIds: ["pr1-3"],
    },
    {
      title: "M4 CSV 导入导出",
      desc: "真实数据总有坏行和重复行；导入函数要统计而不是崩溃。",
      exIds: ["pr1-4"],
    },
  ],
  exercises: [
    {
      id: "pr1-1",
      kind: "code",
      title: "Transaction 校验与内存账本",
      difficulty: "★★☆",
      prompt:
        "实现 <code>Transaction.__post_init__</code>：日期必须是合法的 ISO 日期，kind 只能是 income / expense，category 去空格后不能为空，amount 必须为正数。再实现 <code>Ledger.add</code> 与 <code>balance</code>（收入减支出）。",
      starter: String.raw`from dataclasses import dataclass
from datetime import date as Date

VALID_KINDS = {"income", "expense"}

@dataclass
class Transaction:
    date: str
    kind: str
    category: str
    amount: float
    note: str = ""

    def __post_init__(self):
        # 在这里完成校验与规范化
        pass

class Ledger:
    def __init__(self):
        self.transactions = []

    def add(self, tx):
        # 追加并返回 tx
        pass

    @property
    def balance(self):
        # income - expense
        pass

tx = Transaction("2026-11-03", "expense", "餐饮", 35.5)
print(tx)`,
      hints: [
        "日期校验：<code>Date.fromisoformat(self.date)</code>，失败会抛 ValueError。",
        "amount 先判断类型再判断正负；最后统一转成 float。",
        "balance 用生成器求和：收入为正、支出为负。",
      ],
      solution: String.raw`from dataclasses import dataclass
from datetime import date as Date

VALID_KINDS = {"income", "expense"}

@dataclass
class Transaction:
    date: str
    kind: str
    category: str
    amount: float
    note: str = ""

    def __post_init__(self):
        Date.fromisoformat(self.date)
        if self.kind not in VALID_KINDS:
            raise ValueError("kind 必须是 income 或 expense")
        self.category = self.category.strip()
        if not self.category:
            raise ValueError("category 不能为空")
        if not isinstance(self.amount, (int, float)) or self.amount <= 0:
            raise ValueError("amount 必须为正数")
        self.amount = float(self.amount)
        self.note = (self.note or "").strip()

class Ledger:
    def __init__(self):
        self.transactions = []

    def add(self, tx):
        self.transactions.append(tx)
        return tx

    @property
    def balance(self):
        return sum(tx.amount if tx.kind == "income" else -tx.amount for tx in self.transactions)

tx = Transaction("2026-11-03", "expense", "餐饮", 35.5)
print(tx)`,
      check: String.raw`tx = Transaction("2026-11-03", "expense", "餐饮", 35.5)
assert tx.amount == 35.5
assert tx.category == "餐饮"
bad_cases = [
    ("2026-13-01", "expense", "餐饮", 10, ""),
    ("2026-11-03", "transfer", "餐饮", 10, ""),
    ("2026-11-03", "expense", "   ", 10, ""),
    ("2026-11-03", "expense", "餐饮", 0, ""),
    ("2026-11-03", "expense", "餐饮", -1, ""),
]
for case in bad_cases:
    try:
        Transaction(*case)
    except ValueError:
        pass
    else:
        raise AssertionError(f"应当拒绝非法交易：{case}")

ledger = Ledger()
assert ledger.add(tx) is tx
assert ledger.balance == -35.5
ledger.add(Transaction("2026-11-03", "income", "工资", 1000))
assert ledger.balance == 964.5
assert len(ledger.transactions) == 2
assert Ledger().balance == 0
print("通过：校验、余额与返回值都正确")`,
    },
    {
      id: "pr1-2",
      kind: "code",
      title: "建表、插入与月度汇总",
      difficulty: "★★★",
      prompt:
        "实现 <code>create_schema</code>、<code>insert</code>、<code>monthly_total</code>。表需包含 date / kind / category / amount / note，并用唯一约束阻止重复流水；<code>monthly_total(conn, \"2026-11\")</code> 返回 income / expense / net。",
      starter: String.raw`import sqlite3
from dataclasses import dataclass
from datetime import date as Date

SCHEMA = """
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (date, kind, category, amount, note)
);
"""

@dataclass
class Transaction:
    date: str
    kind: str
    category: str
    amount: float
    note: str = ""

    def __post_init__(self):
        Date.fromisoformat(self.date)
        if self.kind not in {"income", "expense"}:
            raise ValueError("非法 kind")
        self.category = self.category.strip()
        if not self.category or self.amount <= 0:
            raise ValueError("非法数据")
        self.amount = float(self.amount)
        self.note = (self.note or "").strip()

def create_schema(conn):
    pass

def insert(conn, tx):
    pass

def monthly_total(conn, month):
    # month 形如 "2026-11"
    pass

conn = sqlite3.connect(":memory:")
create_schema(conn)
insert(conn, Transaction("2026-11-01", "expense", "餐饮", 35.5, "午饭"))
insert(conn, Transaction("2026-11-02", "income", "工资", 1000, ""))
print(monthly_total(conn, "2026-11"))`,
      hints: [
        "建表直接 <code>conn.executescript(SCHEMA)</code>。",
        "插入后 <code>conn.commit()</code>，返回 <code>cursor.lastrowid</code>。",
        "月度汇总用 <code>date LIKE ?</code> 加 <code>month + \"%\"</code>。",
        "<code>COALESCE(SUM(...), 0)</code> 处理没有数据的情况。",
      ],
      solution: String.raw`import sqlite3
from dataclasses import dataclass
from datetime import date as Date

SCHEMA = """
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (date, kind, category, amount, note)
);
"""

@dataclass
class Transaction:
    date: str
    kind: str
    category: str
    amount: float
    note: str = ""

    def __post_init__(self):
        Date.fromisoformat(self.date)
        if self.kind not in {"income", "expense"}:
            raise ValueError("非法 kind")
        self.category = self.category.strip()
        if not self.category or self.amount <= 0:
            raise ValueError("非法数据")
        self.amount = float(self.amount)
        self.note = (self.note or "").strip()

def create_schema(conn):
    conn.executescript(SCHEMA)

def insert(conn, tx):
    cur = conn.execute(
        "INSERT INTO transactions (date, kind, category, amount, note) VALUES (?, ?, ?, ?, ?)",
        (tx.date, tx.kind, tx.category, tx.amount, tx.note),
    )
    conn.commit()
    return cur.lastrowid

def monthly_total(conn, month):
    row = conn.execute(
        """
        SELECT
            COALESCE(SUM(CASE WHEN kind = 'income' THEN amount END), 0) AS income,
            COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount END), 0) AS expense
        FROM transactions
        WHERE date LIKE ?
        """,
        (month + "%",),
    ).fetchone()
    income, expense = row[0], row[1]
    return {"income": income, "expense": expense, "net": income - expense}

conn = sqlite3.connect(":memory:")
create_schema(conn)
insert(conn, Transaction("2026-11-01", "expense", "餐饮", 35.5, "午饭"))
insert(conn, Transaction("2026-11-02", "income", "工资", 1000, ""))
print(monthly_total(conn, "2026-11"))`,
      check: String.raw`conn = sqlite3.connect(":memory:")
create_schema(conn)
id1 = insert(conn, Transaction("2026-11-01", "expense", "餐饮", 35.5, "午饭"))
assert id1 == 1
id2 = insert(conn, Transaction("2026-11-02", "income", "工资", 1000, ""))
assert id2 == 2
assert monthly_total(conn, "2026-11") == {"income": 1000.0, "expense": 35.5, "net": 964.5}
assert monthly_total(conn, "2026-10") == {"income": 0, "expense": 0, "net": 0}
try:
    insert(conn, Transaction("2026-11-01", "expense", "餐饮", 35.5, "午饭"))
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError("唯一约束应阻止重复插入")
print("通过：schema、插入、月度汇总与去重约束都正确")`,
    },
    {
      id: "pr1-3",
      kind: "code",
      title: "分类报表与预算告警",
      difficulty: "★★★",
      prompt:
        "实现 <code>category_report(conn, month)</code>：按支出类别汇总金额与占比（保留 1 位小数），按金额降序。实现 <code>budget_status(conn, month, budgets)</code>：返回每个预算类别的 spent / limit / over，超支的排前面。",
      starter: String.raw`import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (date, kind, category, amount, note)
);
"""

ROWS = [
    ("2026-11-01", "expense", "餐饮", 35.5, "午饭"),
    ("2026-11-02", "expense", "交通", 10.0, "地铁"),
    ("2026-11-03", "expense", "娱乐", 88.0, "电影"),
    ("2026-11-04", "income", "工资", 1000.0, ""),
    ("2026-12-01", "expense", "餐饮", 60.0, "聚餐"),
]

def seed(conn):
    conn.executescript(SCHEMA)
    conn.executemany(
        "INSERT OR IGNORE INTO transactions (date, kind, category, amount, note) VALUES (?, ?, ?, ?, ?)",
        ROWS,
    )
    conn.commit()

def category_report(conn, month=None):
    pass

def budget_status(conn, month, budgets):
    pass

conn = sqlite3.connect(":memory:")
seed(conn)
print(category_report(conn, "2026-11"))`,
      hints: [
        "先按 category 分组求 SUM(amount)，只查 expense。",
        "占比 = 该类别金额 / 当月总支出 * 100，<code>round(..., 1)</code>。",
        "预算结果按 <code>-int(over), -spent</code> 排序；没有支出的类别 spent 记 0。",
      ],
      solution: String.raw`import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (date, kind, category, amount, note)
);
"""

ROWS = [
    ("2026-11-01", "expense", "餐饮", 35.5, "午饭"),
    ("2026-11-02", "expense", "交通", 10.0, "地铁"),
    ("2026-11-03", "expense", "娱乐", 88.0, "电影"),
    ("2026-11-04", "income", "工资", 1000.0, ""),
    ("2026-12-01", "expense", "餐饮", 60.0, "聚餐"),
]

def seed(conn):
    conn.executescript(SCHEMA)
    conn.executemany(
        "INSERT OR IGNORE INTO transactions (date, kind, category, amount, note) VALUES (?, ?, ?, ?, ?)",
        ROWS,
    )
    conn.commit()

def category_report(conn, month=None):
    sql = "SELECT category, SUM(amount) AS total FROM transactions WHERE kind = 'expense'"
    params = []
    if month:
        sql += " AND date LIKE ?"
        params.append(month + "%")
    sql += " GROUP BY category"
    rows = conn.execute(sql, params).fetchall()
    total = sum(row[1] for row in rows)
    if not total:
        return []
    report = [
        {"category": row[0], "total": round(row[1], 2), "share": round(row[1] / total * 100, 1)}
        for row in rows
    ]
    return sorted(report, key=lambda item: (-item["total"], item["category"]))

def budget_status(conn, month, budgets):
    report = {item["category"]: item["total"] for item in category_report(conn, month)}
    result = []
    for category, limit in budgets.items():
        spent = report.get(category, 0.0)
        result.append({"category": category, "spent": round(spent, 2), "limit": limit, "over": spent > limit})
    return sorted(result, key=lambda item: (-int(item["over"]), -item["spent"], item["category"]))

conn = sqlite3.connect(":memory:")
seed(conn)
print(category_report(conn, "2026-11"))`,
      check: String.raw`conn = sqlite3.connect(":memory:")
seed(conn)
report = category_report(conn, "2026-11")
assert [item["category"] for item in report] == ["娱乐", "餐饮", "交通"], report
assert report[0]["total"] == 88.0
assert report[0]["share"] == 65.9
assert report[1]["share"] == 26.6
assert report[2]["share"] == 7.5
assert category_report(conn, "2026-10") == []

status = budget_status(conn, "2026-11", {"餐饮": 30, "娱乐": 100, "交通": 20})
assert status[0]["category"] == "餐饮" and status[0]["over"] is True
assert status[0]["spent"] == 35.5
assert status[1]["category"] == "娱乐" and status[1]["over"] is False
assert status[2]["category"] == "交通"
assert {item["category"] for item in status} == {"餐饮", "娱乐", "交通"}
print("通过：分类占比、排序与预算告警都正确")`,
    },
    {
      id: "pr1-4",
      kind: "code",
      title: "CSV 导入导出，坏行不崩",
      difficulty: "★★★",
      prompt:
        "实现 <code>import_csv(conn, text)</code>：解析 CSV，跳过坏日期 / 非法 kind / 非数字金额 / 空类别 / 重复行，返回 <code>(imported, skipped)</code>。实现 <code>export_csv(conn)</code>：导出全部流水，表头为 date,kind,category,amount,note。",
      starter: String.raw`import csv
import io
import sqlite3
from dataclasses import dataclass
from datetime import date as Date

SCHEMA = """
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (date, kind, category, amount, note)
);
"""

@dataclass
class Transaction:
    date: str
    kind: str
    category: str
    amount: float
    note: str = ""

    def __post_init__(self):
        Date.fromisoformat(self.date)
        if self.kind not in {"income", "expense"}:
            raise ValueError("非法 kind")
        self.category = self.category.strip()
        if not self.category or self.amount <= 0:
            raise ValueError("非法数据")
        self.amount = float(self.amount)
        self.note = (self.note or "").strip()

def create_schema(conn):
    conn.executescript(SCHEMA)

def import_csv(conn, text):
    pass

def export_csv(conn):
    pass

conn = sqlite3.connect(":memory:")
create_schema(conn)
sample = """date,kind,category,amount,note
2026-11-01,expense,餐饮,35.5,午饭
2026-11-02,expense,交通,10,地铁
2026-13-01,expense,餐饮,20,坏日期
2026-11-01,expense,餐饮,35.5,午饭
"""
print(import_csv(conn, sample))
print(export_csv(conn))`,
      hints: [
        "用 <code>csv.DictReader(io.StringIO(text))</code> 读，不要手写 split。",
        "每行构造 Transaction 再执行 INSERT；用 try/except 统一捕获 ValueError / TypeError / IntegrityError。",
        "导出用 <code>csv.writer(io.StringIO(), lineterminator=\"\\n\")</code>，按 date, id 排序。",
      ],
      solution: String.raw`import csv
import io
import sqlite3
from dataclasses import dataclass
from datetime import date as Date

SCHEMA = """
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (date, kind, category, amount, note)
);
"""

@dataclass
class Transaction:
    date: str
    kind: str
    category: str
    amount: float
    note: str = ""

    def __post_init__(self):
        Date.fromisoformat(self.date)
        if self.kind not in {"income", "expense"}:
            raise ValueError("非法 kind")
        self.category = self.category.strip()
        if not self.category or self.amount <= 0:
            raise ValueError("非法数据")
        self.amount = float(self.amount)
        self.note = (self.note or "").strip()

def create_schema(conn):
    conn.executescript(SCHEMA)

def import_csv(conn, text):
    imported = 0
    skipped = 0
    reader = csv.DictReader(io.StringIO(text))
    for row in reader:
        try:
            tx = Transaction(
                date=(row.get("date") or "").strip(),
                kind=(row.get("kind") or "").strip(),
                category=(row.get("category") or "").strip(),
                amount=float((row.get("amount") or "").strip()),
                note=(row.get("note") or "").strip(),
            )
            cur = conn.execute(
                "INSERT INTO transactions (date, kind, category, amount, note) VALUES (?, ?, ?, ?, ?)",
                (tx.date, tx.kind, tx.category, tx.amount, tx.note),
            )
            conn.commit()
            imported += 1
        except (ValueError, TypeError, sqlite3.IntegrityError):
            skipped += 1
    return imported, skipped

def export_csv(conn):
    out = io.StringIO()
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow(["date", "kind", "category", "amount", "note"])
    rows = conn.execute(
        "SELECT date, kind, category, amount, note FROM transactions ORDER BY date, id"
    ).fetchall()
    for row in rows:
        writer.writerow(list(row))
    return out.getvalue()

conn = sqlite3.connect(":memory:")
create_schema(conn)
sample = """date,kind,category,amount,note
2026-11-01,expense,餐饮,35.5,午饭
2026-11-02,expense,交通,10,地铁
2026-13-01,expense,餐饮,20,坏日期
2026-11-01,expense,餐饮,35.5,午饭
"""
print(import_csv(conn, sample))
print(export_csv(conn))`,
      check: String.raw`conn = sqlite3.connect(":memory:")
create_schema(conn)
sample = """date,kind,category,amount,note
2026-11-01,expense,餐饮,35.5,午饭
2026-11-02,expense,交通,10,地铁
2026-13-01,expense,餐饮,20,坏日期
2026-11-01,expense,餐饮,35.5,午饭
"""
imported, skipped = import_csv(conn, sample)
assert imported == 2, imported
assert skipped == 2, skipped
out = export_csv(conn)
rows = list(csv.DictReader(io.StringIO(out)))
assert len(rows) == 2
assert rows[0]["category"] == "餐饮"
assert rows[0]["amount"] == "35.5"
assert rows[1]["category"] == "交通"
empty = sqlite3.connect(":memory:")
create_schema(empty)
assert export_csv(empty).startswith("date,kind,category,amount,note")
print("通过：坏行跳过、重复行计入 skipped，导出可被 csv 解析")`,
    },
  ],
  files: [
    {
      name: "ledger.py",
      note: "完整实现：模型 + SQLite + 报表 + CLI",
      lang: "python",
      code: String.raw`"""记账 CLI：Python 标准库实现，无第三方依赖。

用法：
    python ledger.py init
    python ledger.py add --kind expense --category 餐饮 --amount 35.5 --note 午饭
    python ledger.py list --month 2026-11
    python ledger.py report --month 2026-11
    python ledger.py import --file records.csv
"""
import argparse
import csv
import io
import sqlite3
from dataclasses import dataclass
from datetime import date as Date

VALID_KINDS = {"income", "expense"}

SCHEMA = """
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (date, kind, category, amount, note)
);
"""

@dataclass
class Transaction:
    date: str
    kind: str
    category: str
    amount: float
    note: str = ""

    def __post_init__(self):
        Date.fromisoformat(self.date)
        if self.kind not in VALID_KINDS:
            raise ValueError("kind 必须是 income 或 expense")
        self.category = self.category.strip()
        if not self.category:
            raise ValueError("category 不能为空")
        if not isinstance(self.amount, (int, float)) or self.amount <= 0:
            raise ValueError("amount 必须为正数")
        self.amount = float(self.amount)
        self.note = (self.note or "").strip()


def connect(path="ledger.db"):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def insert(conn, tx):
    cur = conn.execute(
        "INSERT INTO transactions (date, kind, category, amount, note) VALUES (?, ?, ?, ?, ?)",
        (tx.date, tx.kind, tx.category, tx.amount, tx.note),
    )
    conn.commit()
    return cur.lastrowid


def monthly_total(conn, month):
    row = conn.execute(
        """
        SELECT
            COALESCE(SUM(CASE WHEN kind = 'income' THEN amount END), 0) AS income,
            COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount END), 0) AS expense
        FROM transactions
        WHERE date LIKE ?
        """,
        (month + "%",),
    ).fetchone()
    income, expense = float(row["income"]), float(row["expense"])
    return {"income": income, "expense": expense, "net": income - expense}


def category_report(conn, month=None):
    sql = "SELECT category, SUM(amount) AS total FROM transactions WHERE kind = 'expense'"
    params = []
    if month:
        sql += " AND date LIKE ?"
        params.append(month + "%")
    sql += " GROUP BY category"
    rows = conn.execute(sql, params).fetchall()
    total = sum(row["total"] for row in rows)
    if not total:
        return []
    report = [
        {
            "category": row["category"],
            "total": round(row["total"], 2),
            "share": round(row["total"] / total * 100, 1),
        }
        for row in rows
    ]
    return sorted(report, key=lambda item: (-item["total"], item["category"]))


def budget_status(conn, month, budgets):
    report = {item["category"]: item["total"] for item in category_report(conn, month)}
    result = []
    for category, limit in budgets.items():
        spent = report.get(category, 0.0)
        result.append(
            {"category": category, "spent": round(spent, 2), "limit": limit, "over": spent > limit}
        )
    return sorted(result, key=lambda item: (-int(item["over"]), -item["spent"], item["category"]))


def import_csv(conn, text):
    imported = skipped = 0
    reader = csv.DictReader(io.StringIO(text))
    for row in reader:
        try:
            tx = Transaction(
                date=(row.get("date") or "").strip(),
                kind=(row.get("kind") or "").strip(),
                category=(row.get("category") or "").strip(),
                amount=float((row.get("amount") or "").strip()),
                note=(row.get("note") or "").strip(),
            )
            insert(conn, tx)
        except (ValueError, TypeError, sqlite3.IntegrityError):
            skipped += 1
        else:
            imported += 1
    return imported, skipped


def export_csv(conn):
    out = io.StringIO()
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow(["date", "kind", "category", "amount", "note"])
    for row in conn.execute(
        "SELECT date, kind, category, amount, note FROM transactions ORDER BY date, id"
    ):
        writer.writerow([row["date"], row["kind"], row["category"], row["amount"], row["note"]])
    return out.getvalue()


def parse_budgets(values):
    budgets = {}
    for value in values or []:
        if "=" not in value:
            raise argparse.ArgumentTypeError("预算格式应为 类别=金额")
        category, limit = value.split("=", 1)
        budgets[category.strip()] = float(limit)
    return budgets


def build_parser():
    parser = argparse.ArgumentParser(description="记账 CLI")
    parser.add_argument("--db", default="ledger.db", help="数据库路径")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="初始化数据库")

    add = sub.add_parser("add", help="新增流水")
    add.add_argument("--date", default=str(Date.today()))
    add.add_argument("--kind", required=True, choices=sorted(VALID_KINDS))
    add.add_argument("--category", required=True)
    add.add_argument("--amount", required=True, type=float)
    add.add_argument("--note", default="")

    list_cmd = sub.add_parser("list", help="列出流水")
    list_cmd.add_argument("--month")

    report = sub.add_parser("report", help="月度报表")
    report.add_argument("--month", required=True)
    report.add_argument("--budget", action="append", metavar="类别=金额")

    imp = sub.add_parser("import", help="导入 CSV")
    imp.add_argument("--file", required=True)
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    conn = connect(args.db)

    if args.command == "init":
        print(f"initialized {args.db}")
    elif args.command == "add":
        tx = Transaction(args.date, args.kind, args.category, args.amount, args.note)
        print(f"added #{insert(conn, tx)}")
    elif args.command == "list":
        sql = "SELECT * FROM transactions"
        params = []
        if args.month:
            sql += " WHERE date LIKE ?"
            params.append(args.month + "%")
        for row in conn.execute(sql + " ORDER BY date, id", params):
            sign = "+" if row["kind"] == "income" else "-"
            print(f"{row['date']}  {sign}{row['amount']:>8.2f}  {row['category']}  {row['note']}")
    elif args.command == "report":
        total = monthly_total(conn, args.month)
        print(f"收入 {total['income']:.2f}  支出 {total['expense']:.2f}  结余 {total['net']:.2f}")
        for item in category_report(conn, args.month):
            print(f"{item['category']:<8} {item['total']:>8.2f}  {item['share']:>5.1f}%")
        budgets = parse_budgets(args.budget)
        if budgets:
            for item in budget_status(conn, args.month, budgets):
                mark = "超支" if item["over"] else "正常"
                print(f"[{mark}] {item['category']}: {item['spent']:.2f}/{item['limit']:.2f}")
    elif args.command == "import":
        text = open(args.file, encoding="utf-8").read()
        imported, skipped = import_csv(conn, text)
        print(f"imported={imported} skipped={skipped}")


if __name__ == "__main__":
    main()
`,
    },
    {
      name: "test_ledger.py",
      note: "unittest：模型、聚合、CSV 往返",
      lang: "python",
      code: String.raw`import csv
import io
import sqlite3
import unittest

from ledger import (
    SCHEMA,
    Transaction,
    budget_status,
    category_report,
    export_csv,
    import_csv,
    insert,
    monthly_total,
)


class LedgerTest(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)

    def test_reject_invalid_transaction(self):
        with self.assertRaises(ValueError):
            Transaction("2026-13-01", "expense", "餐饮", 10)
        with self.assertRaises(ValueError):
            Transaction("2026-11-01", "transfer", "餐饮", 10)
        with self.assertRaises(ValueError):
            Transaction("2026-11-01", "expense", "  ", 10)
        with self.assertRaises(ValueError):
            Transaction("2026-11-01", "expense", "餐饮", 0)

    def test_monthly_total_and_unique(self):
        insert(self.conn, Transaction("2026-11-01", "expense", "餐饮", 35.5, "午饭"))
        insert(self.conn, Transaction("2026-11-02", "income", "工资", 1000, ""))
        with self.assertRaises(sqlite3.IntegrityError):
            insert(self.conn, Transaction("2026-11-01", "expense", "餐饮", 35.5, "午饭"))
        self.assertEqual(
            monthly_total(self.conn, "2026-11"),
            {"income": 1000.0, "expense": 35.5, "net": 964.5},
        )

    def test_category_report_and_budget(self):
        for tx in [
            Transaction("2026-11-01", "expense", "餐饮", 35.5, "午饭"),
            Transaction("2026-11-02", "expense", "交通", 10.0, "地铁"),
            Transaction("2026-11-03", "expense", "娱乐", 88.0, "电影"),
        ]:
            insert(self.conn, tx)
        report = category_report(self.conn, "2026-11")
        self.assertEqual([item["category"] for item in report], ["娱乐", "餐饮", "交通"])
        status = budget_status(self.conn, "2026-11", {"餐饮": 30, "娱乐": 100})
        self.assertTrue(status[0]["over"])
        self.assertEqual(status[0]["spent"], 35.5)

    def test_csv_roundtrip(self):
        text = "date,kind,category,amount,note\n2026-11-01,expense,餐饮,35.5,午饭\nbad,expense,交通,10,地铁\n"
        imported, skipped = import_csv(self.conn, text)
        self.assertEqual((imported, skipped), (1, 1))
        rows = list(csv.DictReader(io.StringIO(export_csv(self.conn))))
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["category"], "餐饮")


if __name__ == "__main__":
    unittest.main()
`,
    },
    {
      name: "README.md",
      note: "运行说明与示例命令",
      lang: "markdown",
      plain: true,
      code: String.raw`# 记账 CLI

只依赖 Python 标准库。

## 运行

    python ledger.py init
    python ledger.py add --kind expense --category 餐饮 --amount 35.5 --note 午饭
    python ledger.py add --kind income --category 工资 --amount 1000
    python ledger.py list --month 2026-11
    python ledger.py report --month 2026-11 --budget 餐饮=30 --budget 交通=200
    python ledger.py import --file records.csv

## CSV 格式

    date,kind,category,amount,note
    2026-11-01,expense,餐饮,35.5,午饭

## 测试

    python -m unittest -v

## 已知限制

- 单币种，不做汇率换算
- 预算只按单月检查，不处理跨月周期
- 数据库文件默认在当前目录生成，已加入 .gitignore
`,
    },
  ],
  localSetup: [
    "python -m venv .venv",
    "# Windows: .venv\\Scripts\\activate",
    "# macOS / Linux: source .venv/bin/activate",
    "python ledger.py init",
    "python ledger.py add --kind expense --category 餐饮 --amount 35.5 --note 午饭",
    "python ledger.py report --month 2026-11 --budget 餐饮=30",
    "python -m unittest -v",
  ],
  localNotes: [
    "没有任何第三方依赖，Python 3.10+ 即可运行。",
    "把 `ledger.db` 与 `__pycache__/` 加入 .gitignore，不要提交数据库文件。",
    "发布前补一张终端截图：`report` 命令的输出最能体现项目价值。",
  ],
  resume: {
    keywords: ["Python", "SQLite", "SQL", "argparse", "CSV", "unittest"],
    bullets: [
      "设计并实现记账 CLI，使用 SQLite 的 UNIQUE 约束对 (date, kind, category, amount, note) 去重，将重复导入从人工检查变为自动跳过。",
      "实现月度收支与分类占比报表，输出按金额降序的类别排名，并支持按类别设置预算、标记超支。",
      "实现 CSV 双向转换与坏行统计，配合 unittest 覆盖模型校验、聚合查询、重复约束和导入导出（[N] 个用例）。",
    ],
  },
  extensions: [
    "多账户与转账：增加 accounts 表，转账写成两条关联流水，余额按账户聚合。",
    "预算周期：支持“每月 / 每周”预算，并计算剩余可用额度。",
    "导出月度 Markdown 报告，直接贴进博客或周报。",
    "用 rich / textual 做终端 UI，但保持核心逻辑与展示分离。",
    "把 SQLite 换成 PostgreSQL，补上迁移脚本与 Docker Compose，作为第二个简历项目。",
  ],
  refs: [
    {
      name: "sqlite/sqlite",
      url: "https://github.com/sqlite/sqlite",
      why: "SQLite 官方源码镜像；需要确认约束、聚合函数行为时看官方文档与源码。",
    },
    {
      name: "practical-tutorials/project-based-learning",
      url: "https://github.com/practical-tutorials/project-based-learning",
      why: "项目式教程清单，可以继续找 CLI / 数据处理方向的练手项目。",
    },
    {
      name: "Python 官方文档：sqlite3",
      url: "https://docs.python.org/zh-cn/3/library/sqlite3.html",
      why: "连接、事务、row_factory 与参数的权威说明。",
    },
  ],
});

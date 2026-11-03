/* 项目 05 · FastAPI 任务 API
   浏览器验证仓储层与响应契约；本地提供完整 FastAPI / pytest / Docker 项目。 */
window.PROJECTS.push({
  id: "task-api",
  type: "project",
  index: "05",
  title: "任务 API",
  subtitle: "FastAPI + SQLite + pytest + Docker",
  summary: "一个能写进后端简历的完整 API：请求校验、SQLite 仓储、状态机、分页过滤、统一错误格式、TestClient 测试与 Docker 部署。",
  level: "简历级 · 后端",
  duration: "8–10 小时",
  mode: "hybrid",
  modeLabel: "浏览器练核心 · 本地完整 API",
  accent: "#b06a12",
  stack: ["FastAPI", "Pydantic", "SQLite", "pytest", "Docker"],
  resumeLine: "FastAPI + SQLite 任务 API：Pydantic 校验、仓储分层、状态机、分页过滤、统一错误响应、pytest TestClient 与 Docker。",
  highlights: [
    "有真实的后端分层：schema / repository / router 各司其职",
    "能讲清 422、404、409 分别在什么场景返回",
    "有 OpenAPI 文档、测试与 Dockerfile，可直接部署展示",
  ],
  sections: [
    {
      type: "h",
      text: "为什么这个项目适合写简历",
    },
    {
      type: "p",
      html: "后端岗位看的不是“会不会写路由”，而是<strong>边界是否清楚、错误是否可预期、数据层是否可测试</strong>。这个项目把 Pydantic 校验、SQLite 仓储、状态机与错误格式拆开，任何一层都能单独测试，也能在面试时逐层讲。",
    },
    {
      type: "list",
      items: [
        "POST /tasks：创建任务，校验标题、优先级、截止日期、标签。",
        "GET /tasks：按状态过滤、分页，返回 total / pages / has_next。",
        "GET /tasks/{id}：不存在返回 404，错误格式统一。",
        "PATCH /tasks/{id}/status：todo → doing → done，非法流转返回 409。",
        "DELETE /tasks/{id}：删除并返回 204。",
        "GET /health：给部署与探针使用。",
        "pytest + TestClient 覆盖创建、校验、状态机、分页与 404。",
      ],
    },
    {
      type: "table",
      head: ["状态码", "在这个项目里的含义"],
      rows: [
        ["201", "创建成功，返回完整任务与 self link"],
        ["422", "Pydantic 校验失败：标题为空、priority 越界、tags 超限"],
        ["404", "任务不存在"],
        ["409", "状态流转非法，例如 done → doing"],
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "浏览器里练哪部分",
      html: "站内 4 个检查点验证<strong>仓储层与响应契约</strong>：校验、CRUD、状态机、分页。它们与本地项目共用同一套逻辑；FastAPI 路由、Pydantic 模型与 TestClient 测试在完整实现里提供。",
    },
    {
      type: "callout",
      tone: "warn",
      title: "不要把它写成“内存列表 API”",
      html: "没有持久化、没有分页、没有错误格式的 CRUD，很难体现后端能力。至少保留 SQLite、状态机与测试；再往上加鉴权、审计日志或异步任务，才有继续聊的空间。",
    },
  ],
  architecture: {
    tree: String.raw`task-api/
├─ app/
│  ├─ __init__.py
│  ├─ repository.py     # SQLite 仓储 + 状态机 + 响应组装
│  ├─ schemas.py        # Pydantic 请求 / 响应模型
│  └─ main.py           # FastAPI 路由 + 错误处理
├─ tests/
│  └─ test_api.py       # TestClient：CRUD / 校验 / 状态机 / 分页
├─ requirements.txt
├─ Dockerfile
└─ README.md`,
    notes: [
      "repository 不依赖 FastAPI，测试可以直接用 `sqlite3 :memory:`。",
      "Pydantic 负责请求形状，repository 负责业务规则，router 只做 HTTP 映射。",
      "`build_response` 与 `paginate` 统一响应结构，避免每个路由各写一套。",
    ],
  },
  milestones: [
    {
      title: "M1 请求校验",
      desc: "标题、优先级、截止日期、标签的规则集中在一个函数里。",
      exIds: ["pr5-1"],
    },
    {
      title: "M2 SQLite 仓储与 CRUD",
      desc: "建表、创建、按 id 查询、分页列表；tags 用 JSON 存储。",
      exIds: ["pr5-2"],
    },
    {
      title: "M3 状态机",
      desc: "todo → doing → done；非法流转与不存在的任务分别报什么错。",
      exIds: ["pr5-3"],
    },
    {
      title: "M4 响应契约与分页",
      desc: "self link、pages、has_next / has_prev，前端不需要自己算。",
      exIds: ["pr5-4"],
    },
  ],
  exercises: [
    {
      id: "pr5-1",
      kind: "code",
      title: "请求校验函数",
      difficulty: "★★☆",
      prompt:
        "实现 <code>validate_task(payload)</code>：title 去空格后 1–100 字符；priority 默认 3、必须是 1–5 的整数；due 可为 None 或合法 ISO 日期；tags 必须是字符串列表，去空格、去重、最多 5 个、每个 1–20 字符。返回规范化字典。",
      starter: String.raw`from datetime import date as Date

def validate_task(payload):
    pass

print(validate_task({"title": "写周报"}))`,
      hints: [
        "先判断 title 是 str，再 strip；长度用 <code>1 &lt;= len(title) &lt;= 100</code>。",
        "priority 要排除 bool：<code>isinstance(p, int) and not isinstance(p, bool)</code>。",
        "tags 用循环去重并校验长度，最后判断数量不超过 5。",
      ],
      solution: String.raw`from datetime import date as Date

def validate_task(payload):
    title = payload.get("title")
    if not isinstance(title, str):
        raise ValueError("title 必须是字符串")
    title = title.strip()
    if not (1 <= len(title) <= 100):
        raise ValueError("title 长度必须在 1 到 100 之间")

    priority = payload.get("priority", 3)
    if isinstance(priority, bool) or not isinstance(priority, int) or not (1 <= priority <= 5):
        raise ValueError("priority 必须是 1 到 5 的整数")

    due = payload.get("due")
    if due is not None:
        if not isinstance(due, str):
            raise ValueError("due 必须是 ISO 日期字符串")
        try:
            Date.fromisoformat(due)
        except ValueError:
            raise ValueError("due 不是合法日期")

    raw_tags = payload.get("tags", [])
    if not isinstance(raw_tags, list):
        raise ValueError("tags 必须是列表")
    tags = []
    for tag in raw_tags:
        if not isinstance(tag, str):
            raise ValueError("tag 必须是字符串")
        tag = tag.strip()
        if not (1 <= len(tag) <= 20):
            raise ValueError("tag 长度必须在 1 到 20 之间")
        if tag not in tags:
            tags.append(tag)
    if len(tags) > 5:
        raise ValueError("tags 最多 5 个")

    return {"title": title, "priority": priority, "due": due, "tags": tags}

print(validate_task({"title": "写周报"}))`,
      check: String.raw`assert validate_task({"title": "写周报"}) == {
    "title": "写周报", "priority": 3, "due": None, "tags": []
}
full = validate_task({
    "title": "  A  ", "priority": 1, "due": "2026-11-05",
    "tags": [" x ", "x", "y"],
})
assert full == {"title": "A", "priority": 1, "due": "2026-11-05", "tags": ["x", "y"]}

bad = [
    {"title": ""},
    {"title": "   "},
    {"title": "A" * 101},
    {"title": "A", "priority": 0},
    {"title": "A", "priority": 6},
    {"title": "A", "priority": "3"},
    {"title": "A", "due": "2026-13-01"},
    {"title": "A", "tags": "x"},
    {"title": "A", "tags": [""]},
    {"title": "A", "tags": ["t1", "t2", "t3", "t4", "t5", "t6"]},
]
for payload in bad:
    try:
        validate_task(payload)
    except ValueError:
        pass
    else:
        raise AssertionError(f"应拒绝：{payload}")
assert validate_task({"title": "A", "tags": ["t1", "t2", "t3", "t4", "t5"]})["tags"] == ["t1", "t2", "t3", "t4", "t5"]
print("通过：标题、优先级、日期与标签规则都正确")`,
    },
    {
      id: "pr5-2",
      kind: "code",
      title: "SQLite 仓储与分页",
      difficulty: "★★★",
      prompt:
        "补全 <code>create_task</code>、<code>get_task</code>、<code>list_tasks</code>。tags 以 JSON 文本存储；列表按 id 倒序，支持 status 过滤与 limit / offset，返回 items、total、limit、offset。",
      starter: String.raw`import json
import sqlite3
from datetime import datetime, timezone

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
    due TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);
"""

def init_db(conn):
    conn.executescript(SCHEMA)

def _to_dict(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "priority": row["priority"],
        "status": row["status"],
        "due": row["due"],
        "tags": json.loads(row["tags"]),
        "created_at": row["created_at"],
    }

def create_task(conn, data):
    pass

def get_task(conn, task_id):
    pass

def list_tasks(conn, status=None, limit=20, offset=0):
    pass

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
init_db(conn)
print(create_task(conn, {"title": "A", "priority": 2, "due": None, "tags": ["x"]}))`,
      hints: [
        "created_at 用 <code>datetime.now(timezone.utc).strftime(\"%Y-%m-%dT%H:%M:%SZ\")</code>。",
        "tags 写库：<code>json.dumps(tags, ensure_ascii=False)</code>。",
        "列表先查 total，再按 <code>ORDER BY id DESC LIMIT ? OFFSET ?</code> 查 items。",
      ],
      solution: String.raw`import json
import sqlite3
from datetime import datetime, timezone

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
    due TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);
"""

def init_db(conn):
    conn.executescript(SCHEMA)

def _to_dict(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "priority": row["priority"],
        "status": row["status"],
        "due": row["due"],
        "tags": json.loads(row["tags"]),
        "created_at": row["created_at"],
    }

def create_task(conn, data):
    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    cur = conn.execute(
        "INSERT INTO tasks (title, priority, status, due, tags, created_at) VALUES (?, ?, 'todo', ?, ?, ?)",
        (
            data["title"],
            data["priority"],
            data.get("due"),
            json.dumps(data.get("tags", []), ensure_ascii=False),
            created_at,
        ),
    )
    conn.commit()
    return get_task(conn, cur.lastrowid)

def get_task(conn, task_id):
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return _to_dict(row) if row else None

def list_tasks(conn, status=None, limit=20, offset=0):
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    where = ""
    params = []
    if status:
        where = "WHERE status = ?"
        params.append(status)
    total = conn.execute(f"SELECT COUNT(*) FROM tasks {where}", params).fetchone()[0]
    rows = conn.execute(
        f"SELECT * FROM tasks {where} ORDER BY id DESC LIMIT ? OFFSET ?",
        params + [limit, offset],
    ).fetchall()
    return {"items": [_to_dict(row) for row in rows], "total": total, "limit": limit, "offset": offset}

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
init_db(conn)
print(create_task(conn, {"title": "A", "priority": 2, "due": None, "tags": ["x"]}))`,
      check: String.raw`conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
init_db(conn)
t1 = create_task(conn, {"title": "A", "priority": 2, "due": "2026-11-05", "tags": ["x", "y"]})
assert t1["id"] == 1
assert t1["status"] == "todo"
assert t1["tags"] == ["x", "y"]
assert t1["created_at"]
assert get_task(conn, 1) == t1
assert get_task(conn, 99) is None
for i in range(3):
    create_task(conn, {"title": f"T{i}", "priority": 3, "due": None, "tags": []})

page = list_tasks(conn, limit=2, offset=0)
assert page["total"] == 4
assert [item["id"] for item in page["items"]] == [4, 3]
page2 = list_tasks(conn, limit=2, offset=2)
assert [item["id"] for item in page2["items"]] == [2, 1]
assert list_tasks(conn, status="done")["total"] == 0
assert list_tasks(conn, limit=999)["limit"] == 100
print("通过：创建、查询、倒序分页与状态过滤都正确")`,
    },
    {
      id: "pr5-3",
      kind: "code",
      title: "状态机与错误语义",
      difficulty: "★★★",
      prompt:
        "实现 <code>update_status(conn, task_id, new_status)</code>：只允许 todo → doing、todo → done、doing → done；相同状态幂等返回；非法流转抛 <code>ValueError</code>；任务不存在抛 <code>KeyError</code>。",
      starter: String.raw`import json
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    due TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);
"""

def init_db(conn):
    conn.executescript(SCHEMA)

def _to_dict(row):
    return {
        "id": row["id"], "title": row["title"], "priority": row["priority"],
        "status": row["status"], "due": row["due"],
        "tags": json.loads(row["tags"]), "created_at": row["created_at"],
    }

def create_task(conn, data):
    cur = conn.execute(
        "INSERT INTO tasks (title, priority, due, tags, created_at) VALUES (?, ?, ?, ?, ?)",
        (data["title"], data["priority"], data.get("due"), json.dumps(data.get("tags", [])), "2026-11-03T00:00:00Z"),
    )
    conn.commit()
    return get_task(conn, cur.lastrowid)

def get_task(conn, task_id):
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return _to_dict(row) if row else None

def update_status(conn, task_id, new_status):
    pass

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
init_db(conn)
task = create_task(conn, {"title": "A", "priority": 3, "due": None, "tags": []})
print(update_status(conn, task["id"], "doing"))`,
      hints: [
        "先取当前任务；不存在 raise KeyError。",
        "允许表：<code>{\"todo\": {\"doing\", \"done\"}, \"doing\": {\"done\"}, \"done\": set()}</code>。",
        "相同状态直接返回当前任务；否则校验后 UPDATE。",
      ],
      solution: String.raw`import json
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    due TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);
"""

def init_db(conn):
    conn.executescript(SCHEMA)

def _to_dict(row):
    return {
        "id": row["id"], "title": row["title"], "priority": row["priority"],
        "status": row["status"], "due": row["due"],
        "tags": json.loads(row["tags"]), "created_at": row["created_at"],
    }

def create_task(conn, data):
    cur = conn.execute(
        "INSERT INTO tasks (title, priority, due, tags, created_at) VALUES (?, ?, ?, ?, ?)",
        (data["title"], data["priority"], data.get("due"), json.dumps(data.get("tags", [])), "2026-11-03T00:00:00Z"),
    )
    conn.commit()
    return get_task(conn, cur.lastrowid)

def get_task(conn, task_id):
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return _to_dict(row) if row else None

def update_status(conn, task_id, new_status):
    current = get_task(conn, task_id)
    if current is None:
        raise KeyError(f"任务 {task_id} 不存在")
    if new_status not in {"todo", "doing", "done"}:
        raise ValueError("非法状态")
    if new_status == current["status"]:
        return current
    allowed = {"todo": {"doing", "done"}, "doing": {"done"}, "done": set()}
    if new_status not in allowed[current["status"]]:
        raise ValueError(f"不允许从 {current['status']} 变为 {new_status}")
    conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
    conn.commit()
    return get_task(conn, task_id)

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
init_db(conn)
task = create_task(conn, {"title": "A", "priority": 3, "due": None, "tags": []})
print(update_status(conn, task["id"], "doing"))`,
      check: String.raw`conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
init_db(conn)
a = create_task(conn, {"title": "A", "priority": 3, "due": None, "tags": []})
b = create_task(conn, {"title": "B", "priority": 3, "due": None, "tags": []})
c = create_task(conn, {"title": "C", "priority": 3, "due": None, "tags": []})

assert update_status(conn, a["id"], "doing")["status"] == "doing"
assert update_status(conn, a["id"], "done")["status"] == "done"
assert update_status(conn, a["id"], "done")["status"] == "done"
assert update_status(conn, b["id"], "done")["status"] == "done"

try:
    update_status(conn, a["id"], "doing")
except ValueError:
    pass
else:
    raise AssertionError("done → doing 应被拒绝")
try:
    update_status(conn, 999, "doing")
except KeyError:
    pass
else:
    raise AssertionError("不存在的任务应抛 KeyError")
try:
    update_status(conn, c["id"], "blocked")
except ValueError:
    pass
else:
    raise AssertionError("非法状态应被拒绝")
print("通过：状态流转、幂等与错误类型都正确")`,
    },
    {
      id: "pr5-4",
      kind: "code",
      title: "响应契约与分页元数据",
      difficulty: "★★☆",
      prompt:
        "实现 <code>build_response(task)</code>：在任务字段外增加 <code>links.self = \"/tasks/{id}\"</code>。实现 <code>paginate(result)</code>：在 list_tasks 结果上增加 pages（向上取整）、has_next、has_prev。",
      starter: String.raw`import math

def build_response(task):
    pass

def paginate(result):
    pass

task = {
    "id": 7, "title": "A", "priority": 3, "status": "todo",
    "due": None, "tags": [], "created_at": "2026-11-03T00:00:00Z",
}
print(build_response(task))`,
      hints: [
        "build_response 不要修改原 task，返回新字典。",
        "pages = <code>math.ceil(total / limit)</code>，limit 为 0 时返回 0。",
        "<code>has_next = offset + limit &lt; total</code>；<code>has_prev = offset &gt; 0</code>。",
      ],
      solution: String.raw`import math

def build_response(task):
    return {**task, "links": {"self": f"/tasks/{task['id']}"}}

def paginate(result):
    total = result["total"]
    limit = result["limit"]
    offset = result["offset"]
    pages = math.ceil(total / limit) if limit else 0
    return {
        **result,
        "pages": pages,
        "has_next": offset + limit < total,
        "has_prev": offset > 0,
    }

task = {
    "id": 7, "title": "A", "priority": 3, "status": "todo",
    "due": None, "tags": [], "created_at": "2026-11-03T00:00:00Z",
}
print(build_response(task))`,
      check: String.raw`task = {
    "id": 7, "title": "A", "priority": 3, "status": "todo",
    "due": None, "tags": [], "created_at": "2026-11-03T00:00:00Z",
}
response = build_response(task)
assert response["links"]["self"] == "/tasks/7"
assert response["title"] == "A"
assert "links" not in task, "不应修改原任务"

page = paginate({"items": [], "total": 43, "limit": 10, "offset": 20})
assert page["pages"] == 5
assert page["has_next"] is True
assert page["has_prev"] is True

page2 = paginate({"items": [], "total": 43, "limit": 10, "offset": 40})
assert page2["has_next"] is False
assert page2["has_prev"] is True

page3 = paginate({"items": [], "total": 0, "limit": 10, "offset": 0})
assert page3["pages"] == 0 and page3["has_next"] is False and page3["has_prev"] is False
print("通过：self link 与分页元数据都正确")`,
    },
  ],
  files: [
    {
      name: "__init__.py",
      note: "把 app 目录变成包（内容可以为空）",
      lang: "python",
      code: String.raw`# task-api app package
`,
    },
    {
      name: "repository.py",
      note: "仓储层：schema + CRUD + 状态机 + 响应组装",
      lang: "python",
      code: String.raw`"""SQLite 仓储层：不依赖 FastAPI，可独立测试。"""
import json
import math
import sqlite3
from datetime import datetime, timezone

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
    due TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);
"""

ALLOWED = {"todo": {"doing", "done"}, "doing": {"done"}, "done": set()}


def init_db(conn):
    conn.executescript(SCHEMA)


def _to_dict(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "priority": row["priority"],
        "status": row["status"],
        "due": row["due"],
        "tags": json.loads(row["tags"]),
        "created_at": row["created_at"],
    }


def create_task(conn, data):
    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    cur = conn.execute(
        "INSERT INTO tasks (title, priority, status, due, tags, created_at) VALUES (?, ?, 'todo', ?, ?, ?)",
        (
            data["title"],
            data["priority"],
            data.get("due"),
            json.dumps(data.get("tags", []), ensure_ascii=False),
            created_at,
        ),
    )
    conn.commit()
    return get_task(conn, cur.lastrowid)


def get_task(conn, task_id):
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return _to_dict(row) if row else None


def list_tasks(conn, status=None, limit=20, offset=0):
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    where = ""
    params = []
    if status:
        where = "WHERE status = ?"
        params.append(status)
    total = conn.execute(f"SELECT COUNT(*) FROM tasks {where}", params).fetchone()[0]
    rows = conn.execute(
        f"SELECT * FROM tasks {where} ORDER BY id DESC LIMIT ? OFFSET ?",
        params + [limit, offset],
    ).fetchall()
    return {"items": [_to_dict(row) for row in rows], "total": total, "limit": limit, "offset": offset}


def update_status(conn, task_id, new_status):
    current = get_task(conn, task_id)
    if current is None:
        raise KeyError(f"任务 {task_id} 不存在")
    if new_status not in {"todo", "doing", "done"}:
        raise ValueError("非法状态")
    if new_status == current["status"]:
        return current
    if new_status not in ALLOWED[current["status"]]:
        raise ValueError(f"不允许从 {current['status']} 变为 {new_status}")
    conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
    conn.commit()
    return get_task(conn, task_id)


def delete_task(conn, task_id):
    cur = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    return cur.rowcount > 0


def build_response(task):
    return {**task, "links": {"self": f"/tasks/{task['id']}"}}


def paginate(result):
    total = result["total"]
    limit = result["limit"]
    offset = result["offset"]
    pages = math.ceil(total / limit) if limit else 0
    return {
        **result,
        "pages": pages,
        "has_next": offset + limit < total,
        "has_prev": offset > 0,
    }
`,
    },
    {
      name: "schemas.py",
      note: "Pydantic 请求 / 响应模型",
      lang: "python",
      code: String.raw`from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator

Status = Literal["todo", "doing", "done"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    priority: int = Field(default=3, ge=1, le=5)
    due: date | None = None
    tags: list[str] = Field(default_factory=list, max_length=5)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("title 不能为空")
        return value

    @field_validator("tags")
    @classmethod
    def clean_tags(cls, tags: list[str]) -> list[str]:
        result = []
        for tag in tags:
            tag = tag.strip()
            if not (1 <= len(tag) <= 20):
                raise ValueError("tag 长度必须在 1 到 20 之间")
            if tag not in result:
                result.append(tag)
        if len(result) > 5:
            raise ValueError("tags 最多 5 个")
        return result


class TaskStatusUpdate(BaseModel):
    status: Status


class TaskOut(BaseModel):
    id: int
    title: str
    priority: int
    status: Status
    due: date | None
    tags: list[str]
    created_at: str
    links: dict[str, str]


class TaskListOut(BaseModel):
    items: list[TaskOut]
    total: int
    limit: int
    offset: int
    pages: int
    has_next: bool
    has_prev: bool
`,
    },
    {
      name: "main.py",
      note: "FastAPI 路由 + 统一错误格式",
      lang: "python",
      code: String.raw`import os
import sqlite3

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.responses import JSONResponse

from . import repository
from .schemas import TaskCreate, TaskListOut, TaskOut, TaskStatusUpdate


def create_app(db_path: str) -> FastAPI:
    app = FastAPI(title="Task API", version="1.0.0")

    def get_conn():
        conn = sqlite3.connect(db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        repository.init_db(conn)
        return conn

    @app.exception_handler(HTTPException)
    async def http_error_handler(_, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.status_code, "message": exc.detail}},
        )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.post("/tasks", response_model=TaskOut, status_code=201)
    def create_task(payload: TaskCreate):
        conn = get_conn()
        data = payload.model_dump(mode="json")
        return repository.build_response(repository.create_task(conn, data))

    @app.get("/tasks", response_model=TaskListOut)
    def list_tasks(
        status: str | None = Query(default=None, pattern="^(todo|doing|done)$"),
        limit: int = Query(default=20, ge=1, le=100),
        offset: int = Query(default=0, ge=0),
    ):
        conn = get_conn()
        result = repository.list_tasks(conn, status, limit, offset)
        page = repository.paginate(result)
        page["items"] = [repository.build_response(item) for item in page["items"]]
        return page

    @app.get("/tasks/{task_id}", response_model=TaskOut)
    def get_task(task_id: int):
        task = repository.get_task(get_conn(), task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="任务不存在")
        return repository.build_response(task)

    @app.patch("/tasks/{task_id}/status", response_model=TaskOut)
    def update_status(task_id: int, payload: TaskStatusUpdate):
        try:
            task = repository.update_status(get_conn(), task_id, payload.status)
        except KeyError:
            raise HTTPException(status_code=404, detail="任务不存在")
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc))
        return repository.build_response(task)

    @app.delete("/tasks/{task_id}", status_code=204)
    def delete_task(task_id: int):
        if not repository.delete_task(get_conn(), task_id):
            raise HTTPException(status_code=404, detail="任务不存在")
        return Response(status_code=204)

    return app


app = create_app(os.getenv("TASK_DB", "tasks.db"))
`,
    },
    {
      name: "test_api.py",
      note: "TestClient：CRUD、校验、状态机、分页",
      lang: "python",
      code: String.raw`from fastapi.testclient import TestClient

from app.main import create_app


def make_client(tmp_path):
    return TestClient(create_app(str(tmp_path / "test.db")))


def test_create_and_get(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/tasks", json={"title": "写周报", "priority": 2, "tags": ["work"]})
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "写周报"
    assert body["status"] == "todo"
    assert body["links"]["self"] == "/tasks/1"

    detail = client.get("/tasks/1")
    assert detail.status_code == 200
    assert detail.json()["tags"] == ["work"]


def test_validation(tmp_path):
    client = make_client(tmp_path)
    assert client.post("/tasks", json={"title": "  "}).status_code == 422
    assert client.post("/tasks", json={"title": "A", "priority": 9}).status_code == 422
    assert client.post("/tasks", json={"title": "A", "tags": ["t"] * 6}).status_code == 422


def test_status_machine_and_404(tmp_path):
    client = make_client(tmp_path)
    task_id = client.post("/tasks", json={"title": "A"}).json()["id"]

    assert client.patch(f"/tasks/{task_id}/status", json={"status": "doing"}).status_code == 200
    assert client.patch(f"/tasks/{task_id}/status", json={"status": "done"}).status_code == 200
    assert client.patch(f"/tasks/{task_id}/status", json={"status": "doing"}).status_code == 409
    assert client.patch("/tasks/999/status", json={"status": "doing"}).status_code == 404
    assert client.get("/tasks/999").status_code == 404

    deleted = client.delete(f"/tasks/{task_id}")
    assert deleted.status_code == 204
    assert client.get(f"/tasks/{task_id}").status_code == 404


def test_pagination(tmp_path):
    client = make_client(tmp_path)
    for i in range(3):
        client.post("/tasks", json={"title": f"T{i}"})

    page = client.get("/tasks", params={"limit": 2, "offset": 0}).json()
    assert page["total"] == 3
    assert page["pages"] == 2
    assert page["has_next"] is True
    assert len(page["items"]) == 2
`,
    },
    {
      name: "requirements.txt",
      note: "本地安装依赖",
      lang: "text",
      plain: true,
      code: String.raw`fastapi>=0.115,<1.0
uvicorn[standard]>=0.30
pydantic>=2.7
pytest>=8.0
httpx>=0.27
`,
    },
    {
      name: "Dockerfile",
      note: "容器部署",
      lang: "text",
      plain: true,
      code: String.raw`FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`,
    },
    {
      name: "README.md",
      note: "启动、测试与部署",
      lang: "markdown",
      plain: true,
      code: String.raw`# Task API

## 本地运行

    python -m venv .venv
    # Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload

打开 http://localhost:8000/docs 查看 OpenAPI。

## 测试

    pytest -q

## Docker

    docker build -t task-api .
    docker run -p 8000:8000 task-api

## 接口

- POST /tasks
- GET /tasks?status=todo&limit=20&offset=0
- GET /tasks/{id}
- PATCH /tasks/{id}/status
- DELETE /tasks/{id}
- GET /health

## 状态机

todo -> doing -> done；todo 可直接到 done；done 不能回退。
`,
    },
  ],
  localSetup: [
    "python -m venv .venv",
    "# Windows: .venv\\Scripts\\activate",
    "pip install -r requirements.txt",
    "uvicorn app.main:app --reload",
    "# 打开 http://localhost:8000/docs",
    "pytest -q",
    "docker build -t task-api . && docker run -p 8000:8000 task-api",
  ],
  localNotes: [
    "浏览器检查点只验证仓储层；FastAPI 路由与 Pydantic 模型在完整文件里。",
    "把 `tasks.db` 与 `.venv/` 加入 .gitignore；Docker 镜像不要包含测试数据库。",
    "演示顺序：/docs 创建任务 → 查询分页 → 非法状态 409 → pytest 全绿。",
  ],
  resume: {
    keywords: ["FastAPI", "Pydantic", "SQLite", "REST", "pytest", "Docker"],
    bullets: [
      "用 FastAPI + SQLite 实现任务 API，按 router / repository / schema 分层，Pydantic 负责请求校验，仓储层可脱离 HTTP 独立测试。",
      "设计 todo → doing → done 状态机与统一错误格式，明确 422 / 404 / 409 的返回场景；列表支持状态过滤与分页元数据。",
      "用 pytest + TestClient 覆盖创建、校验、状态流转、分页与删除（[N] 个用例），提供 Dockerfile 一键部署与 OpenAPI 文档。",
    ],
  },
  extensions: [
    "加入 JWT 鉴权与用户维度隔离，tasks 表增加 owner_id。",
    "增加审计日志表，记录每次状态变更的操作者与时间。",
    "把 SQLite 换成 PostgreSQL + SQLAlchemy/Alembic，补充迁移脚本。",
    "加入后台任务（邮件提醒 / 到期通知），用 Celery 或 ARQ。",
    "加 GitHub Actions：ruff + pytest + docker build，保证每次提交可验证。",
  ],
  refs: [
    {
      name: "fastapi/full-stack-fastapi-template",
      url: "https://github.com/fastapi/full-stack-fastapi-template",
      why: "官方全栈模板：FastAPI + SQLModel + PostgreSQL + Docker Compose，适合对照项目结构。",
    },
    {
      name: "fastapi/sqlmodel",
      url: "https://github.com/fastapi/sqlmodel",
      why: "SQLModel 把 Pydantic 与 SQLAlchemy 结合；想把仓储层升级成 ORM 时看这里。",
    },
    {
      name: "FastAPI 官方文档",
      url: "https://fastapi.tiangolo.com/",
      why: "依赖注入、响应模型、错误处理与 TestClient 的权威说明。",
    },
  ],
});

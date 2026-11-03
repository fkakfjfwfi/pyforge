/* 交互实验室：9 个可在浏览器里运行的脚本/模板（Pyodide） */
(function () {
const RAW = String.raw;

window.LABS = [

{
  id: "lab-rename", title: "批量重命名", subtitle: "改前缀，看计划如何先生成、再执行",
  params: [
    { key: "folder", label: "目标目录", type: "text", value: "files", help: "实验环境里已创建 files/" },
    { key: "prefix", label: "文件名前缀", type: "text", value: "cover" },
    { key: "apply", label: "真正执行（取消勾选为 dry-run）", type: "checkbox", value: false }
  ],
  setup: RAW`
from pathlib import Path

root = Path("files")
root.mkdir(exist_ok=True)
for i, name in enumerate(["alpha.txt", "beta.txt", "gamma.txt"]):
    (root / name).write_text(f"demo {i}", encoding="utf-8")
print("已创建 files/: alpha.txt beta.txt gamma.txt")
`,
  code: RAW`
from pathlib import Path

p = LAB_PARAMS
folder = Path(p["folder"])
prefix = p["prefix"]
apply_changes = bool(p["apply"])

if not folder.exists():
    raise SystemExit(f"目录不存在: {folder}")

files = sorted(x for x in folder.iterdir() if x.is_file())
plan, targets = [], set()

for i, src in enumerate(files, 1):
    dst = folder / f"{prefix}_{i:03d}{src.suffix.lower()}"
    if dst.name in targets:
        raise SystemExit(f"目标重名，已中止: {dst.name}")
    targets.add(dst.name)
    plan.append((src, dst))

for src, dst in plan:
    print(f"{src.name}  ->  {dst.name}")

if not apply_changes:
    print(f"[dry-run] {len(plan)} 个文件；勾选 apply 才会执行")
else:
    for src, dst in plan:
        src.rename(dst)
    print("执行完成，目录现在是:", ", ".join(sorted(x.name for x in folder.iterdir())))
`
},

{
  id: "lab-csv", title: "CSV 清洗", subtitle: "调节价格下限与 HTTPS 要求，看坏数据如何分流",
  params: [
    { key: "min_price", label: "最低价格", type: "number", value: 0, min: 0, step: 10 },
    { key: "require_https", label: "只接受 https 链接", type: "checkbox", value: true }
  ],
  setup: RAW`
rows = [
    "title,price,url",
    " 键盘 ,￥199.00,https://a.com/1",
    "鼠标,99,http://a.com/2",
    ",88,https://a.com/3",
    "坏数据,N/A,https://a.com/4",
    "负数,-10,https://a.com/5",
]
open("raw.csv", "w", encoding="utf-8-sig", newline="").write("\n".join(rows) + "\n")
print("已创建 raw.csv（5 条数据，含 3 条坏数据）")
`,
  code: RAW`
import csv
from collections import Counter

p = LAB_PARAMS
min_price = float(p["min_price"])
require_https = bool(p["require_https"])
reasons = Counter()


def normalize(row):
    return {
        "title": (row.get("title") or "").strip(),
        "price": (row.get("price") or "").replace(",", "").replace("￥", "").strip(),
        "url": (row.get("url") or "").strip(),
    }


def validate(item):
    if not item["title"]:
        return "title 为空"
    try:
        item["price"] = float(item["price"])
    except ValueError:
        return "price 不是数字"
    if item["price"] < min_price:
        return f"price 低于 {min_price}"
    if require_https and not item["url"].startswith("https://"):
        return "url 不是 https"
    return None


good, bad = [], []
with open("raw.csv", encoding="utf-8-sig", newline="") as fin:
    for row in csv.DictReader(fin):
        item = normalize(row)
        reason = validate(item)
        if reason:
            reasons[reason] += 1
            bad.append((item, reason))
        else:
            good.append(item)

print(f"成功 {len(good)} 条，失败 {len(bad)} 条")
for reason, count in reasons.most_common():
    print(f"  {reason}: {count}")
print("合法样例:", good[:2])
print("失败样例:", bad[:2])
`
},

{
  id: "lab-pages", title: "API 分页抓取", subtitle: "设置总页数与故障页，观察重试和终止条件",
  params: [
    { key: "total_pages", label: "总页数", type: "number", value: 5, min: 1, max: 10 },
    { key: "fail_page", label: "模拟失败的页码（0 表示不失败）", type: "number", value: 2, min: 0, max: 10 }
  ],
  setup: RAW`
print("准备就绪：fetch_page 是本地模拟接口，不访问网络")
`,
  code: RAW`
import time

p = LAB_PARAMS
total_pages = int(p["total_pages"])
fail_page = int(p["fail_page"])
failed_once = {"done": False}


def fetch_page(page):
    if page > total_pages:
        return []
    if fail_page and page == fail_page and not failed_once["done"]:
        failed_once["done"] = True
        raise TimeoutError("模拟网络超时")
    return [{"id": (page - 1) * 5 + i} for i in range(5)]


page = 1
seen = set()
total = 0

while True:
    for attempt in range(3):
        try:
            items = fetch_page(page)
            break
        except Exception as exc:
            if attempt == 2:
                raise
            wait = 0.2 * (attempt + 1)
            print(f"page {page} 失败，{wait}s 后重试: {exc}")
            time.sleep(wait)

    if not items:
        print("空页：唯一终止条件触发，结束")
        break

    for item in items:
        if item["id"] not in seen:
            seen.add(item["id"])
            total += 1
    print(f"page {page}: {len(items)} 条，累计 {total}")
    page += 1

print(f"完成：{len(seen)} 条唯一记录，共请求 {page - 1} 页")
`
},

{
  id: "lab-log", title: "日志统计", subtitle: "调 TopN 与过滤条件，看 2GB 日志如何压成报表",
  params: [
    { key: "top_n", label: "Top N", type: "number", value: 3, min: 1, max: 5 },
    { key: "only_error", label: "只显示 ERROR 类型", type: "checkbox", value: true }
  ],
  setup: RAW`
from pathlib import Path

lines = [
    "2026-11-02 10:00:01 INFO start",
    "2026-11-02 10:00:02 INFO fetch page=1",
    "2026-11-02 10:00:03 WARNING slow response 1.2s",
    "2026-11-02 10:00:04 ERROR timeout on https://a.com/1",
    "2026-11-02 10:00:05 ERROR parse failed title",
    "2026-11-02 10:00:06 INFO fetch page=2",
    "2026-11-02 10:00:07 ERROR timeout on https://b.com/2",
    "2026-11-02 10:00:08 WARNING retry page=2",
    "2026-11-02 10:00:09 ERROR forbidden 403",
    "broken line without fields",
    "2026-11-02 10:00:10 INFO done",
    "another broken",
]
Path("app.log").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("已创建 app.log（12 行，其中 2 行损坏）")
`,
  code: RAW`
import re
from collections import Counter

p = LAB_PARAMS
top_n = int(p["top_n"])
only_error = bool(p["only_error"])

LOG_RE = re.compile(
    r"(?P<date>\d{4}-\d{2}-\d{2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\s+"
    r"(?P<level>INFO|WARNING|ERROR)\s+"
    r"(?P<message>.*)"
)

levels = Counter()
errors = Counter()
bad = total = 0

with open("app.log", encoding="utf-8") as f:
    for line in f:
        total += 1
        m = LOG_RE.match(line.strip())
        if not m:
            bad += 1
            continue
        record = m.groupdict()
        levels[record["level"]] += 1
        if record["level"] == "ERROR":
            kind = record["message"].split()[0] if record["message"] else "unknown"
            errors[kind] += 1

print(f"总行数 {total}，坏行 {bad}")
if only_error:
    print("只显示 ERROR：")
else:
    print("级别分布:", dict(levels))
for name, count in errors.most_common(top_n):
    print(f"  ERROR {name}: {count}")
`
},

{
  id: "lab-dedupe", title: "目录去重", subtitle: "切换保留策略，观察分层过滤与隔离移动",
  params: [
    { key: "keep", label: "保留哪一份", type: "select", value: "oldest", options: [{ value: "oldest", label: "最早修改" }, { value: "newest", label: "最新修改" }] },
    { key: "apply", label: "移动到 _duplicates/（取消勾选只预览）", type: "checkbox", value: false }
  ],
  setup: RAW`
import os
import time
from pathlib import Path

root = Path("photos")
root.mkdir(exist_ok=True)
(root / "a.txt").write_text("same-content", encoding="utf-8")
(root / "a_copy.txt").write_text("same-content", encoding="utf-8")
(root / "b.txt").write_text("unique", encoding="utf-8")
(root / "c.txt").write_text("another", encoding="utf-8")
(root / "c_copy.txt").write_text("another", encoding="utf-8")

now = time.time()
os.utime(root / "a.txt", (now - 100, now - 100))
os.utime(root / "a_copy.txt", (now, now))
os.utime(root / "c_copy.txt", (now - 50, now - 50))
os.utime(root / "c.txt", (now, now))
print("已创建 photos/：2 组重复文件 + 1 个唯一文件")
`,
  code: RAW`
import hashlib
import shutil
from collections import defaultdict
from pathlib import Path

p = LAB_PARAMS
keep = p["keep"]
apply_changes = bool(p["apply"])
root = Path("photos")


def file_hash(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


by_size = defaultdict(list)
for f in sorted(root.rglob("*")):
    if f.is_file():
        by_size[f.stat().st_size].append(f)

groups = defaultdict(list)
for size, files in by_size.items():
    if len(files) < 2:
        continue
    for f in files:
        groups[(size, file_hash(f))].append(f)

duplicates = []
for (size, digest), files in groups.items():
    if len(files) < 2:
        continue
    files.sort(key=lambda x: x.stat().st_mtime)
    if keep == "newest":
        files.reverse()
    keeper, *rest = files
    for dup in rest:
        duplicates.append((dup, keeper))

print(f"发现 {len(duplicates)} 个重复文件：")
for dup, keeper in duplicates:
    print(f"  {dup.name}  ==  {keeper.name}")

if not apply_changes:
    print("[dry-run] 勾选 apply 才会移动到 _duplicates/")
else:
    for dup, keeper in duplicates:
        target = root / "_duplicates" / dup.name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(dup), str(target))
    print("已移动到 photos/_duplicates/")
`
},

{
  id: "lab-sync", title: "增量同步", subtitle: "对比源与备份，验证「第二次运行 0 复制」",
  params: [
    { key: "apply", label: "真正执行同步", type: "checkbox", value: false },
    { key: "move_orphans", label: "把孤儿文件移到 _orphan/", type: "checkbox", value: true }
  ],
  setup: RAW`
import os
from pathlib import Path

src = Path("source")
dst = Path("backup")
src.mkdir(exist_ok=True)
dst.mkdir(exist_ok=True)

(src / "a.txt").write_text("A", encoding="utf-8")
(src / "b.txt").write_text("B", encoding="utf-8")
(src / "c.txt").write_text("C", encoding="utf-8")
(dst / "a.txt").write_text("A", encoding="utf-8")
(dst / "orphan.txt").write_text("old", encoding="utf-8")

st = os.stat(dst / "a.txt")
os.utime(src / "a.txt", (st.st_atime, st.st_mtime))
print("已创建 source/ 与 backup/：a 已同步，b/c 待复制，orphan 是孤儿")
`,
  code: RAW`
import shutil
from pathlib import Path

p = LAB_PARAMS
apply_changes = bool(p["apply"])
move_orphans = bool(p["move_orphans"])
src = Path("source")
dst = Path("backup")


def snapshot(root):
    return {
        str(x.relative_to(root)): (x.stat().st_size, int(x.stat().st_mtime))
        for x in root.rglob("*") if x.is_file()
    }


s = snapshot(src)
d = snapshot(dst)
added = [k for k in s if k not in d]
changed = [k for k in s if k in d and s[k] != d[k]]
orphans = [k for k in d if k not in s]

print(f"新增 {len(added)}，变化 {len(changed)}，孤儿 {len(orphans)}")
print("新增:", added)
print("孤儿:", orphans)

if not apply_changes:
    print("[dry-run] 勾选 apply 才会执行")
else:
    for key in added + changed:
        target = dst / key
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src / key, target)
    if move_orphans:
        for key in orphans:
            orphan = dst / "_orphan" / key
            orphan.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(dst / key), str(orphan))
    print("同步完成；再次运行时新增应为 0")
`
},

{
  id: "lab-cli", title: "模板一：CLI 骨架", subtitle: "改目录与前缀，体验 dry-run / apply 的节奏",
  params: [
    { key: "folder", label: "工作目录", type: "text", value: "workspace" },
    { key: "apply", label: "真正执行", type: "checkbox", value: false }
  ],
  setup: RAW`
from pathlib import Path

root = Path("workspace")
root.mkdir(exist_ok=True)
for name in ["one.txt", "two.txt", "three.txt"]:
    (root / name).write_text(name, encoding="utf-8")
print("已创建 workspace/：one.txt two.txt three.txt")
`,
  code: RAW`
from pathlib import Path

p = LAB_PARAMS
folder = Path(p["folder"])
apply_changes = bool(p["apply"])

if not folder.exists():
    raise SystemExit(f"目录不存在: {folder}")

plan = [(x, x.with_suffix(".bak")) for x in sorted(folder.glob("*")) if x.is_file()]
if not plan:
    print("没有需要处理的文件")
else:
    for src, dst in plan:
        print(f"{'执行' if apply_changes else '[dry-run]'} {src.name} -> {dst.name}")

if apply_changes:
    # 模板在这里替换成你的真实操作
    for src, dst in plan:
        src.rename(dst)
    print(f"完成：{len(plan)} 项")
else:
    print(f"共 {len(plan)} 项，勾选 apply 执行")
`
},

{
  id: "lab-pipeline", title: "模板二：数据管道", subtitle: "调节价格阈值，观察好坏分流与原因统计",
  params: [
    { key: "min_price", label: "最低价格", type: "number", value: 50, min: 0, step: 10 },
    { key: "drop_invalid", label: "坏数据进入 reject 列表", type: "checkbox", value: true }
  ],
  setup: RAW`
print("准备就绪：内置 4 条演示数据，不需要文件")
`,
  code: RAW`
from collections import Counter

p = LAB_PARAMS
min_price = float(p["min_price"])
drop_invalid = bool(p["drop_invalid"])

RAW_ROWS = [
    {"title": "键盘", "price": "￥199.00"},
    {"title": " 鼠标 ", "price": "99"},
    {"title": "", "price": "88"},
    {"title": "坏数据", "price": "N/A"},
]


def normalize(row):
    return {
        "title": (row.get("title") or "").strip(),
        "price": (row.get("price") or "").replace("￥", "").replace(",", "").strip(),
    }


def validate(item):
    if not item["title"]:
        return "title 为空"
    try:
        item["price"] = float(item["price"])
    except ValueError:
        return "price 不是数字"
    if item["price"] < min_price:
        return f"price 低于 {min_price}"
    return None


ok, bad = [], []
reasons = Counter()

for row in RAW_ROWS:
    item = normalize(row)
    reason = validate(item)
    if reason:
        bad.append((item, reason))
        reasons[reason] += 1
        if not drop_invalid:
            ok.append(item)
    else:
        ok.append(item)

print(f"输出 {len(ok)} 条，拦截 {len(bad)} 条")
for reason, count in reasons.most_common():
    print(f"  {reason}: {count}")
print("样例:", ok)
`
},

{
  id: "lab-resume", title: "模板三：断点续跑", subtitle: "改页数与故障页，观察 checkpoint 写在处理之后",
  params: [
    { key: "total_pages", label: "总页数", type: "number", value: 4, min: 1, max: 8 },
    { key: "fail_page", label: "模拟失败的页码（0 表示不失败）", type: "number", value: 2, min: 0, max: 8 }
  ],
  setup: RAW`
print("准备就绪：状态文件 state.json 会在运行时创建")
`,
  code: RAW`
import time
from pathlib import Path

p = LAB_PARAMS
total_pages = int(p["total_pages"])
fail_page = int(p["fail_page"])
failed_once = {"done": False}
state_path = Path("state.json")


def fetch_page(page):
    if page > total_pages:
        return []
    if fail_page and page == fail_page and not failed_once["done"]:
        failed_once["done"] = True
        raise TimeoutError("模拟网络超时")
    return list(range((page - 1) * 5, page * 5))


page = 1
seen = set()
total = 0

while True:
    for attempt in range(3):
        try:
            items = fetch_page(page)
            break
        except Exception as exc:
            if attempt == 2:
                raise
            wait = 0.2 * (attempt + 1)
            print(f"page {page} 失败，{wait}s 后重试: {exc}")
            time.sleep(wait)

    if not items:
        print("空页：结束")
        break

    for item in items:
        if item not in seen:
            seen.add(item)
            total += 1

    page += 1
    state_path.write_text(str(page), encoding="utf-8")
    print(f"page {page - 1}: {len(items)} 条，累计 {total}；checkpoint -> {page}")

print("总处理", total)
`
}

];

})();

/* 项目 02 · 日志 ETL
   Nginx access.log → 结构化记录 → 聚合指标 → 异常检测 → Markdown/CSV 报表。 */
window.PROJECTS.push({
  id: "loglab",
  type: "project",
  index: "02",
  title: "日志 ETL",
  subtitle: "从 Nginx access.log 到运营报表",
  summary: "逐行解析访问日志，输出状态码、Top 路径、小时流量，自动检测 5xx 比例与错误路径，最后生成可贴进周报的 Markdown。",
  level: "简历级 · 中级",
  duration: "5–7 小时",
  mode: "browser",
  modeLabel: "浏览器可完整练习",
  accent: "#0b7d76",
  stack: ["Python", "re", "collections", "csv", "argparse"],
  resumeLine: "日志 ETL：流式解析 Nginx access.log，产出状态码 / Top 路径 / 小时流量报表，并自动检测 5xx 比例与错误路径。",
  highlights: [
    "能讲清正则解析、坏行处理与逐行读取的工程取舍",
    "能展示从原始日志到可读报表的完整链路",
    "有异常检测规则，而不是只做“统计总数”",
  ],
  sections: [
    {
      type: "h",
      text: "为什么这个项目有区分度",
    },
    {
      type: "p",
      html: "“读取日志、统计访问量”谁都会写；真正能体现工程能力的是<strong>坏行不崩、内存可控、指标有业务含义、结论能直接使用</strong>。这个项目把一条日志拆成结构化记录，再从记录算出运营真正关心的几个数字。",
    },
    {
      type: "list",
      items: [
        "解析 Nginx combined 格式：IP、时间、方法、路径、状态码、字节数、UA。",
        "坏行返回 None，不抛异常；统计时单独计数。",
        "聚合：请求总数、状态码分布、2xx/3xx/4xx/5xx 分类、Top 5 路径、按小时流量、总字节数。",
        "异常检测：整体 5xx 比例、单小时 5xx 比例、错误路径次数。",
        "输出 Markdown 周报与 CSV，方便二次分析。",
      ],
    },
    {
      type: "table",
      head: ["指标", "业务含义"],
      rows: [
        ["5xx 比例", "服务端错误是否异常升高"],
        ["Top 路径", "哪些页面 / API 承受主要流量"],
        ["小时分布", "流量高峰在什么时间段"],
        ["错误路径", "哪些接口最需要优先修"],
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "流式处理是加分项",
      html: "不要一次性 <code>readlines()</code> 把几 GB 日志读进内存。逐行读取、逐行解析；本项目的异常检测需要保留记录，超大文件可以进一步改成“只累加计数器”的增量版本。面试时这一点很容易被追问。",
    },
    {
      type: "callout",
      tone: "warn",
      title: "不要伪造数据",
      html: "如果没有真实日志，就用自己搭的 Nginx / 本地访问日志，或者明确标注“合成数据”。简历里的数字必须是实测的。",
    },
  ],
  architecture: {
    tree: String.raw`loglab/
├─ loglab.py            # 解析 + 聚合 + 异常检测 + 报表 + CLI
├─ test_loglab.py       # 解析、聚合、异常规则测试
├─ sample_access.log    # 演示日志
├─ README.md
└─ reports/             # 生成的 Markdown / CSV（gitignore）`,
    notes: [
      "解析函数只负责“一行 → 一条记录或 None”，不参与统计。",
      "聚合函数接收记录列表，便于用小样本做单元测试。",
      "CLI 用生成器逐行读取文件；`aggregate` 只输出计数，方便替换成增量聚合版本。",
    ],
  },
  milestones: [
    {
      title: "M1 解析单行日志",
      desc: "用正则提取字段，坏行返回 None；状态码与字节数转成 int。",
      exIds: ["pr2-1"],
    },
    {
      title: "M2 聚合核心指标",
      desc: "状态码分布、Top 路径、小时流量、总字节数。",
      exIds: ["pr2-2"],
    },
    {
      title: "M3 异常检测规则",
      desc: "把“5xx 太多”变成可执行的判断：全局、按小时、按路径。",
      exIds: ["pr2-3"],
    },
    {
      title: "M4 生成 Markdown 与 CSV",
      desc: "把指标变成人能读的周报，同时保留 CSV 方便二次分析。",
      exIds: ["pr2-4"],
    },
  ],
  exercises: [
    {
      id: "pr2-1",
      kind: "code",
      title: "解析 combined 格式日志",
      difficulty: "★★☆",
      prompt:
        "补全 <code>parse_line</code>：成功时返回包含 ip、time、method、path、status（int）、size（int）、ua 的字典；无法匹配或状态码非法时返回 <code>None</code>。字节数为 <code>-</code> 时记为 0。",
      starter: String.raw`import re

LINE_RE = re.compile(
    r'^(?P<ip>\S+) - - \[(?P<time>[^\]]+)\] '
    r'"(?P<method>[A-Z]+) (?P<path>\S+) HTTP/[0-9.]+" '
    r'(?P<status>\d{3}) (?P<size>\d+|-)'
    r'(?: "(?P<referer>[^"]*)" "(?P<ua>[^"]*)")?'
)

def parse_line(line):
    pass

samples = [
    '127.0.0.1 - - [03/Nov/2026:10:00:00 +0800] "GET /index.html HTTP/1.1" 200 1234 "-" "Mozilla/5.0"',
    '10.0.0.8 - - [03/Nov/2026:10:05:00 +0800] "POST /api/pay HTTP/1.1" 500 - "-" "curl/8.0"',
    'this is not a log line',
]
for s in samples:
    print(parse_line(s))`,
      hints: [
        "用 <code>LINE_RE.match(line)</code>，失败返回 None。",
        "<code>size</code> 为 '-' 时转成 0，否则 <code>int()</code>。",
        "UA 可能不存在，用 <code>group(\"ua\") or \"\"</code>。",
      ],
      solution: String.raw`import re

LINE_RE = re.compile(
    r'^(?P<ip>\S+) - - \[(?P<time>[^\]]+)\] '
    r'"(?P<method>[A-Z]+) (?P<path>\S+) HTTP/[0-9.]+" '
    r'(?P<status>\d{3}) (?P<size>\d+|-)'
    r'(?: "(?P<referer>[^"]*)" "(?P<ua>[^"]*)")?'
)

def parse_line(line):
    match = LINE_RE.match(line.strip())
    if not match:
        return None
    data = match.groupdict()
    try:
        status = int(data["status"])
        size = 0 if data["size"] == "-" else int(data["size"])
    except (TypeError, ValueError):
        return None
    return {
        "ip": data["ip"],
        "time": data["time"],
        "method": data["method"],
        "path": data["path"],
        "status": status,
        "size": size,
        "ua": data.get("ua") or "",
    }

samples = [
    '127.0.0.1 - - [03/Nov/2026:10:00:00 +0800] "GET /index.html HTTP/1.1" 200 1234 "-" "Mozilla/5.0"',
    '10.0.0.8 - - [03/Nov/2026:10:05:00 +0800] "POST /api/pay HTTP/1.1" 500 - "-" "curl/8.0"',
    'this is not a log line',
]
for s in samples:
    print(parse_line(s))`,
      check: String.raw`line = '127.0.0.1 - - [03/Nov/2026:10:00:00 +0800] "GET /index.html HTTP/1.1" 200 1234 "-" "Mozilla/5.0"'
rec = parse_line(line)
assert rec["ip"] == "127.0.0.1"
assert rec["method"] == "GET"
assert rec["path"] == "/index.html"
assert rec["status"] == 200 and rec["size"] == 1234
assert "Mozilla/5.0" in rec["ua"]

bad = '10.0.0.8 - - [03/Nov/2026:10:05:00 +0800] "POST /api/pay HTTP/1.1" 200 - "-" "curl/8.0"'
rec2 = parse_line(bad)
assert rec2["size"] == 0 and rec2["status"] == 200
assert parse_line("garbage") is None
assert parse_line("") is None
print("通过：字段、类型与坏行处理都正确")`,
    },
    {
      id: "pr2-2",
      kind: "code",
      title: "聚合：状态码、Top 路径、小时流量",
      difficulty: "★★★",
      prompt:
        "实现 <code>aggregate(records)</code>，返回 total、status_counts、status_classes、top_paths（Top 5，按次数降序、同次数按路径升序）、by_hour、bytes。时间字符串中的小时用正则提取，不依赖 locale。",
      starter: String.raw`import re
from collections import Counter

def hour_of(time_text):
    match = re.search(r":([0-9]{2}):[0-9]{2}:[0-9]{2}", time_text)
    return match.group(1) if match else "unknown"

def aggregate(records):
    pass

records = [
    {"time": "03/Nov/2026:10:00:00 +0800", "path": "/index", "status": 200, "size": 100},
    {"time": "03/Nov/2026:10:05:00 +0800", "path": "/index", "status": 200, "size": 200},
    {"time": "03/Nov/2026:11:00:00 +0800", "path": "/api/pay", "status": 500, "size": 0},
]
print(aggregate(records))`,
      hints: [
        "状态分类用 <code>f\"{status // 100}xx\"</code>。",
        "Top 路径：<code>sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:5]</code>。",
        "只统计能解析出小时的记录；其余归入 unknown。",
      ],
      solution: String.raw`import re
from collections import Counter

def hour_of(time_text):
    match = re.search(r":([0-9]{2}):[0-9]{2}:[0-9]{2}", time_text)
    return match.group(1) if match else "unknown"

def aggregate(records):
    status_counts = Counter()
    status_classes = Counter()
    paths = Counter()
    hours = Counter()
    total_bytes = 0

    for rec in records:
        status = rec["status"]
        status_counts[status] += 1
        status_classes[f"{status // 100}xx"] += 1
        paths[rec["path"]] += 1
        hours[hour_of(rec["time"])] += 1
        total_bytes += rec["size"]

    top_paths = sorted(paths.items(), key=lambda item: (-item[1], item[0]))[:5]
    return {
        "total": len(records),
        "status_counts": dict(status_counts),
        "status_classes": dict(status_classes),
        "top_paths": top_paths,
        "by_hour": dict(sorted(hours.items())),
        "bytes": total_bytes,
    }

records = [
    {"time": "03/Nov/2026:10:00:00 +0800", "path": "/index", "status": 200, "size": 100},
    {"time": "03/Nov/2026:10:05:00 +0800", "path": "/index", "status": 200, "size": 200},
    {"time": "03/Nov/2026:11:00:00 +0800", "path": "/api/pay", "status": 500, "size": 0},
]
print(aggregate(records))`,
      check: String.raw`records = [
    {"time": "03/Nov/2026:10:00:00 +0800", "path": "/index", "status": 200, "size": 100},
    {"time": "03/Nov/2026:10:05:00 +0800", "path": "/index", "status": 200, "size": 200},
    {"time": "03/Nov/2026:10:10:00 +0800", "path": "/missing", "status": 404, "size": 50},
    {"time": "03/Nov/2026:11:00:00 +0800", "path": "/api/pay", "status": 500, "size": 0},
    {"time": "03/Nov/2026:11:10:00 +0800", "path": "/api/pay", "status": 500, "size": 0},
    {"time": "03/Nov/2026:11:20:00 +0800", "path": "/old", "status": 301, "size": 0},
    {"time": "03/Nov/2026:12:00:00 +0800", "path": "/about", "status": 200, "size": 300},
]
result = aggregate(records)
assert result["total"] == 7
assert result["status_counts"] == {200: 3, 404: 1, 500: 2, 301: 1}
assert result["status_classes"] == {"2xx": 3, "4xx": 1, "5xx": 2, "3xx": 1}
assert result["top_paths"][:2] == [("/api/pay", 2), ("/index", 2)]
assert result["by_hour"] == {"10": 3, "11": 3, "12": 1}
assert result["bytes"] == 650
assert aggregate([])["total"] == 0
print("通过：聚合指标、Top 排序与小时分布都正确")`,
    },
    {
      id: "pr2-3",
      kind: "code",
      title: "异常检测：把规则写清楚",
      difficulty: "★★★",
      prompt:
        "实现 <code>detect_anomalies(records, threshold=0.05)</code>：1) 总数 ≥ 10 且整体 5xx 比例超过 threshold，返回 global_5xx；2) 单小时请求数 ≥ 5 且该小时 5xx 比例超过 threshold，返回 hour_5xx；3) 某个路径的 4xx/5xx 次数 ≥ 3，返回 path_error（最多 3 条）。",
      starter: String.raw`import re

def hour_of(time_text):
    match = re.search(r":([0-9]{2}):[0-9]{2}:[0-9]{2}", time_text)
    return match.group(1) if match else "unknown"

def detect_anomalies(records, threshold=0.05):
    pass

records = [
    {"time": "03/Nov/2026:10:00:00 +0800", "path": "/api/pay", "status": 500},
    {"time": "03/Nov/2026:10:01:00 +0800", "path": "/api/pay", "status": 500},
    {"time": "03/Nov/2026:10:02:00 +0800", "path": "/api/pay", "status": 500},
    {"time": "03/Nov/2026:10:03:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:10:04:00 +0800", "path": "/index", "status": 200},
]
print(detect_anomalies(records))`,
      hints: [
        "先算 overall、按小时、按错误路径三组计数，再套规则。",
        "返回结构固定：<code>{\"type\": \"global_5xx\", \"value\": ..., \"threshold\": ...}</code>。",
        "path_error 的 value 用 count，按次数降序、路径升序取前 3。",
      ],
      solution: String.raw`import re
from collections import Counter, defaultdict

def hour_of(time_text):
    match = re.search(r":([0-9]{2}):[0-9]{2}:[0-9]{2}", time_text)
    return match.group(1) if match else "unknown"

def detect_anomalies(records, threshold=0.05):
    if not records:
        return []
    findings = []
    total = len(records)
    five_xx = sum(1 for rec in records if rec["status"] >= 500)
    ratio = five_xx / total
    if total >= 10 and ratio > threshold:
        findings.append({"type": "global_5xx", "value": round(ratio, 3), "threshold": threshold})

    by_hour = defaultdict(list)
    for rec in records:
        by_hour[hour_of(rec["time"])].append(rec)
    for hour, group in sorted(by_hour.items()):
        hour_ratio = sum(1 for rec in group if rec["status"] >= 500) / len(group)
        if len(group) >= 5 and hour_ratio > threshold:
            findings.append({"type": "hour_5xx", "hour": hour, "value": round(hour_ratio, 3)})

    errors = Counter(rec["path"] for rec in records if rec["status"] >= 400)
    for path, count in sorted(errors.items(), key=lambda item: (-item[1], item[0]))[:3]:
        if count >= 3:
            findings.append({"type": "path_error", "path": path, "count": count})
    return findings

records = [
    {"time": "03/Nov/2026:10:00:00 +0800", "path": "/api/pay", "status": 500},
    {"time": "03/Nov/2026:10:01:00 +0800", "path": "/api/pay", "status": 500},
    {"time": "03/Nov/2026:10:02:00 +0800", "path": "/api/pay", "status": 500},
    {"time": "03/Nov/2026:10:03:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:10:04:00 +0800", "path": "/index", "status": 200},
]
print(detect_anomalies(records))`,
      check: String.raw`records = [
    {"time": "03/Nov/2026:10:00:00 +0800", "path": "/api/pay", "status": 500},
    {"time": "03/Nov/2026:10:01:00 +0800", "path": "/api/pay", "status": 500},
    {"time": "03/Nov/2026:10:02:00 +0800", "path": "/api/pay", "status": 404},
    {"time": "03/Nov/2026:10:03:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:10:04:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:11:00:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:11:01:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:11:02:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:11:03:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:11:04:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:12:00:00 +0800", "path": "/index", "status": 200},
    {"time": "03/Nov/2026:12:01:00 +0800", "path": "/index", "status": 200},
]
findings = detect_anomalies(records)
assert [item["type"] for item in findings] == ["global_5xx", "hour_5xx", "path_error"], findings
assert findings[0]["value"] == 0.167
assert findings[1]["hour"] == "10" and findings[1]["value"] == 0.4
assert findings[2]["path"] == "/api/pay" and findings[2]["count"] == 3
clean = [
    {"time": "03/Nov/2026:10:00:00 +0800", "path": "/ok", "status": 200}
    for _ in range(6)
]
assert detect_anomalies(clean) == []
assert detect_anomalies([]) == []
print("通过：全局、小时与路径三类异常规则都正确")`,
    },
    {
      id: "pr2-4",
      kind: "code",
      title: "生成 Markdown 周报与 CSV",
      difficulty: "★★★",
      prompt:
        "实现 <code>render_markdown(summary, findings)</code>：输出以 <code># 访问日志报告</code> 开头的 Markdown，包含总请求、总字节、状态码、Top 路径表格和异常列表。实现 <code>export_csv(records)</code>：输出表头 <code>ip,time,method,path,status,size,ua</code>。",
      starter: String.raw`import csv
import io

def render_markdown(summary, findings):
    pass

def export_csv(records):
    pass

summary = {
    "total": 7,
    "bytes": 650,
    "status_counts": {200: 3, 404: 1, 500: 2, 301: 1},
    "top_paths": [("/api/pay", 2), ("/index", 2), ("/about", 1)],
}
findings = [{"type": "global_5xx", "value": 0.167, "threshold": 0.05}]
print(render_markdown(summary, findings))`,
      hints: [
        "Top 路径用 Markdown 表格：<code>| 路径 | 次数 |</code>。",
        "findings 为空时输出“未发现异常”。",
        "CSV 用 <code>csv.DictWriter</code> 或 <code>writerow</code>，注意字段顺序。",
      ],
      solution: String.raw`import csv
import io

def render_markdown(summary, findings):
    lines = [
        "# 访问日志报告",
        "",
        f"- 总请求：{summary['total']}",
        f"- 总字节：{summary['bytes']}",
        "",
        "## 状态码",
    ]
    for status in sorted(summary["status_counts"]):
        lines.append(f"- {status}: {summary['status_counts'][status]}")
    lines.extend(["", "## Top 路径", "| 路径 | 次数 |", "| --- | --- |"])
    for path, count in summary["top_paths"]:
        lines.append(f"| {path} | {count} |")
    lines.extend(["", "## 异常"])
    if findings:
        for item in findings:
            lines.append(f"- {item}")
    else:
        lines.append("未发现异常")
    return "\n".join(lines)

def export_csv(records):
    out = io.StringIO()
    fields = ["ip", "time", "method", "path", "status", "size", "ua"]
    writer = csv.DictWriter(out, fieldnames=fields, lineterminator="\n")
    writer.writeheader()
    for rec in records:
        writer.writerow({key: rec.get(key, "") for key in fields})
    return out.getvalue()

summary = {
    "total": 7,
    "bytes": 650,
    "status_counts": {200: 3, 404: 1, 500: 2, 301: 1},
    "top_paths": [("/api/pay", 2), ("/index", 2), ("/about", 1)],
}
findings = [{"type": "global_5xx", "value": 0.167, "threshold": 0.05}]
print(render_markdown(summary, findings))`,
      check: String.raw`summary = {
    "total": 7,
    "bytes": 650,
    "status_counts": {200: 3, 404: 1, 500: 2, 301: 1},
    "top_paths": [("/api/pay", 2), ("/index", 2), ("/about", 1)],
}
findings = [{"type": "global_5xx", "value": 0.167, "threshold": 0.05}]
md = render_markdown(summary, findings)
assert md.startswith("# 访问日志报告")
assert "总请求：7" in md
assert "| /api/pay | 2 |" in md
assert "global_5xx" in md
assert "未发现异常" in render_markdown(summary, [])

records = [
    {"ip": "127.0.0.1", "time": "03/Nov/2026:10:00:00 +0800", "method": "GET", "path": "/index", "status": 200, "size": 10, "ua": "curl"},
    {"ip": "10.0.0.2", "time": "03/Nov/2026:11:00:00 +0800", "method": "POST", "path": "/api/pay", "status": 500, "size": 0, "ua": "Mozilla"},
]
csv_text = export_csv(records)
assert csv_text.splitlines()[0] == "ip,time,method,path,status,size,ua"
parsed = list(csv.DictReader(io.StringIO(csv_text)))
assert len(parsed) == 2
assert parsed[1]["status"] == "500"
print("通过：Markdown 结构、空异常提示与 CSV 字段都正确")`,
    },
  ],
  files: [
    {
      name: "loglab.py",
      note: "解析 + 聚合 + 异常检测 + 报表 CLI",
      lang: "python",
      code: String.raw`"""日志 ETL：Nginx access.log → 指标 → 异常 → Markdown / CSV / JSON。

用法：
    python loglab.py report sample_access.log
    python loglab.py report sample_access.log --format csv --output report.csv
    python loglab.py report sample_access.log --threshold 0.03
"""
import argparse
import csv
import io
import json
import re
from collections import Counter, defaultdict

LINE_RE = re.compile(
    r'^(?P<ip>\S+) - - \[(?P<time>[^\]]+)\] '
    r'"(?P<method>[A-Z]+) (?P<path>\S+) HTTP/[0-9.]+" '
    r'(?P<status>\d{3}) (?P<size>\d+|-)'
    r'(?: "(?P<referer>[^"]*)" "(?P<ua>[^"]*)")?'
)
HOUR_RE = re.compile(r":([0-9]{2}):[0-9]{2}:[0-9]{2}")


def parse_line(line):
    match = LINE_RE.match(line.strip())
    if not match:
        return None
    data = match.groupdict()
    try:
        status = int(data["status"])
        size = 0 if data["size"] == "-" else int(data["size"])
    except (TypeError, ValueError):
        return None
    return {
        "ip": data["ip"],
        "time": data["time"],
        "method": data["method"],
        "path": data["path"],
        "status": status,
        "size": size,
        "ua": data.get("ua") or "",
    }


def iter_records(lines):
    for line in lines:
        record = parse_line(line)
        if record:
            yield record


def hour_of(time_text):
    match = HOUR_RE.search(time_text)
    return match.group(1) if match else "unknown"


def aggregate(records):
    status_counts = Counter()
    status_classes = Counter()
    paths = Counter()
    hours = Counter()
    total_bytes = 0

    for rec in records:
        status = rec["status"]
        status_counts[status] += 1
        status_classes[f"{status // 100}xx"] += 1
        paths[rec["path"]] += 1
        hours[hour_of(rec["time"])] += 1
        total_bytes += rec["size"]

    return {
        "total": len(records),
        "status_counts": dict(status_counts),
        "status_classes": dict(status_classes),
        "top_paths": sorted(paths.items(), key=lambda item: (-item[1], item[0]))[:5],
        "by_hour": dict(sorted(hours.items())),
        "bytes": total_bytes,
    }


def detect_anomalies(records, threshold=0.05):
    if not records:
        return []
    findings = []
    total = len(records)
    five_xx = sum(1 for rec in records if rec["status"] >= 500)
    ratio = five_xx / total
    if total >= 10 and ratio > threshold:
        findings.append({"type": "global_5xx", "value": round(ratio, 3), "threshold": threshold})

    by_hour = defaultdict(list)
    for rec in records:
        by_hour[hour_of(rec["time"])].append(rec)
    for hour, group in sorted(by_hour.items()):
        hour_ratio = sum(1 for rec in group if rec["status"] >= 500) / len(group)
        if len(group) >= 5 and hour_ratio > threshold:
            findings.append({"type": "hour_5xx", "hour": hour, "value": round(hour_ratio, 3)})

    errors = Counter(rec["path"] for rec in records if rec["status"] >= 400)
    for path, count in sorted(errors.items(), key=lambda item: (-item[1], item[0]))[:3]:
        if count >= 3:
            findings.append({"type": "path_error", "path": path, "count": count})
    return findings


def render_markdown(summary, findings):
    lines = [
        "# 访问日志报告",
        "",
        f"- 总请求：{summary['total']}",
        f"- 总字节：{summary['bytes']}",
        "",
        "## 状态码",
    ]
    for status in sorted(summary["status_counts"]):
        lines.append(f"- {status}: {summary['status_counts'][status]}")
    lines.extend(["", "## Top 路径", "| 路径 | 次数 |", "| --- | --- |"])
    for path, count in summary["top_paths"]:
        lines.append(f"| {path} | {count} |")
    lines.extend(["", "## 异常"])
    if findings:
        for item in findings:
            lines.append(f"- {item}")
    else:
        lines.append("未发现异常")
    return "\n".join(lines)


def export_csv(records):
    out = io.StringIO()
    fields = ["ip", "time", "method", "path", "status", "size", "ua"]
    writer = csv.DictWriter(out, fieldnames=fields, lineterminator="\n")
    writer.writeheader()
    for rec in records:
        writer.writerow({key: rec.get(key, "") for key in fields})
    return out.getvalue()


def build_report(records, threshold=0.05):
    summary = aggregate(records)
    findings = detect_anomalies(records, threshold)
    return summary, findings


def main(argv=None):
    parser = argparse.ArgumentParser(description="Nginx 日志 ETL")
    parser.add_argument("file")
    parser.add_argument("--format", choices=["markdown", "csv", "json"], default="markdown")
    parser.add_argument("--output")
    parser.add_argument("--threshold", type=float, default=0.05)
    args = parser.parse_args(argv)

    with open(args.file, encoding="utf-8") as fh:
        records = list(iter_records(fh))
    summary, findings = build_report(records, args.threshold)

    if args.format == "markdown":
        text = render_markdown(summary, findings)
    elif args.format == "csv":
        text = export_csv(records)
    else:
        text = json.dumps({"summary": summary, "findings": findings}, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(text)
        print(f"written {args.output}")
    else:
        print(text)


if __name__ == "__main__":
    main()
`,
    },
    {
      name: "test_loglab.py",
      note: "解析、聚合、异常规则测试",
      lang: "python",
      code: String.raw`import unittest

from loglab import aggregate, detect_anomalies, parse_line, render_markdown


class LogLabTest(unittest.TestCase):
    def test_parse(self):
        rec = parse_line(
            '127.0.0.1 - - [03/Nov/2026:10:00:00 +0800] "GET /index HTTP/1.1" 200 123 "-" "curl"'
        )
        self.assertEqual(rec["status"], 200)
        self.assertEqual(rec["size"], 123)
        self.assertIsNone(parse_line("garbage"))

    def test_aggregate(self):
        records = [
            {"time": "03/Nov/2026:10:00:00 +0800", "path": "/a", "status": 200, "size": 10},
            {"time": "03/Nov/2026:10:01:00 +0800", "path": "/a", "status": 500, "size": 0},
            {"time": "03/Nov/2026:11:00:00 +0800", "path": "/b", "status": 404, "size": 5},
        ]
        result = aggregate(records)
        self.assertEqual(result["total"], 3)
        self.assertEqual(result["status_classes"], {"2xx": 1, "5xx": 1, "4xx": 1})
        self.assertEqual(result["top_paths"][0], ("/a", 2))

    def test_anomaly(self):
        records = [
            {"time": "03/Nov/2026:10:00:00 +0800", "path": "/pay", "status": 500}
            for _ in range(3)
        ]
        records += [
            {"time": "03/Nov/2026:10:00:00 +0800", "path": "/index", "status": 200}
            for _ in range(2)
        ]
        findings = detect_anomalies(records)
        self.assertEqual([f["type"] for f in findings], ["hour_5xx", "path_error"])

    def test_markdown(self):
        summary = {"total": 2, "bytes": 10, "status_counts": {200: 2}, "top_paths": [("/", 2)]}
        text = render_markdown(summary, [])
        self.assertTrue(text.startswith("# 访问日志报告"))
        self.assertIn("未发现异常", text)


if __name__ == "__main__":
    unittest.main()
`,
    },
    {
      name: "sample_access.log",
      note: "演示日志（可直接下载）",
      lang: "text",
      plain: true,
      code: String.raw`127.0.0.1 - - [03/Nov/2026:10:00:00 +0800] "GET /index.html HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
10.0.0.8 - - [03/Nov/2026:10:05:00 +0800] "POST /api/pay HTTP/1.1" 500 - "-" "curl/8.0"
10.0.0.9 - - [03/Nov/2026:10:10:00 +0800] "GET /missing HTTP/1.1" 404 120 "-" "Mozilla/5.0"
10.0.0.8 - - [03/Nov/2026:11:00:00 +0800] "POST /api/pay HTTP/1.1" 500 - "-" "curl/8.0"
10.0.0.7 - - [03/Nov/2026:11:10:00 +0800] "GET /index.html HTTP/1.1" 200 900 "-" "Mozilla/5.0"
10.0.0.6 - - [03/Nov/2026:11:20:00 +0800] "GET /old HTTP/1.1" 301 0 "-" "Mozilla/5.0"
10.0.0.5 - - [03/Nov/2026:12:00:00 +0800] "GET /about HTTP/1.1" 200 700 "-" "Mozilla/5.0"
10.0.0.4 - - [03/Nov/2026:12:10:00 +0800] "POST /api/pay HTTP/1.1" 500 - "-" "curl/8.0"
10.0.0.3 - - [03/Nov/2026:12:20:00 +0800] "GET /index.html HTTP/1.1" 200 800 "-" "Mozilla/5.0"
bad line without fields
`,
    },
    {
      name: "README.md",
      note: "运行说明",
      lang: "markdown",
      plain: true,
      code: String.raw`# Nginx 日志 ETL

    python loglab.py report sample_access.log
    python loglab.py report sample_access.log --format csv --output report.csv
    python loglab.py report sample_access.log --format json --threshold 0.03

## 输出

- Markdown：适合贴进周报
- CSV：适合导入表格做二次分析
- JSON：适合接入其他服务

## 异常规则

- 总请求 >= 10 且 5xx 比例 > threshold
- 单小时请求 >= 5 且该小时 5xx 比例 > threshold
- 单路径 4xx/5xx >= 3 次

## 测试

    python -m unittest -v
`,
    },
  ],
  localSetup: [
    "python -m venv .venv",
    "# Windows: .venv\\Scripts\\activate",
    "python loglab.py report sample_access.log",
    "python loglab.py report sample_access.log --format csv --output reports/report.csv",
    "python -m unittest -v",
  ],
  localNotes: [
    "没有任何第三方依赖。真实日志可能很大，CLI 已按行读取；不要把 `records` 全量留在内存里。",
    "如果日志格式不同，只改 `LINE_RE`，其他函数不需要动。",
    "截图建议：Markdown 报表 + 一条异常结论。",
  ],
  resume: {
    keywords: ["Python", "ETL", "正则", "日志分析", "异常检测", "CLI"],
    bullets: [
      "实现 Nginx 日志 ETL：逐行解析 combined 格式，坏行安全跳过，聚合状态码、Top 路径与小时流量；从未清洗的文本直接产出可读报表。",
      "设计三类异常规则（整体 5xx、单小时 5xx、错误路径），把人工排查变成自动报告。",
      "输出 Markdown / CSV / JSON 三种格式，支持直接贴进周报或接入二次分析；配套 unittest 覆盖解析、聚合与规则边界。",
    ],
  },
  extensions: [
    "按 IP / UA 维度补充统计，识别爬虫与异常来源。",
    "支持 gzip 日志与多文件滚动日志（按天合并）。",
    "接入 SQLite：把解析结果落库，再做 SQL 查询与历史对比。",
    "把异常检测换成滑动窗口 / 同比环比，避免固定阈值误报。",
    "用 FastAPI 暴露 `/metrics`，做成一个可查询的日志看板。",
  ],
  refs: [
    {
      name: "scrapy/scrapy",
      url: "https://github.com/scrapy/scrapy",
      why: "大型 Python 项目如何组织日志、配置与管道；读源码能学到工程结构。",
    },
    {
      name: "practical-tutorials/project-based-learning",
      url: "https://github.com/practical-tutorials/project-based-learning",
      why: "数据处理与日志分析方向的更多项目式教程。",
    },
    {
      name: "Python 官方文档：re",
      url: "https://docs.python.org/zh-cn/3/library/re.html",
      why: "正则分组、命名组的权威说明，解析日志前建议先过一遍。",
    },
  ],
});

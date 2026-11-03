/* 脚本拆解数据：6 个完整脚本 + 逻辑教学 */
(function () {
const RAW = String.raw;

window.SCRIPTS = [

{
  id: "s1", no: "01", cat: "文件", level: "基础",
  title: "批量重命名：先计划，再动手",
  subtitle: "同样是改名，为什么别人的脚本敢跑 300 个文件",
  time: "25 分钟",
  tags: ["dry-run", "计划与执行分离", "冲突预检"],
  scene: "你下载了 300 张图片，文件名全是哈希串。想统一改成 cover_001.jpg，但写了个循环边遍历边改名，跑到一半编号全乱了，还覆盖了两个文件。",
  requirements: [
    "只处理当前目录下的文件，忽略子目录",
    "按文件名排序后编号，保证每次运行顺序一致",
    "目标重名时提前失败，不能改到一半才报错",
    "默认只预览，加 --apply 才真正执行"
  ],
  flow: [
    { title: "扫描", body: "收集所有文件路径，不排序就编号，结果会随文件系统变化。" },
    { title: "排序", body: "按 name 排序，得到稳定顺序，这是可重复执行的前提。" },
    { title: "生成计划", body: "算出每个 src → dst 的映射，先不碰磁盘。" },
    { title: "冲突预检", body: "目标名放进 set，发现重复立即退出，避免半途损坏。" },
    { title: "预览 / 执行", body: "默认打印计划；--apply 才执行 rename。" }
  ],
  code: RAW`
from pathlib import Path
import argparse


def build_plan(folder: Path, prefix: str):
    """纯函数：只生成计划，不修改磁盘。"""
    files = sorted(p for p in folder.iterdir() if p.is_file())
    plan, targets = [], set()
    for i, src in enumerate(files, 1):
        dst = folder / f"{prefix}_{i:03d}{src.suffix.lower()}"
        if dst.name in targets:
            raise SystemExit(f"目标重名，已中止: {dst.name}")
        targets.add(dst.name)
        plan.append((src, dst))
    return plan


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", type=Path)
    ap.add_argument("--prefix", default="item")
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    plan = build_plan(args.folder, args.prefix)
    for src, dst in plan:
        print(f"{src.name}  ->  {dst.name}")

    if not args.apply:
        print(f"[dry-run] 共 {len(plan)} 个文件；确认后加 --apply 执行")
        return

    for src, dst in plan:
        src.rename(dst)
    print(f"完成：重命名 {len(plan)} 个文件")


if __name__ == "__main__":
    main()
`,
  walkthrough: [
    { title: "build_plan 是纯函数", body: "输入目录和前缀，输出映射列表。它不读网络、不写磁盘，所以可以单独测试：造 3 个文件，断言计划长度与顺序。" },
    { title: "默认 dry-run", body: "危险操作默认不执行。这不是「多此一举」，而是让脚本可以被放心地跑一遍、看一遍。" },
    { title: "冲突预检", body: "目标名集合在真正 rename 之前建立。否则改到第 200 个才发现重名，前 199 个已经改完，回滚很麻烦。" },
    { title: "排序决定可重复性", body: "sorted 让编号稳定。用 os.listdir 的原始顺序，换台机器或换个文件系统，结果就可能不同。" }
  ],
  wrong: [
    { title: "边遍历边改名", body: "在同一个目录里边遍历边 rename，可能把刚改好的文件再次扫进来，编号错乱甚至死循环。正确做法是先收集、再执行。" },
    { title: "直接 rename 不检查目标", body: "Windows 上 rename 到已存在的文件会报错，Linux 上可能直接覆盖。重名预检是跨平台的安全线。" }
  ],
  reuse: ["危险脚本默认 dry-run", "计划与执行分成两个函数", "先排序再编号"],
  tip: "判断一个脚本是否「专业」，先看它失败时会不会留下半成品。计划/执行分离就是为了这一点。"
},

{
  id: "s2", no: "02", cat: "数据", level: "进阶",
  title: "CSV 清洗：一条坏数据不该毁掉整批",
  subtitle: "把「读 → 规范化 → 校验 → 分流」拆成可测试的流水线",
  time: "30 分钟",
  tags: ["流式处理", "错误分流", "规范化与校验分离"],
  scene: "后台导出的商品 CSV 有全角空格、千分位逗号、货币符号，还有空标题和负价格。你直接 float() 入库，第 3 行就抛异常，后面 10 万行全没处理。",
  requirements: [
    "逐行处理，不把整个文件读进内存",
    "合法行写入 clean.csv，非法行写入 reject.csv 并带上原因",
    "空标题、非数字价格、负价格、非法 URL 都要拦截",
    "兼容 Excel 导出的 BOM 与不同列顺序"
  ],
  flow: [
    { title: "打开", body: "用 utf-8-sig 读，兼容 Excel 的 BOM；用 newline='' 写，避免空行。" },
    { title: "规范化", body: "去空格、去货币符号、去千分位，只改格式，不做业务判断。" },
    { title: "校验", body: "标题非空、价格可转 float 且非负、URL 以 http 开头。" },
    { title: "分流", body: "合法写 good，非法写 bad 并附带 reason，继续下一行。" },
    { title: "汇总", body: "返回成功/失败计数，调用方据此决定退出码。" }
  ],
  code: RAW`
from __future__ import annotations

import csv
from pathlib import Path


def normalize(row: dict) -> dict:
    """只做格式统一，不做业务判断。"""
    return {
        "title": (row.get("title") or "").strip(),
        "price": (row.get("price") or "").replace(",", "").replace("￥", "").strip(),
        "url": (row.get("url") or "").strip(),
    }


def validate(item: dict) -> str | None:
    """返回失败原因；合法返回 None。"""
    if not item["title"]:
        return "title 为空"
    try:
        item["price"] = float(item["price"])
    except ValueError:
        return "price 不是数字"
    if item["price"] < 0:
        return "price 为负"
    if not item["url"].startswith(("http://", "https://")):
        return "url 非法"
    return None


def clean(src, good_path, bad_path):
    ok = bad = 0
    fields = ["title", "price", "url"]

    with open(src, encoding="utf-8-sig", newline="") as fin, \
         open(good_path, "w", encoding="utf-8-sig", newline="") as fgood, \
         open(bad_path, "w", encoding="utf-8-sig", newline="") as fbad:

        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fgood, fieldnames=fields)
        reject = csv.DictWriter(fbad, fieldnames=fields + ["reason"])
        writer.writeheader()
        reject.writeheader()

        for row in reader:
            item = normalize(row)
            reason = validate(item)
            if reason:
                item["reason"] = reason
                reject.writerow(item)
                bad += 1
            else:
                writer.writerow(item)
                ok += 1

    return ok, bad


if __name__ == "__main__":
    good, bad = clean("raw.csv", "clean.csv", "reject.csv")
    print(f"成功 {good} 条，失败 {bad} 条")
`,
  walkthrough: [
    { title: "normalize 与 validate 分开", body: "格式统一和数据规则是两类变化：网站改了货币符号，只改 normalize；业务要求价格上限，只改 validate。测试也能各自独立。" },
    { title: "坏行返回原因，而不是抛异常", body: "一行坏数据不应该中断整个文件。把失败收集到 reject.csv，跑完后你能看到「哪类错误最多」。" },
    { title: "DictReader 而不是下标", body: "列顺序变化、多一列少一列都不会让下标错位。字段名是契约，下标只是位置。" },
    { title: "utf-8-sig 的意义", body: "Excel 打开 UTF-8 CSV 中文会乱码；带 BOM 可以解决。读的时候也要兼容 BOM，否则第一列字段名会带一个看不见的字符。" }
  ],
  wrong: [
    { title: "readlines 后再处理", body: "10 万行也许还能撑，100 万行直接把内存打满。逐行迭代是这类脚本的默认姿势。" },
    { title: "校验失败就 raise", body: "这不是「严格」，是把一条脏数据放大成整批失败。正确做法是分流 + 汇总。" }
  ],
  reuse: ["规范化与校验分离", "错误分流到独立文件", "流式读写 + 计数摘要"],
  tip: "数据脚本的核心不是「转换」，而是「决定坏数据去哪」。能解释每一条失败原因，才算可控。"
},

{
  id: "s3", no: "03", cat: "网络", level: "挑战",
  title: "API 分页抓取：终止条件、重试与断点",
  subtitle: "循环写错，通常不是语法问题，是「什么时候停」没想清",
  time: "35 分钟",
  tags: ["终止条件", "局部重试", "checkpoint"],
  scene: "接口每页 20 条，返回空数组表示结束。网络偶尔超时，你写了 while page < total 循环，结果数据更新后漏抓；跑到一半断了，又得从第 1 页重来。",
  requirements: [
    "唯一终止条件：本页返回空",
    "每页最多重试 3 次，指数退避",
    "每页处理成功后写 checkpoint，重启从下一页继续",
    "进程内按 id 去重，重复条目不重复处理"
  ],
  flow: [
    { title: "读状态", body: "有 checkpoint 就从 next_page 开始，没有就从第 1 页。" },
    { title: "取一页", body: "只把「取这一页」放进重试，失败不影响其他页。" },
    { title: "判空", body: "空列表立即 break；不要依赖 total 字段。" },
    { title: "处理", body: "去重、解析、落盘，全部完成后再推进页码。" },
    { title: "记账", body: "写 next_page 到状态文件；断电最多丢当前页。" }
  ],
  code: RAW`
import json
import time
from pathlib import Path


def fetch_page(page: int, retries: int = 2):
    """示例实现：真实项目替换成你的 API 请求。"""
    if page > 5:
        return []
    return [{"id": (page - 1) * 20 + i} for i in range(20)]


def load_next_page(path: Path) -> int:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))["next_page"]
    return 1


def save_next_page(path: Path, page: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps({"next_page": page}, ensure_ascii=False),
        encoding="utf-8",
    )


def crawl(state_path="state/pages.json"):
    state = Path(state_path)
    page = load_next_page(state)
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
                wait = 2 ** attempt
                print(f"page {page} 失败，{wait}s 后重试: {exc}")
                time.sleep(wait)

        if not items:          # 唯一终止条件
            print("没有更多数据，结束")
            break

        for item in items:
            if item["id"] in seen:
                continue
            seen.add(item["id"])
            total += 1
            # 真实项目在这里解析并写入 JSONL / 数据库

        page += 1
        save_next_page(state, page)   # 处理完成后再记账
        print(f"page {page - 1}: {len(items)} 条，累计 {total}")

    return total


if __name__ == "__main__":
    print("总计", crawl())
`,
  walkthrough: [
    { title: "终止条件只能有一个", body: "空页 = 没有数据。用 total / total_pages 做条件，接口一变就会漏抓或多抓，而且很难复现。" },
    { title: "重试只包住一页", body: "如果把整个 while 包进 try，一页失败会从第 1 页重跑，重复处理和重复写入都来了。" },
    { title: "checkpoint 写在后、不在前", body: "处理完成再写 next_page。写在前面，重启后会直接跳过还没处理的那一页。" },
    { title: "seen 只解决进程内重复", body: "跨进程去重要落盘：SQLite 唯一索引、或在 JSONL 里维护已见 id。否则重启后仍会重复。" }
  ],
  wrong: [
    { title: "while page < total_pages", body: "total_pages 来自第一页响应，数据增长后它不再准确；终止条件应该来自「当前页是否为空」。" },
    { title: "sleep 放在成功路径", body: "限速应该发生在每次请求前，而不是失败后。成功时全速、失败时退避，才是可控节奏。" }
  ],
  reuse: ["单一终止条件", "局部重试 + 指数退避", "checkpoint 时机"],
  tip: "循环脚本先写三行伪代码：从哪开始、什么时候停、失败了记什么。这三行想清楚，代码就不会绕。"
},

{
  id: "s4", no: "04", cat: "数据", level: "进阶",
  title: "日志统计：把 2GB 文本压成一张报表",
  subtitle: "流式读取 + 命名分组 + Counter，三件套解决 90% 的日志分析",
  time: "25 分钟",
  tags: ["流式", "命名分组", "Counter"],
  scene: "线上日志 2GB，你想知道 ERROR 类型 Top5、每小时请求量，还有多少行格式已经坏了。用 split() 切空格，message 里的空格把字段全打乱。",
  requirements: [
    "逐行读取，内存占用恒定",
    "用命名分组解析 date/time/level/message",
    "统计各 level 数量、ERROR 类型 Top5、无法解析行数",
    "解析失败不中断，最后一起报告"
  ],
  flow: [
    { title: "预编译", body: "模块级 re.compile，循环里只 match，不要每次重新解析模式串。" },
    { title: "逐行解析", body: "match 成功取 groupdict，失败只计数。" },
    { title: "聚合", body: "Counter 统计 level；ERROR 消息再切词统计类型。" },
    { title: "输出", body: "打印总量、坏行数、TopN，必要时写 CSV。" }
  ],
  code: RAW`
import re
from collections import Counter

LOG_RE = re.compile(
    r"(?P<date>\d{4}-\d{2}-\d{2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\s+"
    r"(?P<level>INFO|WARNING|ERROR)\s+"
    r"(?P<message>.*)"
)


def analyze(path):
    levels = Counter()
    error_types = Counter()
    bad_lines = 0
    total = 0

    with open(path, encoding="utf-8", errors="replace") as f:
        for line in f:
            total += 1
            m = LOG_RE.match(line.strip())
            if not m:
                bad_lines += 1
                continue
            record = m.groupdict()
            levels[record["level"]] += 1
            if record["level"] == "ERROR":
                first_word = record["message"].split()[0] if record["message"] else "unknown"
                error_types[first_word] += 1

    return {
        "total": total,
        "bad_lines": bad_lines,
        "levels": levels,
        "top_errors": error_types.most_common(5),
    }


if __name__ == "__main__":
    report = analyze("app.log")
    print("总行数", report["total"], "坏行", report["bad_lines"])
    print("级别分布", dict(report["levels"]))
    for name, count in report["top_errors"]:
        print(f"ERROR {name}: {count}")
`,
  walkthrough: [
    { title: "命名分组是自文档", body: "groupdict() 直接给字段名。以后日志加一个字段，只改正则，不用记住「第 3 组是 level 还是 message」。" },
    { title: "坏行要计数，不要静默跳过", body: "格式变化时，bad_lines 会突然上涨。这是最早的预警信号，比「报表为空」更早。" },
    { title: "Counter 比手写字典干净", body: "计数、TopN、合并都用标准库。手写 d[k] = d.get(k, 0) + 1 不是错，只是没必要。" },
    { title: "errors='replace' 的取舍", body: "日志编码可能混杂；严格模式会中断，replace 能跑完但可能失真。至少要把替换次数记录下来。" }
  ],
  wrong: [
    { title: "split() 解析日志", body: "message 里有空格，字段就会错位。正则命名分组才能稳定处理不定长内容。" },
    { title: "findall 读完整个文件", body: "2GB 文本会生成同等规模的列表，内存直接爆。逐行迭代是唯一稳妥的方式。" }
  ],
  reuse: ["预编译正则", "命名分组", "坏行计数 + TopN 报表"],
  tip: "日志分析脚本的产出不是「一堆 print」，而是一张能回答问题的表：总量、分布、异常、TopN。"
},

{
  id: "s5", no: "05", cat: "文件", level: "挑战",
  title: "目录去重：先按大小筛，再算哈希",
  subtitle: "几十 GB 照片不敢删？用分层过滤把 IO 降到十分之一",
  time: "35 分钟",
  tags: ["分层过滤", "哈希", "保守删除"],
  scene: "几个备份目录混在一起，重复照片占了几十 GB。你想直接按内容哈希去重，结果几百 GB 全读一遍，跑了三个小时还没完。",
  requirements: [
    "先按文件大小分组，大小唯一的直接跳过",
    "只对同大小文件计算哈希",
    "保留最早修改的那一份",
    "重复文件移动到 _duplicates/，不直接删除",
    "支持 dry-run 预览"
  ],
  flow: [
    { title: "扫描", body: "递归收集文件，记录 size、mtime、path。" },
    { title: "按大小分组", body: "只有同 size 的文件才可能重复，其他直接排除。" },
    { title: "组内哈希", body: "分块读取计算 sha256，避免大文件一次性进内存。" },
    { title: "决策", body: "同哈希组里按 mtime 保留最早一份，其余标记为重复。" },
    { title: "移动", body: "移动到 _duplicates/，保留相对路径，避免同名覆盖。" }
  ],
  code: RAW`
import hashlib
import shutil
from collections import defaultdict
from pathlib import Path


def file_hash(path: Path, chunk_size=1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            h.update(chunk)
    return h.hexdigest()


def find_duplicates(root: Path):
    by_size = defaultdict(list)
    for p in root.rglob("*"):
        if p.is_file():
            by_size[p.stat().st_size].append(p)

    duplicates = []
    for size, files in by_size.items():
        if len(files) < 2:
            continue
        by_hash = defaultdict(list)
        for f in files:
            by_hash[file_hash(f)].append(f)
        for group in by_hash.values():
            if len(group) < 2:
                continue
            group.sort(key=lambda p: p.stat().st_mtime)
            keep, *rest = group
            for dup in rest:
                duplicates.append((dup, keep))
    return duplicates


def quarantine(root: Path, duplicates, apply=False):
    for dup, keep in duplicates:
        rel = dup.relative_to(root)
        target = root / "_duplicates" / rel
        print(f"{dup}  ==  {keep}")
        if apply:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(dup), str(target))


if __name__ == "__main__":
    duplicates = find_duplicates(Path("photos"))
    quarantine(Path("photos"), duplicates, apply=False)
    print(f"发现 {len(duplicates)} 个重复文件；确认后把 apply 改为 True")
`,
  walkthrough: [
    { title: "分层的意义", body: "大部分文件大小唯一，根本不可能是重复。先按 size 分组，能把需要哈希的文件数量降一个数量级。" },
    { title: "分块哈希", body: "一次 read() 整个文件在几 GB 文件上会吃掉内存。按 1MB 分块，内存恒定。" },
    { title: "保留策略必须明确", body: "「保留最早修改」是规则，不是感觉。没有规则，每次运行留下的文件可能不同。" },
    { title: "移动而不是删除", body: "哈希碰撞概率极低，但逻辑错误并不罕见。移到 _duplicates/ 让误判可恢复。" }
  ],
  wrong: [
    { title: "全量哈希", body: "对所有文件直接哈希，等于把几十 GB 全读一遍。分层过滤是这类脚本的第一原则。" },
    { title: "直接 unlink", body: "删除不可逆。先去重到隔离目录，确认无误后再手动清空。" }
  ],
  reuse: ["分层过滤（大小 → 哈希）", "保守删除/隔离", "明确的保留策略"],
  tip: "处理不可逆操作时，把「删除」换成「移动到隔离区」。这不是胆小，是给未来的自己留退路。"
},

{
  id: "s6", no: "06", cat: "文件", level: "挑战",
  title: "增量同步：跑第二遍应该什么都不做",
  subtitle: "幂等 + manifest，才能让定时任务放心地每天跑",
  time: "40 分钟",
  tags: ["幂等", "manifest", "差异同步"],
  scene: "你写了一个每天全量复制源目录到备份盘的脚本，文件越来越多，跑得越来越慢；源目录删掉的文件，备份盘还一直留着。",
  requirements: [
    "比较 size + mtime，只复制新增或变化的文件",
    "记录 manifest（相对路径 → size/mtime）",
    "目标端多余文件移到 _orphan/，不直接删除",
    "同样输入运行两次，第二次复制数为 0"
  ],
  flow: [
    { title: "扫描", body: "分别收集源和目标的文件快照。" },
    { title: "读 manifest", body: "拿到上次同步状态，用于识别「源已删除」。" },
    { title: "算差异", body: "新增、变化、删除三类，分别处理。" },
    { title: "执行", body: "只复制变化文件；孤儿移到 _orphan/。" },
    { title: "写回", body: "更新 manifest，打印本次统计。" }
  ],
  code: RAW`
import json
import shutil
from pathlib import Path


def snapshot(root: Path):
    return {
        str(p.relative_to(root)): (p.stat().st_size, int(p.stat().st_mtime))
        for p in root.rglob("*") if p.is_file()
    }


def load_manifest(path: Path):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def sync(src: Path, dst: Path, manifest_path: Path, apply=False):
    src_snap = snapshot(src)
    dst_snap = snapshot(dst)
    old = load_manifest(manifest_path)

    added = [k for k in src_snap if k not in dst_snap]
    changed = [
        k for k in src_snap
        if k in dst_snap and src_snap[k] != dst_snap[k]
    ]
    removed = [k for k in old if k not in src_snap]
    orphans = [k for k in dst_snap if k not in src_snap]

    print(f"新增 {len(added)}，变化 {len(changed)}，源删除 {len(removed)}，孤儿 {len(orphans)}")

    if not apply:
        print("[dry-run] 加 --apply 执行")
        return

    for key in added + changed:
        target = dst / key
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src / key, target)

    for key in orphans:
        target = dst / key
        orphan = dst / "_orphan" / key
        orphan.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(target), str(orphan))

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(src_snap, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    sync(Path("source"), Path("backup"), Path("state/manifest.json"), apply=False)
`,
  walkthrough: [
    { title: "幂等是定时任务的生命线", body: "第二次运行应该 0 复制。做不到幂等，定时任务就会反复复制、越来越慢，还可能覆盖正在写入的文件。" },
    { title: "manifest 解决「源删除」", body: "只看两边现状，无法区分「源删了」和「目标新增了」。上次的快照就是判据。" },
    { title: "size + mtime 是廉价近似", body: "大多数场景够用；对内容一致性要求高时，再引入哈希，但只对同大小文件算。" },
    { title: "孤儿进 _orphan，不进回收站", body: "自动删除是危险动作。隔离目录让人可以复核，也保留了恢复路径。" }
  ],
  wrong: [
    { title: "每次 copytree 全量覆盖", body: "文件越多越慢，还会覆盖目标端正在被其他程序读取的文件。增量同步才是日常方案。" },
    { title: "没有 manifest 就删目标多余文件", body: "会把用户在目标端新建的文件当成「多余」删掉。删除决策必须基于上次状态。" }
  ],
  reuse: ["幂等设计", "manifest 记录上次状态", "孤儿隔离而非删除"],
  tip: "定时脚本的验收标准不是「第一次能跑」，而是「连续跑 30 天不出事」。幂等、隔离、状态文件，都是为这个标准服务的。"
},

];

window.SCRIPT_REPOS = [
  {
    name: "geekcomputers / Python",
    desc: "3.5 万星的脚本合集，从文件处理、网络请求到小游戏，适合挑短脚本练习「读一遍再复述」。",
    link: "https://github.com/geekcomputers/Python"
  },
  {
    name: "realpython / python-scripts",
    desc: "Real Python 维护的实用脚本集合，代码短、注释清楚，适合看「一个脚本如何只做一件事」。",
    link: "https://github.com/realpython/python-scripts"
  },
  {
    name: "Automate the Boring Stuff",
    desc: "《Python编程快速上手》官方在线版，第 12 章之后全是可落地的自动化脚本，配套代码可运行。",
    link: "https://automatetheboringstuff.com/"
  }
];

})();

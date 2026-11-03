"""模板：流式数据管道（规范化 → 校验 → 好坏分流 → 汇总）

复制这个文件，把 parse / normalize / validate 换成你的规则。
运行：python scripts/template_pipeline.py
"""

from __future__ import annotations

from collections import Counter


RAW_ROWS = [
    {"title": "键盘", "price": "￥199.00"},
    {"title": " 鼠标 ", "price": "99"},
    {"title": "", "price": "88"},
    {"title": "坏数据", "price": "N/A"},
]


def parse(rows):
    """输入层：把外部格式转成统一 dict，逐条产出。"""
    for row in rows:
        yield row


def normalize(row: dict) -> dict:
    """只改格式，不做业务判断。"""
    return {
        "title": (row.get("title") or "").strip(),
        "price": (row.get("price") or "").replace("￥", "").replace(",", "").strip(),
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
    return None


def pipeline(rows):
    """生成器管道：内存里始终只有当前一条。"""
    for row in parse(rows):
        item = normalize(row)
        reason = validate(item)
        if reason:
            yield False, item, reason
        else:
            yield True, item, None


def main() -> int:
    ok, bad = [], []
    reasons = Counter()

    for passed, item, reason in pipeline(RAW_ROWS):
        if passed:
            ok.append(item)
        else:
            bad.append(item)
            reasons[reason] += 1

    print(f"成功 {len(ok)} 条，失败 {len(bad)} 条")
    for reason, count in reasons.most_common():
        print(f"  {reason}: {count}")
    print("样例:", ok[:2])
    return 0 if not bad else 1


if __name__ == "__main__":
    raise SystemExit(main())

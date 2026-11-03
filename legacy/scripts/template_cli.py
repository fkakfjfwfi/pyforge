"""模板：命令行脚本骨架（argparse + dry-run + 退出码）

复制这个文件，改 build_plan 与 execute 两处即可。
运行：python scripts/template_cli.py . --apply
"""

from __future__ import annotations

import argparse
from pathlib import Path


def build_plan(folder: Path) -> list[tuple[Path, Path]]:
    """纯函数：只生成计划，不修改磁盘。"""
    plan = []
    for path in sorted(folder.glob("*")):
        if path.is_file():
            plan.append((path, path.with_suffix(".bak")))
    return plan


def execute(plan: list[tuple[Path, Path]]) -> None:
    """副作用集中在这里，方便回滚与重跑。"""
    for src, dst in plan:
        print(f"{src} -> {dst}")
        # src.rename(dst)


def main() -> int:
    ap = argparse.ArgumentParser(description="脚本模板")
    ap.add_argument("folder", nargs="?", default=".", type=Path)
    ap.add_argument("--apply", action="store_true", help="真正执行（默认 dry-run）")
    args = ap.parse_args()

    if not args.folder.exists():
        print(f"目录不存在: {args.folder}")
        return 2

    plan = build_plan(args.folder)
    if not plan:
        print("没有需要处理的文件")
        return 0

    if not args.apply:
        for src, dst in plan:
            print(f"[dry-run] {src.name} -> {dst.name}")
        print(f"共 {len(plan)} 项，加 --apply 执行")
        return 0

    execute(plan)
    print(f"完成：{len(plan)} 项")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

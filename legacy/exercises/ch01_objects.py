"""第 1 章练习：变量、对象与内存模型

运行：python exercises/ch01_objects.py
"""

from __future__ import annotations

import copy


# ------------------------------------------------------------
# 练习 1：安全合并请求头
# 要求：返回新 dict，extra 覆盖 base，且 base 不被修改。
# ------------------------------------------------------------
def merge_headers(base: dict, extra: dict) -> dict:
    # TODO: 先复制 base，再 update(extra)
    raise NotImplementedError


# ------------------------------------------------------------
# 练习 2：验证浅拷贝的边界
# 要求：返回 (原配置最内层, 浅拷贝最内层, 深拷贝最内层) 的三个 id。
# ------------------------------------------------------------
def copy_ids(config: dict) -> tuple[int, int, int]:
    shallow = copy.copy(config)
    deep = copy.deepcopy(config)
    # TODO: 返回 id(config["a"]["b"]), id(shallow["a"]["b"]), id(deep["a"]["b"])
    raise NotImplementedError


if __name__ == "__main__":
    BASE = {"User-Agent": "PyForge/1.0"}
    merged = merge_headers(BASE, {"Cookie": "sid=abc"})

    assert merged["User-Agent"] == "PyForge/1.0"
    assert merged["Cookie"] == "sid=abc"
    assert "Cookie" not in BASE, "base 被修改了"
    assert merged is not BASE

    config = {"a": {"b": {"c": 1}}}
    origin_id, shallow_id, deep_id = copy_ids(config)
    assert origin_id == shallow_id, "浅拷贝应共享内层对象"
    assert origin_id != deep_id, "深拷贝应重建内层对象"

    print("ch01 全部通过")

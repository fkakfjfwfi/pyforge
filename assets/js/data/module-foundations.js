/* 模块 01 · 基础重塑
   目标：把“会用”变成“说得清”，修补有基础学习者最常见的模糊点。 */
window.CURRICULUM = window.CURRICULUM || { modules: [] };
window.CURRICULUM.modules.push({
  id: "foundations",
  index: "01",
  title: "基础重塑",
  tagline: "把“会用”变成“说得清”",
  description:
    "对象模型、真值规则、参数与作用域、容器与推导式。这四节不追求覆盖面，而是把最容易“好像懂、其实说不清”的地方逐个拆开。",
  accent: "#2458e6",
  lessons: [
    /* ============================================================ 1 */
    {
      id: "objects",
      title: "对象、名字与类型",
      summary:
        "变量不是装东西的盒子，而是贴在对象上的名字。搞清这一点，后面的可变默认参数、深浅拷贝、函数传参都会顺很多。",
      level: "基础重塑",
      minutes: 22,
      objectives: [
        "解释赋值、别名与对象身份的关系",
        "区分可变 / 不可变类型，并预测原地修改的结果",
        "正确选择 == 与 is",
        "用 f-string 完成常用格式化",
      ],
      sections: [
        {
          type: "h",
          text: "变量是名字，不是盒子",
        },
        {
          type: "p",
          html: "执行 <code>a = [1, 2]</code> 时，Python 先创建列表对象，再把名字 <code>a</code> 绑定到它。再写 <code>b = a</code>，只是让 <code>b</code> 指向同一个对象，并没有复制列表。于是通过 <code>b</code> 做的修改，<code>a</code> 也看得见。",
        },
        {
          type: "code",
          file: "alias.py",
          code: String.raw`a = [1, 2, 3]
b = a
b.append(4)

print(a)          # [1, 2, 3, 4]
print(a is b)     # True`,
          output: "[1, 2, 3, 4]  /  True",
        },
        {
          type: "p",
          html: "想得到一份独立的列表，必须显式复制：<code>list(a)</code>、<code>a[:]</code> 或 <code>a.copy()</code>。注意这些方法只做<strong>浅拷贝</strong>——如果元素本身是列表，复制出来的列表里装的仍是同一批子对象。",
        },
        {
          type: "h",
          text: "可变与不可变",
        },
        {
          type: "p",
          html: "不可变对象创建后不能被修改，所有“修改”其实都在创建新对象并重新绑定名字；可变对象可以原地变化，所有指向它的名字都会看到新状态。",
        },
        {
          type: "table",
          head: ["类型", "可变？", "典型操作"],
          rows: [
            ["<code>list</code>", "可变", "<code>append / sort / pop / 切片赋值</code>"],
            ["<code>dict</code>", "可变", "<code>d[k] = v / update / pop</code>"],
            ["<code>set</code>", "可变", "<code>add / discard / |=</code>"],
            ["<code>tuple</code>", "不可变", "只能重新创建"],
            ["<code>str</code>", "不可变", "只能生成新字符串"],
            ["<code>int / float / bool</code>", "不可变", "运算产生新对象"],
          ],
        },
        {
          type: "code",
          file: "immutable.py",
          code: String.raw`s = "py"
t = s
s += "thon"

print(s, t)      # python py
print(s is t)    # False：s 已指向新对象`,
          output: "python py  /  False",
        },
        {
          type: "callout",
          tone: "warn",
          title: "tuple 不是“深度不可变”",
          html: "含可变元素的 tuple 依然不能替换元素，但可以修改其中的列表：<code>t = ([1],); t[0].append(2)</code> 是合法的。判断“能不能改”要看你想改的是容器本身还是内部对象。",
        },
        {
          type: "h",
          text: "== 比值，is 比身份",
        },
        {
          type: "p",
          html: "<code>==</code> 调用对象的 <code>__eq__</code>，比较内容是否相等；<code>is</code> 比较两个名字是否指向同一块对象。判断 <code>None</code> 用 <code>is</code> 是惯例，因为 <code>None</code> 是单例；判断两个列表是否“长得一样”必须用 <code>==</code>。",
        },
        {
          type: "code",
          file: "identity.py",
          code: String.raw`x = [1, 2]
y = [1, 2]
print(x == y)      # True
print(x is y)      # False

n = None
print(n is None)   # True`,
          output: "True  /  False  /  True",
        },
        {
          type: "callout",
          tone: "warn",
          title: "不要用 is 比较小整数或字符串",
          html: "CPython 会缓存 -5 到 256 的整数，部分字符串也会被驻留，导致 <code>is</code> 偶尔返回 True。这属于实现细节，换版本或换写法就可能失效。相等判断永远用 <code>==</code>。",
        },
        {
          type: "h",
          text: "类型转换与 f-string",
        },
        {
          type: "p",
          html: "输入数据几乎总是字符串。转换要显式：<code>int(\"12\")</code> 成功，<code>int(\"12.5\")</code> 会抛 <code>ValueError</code>（要先 <code>float</code> 再 <code>int</code>）。格式化推荐 f-string，能在花括号里直接写表达式和格式说明符。",
        },
        {
          type: "code",
          file: "format.py",
          code: String.raw`count = "12"
total = int(count) + 3
ratio = total / 5

print(f"{total=}, {ratio=:.2f}")
print(f"{'PyForge':*>12}")`,
          output: "total=15, ratio=3.00  /  *****PyForge",
        },
        {
          type: "callout",
          tone: "deep",
          title: "为什么是 len(x) 而不是 x.len()",
          html: "Python 的数据模型把“长度”统一成特殊方法 <code>__len__</code>，内建函数 <code>len()</code> 只是统一入口。这样任何实现了协议的对象都能被同一套语法使用。这是《流畅的 Python》第 1 章的主线，也是理解魔术方法的起点。",
        },
      ],
      exercises: [
        {
          id: "f1-1",
          kind: "code",
          title: "修掉别名副作用",
          difficulty: "★★☆",
          prompt:
            "下面的函数原本想返回“加了新元素的列表”，但它直接修改了传入的列表。改写 <code>add_item</code>，让它返回新列表，且不改变传入的 <code>data</code>。",
          starter: String.raw`data = [1, 2, 3]

def add_item(lst, item):
    lst.append(item)
    return lst

new_data = add_item(data, 4)
print("new_data:", new_data)
print("data:", data)`,
          hints: [
            "不要对 <code>lst</code> 调用 <code>append</code>；用拼接或复制后再追加。",
            "<code>lst + [item]</code> 会创建一个新列表。",
          ],
          solution: String.raw`data = [1, 2, 3]

def add_item(lst, item):
    return lst + [item]

new_data = add_item(data, 4)
print("new_data:", new_data)
print("data:", data)`,
          check: String.raw`assert add_item([1, 2], 3) == [1, 2, 3]
_original = [1, 2]
_result = add_item(_original, 9)
assert _original == [1, 2], "传入的列表不应该被修改"
assert _result == [1, 2, 9]
print("通过：返回新列表，原列表保持不变")`,
        },
        {
          id: "f1-2",
          kind: "code",
          title: "== 与 is 的边界",
          difficulty: "★★☆",
          prompt:
            "实现 <code>compare(a, b)</code>，返回一个二元组：第一项用 <code>==</code> 比较，第二项用 <code>is</code> 比较。观察相同值与同一对象之间的差异。",
          starter: String.raw`def compare(a, b):
    # 返回 (值是否相等, 是否是同一个对象)
    pass

print(compare([1, 2], [1, 2]))
print(compare(None, None))`,
          hints: ["元组写法：<code>return (a == b, a is b)</code>。", "注意题目要求返回 tuple，不是 list。"],
          solution: String.raw`def compare(a, b):
    return (a == b, a is b)

print(compare([1, 2], [1, 2]))
print(compare(None, None))`,
          check: String.raw`assert compare([1, 2], [1, 2]) == (True, False)
assert compare(None, None) == (True, True)
_same = [1]
assert compare(_same, _same) == (True, True)
print("通过：== 比值，is 比身份")`,
        },
        {
          id: "f1-3",
          kind: "code",
          title: "不修改输入的清洗函数",
          difficulty: "★★★",
          prompt:
            "实现 <code>normalize_tags</code>：把标签去掉首尾空格、转小写、去重，并保持第一次出现的顺序。要求返回新列表，不能修改 <code>raw_tags</code>。",
          starter: String.raw`raw_tags = ["Python", "python", "Web", " web ", "Data"]

def normalize_tags(tags):
    pass

print(normalize_tags(raw_tags))
print(raw_tags)`,
          hints: [
            "先用生成器表达式完成 <code>t.strip().lower()</code>。",
            "去重且保序：<code>dict.fromkeys(...)</code> 再 <code>list()</code>。",
            "不要在参数上直接调用 <code>sort</code> 之类会原地修改的方法。",
          ],
          solution: String.raw`raw_tags = ["Python", "python", "Web", " web ", "Data"]

def normalize_tags(tags):
    cleaned = (tag.strip().lower() for tag in tags)
    return list(dict.fromkeys(cleaned))

print(normalize_tags(raw_tags))
print(raw_tags)`,
          check: String.raw`_src = ["Python", "python", "WEB "]
_result = normalize_tags(_src)
assert _result == ["python", "web"], f"结果不对：{_result}"
assert _src == ["Python", "python", "WEB "], "不要修改传入的列表"
assert normalize_tags([]) == []
assert normalize_tags(["A", "a", "B"]) == ["a", "b"]
print("通过：去空格、转小写、保序去重，且输入未被修改")`,
        },
        {
          id: "f1-4",
          kind: "quiz",
          question: "关于 <code>==</code> 与 <code>is</code>，下面哪一句最准确？",
          options: [
            "<code>==</code> 比较对象身份，<code>is</code> 比较值",
            "<code>==</code> 比较值（调用 <code>__eq__</code>），<code>is</code> 判断是否为同一个对象",
            "两者完全等价，可以互换",
            "<code>is</code> 只能用于数字类型",
          ],
          answer: 1,
          explain:
            "<b>B。</b><code>==</code> 走对象的相等协议，<code>is</code> 直接比较身份。两个内容相同的列表 <code>==</code> 为 True、<code>is</code> 为 False；判断 <code>None</code> 时习惯用 <code>is None</code>。注意 <code>is</code> 为 True 时，<code>==</code> 在极端情况下仍可能为 False（例如同一个 <code>nan</code> 对象），所以两者不是等价关系。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 1 章：Python 数据模型",
        "《Python 编程：从入门到实践（第 3 版）》第 3–4 章：变量与列表",
        "Python 官方教程：3.1 节「将 Python 当作计算器使用」",
      ],
    },

    /* ============================================================ 2 */
    {
      id: "control-flow",
      title: "控制流与真值",
      summary:
        "if 不只接受 True/False；for-else 也不是“循环结束后”。这一节把分支、循环与真值规则讲清楚，减少靠试出来的写法。",
      level: "基础重塑",
      minutes: 20,
      objectives: [
        "预测任意对象的布尔值",
        "用 for-else / while-else 表达“没找到”",
        "熟练使用 range、enumerate、zip",
        "理解 and / or 的短路返回值",
      ],
      sections: [
        {
          type: "h",
          text: "真值：一切对象都能被判断",
        },
        {
          type: "p",
          html: "<code>if</code> 后面可以放任何对象，解释器会调用 <code>bool()</code>。空容器、数字 0、<code>None</code> 为假；非空容器、非零数字、非空字符串为真。注意 <code>\"0\"</code> 和 <code>[0]</code> 都是真——判断的是“有没有内容”，不是内容本身。",
        },
        {
          type: "code",
          file: "truthy.py",
          code: String.raw`values = [0, 0.0, "", [], {}, set(), None, "0", [0], -1]
for v in values:
    print(repr(v), "->", bool(v))`,
          output:
            '0 -> False / 0.0 -> False / \'\' -> False / [] -> False / {} -> False / set() -> False / None -> False / \'0\' -> True / [0] -> True / -1 -> True',
        },
        {
          type: "callout",
          tone: "tip",
          title: "空值判断的常见写法",
          html: "判断容器是否为空，直接写 <code>if not items:</code>，比 <code>if len(items) == 0:</code> 更 Pythonic；但如果 <code>items</code> 可能是 <code>None</code>，先写 <code>if items is None</code> 区分“没有值”和“空容器”。",
        },
        {
          type: "h",
          text: "for-else：没有被 break 打断才执行",
        },
        {
          type: "p",
          html: "<code>else</code> 属于循环，不属于 <code>if</code>；只有在循环正常跑完、没有被 <code>break</code> 打断时才执行。它最适合表达“找了一圈，没找到”。",
        },
        {
          type: "code",
          file: "for_else.py",
          code: String.raw`target = 7
nums = [1, 3, 5, 9]

for n in nums:
    if n == target:
        print("找到了")
        break
else:
    print("没找到")`,
          output: "没找到",
        },
        {
          type: "callout",
          tone: "warn",
          title: "别把它当成“循环结束后”",
          html: "只要循环里执行过 <code>break</code>，<code>else</code> 就会被跳过。团队代码里如果读者可能不熟，用标志变量 <code>found = False</code> 换可读性也完全合理。",
        },
        {
          type: "h",
          text: "range / enumerate / zip",
        },
        {
          type: "p",
          html: "<code>range</code> 是右开区间：<code>range(1, 5)</code> 只到 4。<code>enumerate</code> 同时给下标和元素，<code>start</code> 可以改变起始编号。<code>zip</code> 并行遍历多个序列，默认以最短的为准（3.10+ 可用 <code>strict=True</code> 要求等长）。",
        },
        {
          type: "code",
          file: "loops.py",
          code: String.raw`names = ["林", "陈", "周"]
scores = [88, 95, 76]

for i, (name, score) in enumerate(zip(names, scores), start=1):
    print(f"{i}. {name}: {score}")`,
          output: "1. 林: 88 / 2. 陈: 95 / 3. 周: 76",
        },
        {
          type: "h",
          text: "短路求值不是返回布尔值",
        },
        {
          type: "p",
          html: "<code>a and b</code> 返回第一个假值，或最后一个值；<code>a or b</code> 返回第一个真值，或最后一个值。所以 <code>name or \"匿名\"</code> 在 <code>name</code> 为空字符串时也会替换成默认值——这可能不是你想要的。",
        },
        {
          type: "code",
          file: "short_circuit.py",
          code: String.raw`def greet(name=None):
    display = name or "匿名用户"
    return f"你好，{display}"

print(greet())
print(greet(""))
print(greet("小林"))`,
          output: "你好，匿名用户 / 你好，匿名用户 / 你好，小林",
        },
        {
          type: "callout",
          tone: "deep",
          title: "三元表达式也有优先级陷阱",
          html: "<code>x = a if cond else b</code> 可读性好，但不要嵌套三层以上；嵌套时用括号强制分组，或者直接改成 if 语句。",
        },
      ],
      exercises: [
        {
          id: "f2-1",
          kind: "code",
          title: "FizzBuzz，但要求可测试",
          difficulty: "★★☆",
          prompt:
            "实现 <code>fizzbuzz(n)</code>，返回从 1 到 n 的字符串列表：3 的倍数为 <code>Fizz</code>，5 的倍数为 <code>Buzz</code>，同时是 3 和 5 的倍数为 <code>FizzBuzz</code>，其余为数字本身（字符串形式）。",
          starter: String.raw`def fizzbuzz(n):
    result = []
    # 在这里实现
    return result

print(fizzbuzz(15))`,
          hints: [
            "先判断同时是 3 和 5 的倍数，再判断单个条件，顺序不能反。",
            "用 <code>str(i)</code> 把数字放进结果列表。",
          ],
          solution: String.raw`def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result

print(fizzbuzz(15))`,
          check: String.raw`assert fizzbuzz(5) == ["1", "2", "Fizz", "4", "Buzz"]
assert fizzbuzz(15)[14] == "FizzBuzz"
assert fizzbuzz(15)[2] == "Fizz"
assert fizzbuzz(15)[4] == "Buzz"
assert all(isinstance(x, str) for x in fizzbuzz(3))
assert fizzbuzz(0) == []
print("通过：FizzBuzz 顺序与类型都正确")`,
        },
        {
          id: "f2-2",
          kind: "code",
          title: "用 for-else 找第一个负数",
          difficulty: "★★☆",
          prompt:
            "实现 <code>first_negative(nums)</code>：返回第一个负数的下标；如果没有负数，返回 <code>-1</code>。请使用 <code>for ... else</code> 结构。",
          starter: String.raw`def first_negative(nums):
    for i, n in enumerate(nums):
        pass
    else:
        pass

print(first_negative([3, -2, 5]))
print(first_negative([1, 2, 3]))`,
          hints: [
            "在循环体里判断 <code>n &lt; 0</code>，满足就 <code>return i</code>。",
            "return 也会结束循环，所以 <code>else</code> 里直接 <code>return -1</code> 即可。",
          ],
          solution: String.raw`def first_negative(nums):
    for i, n in enumerate(nums):
        if n < 0:
            return i
    else:
        return -1

print(first_negative([3, -2, 5]))
print(first_negative([1, 2, 3]))`,
          check: String.raw`assert first_negative([3, -2, 5]) == 1
assert first_negative([1, 2, 3]) == -1
assert first_negative([-1, 2]) == 0
assert first_negative([]) == -1
print("通过：能找到第一个负数，也能处理空列表")`,
        },
        {
          id: "f2-3",
          kind: "code",
          title: "考拉兹序列的步数",
          difficulty: "★★☆",
          prompt:
            "实现 <code>collatz_steps(n)</code>：偶数除以 2，奇数乘 3 加 1，统计回到 1 需要多少步。用 <code>while</code> 循环完成。",
          starter: String.raw`def collatz_steps(n):
    steps = 0
    # 在这里实现
    return steps

print(collatz_steps(6))
print(collatz_steps(27))`,
          hints: [
            "循环条件写 <code>while n != 1:</code>。",
            "每轮结束前让 <code>steps += 1</code>，记得更新 <code>n</code>。",
          ],
          solution: String.raw`def collatz_steps(n):
    steps = 0
    while n != 1:
        if n % 2 == 0:
            n = n // 2
        else:
            n = 3 * n + 1
        steps += 1
    return steps

print(collatz_steps(6))
print(collatz_steps(27))`,
          check: String.raw`assert collatz_steps(1) == 0
assert collatz_steps(6) == 8
assert collatz_steps(27) == 111
print("通过：6 -> 8 步，27 -> 111 步")`,
        },
        {
          id: "f2-4",
          kind: "quiz",
          question: "下面哪个表达式在 <code>if</code> 中为假？",
          options: ["<code>\"0\"</code>", "<code>[0]</code>", "<code>0.0</code>", "<code>(0,)</code>"],
          answer: 2,
          explain:
            "<b>C。</b>只有数值 0 本身为假。<code>\"0\"</code> 是非空字符串，<code>[0]</code> 是含一个元素的列表，<code>(0,)</code> 是含一个元素的元组，三者都为真。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 2 章：序列构成的数组（真值与切片）",
        "《Python 编程：从入门到实践（第 3 版）》第 5 章：if 语句",
        "Python 官方教程：4. 更多控制流工具",
      ],
    },

    /* ============================================================ 3 */
    {
      id: "functions-basics",
      title: "函数：参数与作用域",
      summary:
        "默认参数在定义时求值、*args 与 **kwargs 的边界、LEGB 查找规则。这三件事几乎决定了你写出的函数是否可复用。",
      level: "基础重塑",
      minutes: 24,
      objectives: [
        "解释并修复可变默认参数陷阱",
        "写出带仅关键字参数的函数",
        "说出 LEGB 查找顺序，知道何时用 nonlocal",
        "把函数当作普通对象传来传去",
      ],
      sections: [
        {
          type: "h",
          text: "默认参数只在定义时求值一次",
        },
        {
          type: "p",
          html: "默认值不是每次调用都重新计算，而是在 <code>def</code> 执行时求值一次，之后挂在函数对象上复用。默认值是可变对象时，上一次调用留下的修改会被下一次调用看见。",
        },
        {
          type: "code",
          file: "default_bug.py",
          code: String.raw`def add_task(task, bucket=[]):
    bucket.append(task)
    return bucket

print(add_task("写测试"))
print(add_task("改 bug"))`,
          output: "['写测试']  /  ['写测试', '改 bug']",
        },
        {
          type: "p",
          html: "标准修法是用 <code>None</code> 作哨兵，在函数体内创建新容器：",
        },
        {
          type: "code",
          file: "default_fix.py",
          code: String.raw`def add_task(task, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(task)
    return bucket

print(add_task("写测试"))
print(add_task("改 bug"))`,
          output: "['写测试']  /  ['改 bug']",
        },
        {
          type: "callout",
          tone: "warn",
          title: "为什么 None 可以，[] 不行",
          html: "<code>None</code> 是不可变单例，每次调用都能安全地拿它当“没有传参”的信号；<code>[]</code> 是一个具体的列表对象，会被所有调用共享。同理适用于 <code>{}</code>、<code>set()</code>。",
        },
        {
          type: "h",
          text: "参数形态：从位置到仅关键字",
        },
        {
          type: "table",
          head: ["写法", "含义", "示例"],
          rows: [
            ["<code>def f(a, b)</code>", "位置或关键字传入", "<code>f(1, 2)</code> / <code>f(b=2, a=1)</code>"],
            ["<code>def f(a, b=3)</code>", "b 可省略，默认 3", "<code>f(1)</code>"],
            ["<code>def f(*args)</code>", "收集多余位置参数为 tuple", "<code>f(1, 2, 3)</code>"],
            ["<code>def f(**kwargs)</code>", "收集多余关键字参数为 dict", "<code>f(x=1, y=2)</code>"],
            ["<code>def f(a, *, b)</code>", "b 必须用关键字传入", "<code>f(1, b=2)</code>"],
            ["<code>def f(a, /, b)</code>", "a 只能用位置传入", "<code>f(1, 2)</code>"],
          ],
        },
        {
          type: "code",
          file: "signature.py",
          code: String.raw`def register(name, /, age, *, city="北京", **extra):
    print(name, age, city, extra)

register("林", 28)
register("林", 28, city="上海", tag="学员")`,
          output: "林 28 北京 {}  /  林 28 上海 {'tag': '学员'}",
        },
        {
          type: "callout",
          tone: "tip",
          title: "什么时候用仅关键字",
          html: "当参数含义不直观、容易被顺序搞错时（如 <code>save(path, overwrite=True)</code>），把布尔开关放在 <code>*</code> 后面，调用处必须写 <code>overwrite=True</code>，可读性立刻提升。",
        },
        {
          type: "h",
          text: "LEGB：名字去哪里找",
        },
        {
          type: "p",
          html: "函数里读取一个名字时，依次查 Local（局部）→ Enclosing（外层函数）→ Global（模块）→ Builtin（内建）。函数内<strong>赋值</strong>默认创建局部变量，不会影响外层；要修改外层函数变量用 <code>nonlocal</code>，要修改模块级变量用 <code>global</code>。",
        },
        {
          type: "code",
          file: "scope.py",
          code: String.raw`count = 0

def bump():
    global count
    count += 1
    return count

print(bump(), bump())`,
          output: "1 2",
        },
        {
          type: "callout",
          tone: "warn",
          title: "global 是最后手段",
          html: "模块级可变状态会让测试互相污染、并发下难以推理。优先把状态放进参数、返回值，或用闭包/类封装。你会在第 6 节看到闭包如何优雅地保存状态。",
        },
        {
          type: "h",
          text: "函数是普通对象",
        },
        {
          type: "p",
          html: "函数可以赋给变量、放进列表和字典、作为参数传给另一个函数。这正是 <code>sorted(key=...)</code>、回调、装饰器的基础。",
        },
        {
          type: "code",
          file: "first_class.py",
          code: String.raw`def double(x):
    return x * 2

def square(x):
    return x ** 2

ops = {"double": double, "square": square}
print(ops["double"](4))
print(sorted([3, 1, 2], key=lambda x: -x))`,
          output: "8  /  [3, 2, 1]",
        },
      ],
      exercises: [
        {
          id: "f3-1",
          kind: "code",
          title: "修复共享的默认列表",
          difficulty: "★★☆",
          prompt:
            "下面的 <code>add_tag</code> 使用了可变默认参数，导致多次调用互相污染。修复它，使每次不传 <code>tags</code> 时都得到干净的新列表。",
          starter: String.raw`def add_tag(tag, tags=[]):
    tags.append(tag)
    return tags

print(add_tag("python"))
print(add_tag("web"))`,
          hints: ["把默认值改成 <code>None</code>。", "函数开头判断 <code>if tags is None: tags = []</code>。"],
          solution: String.raw`def add_tag(tag, tags=None):
    if tags is None:
        tags = []
    tags.append(tag)
    return tags

print(add_tag("python"))
print(add_tag("web"))`,
          check: String.raw`assert add_tag("python") == ["python"]
assert add_tag("web") == ["web"], "默认列表被复用了"
_custom = ["base"]
assert add_tag("extra", _custom) == ["base", "extra"]
assert _custom == ["base", "extra"]
print("通过：默认值不再跨调用共享")`,
        },
        {
          id: "f3-2",
          kind: "code",
          title: "设计一个仅关键字参数",
          difficulty: "★★★",
          prompt:
            "实现 <code>build_profile(name, *, age, city=\"北京\", **extra)</code>：返回包含 <code>name / age / city</code> 以及所有额外键值对的字典。<code>age</code> 必须只能通过关键字传入；位置传入应抛出 <code>TypeError</code>。",
          starter: String.raw`def build_profile(name, *, age, city="北京", **extra):
    # 在这里实现
    pass

print(build_profile("林", age=28, job="工程师"))`,
          hints: [
            "先构造基础字典，再用 <code>dict.update(extra)</code> 合并。",
            "仅关键字参数由 <code>*</code> 语法自动保证，不需要手写检查。",
          ],
          solution: String.raw`def build_profile(name, *, age, city="北京", **extra):
    profile = {"name": name, "age": age, "city": city}
    profile.update(extra)
    return profile

print(build_profile("林", age=28, job="工程师"))`,
          check: String.raw`result = build_profile("林", age=28, job="工程师")
assert result == {"name": "林", "age": 28, "city": "北京", "job": "工程师"}, result
assert build_profile("陈", age=30, city="上海")["city"] == "上海"
try:
    build_profile("周", 25)
except TypeError:
    pass
else:
    raise AssertionError("age 必须是仅关键字参数")
print("通过：签名与合并逻辑都正确")`,
        },
        {
          id: "f3-3",
          kind: "code",
          title: "用闭包保存状态",
          difficulty: "★★★",
          prompt:
            "实现 <code>make_counter(start=0)</code>：返回一个函数，每次调用把计数加一并返回新的值。<code>make_counter()</code> 与 <code>make_counter(10)</code> 得到两个互不影响的计数器。",
          starter: String.raw`def make_counter(start=0):
    # 返回一个计数函数
    pass

c1 = make_counter()
c2 = make_counter(10)
print(c1(), c1(), c1())
print(c2(), c2())`,
          hints: [
            "在 <code>make_counter</code> 内部定义 <code>count = start</code> 和 <code>def next_value():</code>。",
            "内部函数修改 count 需要 <code>nonlocal count</code>。",
            "返回内部函数本身，不要返回调用结果。",
          ],
          solution: String.raw`def make_counter(start=0):
    count = start
    def next_value():
        nonlocal count
        count += 1
        return count
    return next_value

c1 = make_counter()
c2 = make_counter(10)
print(c1(), c1(), c1())
print(c2(), c2())`,
          check: String.raw`c1 = make_counter()
assert [c1(), c1(), c1()] == [1, 2, 3]
c2 = make_counter(10)
assert c2() == 11
assert c1() == 4, "两个计数器不应共享状态"
assert make_counter(5)() == 6
print("通过：每个计数器都有独立状态")`,
        },
        {
          id: "f3-4",
          kind: "quiz",
          question: "关于默认参数，哪一句是正确的？",
          options: [
            "默认值在每次调用时重新求值",
            "默认值只在函数定义时求值一次",
            "默认值不能是 <code>None</code>",
            "默认值必须写成关键字参数",
          ],
          answer: 1,
          explain:
            "<b>B。</b>默认值在 <code>def</code> 执行时求值一次，并保存在函数对象上。这也是可变默认参数会跨调用共享的根本原因。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 5 章：一等函数",
        "《Python 工匠》第 1 章：最佳实践（参数设计）",
        "《Effective Python（第 3 版）》条目 32–35：函数参数设计",
      ],
    },

    /* ============================================================ 4 */
    {
      id: "containers",
      title: "容器与推导式",
      summary:
        "列表、元组、字典、集合各自擅长什么？切片会不会改原对象？推导式什么时候该停手？这一节把最常用的数据结构用顺手。",
      level: "基础重塑",
      minutes: 26,
      objectives: [
        "按查找 / 顺序 / 可变性选择容器",
        "正确使用切片与浅拷贝",
        "写出列表、字典、集合推导式",
        "用 key 函数完成多条件排序",
      ],
      sections: [
        {
          type: "h",
          text: "先选容器，再谈写法",
        },
        {
          type: "table",
          head: ["容器", "有序", "可变", "查找复杂度", "典型用途"],
          rows: [
            ["<code>list</code>", "是", "是", "O(n)", "顺序保存、允许重复"],
            ["<code>tuple</code>", "是", "否", "O(n)", "固定结构、可作字典键"],
            ["<code>dict</code>", "是（插入序）", "是", "O(1) 平均", "键值映射、计数、分组"],
            ["<code>set</code>", "否", "是", "O(1) 平均", "去重、成员判断、集合运算"],
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "用 set 做成员判断",
          html: "在列表里反复写 <code>if x in items</code> 是 O(n)；把 <code>items</code> 换成 <code>set(items)</code> 后平均 O(1)。数据量大时这是最便宜的优化之一。",
        },
        {
          type: "h",
          text: "切片产生新对象",
        },
        {
          type: "p",
          html: "<code>nums[1:4]</code> 返回新列表，不会影响 <code>nums</code>。切片还支持步长和负数下标；<code>nums[::-1]</code> 是最常用的反转写法。切片赋值则不同，它会原地替换原列表的一段，甚至可以改变长度。",
        },
        {
          type: "code",
          file: "slice.py",
          code: String.raw`nums = [0, 1, 2, 3, 4, 5]
print(nums[1:4])        # [1, 2, 3]
print(nums[::-1])       # [5, 4, 3, 2, 1, 0]
print(nums[::2])        # [0, 2, 4]

nums[1:3] = [9, 9, 9]
print(nums)             # [0, 9, 9, 9, 3, 4, 5]`,
          output: "[1, 2, 3] / [5, 4, 3, 2, 1, 0] / [0, 2, 4] / [0, 9, 9, 9, 3, 4, 5]",
        },
        {
          type: "callout",
          tone: "warn",
          title: "浅拷贝的边界",
          html: "<code>b = a[:]</code> 只复制最外层。若 <code>a = [[1], [2]]</code>，修改 <code>b[0].append(3)</code> 仍会改到 <code>a[0]</code>。需要彻底独立时用 <code>copy.deepcopy</code>，但要先确认真的需要。",
        },
        {
          type: "h",
          text: "推导式：一行生成新容器",
        },
        {
          type: "code",
          file: "comprehensions.py",
          code: String.raw`squares = [x * x for x in range(6) if x % 2 == 0]
mapping = {k: v for k, v in [("a", 1), ("b", 2)]}
unique = {word.lower() for word in ["Py", "py", "PY"]}

print(squares)   # [0, 4, 16]
print(mapping)   # {'a': 1, 'b': 2}
print(unique)    # {'py'}`,
          output: "[0, 4, 16] / {'a': 1, 'b': 2} / {'py'}",
        },
        {
          type: "p",
          html: "推导式适合“从可迭代对象生成新容器”的一步式转换。一旦需要多步逻辑、异常处理、副作用（写文件、打印），退回普通 <code>for</code> 循环更好读。嵌套超过两层时，也建议拆开。",
        },
        {
          type: "h",
          text: "排序靠 key，不靠比较函数",
        },
        {
          type: "p",
          html: "<code>sorted(rows, key=...)</code> 会为每个元素调用一次 key 函数，拿到排序依据再比较，效率高且稳定（相等元素保持原顺序）。多条件排序让 key 返回元组：先按分数降序，再按名字升序。",
        },
        {
          type: "code",
          file: "sorting.py",
          code: String.raw`rows = [("林", 88), ("陈", 95), ("周", 76)]

print(sorted(rows, key=lambda r: r[1], reverse=True))
print(sorted(rows, key=lambda r: (-r[1], r[0])))`,
          output: "[('陈', 95), ('林', 88), ('周', 76)] / [('陈', 95), ('林', 88), ('周', 76)]",
        },
        {
          type: "callout",
          tone: "deep",
          title: "sort 与 sorted",
          html: "<code>list.sort()</code> 原地排序并返回 <code>None</code>；<code>sorted()</code> 返回新列表。把 <code>sort()</code> 的返回值赋给变量是经典错误——你会得到 <code>None</code>。",
        },
      ],
      exercises: [
        {
          id: "f4-1",
          kind: "code",
          title: "把循环改写成推导式",
          difficulty: "★★☆",
          prompt:
            "实现 <code>even_squares(nums)</code>：返回所有偶数元素的平方，使用列表推导式完成。",
          starter: String.raw`def even_squares(nums):
    result = []
    # 用推导式改写
    return result

print(even_squares([1, 2, 3, 4, 5, 6]))`,
          hints: ["条件写在推导式末尾：<code>[x * x for x in nums if ...]</code>。", "只保留 <code>x % 2 == 0</code> 的元素。"],
          solution: String.raw`def even_squares(nums):
    return [x * x for x in nums if x % 2 == 0]

print(even_squares([1, 2, 3, 4, 5, 6]))`,
          check: String.raw`assert even_squares([1, 2, 3, 4, 5, 6]) == [4, 16, 36]
assert even_squares([]) == []
assert even_squares([0, 7]) == [0]
assert even_squares([-2, -1]) == [4]
print("通过：偶数平方列表正确")`,
        },
        {
          id: "f4-2",
          kind: "code",
          title: "按首字母分组",
          difficulty: "★★★",
          prompt:
            "实现 <code>group_by_letter(words)</code>：返回字典，键为首字母（小写），值为该字母开头的单词列表（保持原顺序）。空字符串单词直接跳过。",
          starter: String.raw`def group_by_letter(words):
    pass

print(group_by_letter(["apple", "Avocado", "banana", "blueberry", "", "Cherry"]))`,
          hints: [
            "用 <code>result.setdefault(key, []).append(word)</code>。",
            "先做 <code>word.strip()</code> 判断空值，键取 <code>word[0].lower()</code>。",
          ],
          solution: String.raw`def group_by_letter(words):
    result = {}
    for word in words:
        if not word or not word.strip():
            continue
        key = word[0].lower()
        result.setdefault(key, []).append(word)
    return result

print(group_by_letter(["apple", "Avocado", "banana", "blueberry", "", "Cherry"]))`,
          check: String.raw`result = group_by_letter(["apple", "Avocado", "banana", "blueberry", "", "Cherry"])
assert result["a"] == ["apple", "Avocado"], result.get("a")
assert result["b"] == ["banana", "blueberry"]
assert result["c"] == ["Cherry"]
assert "" not in result
assert group_by_letter([]) == {}
print("通过：分组、保序、空字符串处理都正确")`,
        },
        {
          id: "f4-3",
          kind: "code",
          title: "多条件排序",
          difficulty: "★★☆",
          prompt:
            "实现 <code>rank(rows)</code>：输入由 <code>(姓名, 分数)</code> 组成的列表，返回按“分数降序、同分姓名升序”排好的姓名列表。",
          starter: String.raw`def rank(rows):
    pass

print(rank([("林", 88), ("陈", 95), ("周", 76), ("赵", 88)]))`,
          hints: ["<code>sorted</code> 的 key 可以返回元组。", "分数降序用 <code>-score</code>，姓名升序直接用字符串本身。"],
          solution: String.raw`def rank(rows):
    ordered = sorted(rows, key=lambda row: (-row[1], row[0]))
    return [name for name, score in ordered]

print(rank([("林", 88), ("陈", 95), ("周", 76), ("赵", 88)]))`,
          check: String.raw`assert rank([("林", 88), ("陈", 95), ("周", 76), ("赵", 88)]) == ["陈", "林", "赵", "周"]
assert rank([]) == []
assert rank([("B", 90), ("A", 90)]) == ["A", "B"]
print("通过：分数降序、同分姓名升序")`,
        },
        {
          id: "f4-4",
          kind: "quiz",
          question: "<code>nums = [0, 1, 2, 3, 4, 5]</code>，执行 <code>b = nums[1:4]</code> 后再执行 <code>b[0] = 99</code>，<code>nums</code> 会变成什么？",
          options: [
            "<code>[0, 1, 2, 3, 4, 5]</code>，切片是独立的新列表",
            "<code>[0, 99, 2, 3, 4, 5]</code>，切片共享底层元素",
            "<code>[0, 99, 99, 99, 4, 5]</code>，切片是视图",
            "抛出错，因为切片不可修改",
          ],
          answer: 0,
          explain:
            "<b>A。</b>切片会创建新列表，<code>b</code> 是独立对象；修改 <code>b[0]</code> 不影响 <code>nums</code>。只有切片赋值 <code>nums[1:4] = ...</code> 才会改原列表。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 2–3 章：序列、字典与集合",
        "《Python Cookbook（第 3 版）》第 1 章：数据结构和算法",
        "《Python 编程：从入门到实践（第 3 版）》第 4 章：操作列表",
      ],
    },
  ],
});

/* 模块 02 · 中级核心
   从“写得出”到“写得对”：惰性求值、装饰器、对象模型、异常边界。 */
window.CURRICULUM.modules.push({
  id: "intermediate",
  index: "02",
  title: "中级核心",
  tagline: "从“写得出”到“写得对”",
  description:
    "生成器、闭包、装饰器、面向对象、异常与文件。这些内容决定了你的代码能否被复用、被测试、被别人接手。",
  accent: "#6a4bf0",
  lessons: [
    /* ============================================================ 5 */
    {
      id: "iterators",
      title: "迭代器与生成器",
      summary:
        "for 循环背后发生了什么？为什么生成器只能遍历一次？什么时候该用 yield 而不是先建一个大列表？",
      level: "中级核心",
      minutes: 28,
      objectives: [
        "区分可迭代对象与迭代器",
        "用 yield 写出惰性生成器",
        "用 itertools.islice 消费无限序列",
        "识别生成器“只能消费一次”的坑",
      ],
      sections: [
        {
          type: "h",
          text: "for 循环其实只做两件事",
        },
        {
          type: "p",
          html: "对一个对象做 <code>for</code>，解释器先调用 <code>iter(obj)</code> 拿到迭代器，再反复调用 <code>next()</code>，直到抛出 <code>StopIteration</code>。列表是<strong>可迭代对象</strong>，不是迭代器；<code>iter(list)</code> 返回的才是迭代器，它内部记住遍历到了哪里。",
        },
        {
          type: "code",
          file: "iter_next.py",
          code: String.raw`nums = [1, 2, 3]
it = iter(nums)

print(next(it))   # 1
print(next(it))   # 2
print(next(it))   # 3
# 再调用一次会抛 StopIteration`,
          output: "1 / 2 / 3",
        },
        {
          type: "h",
          text: "yield：把函数变成生成器工厂",
        },
        {
          type: "p",
          html: "函数体里出现 <code>yield</code> 后，调用它不会立刻执行，而是返回一个生成器对象。每次 <code>next()</code> 推进到下一个 <code>yield</code> 就暂停，局部变量和位置都保留下来。",
        },
        {
          type: "code",
          file: "generator.py",
          code: String.raw`def count_up(n):
    i = 1
    while i <= n:
        yield i
        i += 1

gen = count_up(3)
print(list(gen))   # [1, 2, 3]`,
          output: "[1, 2, 3]",
        },
        {
          type: "callout",
          tone: "warn",
          title: "生成器不能倒带",
          html: "生成器被完整消费后再次遍历不会重新开始，而是直接得到空结果。需要复用就重新调用生成器函数，或者先物化成 <code>list</code>（但那就失去了惰性）。",
        },
        {
          type: "h",
          text: "惰性求值省的是内存，不只是代码",
        },
        {
          type: "p",
          html: "生成器表达式 <code>(x * x for x in range(100000))</code> 不会立刻建出 10 万个元素的列表，而是按需计算。内存占用几乎只与生成器对象本身有关。",
        },
        {
          type: "code",
          file: "lazy.py",
          code: String.raw`import sys

gen = (x * x for x in range(100000))
print(type(gen).__name__)
print(sys.getsizeof(gen))   # 数百字节，而不是整张表`,
          output: "generator / 约 200 字节（随实现略有差异）",
        },
        {
          type: "p",
          html: "无限序列也可以安全使用，只要消费端限制数量。<code>itertools.islice</code> 就是为此准备的。",
        },
        {
          type: "code",
          file: "fib.py",
          code: String.raw`from itertools import islice

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(islice(fibonacci(), 10)))`,
          output: "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]",
        },
        {
          type: "h",
          text: "yield from 与生成器表达式",
        },
        {
          type: "code",
          file: "flatten.py",
          code: String.raw`def flatten(matrix):
    for row in matrix:
        yield from row

print(list(flatten([[1, 2], [3], [4, 5]])))`,
          output: "[1, 2, 3, 4, 5]",
        },
        {
          type: "callout",
          tone: "deep",
          title: "生成器是“生产者”，不是“容器”",
          html: "把生成器当成管道的一节：上游按需生产，下游按需消费。需要随机访问、多次遍历、求长度时才物化成列表。这个判断标准会反复出现在数据处理和并发代码里。",
        },
      ],
      exercises: [
        {
          id: "i5-1",
          kind: "code",
          title: "倒计时生成器",
          difficulty: "★★☆",
          prompt:
            "实现生成器 <code>count_down(n)</code>：依次产出 <code>n, n-1, ..., 1</code>。<code>n</code> 小于等于 0 时不产出任何值。",
          starter: String.raw`def count_down(n):
    # 用 yield 实现
    pass

print(list(count_down(4)))
print(sum(count_down(4)))`,
          hints: ["用 <code>while n > 0:</code> 循环。", "每轮先 <code>yield n</code>，再 <code>n -= 1</code>。"],
          solution: String.raw`def count_down(n):
    while n > 0:
        yield n
        n -= 1

print(list(count_down(4)))
print(sum(count_down(4)))`,
          check: String.raw`assert list(count_down(4)) == [4, 3, 2, 1]
assert list(count_down(0)) == []
assert list(count_down(-3)) == []
assert sum(count_down(5)) == 15
print("通过：倒计时生成器正确")`,
        },
        {
          id: "i5-2",
          kind: "code",
          title: "分批切块",
          difficulty: "★★★",
          prompt:
            "实现生成器 <code>chunks(items, size)</code>：把序列按 size 切成若干批，最后一批可以不足 size。不要在开头一次性复制整个序列。",
          starter: String.raw`def chunks(items, size):
    # 用 yield 实现
    pass

for batch in chunks(list(range(1, 8)), 3):
    print(batch)`,
          hints: [
            "用 <code>range(0, len(items), size)</code> 生成起点。",
            "<code>yield items[start:start + size]</code>。",
          ],
          solution: String.raw`def chunks(items, size):
    for start in range(0, len(items), size):
        yield items[start:start + size]

for batch in chunks(list(range(1, 8)), 3):
    print(batch)`,
          check: String.raw`assert list(chunks([1, 2, 3, 4, 5, 6, 7], 3)) == [[1, 2, 3], [4, 5, 6], [7]]
assert list(chunks([], 2)) == []
assert list(chunks([1], 5)) == [[1]]
_result = chunks([1, 2, 3], 2)
assert hasattr(_result, "__next__"), "应返回生成器而不是列表"
print("通过：分批正确，且是惰性生成器")`,
        },
        {
          id: "i5-3",
          kind: "code",
          title: "无限斐波那契",
          difficulty: "★★★",
          prompt:
            "实现无限生成器 <code>fibonacci()</code>，从 0、1 开始不断产出。然后用 <code>itertools.islice</code> 取出前 12 项并打印列表。",
          starter: String.raw`from itertools import islice

def fibonacci():
    # 无限产出，注意不要写成一次性求值
    pass

print(list(islice(fibonacci(), 12)))`,
          hints: [
            "初始 <code>a, b = 0, 1</code>，循环里 <code>yield a</code>。",
            "更新写成 <code>a, b = b, a + b</code>。",
            "<code>while True</code> 是安全的，因为 islice 只取有限项。",
          ],
          solution: String.raw`from itertools import islice

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(islice(fibonacci(), 12)))`,
          check: String.raw`from itertools import islice
assert list(islice(fibonacci(), 12)) == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
assert list(islice(fibonacci(), 3)) == [0, 1, 1]
print("通过：无限生成器前 12 项正确")`,
        },
        {
          id: "i5-4",
          kind: "quiz",
          question:
            "执行 <code>g = (x for x in range(3))</code>，然后 <code>list(g)</code> 两次，第二次的结果是什么？",
          options: ["<code>[0, 1, 2]</code>", "<code>[]</code>", "报错", "<code>[0, 1, 2, 0, 1, 2]</code>"],
          answer: 1,
          explain:
            "<b>B。</b>生成器只能被消费一次。第一次 <code>list(g)</code> 已经把它耗尽，第二次不会重新开始，只会得到空列表。需要重复遍历时请重新创建生成器。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 17 章：迭代器、生成器与经典协程",
        "《Python Cookbook（第 3 版）》4.1–4.4：迭代器与生成器",
        "Python 官方教程：9.9 节「生成器」",
      ],
    },

    /* ============================================================ 6 */
    {
      id: "decorators",
      title: "闭包与装饰器",
      summary:
        "装饰器不是魔法，它只是“接收函数、返回函数”的高阶函数。理解闭包之后，@wraps、带参装饰器和缓存都会变得自然。",
      level: "中级核心",
      minutes: 30,
      objectives: [
        "解释闭包保存了哪些变量",
        "避开循环中 lambda 的延迟绑定",
        "手写带参数与不带参数的装饰器",
        "用 functools.wraps / lru_cache 解决常见问题",
      ],
      sections: [
        {
          type: "h",
          text: "闭包：函数记住了定义时的环境",
        },
        {
          type: "p",
          html: "内部函数引用外部函数的变量时，即使外部函数已经返回，这些变量仍然活着。它们被保存在 cell 里，和函数对象绑定在一起——这就是闭包。",
        },
        {
          type: "code",
          file: "closure.py",
          code: String.raw`def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply

times3 = make_multiplier(3)
print(times3(10))    # 30`,
          output: "30",
        },
        {
          type: "h",
          text: "延迟绑定：循环里的 lambda 陷阱",
        },
        {
          type: "code",
          file: "late_binding.py",
          code: String.raw`funcs = []
for i in range(3):
    funcs.append(lambda: i)

print([f() for f in funcs])   # [2, 2, 2]`,
          output: "[2, 2, 2]",
        },
        {
          type: "p",
          html: "lambda 里的 <code>i</code> 不是当时的值，而是“调用时才去外层找 i”。循环结束后 i 已经是 2，所以三个函数都返回 2。用默认参数把当前值绑定进去即可：<code>lambda i=i: i</code>。",
        },
        {
          type: "callout",
          tone: "warn",
          title: "默认参数的又一次出场",
          html: "这里 <code>i=i</code> 利用的正是“默认值在定义时求值”，和上一节修复可变默认参数是同一套规则的两面。",
        },
        {
          type: "h",
          text: "装饰器：语法糖下的函数替换",
        },
        {
          type: "p",
          html: "<code>@logged</code> 等价于 <code>add = logged(add)</code>。装饰器接收原函数，返回一个包装函数；调用时先执行包装逻辑，再调用原函数。",
        },
        {
          type: "code",
          file: "decorator.py",
          code: String.raw`from functools import wraps

def logged(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print(f"调用 {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper

@logged
def add(a, b):
    return a + b

print(add(2, 3))
print(add.__name__)`,
          output: "调用 add / 5 / add",
        },
        {
          type: "callout",
          tone: "tip",
          title: "wraps 不是可选项",
          html: "不加 <code>@wraps(fn)</code>，被装饰函数的 <code>__name__</code>、<code>__doc__</code>、签名元信息都会变成 wrapper 的，调试和文档工具会读错。永远加。",
        },
        {
          type: "h",
          text: "带参数的装饰器：多一层函数",
        },
        {
          type: "p",
          html: "<code>@repeat(3)</code> 先执行 <code>repeat(3)</code> 返回一个装饰器，再用它包装函数。所以带参装饰器通常有三层：参数层 → 装饰器层 → 包装层。",
        },
        {
          type: "code",
          file: "repeat.py",
          code: String.raw`from functools import wraps

def repeat(times):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            return [fn(*args, **kwargs) for _ in range(times)]
        return wrapper
    return decorator

@repeat(3)
def hello():
    return "hi"

print(hello())`,
          output: "['hi', 'hi', 'hi']",
        },
        {
          type: "h",
          text: "缓存也是装饰器",
        },
        {
          type: "code",
          file: "cache.py",
          code: String.raw`from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))`,
          output: "832040",
        },
        {
          type: "callout",
          tone: "deep",
          title: "多个装饰器的执行顺序",
          html: "<code>@a</code> 写在 <code>@b</code> 上面时，应用顺序是自下而上：先 <code>b(f)</code>，再 <code>a(b(f))</code>。调用时的进入顺序则相反。调试复杂装饰器时，先画出这层嵌套关系。",
        },
      ],
      exercises: [
        {
          id: "i6-1",
          kind: "code",
          title: "写一个乘法闭包",
          difficulty: "★★☆",
          prompt:
            "实现 <code>make_multiplier(n)</code>：返回一个函数，调用它时把参数乘以 n。要求用闭包，不要用类。",
          starter: String.raw`def make_multiplier(n):
    pass

times3 = make_multiplier(3)
print(times3(10))
print(times3(0.5))`,
          hints: ["在函数内部定义 <code>def multiply(x): return x * n</code>。", "返回内部函数对象本身。"],
          solution: String.raw`def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply

times3 = make_multiplier(3)
print(times3(10))
print(times3(0.5))`,
          check: String.raw`assert make_multiplier(3)(10) == 30
assert make_multiplier(-2)(5) == -10
assert make_multiplier(0)(99) == 0
assert callable(make_multiplier(2))
print("通过：闭包乘法器正确")`,
        },
        {
          id: "i6-2",
          kind: "code",
          title: "统计调用次数",
          difficulty: "★★★",
          prompt:
            "补全装饰器 <code>count_calls</code>：被装饰的函数每调用一次，<code>wrapper.calls</code> 加 1，并返回原函数的结果。保留原函数的 <code>__name__</code>。",
          starter: String.raw`from functools import wraps

def count_calls(fn):
    # 在这里补全
    return fn

@count_calls
def greet(name):
    return f"你好，{name}"

print(greet("林"))
print(greet("陈"))
print(greet.calls, greet.__name__)`,
          hints: [
            "在 wrapper 内部执行 <code>wrapper.calls += 1</code>。",
            "初始化要写在 <code>wrapper.calls = 0</code> 之后、返回之前。",
            "用 <code>@wraps(fn)</code> 保留元信息。",
          ],
          solution: String.raw`from functools import wraps

def count_calls(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return fn(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def greet(name):
    return f"你好，{name}"

print(greet("林"))
print(greet("陈"))
print(greet.calls, greet.__name__)`,
          check: String.raw`@count_calls
def ping():
    return "pong"

assert ping() == "pong"
assert ping() == "pong"
assert ping.calls == 2
assert ping.__name__ == "ping", "需要 functools.wraps 保留原名"
assert callable(ping)
print("通过：调用计数与元信息都正确")`,
        },
        {
          id: "i6-3",
          kind: "code",
          title: "带参数的装饰器",
          difficulty: "★★★",
          prompt:
            "实现 <code>repeat(times)</code>：它能装饰一个无参函数，调用被装饰函数时执行 times 次，并返回结果列表。",
          starter: String.raw`from functools import wraps

def repeat(times):
    # 三层结构：repeat -> decorator -> wrapper
    pass

@repeat(3)
def hello():
    return "hi"

print(hello())`,
          hints: [
            "最外层返回 <code>decorator</code>，不是 wrapper。",
            "wrapper 里用列表推导式调用 <code>fn()</code> times 次。",
          ],
          solution: String.raw`from functools import wraps

def repeat(times):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            return [fn(*args, **kwargs) for _ in range(times)]
        return wrapper
    return decorator

@repeat(3)
def hello():
    return "hi"

print(hello())`,
          check: String.raw`@repeat(4)
def value():
    return 7

assert value() == [7, 7, 7, 7]
assert value.__name__ == "value"
@repeat(0)
def never():
    return 1
assert never() == []
print("通过：带参装饰器的三层结构正确")`,
        },
        {
          id: "i6-4",
          kind: "quiz",
          question:
            "下面代码输出什么？<br><code>funcs = []</code><br><code>for i in range(3): funcs.append(lambda: i)</code><br><code>print([f() for f in funcs])</code>",
          options: ["<code>[0, 1, 2]</code>", "<code>[2, 2, 2]</code>", "<code>[0, 0, 0]</code>", "报错"],
          answer: 1,
          explain:
            "<b>B。</b>lambda 体在调用时才查找 <code>i</code>，循环结束时 <code>i</code> 已经是 2。想固定当时的值，写 <code>lambda i=i: i</code>。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 9 章：装饰器与闭包",
        "《Python 工匠》第 4 章：装饰器",
        "《Effective Python（第 3 版）》条目 26：用 functools.wraps 定义装饰器",
      ],
    },

    /* ============================================================ 7 */
    {
      id: "oop",
      title: "面向对象：类、属性与魔术方法",
      summary:
        "类不是语法负担，而是把数据和操作绑在一起的最小单位。重点讲清类属性陷阱、property 校验，以及让对象“像内建类型一样”工作。",
      level: "中级核心",
      minutes: 30,
      objectives: [
        "区分类属性与实例属性，避开共享可变状态",
        "用 property 做读写控制",
        "实现 __repr__ / __len__ / __getitem__ 等魔术方法",
        "理解继承与 super 的调用顺序",
      ],
      sections: [
        {
          type: "h",
          text: "实例属性与类属性",
        },
        {
          type: "code",
          file: "class_basic.py",
          code: String.raw`class Dog:
    species = "犬科"            # 类属性：所有实例共享

    def __init__(self, name):
        self.name = name        # 实例属性：每个实例一份

    def bark(self):
        return f"{self.name} 汪"

d = Dog("豆豆")
print(d.name, d.species, d.bark())`,
          output: "豆豆 犬科 豆豆 汪",
        },
        {
          type: "p",
          html: "对普通属性，查找顺序是实例字典 → 类字典 → 父类；给实例赋值同名属性会遮蔽类属性。但 <code>property</code> 这类数据描述符优先级更高，会先于实例字典被调用——这也是它能接管赋值的原因。",
        },
        {
          type: "callout",
          tone: "warn",
          title: "可变类属性是最常见的共享 bug",
          html: "把列表写在类体里，所有实例会共享同一个列表。可变状态应放进 <code>__init__</code>，写成 <code>self.members = []</code>。",
        },
        {
          type: "code",
          file: "class_attr_bug.py",
          code: String.raw`class Team:
    members = []            # 所有实例共享
    def add(self, name):
        self.members.append(name)

a, b = Team(), Team()
a.add("林")
print(b.members)            # ['林']`,
          output: "['林']",
        },
        {
          type: "h",
          text: "property：把属性访问变成方法调用",
        },
        {
          type: "p",
          html: "<code>@property</code> 让 <code>obj.price</code> 实际上调用 getter；<code>@price.setter</code> 接管赋值。这样既能保持简洁的访问语法，又能在写入时校验。",
        },
        {
          type: "code",
          file: "property.py",
          code: String.raw`class Product:
    def __init__(self, price):
        self._price = price

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("价格不能为负")
        self._price = value

p = Product(100)
print(p.price)
p.price = 80
print(p.price)`,
          output: "100 / 80",
        },
        {
          type: "callout",
          tone: "tip",
          title: "下划线是约定，不是锁",
          html: "<code>_price</code> 表示“内部使用”，Python 不会阻止外部访问。真正的约束靠 property、文档和 review，而不是语言强制。",
        },
        {
          type: "h",
          text: "魔术方法：让你的对象像内建类型",
        },
        {
          type: "code",
          file: "dunder.py",
          code: String.raw`class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)

    def __repr__(self):
        return f"Playlist({self._songs!r})"

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, index):
        return self._songs[index]

pl = Playlist(["A", "B", "C"])
print(pl, len(pl), pl[1:], list(pl))`,
          output: "Playlist(['A', 'B', 'C']) 3 ['B', 'C'] ['A', 'B', 'C']",
        },
        {
          type: "p",
          html: "实现 <code>__len__</code> 后 <code>len(obj)</code> 可用；实现 <code>__getitem__</code> 后下标、切片、甚至 <code>for</code> 迭代都能工作。这是 Python 数据模型的“协议式”设计。",
        },
        {
          type: "h",
          text: "继承与 super",
        },
        {
          type: "code",
          file: "inherit.py",
          code: String.raw`class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Cat(Animal):
    def speak(self):
        return f"{self.name}: 喵"

print(Cat("咪").speak())`,
          output: "咪: 喵",
        },
        {
          type: "callout",
          tone: "deep",
          title: "优先组合，谨慎继承",
          html: "继承表达的是“is-a”，组合表达“has-a”。当两个类只是共享一段逻辑时，把逻辑抽成函数或成员对象，通常比多层继承更好维护。",
        },
      ],
      exercises: [
        {
          id: "i7-1",
          kind: "code",
          title: "账户类与 __repr__",
          difficulty: "★★☆",
          prompt:
            "实现 <code>BankAccount</code>：构造时接收 <code>owner</code> 和 <code>balance=0</code>；<code>deposit(amount)</code> 与 <code>withdraw(amount)</code> 都返回新余额；金额必须为正，余额不足时抛出 <code>ValueError</code>；实现 <code>__repr__</code> 输出 <code>BankAccount('林', balance=120)</code> 这种形式。",
          starter: String.raw`class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        pass

    def withdraw(self, amount):
        pass

    def __repr__(self):
        pass

acc = BankAccount("林", 100)
acc.deposit(20)
acc.withdraw(50)
print(acc)`,
          hints: [
            "两个方法开头都判断 <code>amount &lt;= 0</code> 并抛 <code>ValueError</code>。",
            "取款前判断 <code>amount &gt; self.balance</code>。",
            "repr 用 <code>f\"BankAccount({self.owner!r}, balance={self.balance})\"</code>。",
          ],
          solution: String.raw`class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("存款金额必须为正")
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("取款金额必须为正")
        if amount > self.balance:
            raise ValueError("余额不足")
        self.balance -= amount
        return self.balance

    def __repr__(self):
        return f"BankAccount({self.owner!r}, balance={self.balance})"

acc = BankAccount("林", 100)
acc.deposit(20)
acc.withdraw(50)
print(acc)`,
          check: String.raw`acc = BankAccount("林", 100)
assert acc.deposit(20) == 120
assert acc.withdraw(50) == 70
assert repr(acc) == "BankAccount('林', balance=70)", repr(acc)
try:
    acc.deposit(0)
except ValueError:
    pass
else:
    raise AssertionError("金额为 0 应抛 ValueError")
try:
    acc.withdraw(1000)
except ValueError:
    pass
else:
    raise AssertionError("余额不足应抛 ValueError")
print("通过：存取款校验与 __repr__ 都正确")`,
        },
        {
          id: "i7-2",
          kind: "code",
          title: "用 property 守住尺寸",
          difficulty: "★★★",
          prompt:
            "实现 <code>Rectangle</code>：<code>width</code> 与 <code>height</code> 用 property 管理，赋值时必须为正数，否则抛出 <code>ValueError</code>；<code>area</code> 是只读属性。构造时也要走校验。",
          starter: String.raw`class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def area(self):
        pass

r = Rectangle(3, 4)
print(r.area)`,
          hints: [
            "getter 返回 <code>self._width</code>，setter 校验后写入 <code>self._width</code>。",
            "在 <code>__init__</code> 里直接给 <code>self.width</code> 赋值，就会触发 setter。",
            "area 不需要 setter。",
          ],
          solution: String.raw`class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def width(self):
        return self._width

    @width.setter
    def width(self, value):
        if value <= 0:
            raise ValueError("宽度必须为正")
        self._width = value

    @property
    def height(self):
        return self._height

    @height.setter
    def height(self, value):
        if value <= 0:
            raise ValueError("高度必须为正")
        self._height = value

    @property
    def area(self):
        return self._width * self._height

r = Rectangle(3, 4)
print(r.area)`,
          check: String.raw`r = Rectangle(3, 4)
assert r.width == 3 and r.height == 4
assert r.area == 12
r.width = 5
assert r.area == 20
try:
    r.width = 0
except ValueError:
    pass
else:
    raise AssertionError("宽度为 0 应抛 ValueError")
assert r.width == 5, "非法赋值不应改变原值"
try:
    Rectangle(2, -1)
except ValueError:
    pass
else:
    raise AssertionError("构造时也应校验")
print("通过：property 校验与 area 都正确")`,
        },
        {
          id: "i7-3",
          kind: "code",
          title: "让对象可迭代",
          difficulty: "★★★",
          prompt:
            "实现 <code>Playlist</code>：内部保存歌曲列表；支持 <code>len(pl)</code>、<code>pl[0]</code>、<code>pl[1:]</code>、<code>for song in pl</code>；<code>add(song)</code> 追加一首歌。",
          starter: String.raw`class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)

    def add(self, song):
        pass

pl = Playlist(["A", "B"])
pl.add("C")
print(len(pl))
print(pl[1:])
for song in pl:
    print(song)`,
          hints: [
            "实现 <code>__len__</code> 和 <code>__getitem__</code>，其余能力会自动获得。",
            "<code>__getitem__</code> 直接返回 <code>self._songs[index]</code>，切片自然成立。",
          ],
          solution: String.raw`class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)

    def add(self, song):
        self._songs.append(song)

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, index):
        return self._songs[index]

pl = Playlist(["A", "B"])
pl.add("C")
print(len(pl))
print(pl[1:])
for song in pl:
    print(song)`,
          check: String.raw`pl = Playlist(["A", "B"])
pl.add("C")
assert len(pl) == 3
assert pl[0] == "A"
assert pl[-1] == "C"
assert pl[1:] == ["B", "C"]
assert list(pl) == ["A", "B", "C"]
print("通过：长度、索引、切片与迭代都可用")`,
        },
        {
          id: "i7-4",
          kind: "quiz",
          question: "下面这段代码中，<code>b.members</code> 打印什么？" +
            "<br><code>class Team:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;members = []</code><br><code>a, b = Team(), Team()</code><br><code>a.members.append(\"林\")</code><br><code>print(b.members)</code>",
          options: ["<code>[]</code>", "<code>['林']</code>", "<code>None</code>", "报错"],
          answer: 1,
          explain:
            "<b>B。</b><code>members</code> 是类属性，两个实例共享同一个列表。正确做法是在 <code>__init__</code> 里写 <code>self.members = []</code>，让每个实例拥有自己的列表。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 1 章与第 11–12 章：对象协议",
        "《Python 工匠》第 2 章：面向对象",
        "《Effective Python（第 3 版）》条目 37–41：类与继承",
      ],
    },

    /* ============================================================ 8 */
    {
      id: "exceptions-files",
      title: "异常、文件与资源",
      summary:
        "异常不是 if 的替代品，而是“正常流程之外”的表达。文件、网络、锁、临时目录都应该交给 with 管理。",
      level: "中级核心",
      minutes: 26,
      objectives: [
        "写出完整的 try/except/else/finally",
        "定义有语义的自定义异常",
        "用 pathlib / json 完成读写",
        "理解 with 保证资源释放的机制",
      ],
      sections: [
        {
          type: "h",
          text: "try 的四个分支各管什么",
        },
        {
          type: "p",
          html: "<code>try</code> 放可能失败的代码；<code>except</code> 只捕获你能处理的异常；<code>else</code> 在没有异常时执行；<code>finally</code> 无论成功失败都会执行，适合放清理逻辑。捕获异常时尽量写具体类型，避免 <code>except Exception</code> 吞掉真正的 bug。",
        },
        {
          type: "code",
          file: "try_branches.py",
          code: String.raw`def parse_age(text):
    try:
        age = int(text)
    except ValueError as exc:
        raise ValueError(f"年龄格式不对: {text!r}") from exc
    else:
        return age
    finally:
        print("parse_age 结束")

print(parse_age("18"))`,
          output: "parse_age 结束 / 18",
        },
        {
          type: "callout",
          tone: "tip",
          title: "raise ... from 保留原因",
          html: "<code>from exc</code> 会把原始异常挂在 <code>__cause__</code> 上，traceback 里能同时看到“为什么失败”和“我抛了什么”。定位问题时非常有用。",
        },
        {
          type: "h",
          text: "自定义异常：给失败一个名字",
        },
        {
          type: "code",
          file: "custom_error.py",
          code: String.raw`class AppError(Exception):
    pass

class ValidationError(AppError):
    def __init__(self, field, message):
        self.field = field
        super().__init__(f"{field}: {message}")

try:
    raise ValidationError("age", "必须为正数")
except AppError as e:
    print(type(e).__name__, e)`,
          output: "ValidationError age: 必须为正数",
        },
        {
          type: "p",
          html: "自定义异常让调用方可以只接住“业务失败”，而不必猜 <code>ValueError</code> 到底来自哪里。继承一个项目级基类，还能统一日志与错误码。",
        },
        {
          type: "h",
          text: "EAFP 而不是 LBYL",
        },
        {
          type: "p",
          html: "LBYL 是“先检查再使用”（Look Before You Leap），EAFP 是“先做，失败再处理”（Easier to Ask Forgiveness than Permission）。文件可能在检查之后被删，字典键可能在检查之后被改，Python 更鼓励直接操作并捕获异常。",
        },
        {
          type: "code",
          file: "eafp.py",
          code: String.raw`data = {"name": "林"}

# 推荐
try:
    name = data["name"]
except KeyError:
    name = "匿名"

# 也可以，但多一次查找
name = data["name"] if "name" in data else "匿名"
print(name)`,
          output: "林",
        },
        {
          type: "h",
          text: "pathlib 与 json",
        },
        {
          type: "p",
          html: "文本文件始终显式写 <code>encoding=\"utf-8\"</code>，否则在不同系统上会出现乱码或解码错误。JSON 序列化时，<code>ensure_ascii=False</code> 让中文保持可读。",
        },
        {
          type: "code",
          file: "json_io.py",
          code: String.raw`import json
from pathlib import Path

path = Path("config.json")
path.write_text(
    json.dumps({"debug": True, "name": "训练场"}, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
data = json.loads(path.read_text(encoding="utf-8"))
print(data["name"])`,
          output: "训练场",
        },
        {
          type: "callout",
          tone: "warn",
          title: "write_text 是整文件覆盖",
          html: "<code>Path.write_text</code> 会一次性覆盖原内容，不适合追加日志。需要追加用 <code>open(path, \"a\", encoding=\"utf-8\")</code>；需要原子写用临时文件 + <code>replace</code>。",
        },
        {
          type: "h",
          text: "with：把清理写进协议里",
        },
        {
          type: "p",
          html: "<code>with</code> 进入时调用 <code>__enter__</code>，离开时调用 <code>__exit__</code>——即使块内抛异常也会执行。文件、线程锁、数据库事务、临时目录都该用它。下一模块会自己实现一个上下文管理器。",
        },
      ],
      exercises: [
        {
          id: "i8-1",
          kind: "code",
          title: "安全的整数解析",
          difficulty: "★★☆",
          prompt:
            "实现 <code>safe_int(value, default=0)</code>：能解析就返回整数；遇到 <code>None</code>、非法字符串、浮点字符串都返回 default，不向外抛异常。",
          starter: String.raw`def safe_int(value, default=0):
    pass

print(safe_int("42"))
print(safe_int("3.14", -1))
print(safe_int(None, 99))`,
          hints: [
            "捕获 <code>(TypeError, ValueError)</code> 两类异常。",
            "直接 <code>return int(value)</code>，不要先判断类型。",
          ],
          solution: String.raw`def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

print(safe_int("42"))
print(safe_int("3.14", -1))
print(safe_int(None, 99))`,
          check: String.raw`assert safe_int("42") == 42
assert safe_int("3.14", -1) == -1
assert safe_int(None, 99) == 99
assert safe_int("abc", 7) == 7
assert safe_int(3.9) == 3
print("通过：各种非法输入都回退到默认值")`,
        },
        {
          id: "i8-2",
          kind: "code",
          title: "自定义余额不足异常",
          difficulty: "★★★",
          prompt:
            "定义异常类 <code>InsufficientFunds</code>（继承 Exception），实现 <code>withdraw(balance, amount)</code>：金额非法或余额不足时抛这个异常，正常时返回剩余余额。",
          starter: String.raw`class InsufficientFunds(Exception):
    pass

def withdraw(balance, amount):
    pass

print(withdraw(100, 30))`,
          hints: [
            "不足时 <code>raise InsufficientFunds(f\"余额 {balance} 不足以取出 {amount}\")</code>。",
            "负数或 0 金额也应抛同一个异常，保持调用方只处理一种错误。",
          ],
          solution: String.raw`class InsufficientFunds(Exception):
    pass

def withdraw(balance, amount):
    if amount <= 0:
        raise InsufficientFunds("取款金额必须为正")
    if amount > balance:
        raise InsufficientFunds(f"余额 {balance} 不足以取出 {amount}")
    return balance - amount

print(withdraw(100, 30))`,
          check: String.raw`assert issubclass(InsufficientFunds, Exception)
assert withdraw(100, 30) == 70
assert withdraw(100, 100) == 0
try:
    withdraw(100, 500)
except InsufficientFunds as e:
    assert "100" in str(e) and "500" in str(e)
else:
    raise AssertionError("余额不足应抛 InsufficientFunds")
try:
    withdraw(100, -5)
except InsufficientFunds:
    pass
else:
    raise AssertionError("负金额也应抛 InsufficientFunds")
print("通过：自定义异常与边界处理正确")`,
        },
        {
          id: "i8-3",
          kind: "code",
          title: "JSON 配置的读写往返",
          difficulty: "★★★",
          prompt:
            "实现 <code>save_profile(path, profile)</code> 与 <code>load_profile(path)</code>：用 pathlib 写入 UTF-8 的 JSON，中文保持可读（<code>ensure_ascii=False</code>，缩进 2）；读取时还原为字典。",
          starter: String.raw`import json
from pathlib import Path

def save_profile(path, profile):
    pass

def load_profile(path):
    pass

save_profile("profile.json", {"name": "林", "age": 28})
print(load_profile("profile.json"))
print(Path("profile.json").read_text(encoding="utf-8"))`,
          hints: [
            "<code>Path(path).write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding=\"utf-8\")</code>。",
            "读取用 <code>json.loads(Path(path).read_text(encoding=\"utf-8\"))</code>。",
          ],
          solution: String.raw`import json
from pathlib import Path

def save_profile(path, profile):
    text = json.dumps(profile, ensure_ascii=False, indent=2)
    Path(path).write_text(text, encoding="utf-8")

def load_profile(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

save_profile("profile.json", {"name": "林", "age": 28})
print(load_profile("profile.json"))
print(Path("profile.json").read_text(encoding="utf-8"))`,
          check: String.raw`save_profile("check.json", {"name": "林", "tags": ["python"]})
loaded = load_profile("check.json")
assert loaded == {"name": "林", "tags": ["python"]}
raw = Path("check.json").read_text(encoding="utf-8")
assert "林" in raw, "ensure_ascii=False 才能让中文保持可读"
assert "\n" in raw, "应使用 indent=2 生成可读格式"
print("通过：JSON 往返正确，中文未被转义")`,
        },
        {
          id: "i8-4",
          kind: "quiz",
          question: "关于 <code>finally</code>，哪一句是正确的？",
          options: [
            "只有 try 成功时才执行",
            "只有发生异常时才执行",
            "无论是否异常、是否 return，都会执行",
            "它必须和 else 一起使用",
          ],
          answer: 2,
          explain:
            "<b>C。</b><code>finally</code> 在离开 try 语句时总会执行，包括异常路径和 return 路径。它常用于关闭文件、释放锁、恢复状态。",
        },
      ],
      further: [
        "《流畅的 Python（第 2 版）》第 8 章：对象引用、可变性与垃圾回收（资源语义）",
        "《Python 工匠》第 3 章：异常处理",
        "Python 官方教程：8. 错误和异常",
      ],
    },
  ],
});

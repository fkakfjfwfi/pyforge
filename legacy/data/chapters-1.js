/* 课程数据 · 第一部分（第 1–6 章） */
(function () {
const RAW = String.raw;

window.CHAPTERS = (window.CHAPTERS || []).concat([

/* ================= 第 1 章 ================= */
{
  id: "ch01", no: 1, stage: 1, stageName: "语法内功",
  stageDesc: "爬虫每天都在用的对象、字符串、函数与文件",
  title: "变量、对象与内存模型",
  subtitle: "理解「名字绑定」，才能不踩可变对象的坑",
  time: "90 分钟", level: "基础", tags: ["对象模型", "可变/不可变", "深浅拷贝"],
  crawlerScene: "你写了一个 fetch(url, headers=DEFAULT_HEADERS) 函数。某次为了抓一个需要登录的页面，往 headers 里加了 Cookie，结果之后所有请求都带上了这个 Cookie，甚至并发请求互相污染。",
  goals: [
    "说清「变量是名字，不是盒子」，能解释 b = a 之后修改 b 为什么会影响 a",
    "分清可变与不可变对象，知道什么时候该浅拷贝、什么时候必须深拷贝",
    "避开默认参数、is 比较、类属性共享这三个高频坑"
  ],
  blocks: [
    { t: "lead", x: "Python 里所有数据都是对象，变量只是贴在对象上的名字标签。这句话听起来像废话，但它决定了赋值、传参、拷贝、默认参数的全部行为。爬虫代码里那些「我明明没改它，它怎么变了」的 bug，九成都源于没想清楚这件事。" },
    { t: "h", x: "1.1 变量是标签，不是盒子" },
    { t: "p", x: "<code>a = [1, 2, 3]</code> 实际做了两件事：先在堆上创建一个列表对象，再把名字 <code>a</code> 绑定到它。<code>b = a</code> 不会复制列表，只是给同一个对象再贴一个标签。" },
    { t: "code", title: "alias.py", x: RAW`
a = [1, 2, 3]
b = a                 # 不是复制，是第二个名字
b.append(4)

print(a)              # [1, 2, 3, 4]
print(a is b)         # True
print(id(a), id(b))   # 两个 id 完全相同
`, out: "[1, 2, 3, 4]\nTrue\n同一串数字" },
    { t: "p", x: "这也解释了函数传参。Python 是「对象引用传递」：函数拿到的是对象的引用，不是副本。函数内部修改可变对象，调用方一定看得见。" },
    { t: "code", title: "pass_by_ref.py", x: RAW`
def add_cookie(headers):
    headers["Cookie"] = "sessionid=abc"   # 原地修改

DEFAULT_HEADERS = {"User-Agent": "PyForge/1.0"}
add_cookie(DEFAULT_HEADERS)
print(DEFAULT_HEADERS)   # {'User-Agent': 'PyForge/1.0', 'Cookie': 'sessionid=abc'}
` },
    { t: "note", kind: "warn", title: "爬虫里的真实事故", x: "把全局 <code>HEADERS</code> 直接传给 <code>requests.get</code> 通常没问题，因为 requests 不会改它；但只要你在自己的封装里往这个 dict 里塞过 Cookie、Referer，污染就发生了，而且是跨线程、跨请求的。正确做法是每次进入函数先 <code>headers = dict(headers)</code> 复制一份。" },
    { t: "h", x: "1.2 可变与不可变" },
    { t: "table", head: ["类型", "可变性", "能否作为 dict 的 key"], rows: [
      ["<code>int</code> / <code>float</code> / <code>bool</code>", "不可变", "可以"],
      ["<code>str</code> / <code>bytes</code>", "不可变", "可以"],
      ["<code>tuple</code>", "不可变（但内部元素可能可变）", "元素都可哈希时可以"],
      ["<code>list</code>", "可变", "不可以"],
      ["<code>dict</code>", "可变", "不可以"],
      ["<code>set</code>", "可变", "不可以"],
      ["<code>frozenset</code>", "不可变", "可以"]
    ] },
    { t: "p", x: "不可变对象一旦创建，内容就固定了。<code>s += \"x\"</code> 不是原地追加，而是创建了一个新字符串再重新绑定名字。可变对象则原地修改，所有指向它的名字都会看到变化。" },
    { t: "code", title: "mutable_vs_immutable.py", x: RAW`
s = "abc"
t = s
s += "d"
print(s, t)          # abcd abc —— t 还指向旧对象

lst = [1, 2]
lst2 = lst
lst.append(3)
print(lst2)          # [1, 2, 3] —— 同一对象
` },
    { t: "p", x: "dict 的 key 必须可哈希。哈希要求对象在生命周期内哈希值不变，所以 list、dict、set 这类可变容器不能当 key。元组可以，但如果元组里装了 list，一样会报 <code>TypeError: unhashable type</code>。" },
    { t: "h", x: "1.3 赋值、浅拷贝、深拷贝" },
    { t: "code", title: "copy_levels.py", x: RAW`
import copy

config = {
    "headers": {"User-Agent": "PyForge"},
    "retries": 3,
}

alias    = config                      # 同一个对象
shallow  = copy.copy(config)           # 只复制第一层
deep     = copy.deepcopy(config)       # 递归复制所有层

shallow["retries"] = 5
print(config["retries"])               # 3 —— 第一层互不影响

shallow["headers"]["User-Agent"] = "Other"
print(config["headers"]["User-Agent"]) # Other —— 内层还是共享的！

deep["headers"]["User-Agent"] = "Deep"
print(config["headers"]["User-Agent"]) # Other —— deep 完全独立
` },
    { t: "p", x: "切片 <code>lst[:]</code>、<code>dict(d)</code>、<code>list(d)</code> 都属于浅拷贝。嵌套结构用 <code>copy.deepcopy</code>，代价是慢；只在确实需要完全隔离时用。" },
    { t: "h", x: "1.4 is 与 ==" },
    { t: "p", x: "<code>==</code> 比较值是否相等，<code>is</code> 比较是不是同一个对象（同一块内存）。判空统一写 <code>x is None</code>，不要写 <code>x == None</code>。" },
    { t: "code", title: "identity.py", x: RAW`
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)     # True  值相等
print(a is b)     # False 不同对象

print([] is [])   # False 每次字面量都新建
print(None is None)  # True 单例
` },
    { t: "note", kind: "danger", title: "不要依赖小整数缓存", x: "CPython 会缓存 -5 到 256 的整数和部分短字符串，于是 <code>a = 256; b = 256; a is b</code> 可能是 True，换成 257 又变成 False。这是实现细节，不是语言保证。判断值相等永远用 <code>==</code>。" },
    { t: "h", x: "1.5 默认参数的坑" },
    { t: "p", x: "默认值在函数定义时求值一次，之后所有调用共享同一个对象。用可变默认值，等于给自己埋了一个跨调用的全局变量。" },
    { t: "code", title: "default_arg.py", x: RAW`
def collect_bad(item, bucket=[]):
    bucket.append(item)
    return bucket

print(collect_bad(1))   # [1]
print(collect_bad(2))   # [1, 2]  —— 上次的结果还在

def collect_ok(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(collect_ok(1))    # [1]
print(collect_ok(2))    # [2]
` },
    { t: "p", x: "规则很简单：默认值只放不可变对象（None、数字、字符串、元组）。需要容器时用 None 哨兵，在函数体里创建。" },
    { t: "h", x: "1.6 引用计数、del 与内存" },
    { t: "p", x: "CPython 用引用计数为主、分代垃圾回收为辅。每多一个名字指向对象，计数 +1；名字离开作用域或重新绑定，计数 -1；归零立即释放。<code>del</code> 只是删除一个名字，不是销毁对象。" },
    { t: "code", title: "refcount.py", x: RAW`
import sys

data = [0] * 100000
print(sys.getrefcount(data))   # 2（data + 临时参数）

alias = data
print(sys.getrefcount(data))   # 3

del alias
print(sys.getrefcount(data))   # 2 —— 对象还在
` },
    { t: "p", x: "爬虫里的实际意义：一个 5 MB 的 <code>response.text</code> 如果被全局缓存列表一直持有，内存就降不下来。处理完就让它离开作用域，或者只保留解析后的字段，不要保留整页 HTML。" }
  ],
  pitfalls: [
    { title: "用 is 比较字符串或数字", body: "结果取决于缓存与编译器优化，可能今天 True 明天 False。值比较一律用 <code>==</code>。" },
    { title: "浅拷贝嵌套字典", body: "改内层仍然影响原对象。嵌套结构要么 <code>deepcopy</code>，要么手动重建每一层。" },
    { title: "默认参数写 [] 或 {}", body: "所有调用共享同一个容器，数据会跨请求累积。用 <code>None</code> 哨兵。" },
    { title: "a += [...] 与 a = a + [...] 混用", body: "前者原地修改，后者新建对象。存在别名时，两者结果完全不同。" },
    { title: "把大响应挂在全局变量上", body: "引用不释放，内存持续上涨。用完即弃，或只留必要字段。" }
  ],
  cheatsheet: [
    ["id(x)", "对象身份（内存地址），调试别名问题时用"],
    ["x is None", "判空的标准写法"],
    ["copy.copy(x)", "浅拷贝：只复制最外层容器"],
    ["copy.deepcopy(x)", "深拷贝：递归复制所有层级，慢"],
    ["lst[:] / dict(d) / list(d)", "同样是浅拷贝"],
    ["sys.getrefcount(x)", "查看引用计数（结果比实际多 1）"],
    ["del x", "只删除名字，不保证释放对象"]
  ],
  quiz: [
    { q: "执行 a = [1, 2]; b = a; b += [3] 之后，a 的值是？", options: ["[1, 2]", "[1, 2, 3]", "报错", "取决于是否开启 GC"], answer: 1, explain: "b 和 a 绑定同一个列表，+= 对列表是原地扩展（相当于 extend），所以 a 也变成 [1, 2, 3]。" },
    { q: "def f(x, cache={}) 这种写法最主要的问题是？", options: ["语法错误", "每次调用都会新建字典", "所有调用共享同一个字典", "字典不能被修改"], answer: 2, explain: "默认值在函数定义时求值一次，之后所有调用复用同一个 dict，数据会跨调用累积。" },
    { q: "要得到与嵌套字典 config 完全独立的副本，应该用？", options: ["dict(config)", "config.copy()", "copy.copy(config)", "copy.deepcopy(config)"], answer: 3, explain: "前三个都是浅拷贝，内层字典仍然共享；只有 deepcopy 会递归复制。" }
  ],
  tasks: [
    { title: "复现并修复 headers 污染", level: "基础", desc: "写一个 fetch(url, headers=DEFAULT_HEADERS) 函数，在函数内给 headers 加 Cookie。连续调用两次不同站点，打印第二次的 headers，观察污染；然后用 dict(headers) 修复。", file: "exercises/ch01_objects.py" },
    { title: "验证浅拷贝的边界", level: "进阶", desc: "构造一个三层嵌套的 dict，分别用赋值、copy.copy、copy.deepcopy 得到三个版本，修改最内层，打印原对象与三个版本，并用 id() 解释差异。", file: "exercises/ch01_objects.py" }
  ]
},

/* ================= 第 2 章 ================= */
{
  id: "ch02", no: 2, stage: 1, stageName: "语法内功",
  title: "序列与映射的实战用法",
  subtitle: "选对容器，10 万条 URL 去重从 20 分钟到 1 秒",
  time: "100 分钟", level: "基础", tags: ["list", "dict", "set", "推导式"],
  crawlerScene: "你手里有 10 万个待抓 URL，用 `if url not in urls` 做去重，跑了二十分钟还没结束；同事换成 set，一秒跑完。",
  goals: [
    "根据查找、插入、排序需求选对容器，知道常见操作的时间复杂度",
    "熟练使用 dict.get / setdefault / defaultdict / Counter 处理抓取结果",
    "写出正确的排序 key、切片、解包与推导式"
  ],
  blocks: [
    { t: "lead", x: "Python 的容器不是「差不多能用就行」。list、dict、set 的底层结构决定了它们的快慢，而爬虫处理的恰恰是海量数据的查找、去重、计数、排序——选错容器，代码能跑，但慢到不可用。" },
    { t: "h", x: "2.1 四种容器的定位" },
    { t: "table", head: ["容器", "底层", "查找", "有序", "典型用途"], rows: [
      ["<code>list</code>", "动态数组", "<code>in</code> 是 O(n)", "是（插入顺序）", "有序结果、队列（尾部操作）"],
      ["<code>tuple</code>", "定长数组", "O(n)", "是", "不可变记录、函数返回多值"],
      ["<code>dict</code>", "哈希表", "平均 O(1)", "是（3.7+ 插入顺序）", "字段映射、计数、缓存"],
      ["<code>set</code>", "哈希表", "平均 O(1)", "否", "去重、集合运算、成员判断"]
    ] },
    { t: "p", x: "list 随机访问 O(1)，但 <code>insert(0, x)</code> 和 <code>pop(0)</code> 要搬移整个数组，是 O(n)。需要频繁两端进出，用 <code>collections.deque</code>。" },
    { t: "code", title: "why_set.py", x: RAW`
import time

urls = [f"https://example.com/item/{i}" for i in range(100_000)]
target = "https://example.com/item/99999"

start = time.perf_counter()
print(target in urls)                 # True
print("list:", round(time.perf_counter() - start, 4))   # 约 0.001~0.003s

start = time.perf_counter()
url_set = set(urls)
print(target in url_set)              # True
print("set:", round(time.perf_counter() - start, 4))    # 约 0.0005s（含建集合）
` },
    { t: "note", kind: "info", title: "复杂度要看平均情况", x: "dict/set 的平均 O(1) 建立在哈希均匀分布上。如果所有 key 哈希冲突，会退化成 O(n)。自定义对象做 key 时，确保 <code>__hash__</code> 与 <code>__eq__</code> 一致。" },
    { t: "h", x: "2.2 去重与计数：爬虫最高频的两个操作" },
    { t: "code", title: "dedupe.py", x: RAW`
urls = ["https://a.com/1", "https://b.com/2", "https://a.com/1"]

# 只要去重，不在乎顺序
unique_fast = set(urls)

# 要保留首次出现顺序（最常用）
unique_ordered = list(dict.fromkeys(urls))

print(unique_fast)      # 顺序不保证
print(unique_ordered)   # ['https://a.com/1', 'https://b.com/2']
` },
    { t: "p", x: "统计域名出现次数，用 <code>collections.Counter</code>，比手写 dict 自增干净得多。" },
    { t: "code", title: "counter.py", x: RAW`
from collections import Counter
from urllib.parse import urlparse

urls = [
    "https://a.com/1", "https://a.com/2",
    "https://b.com/3", "https://a.com/4",
]
domains = [urlparse(u).netloc for u in urls]
print(Counter(domains))                  # Counter({'a.com': 3, 'b.com': 1})
print(Counter(domains).most_common(1))   # [('a.com', 3)]
` },
    { t: "h", x: "2.3 dict 的三个实用方法" },
    { t: "code", title: "dict_methods.py", x: RAW`
item = {"title": "键盘", "price": 199}

# get：取不到给默认值，不抛 KeyError
print(item.get("stock", 0))          # 0

# setdefault：key 不存在时写入默认值并返回
groups = {}
groups.setdefault("数码", []).append("键盘")
print(groups)                        # {'数码': ['键盘']}

# defaultdict：省掉 setdefault 的样板代码
from collections import defaultdict
by_category = defaultdict(list)
for name, cat in [("键盘", "数码"), ("鼠标", "数码"), ("T恤", "服饰")]:
    by_category[cat].append(name)
print(dict(by_category))             # {'数码': ['键盘', '鼠标'], '服饰': ['T恤']}
` },
    { t: "note", kind: "tip", title: "defaultdict 的副作用", x: "访问不存在的 key 会自动创建空列表，哪怕你只是想查询。查完要判断存在性时，用 <code>if key in d</code> 或 <code>d.get(key)</code>。" },
    { t: "h", x: "2.4 排序：key 函数决定一切" },
    { t: "code", title: "sort_items.py", x: RAW`
items = [
    {"title": "B", "price": 299, "sales": 10},
    {"title": "A", "price": 199, "sales": 50},
    {"title": "C", "price": 199, "sales": 20},
]

# 按价格升序，价格相同按销量降序
items.sort(key=lambda x: (x["price"], -x["sales"]))
print([(i["title"], i["price"], i["sales"]) for i in items])
# [('A', 199, 50), ('C', 199, 20), ('B', 299, 10)]

# sorted 返回新列表，原列表不变
print(sorted(items, key=lambda x: x["sales"], reverse=True)[0]["title"])
` },
    { t: "p", x: "<code>sort</code> 是稳定排序：key 相同的元素保持原顺序。多级排序可以返回元组，也可以用 <code>operator.itemgetter</code>，后者更快一点。" },
    { t: "code", title: "itemgetter.py", x: RAW`
from operator import itemgetter

rows = [("b", 2), ("a", 1), ("c", 3)]
rows.sort(key=itemgetter(1))     # 按第二列
print(rows)                      # [('a', 1), ('b', 2), ('c', 3)]
` },
    { t: "h", x: "2.5 切片、解包与交换" },
    { t: "code", title: "slice_unpack.py", x: RAW`
nums = [0, 1, 2, 3, 4, 5]

print(nums[1:3])      # [1, 2]
print(nums[::2])      # [0, 2, 4]
print(nums[-1])       # 5
print(nums[::-1])     # [5, 4, 3, 2, 1]

first, *middle, last = nums
print(first, middle, last)   # 0 [1, 2, 3, 4] 5

a, b = 1, 2
a, b = b, a
print(a, b)                  # 2 1
` },
    { t: "p", x: "切片会创建新列表，对大列表反复切片会复制大量内存。只是遍历的话，用索引或 <code>itertools.islice</code>（第 7 章）做惰性截取。" },
    { t: "h", x: "2.6 推导式：一行写完过滤与映射" },
    { t: "code", title: "comprehension.py", x: RAW`
prices = ["199", "299", "N/A", "399"]

valid = [int(p) for p in prices if p.isdigit()]
print(valid)                       # [199, 299, 399]

squared = {n: n * n for n in range(4)}
print(squared)                     # {0: 0, 1: 1, 2: 4, 3: 9}

lengths = {len(u) for u in ["ab", "abc", "ab"]}
print(lengths)                     # {2, 3}

total = sum(int(p) for p in prices if p.isdigit())
print(total)                       # 897，生成器版本不建中间列表
` },
    { t: "note", kind: "warn", title: "别把推导式写成嵌套迷宫", x: "两层已经是可读性上限。三层推导式、带复杂 if/else 的推导式，改成普通循环更值得。" },
    { t: "h", x: "2.7 zip 与 enumerate" },
    { t: "code", title: "zip_enumerate.py", x: RAW`
titles = ["A", "B", "C"]
prices = [199, 299]

for i, title in enumerate(titles, start=1):
    print(i, title)

for title, price in zip(titles, prices):   # 以最短的为准
    print(title, price)
` },
    { t: "p", x: "<code>zip</code> 默认按最短序列截断。要保留最长并补 None，用 <code>itertools.zip_longest</code>；要同时遍历两个不等长列表并发现差异，别用 zip 掩盖问题。" }
  ],
  pitfalls: [
    { title: "用 list 做成员判断", body: "`x in list` 是 O(n)，10 万条数据就是 100 亿次比较级别。先去重成 set。" },
    { title: "边遍历边删除列表元素", body: "删除会让后续元素前移，导致跳过元素。用列表推导式生成新列表，或倒序遍历。" },
    { title: "把 list 当 dict 的 key", body: "list 不可哈希，直接 TypeError。转成 tuple，或改用字符串 id。" },
    { title: "用 [[0] * 3] * 3 创建二维表", body: "内层列表是同一个对象，改一行三行都变。用 <code>[[0] * 3 for _ in range(3)]</code>。" },
    { title: "依赖 set 的打印顺序", body: "set 无序，输出顺序不稳定。需要顺序就用 dict.fromkeys 或显式排序。" }
  ],
  cheatsheet: [
    ["<code>set(seq)</code> / <code>list(dict.fromkeys(seq))</code>", "去重；后者保留顺序"],
    ["<code>Counter(seq).most_common(n)</code>", "Top-N 计数"],
    ["<code>d.get(k, default)</code>", "安全取值"],
    ["<code>d.setdefault(k, []).append(x)</code>", "分组（简单场景）"],
    ["<code>defaultdict(list)</code>", "分组（大量数据）"],
    ["<code>sorted(seq, key=..., reverse=...)</code>", "返回新列表，稳定排序"],
    ["<code>enumerate(seq, start=1)</code>", "带下标的遍历"],
    ["<code>zip(a, b)</code>", "并行遍历，按最短截断"]
  ],
  quiz: [
    { q: "判断一个 URL 是否已经抓过，性能最好的容器是？", options: ["list", "tuple", "set", "字符串拼接"], answer: 2, explain: "set 基于哈希表，成员判断平均 O(1)；list/tuple 是 O(n)，字符串拼接更慢且占内存。" },
    { q: "关于 dict.fromkeys(urls) 的说法，正确的是？", options: ["它返回 dict，需要再转 list", "它保留首次出现顺序", "它会打乱顺序", "它只能用于数字"], answer: 1, explain: "dict 在 3.7+ 保持插入顺序，fromkeys 会按首次出现顺序建立键，转成 list 即得到保序去重结果。" },
    { q: "items.sort(key=lambda x: (x['price'], -x['sales'])) 的含义是？", options: ["价格升序，销量升序", "价格升序，销量降序", "价格降序，销量升序", "只按销量排序"], answer: 1, explain: "元组按字典序比较：价格升序；价格相同时，-sales 让销量大的排在前面。" }
  ],
  tasks: [
    { title: "10 万 URL 去重 benchmark", level: "基础", desc: "生成 10 万个含重复的 URL，分别用 list 判断、set 判断、dict.fromkeys 三种方案去重，用 time.perf_counter 记录耗时并打印对比。", file: "exercises/ch02_containers.py" },
    { title: "按域名分组统计", level: "进阶", desc: "给一批 URL，用 defaultdict 按域名分组，用 Counter 统计每个域名的数量，输出数量最多的前 3 个域名及其 URL 列表。", file: "exercises/ch02_containers.py" }
  ]
},

/* ================= 第 3 章 ================= */
{
  id: "ch03", no: 3, stage: 1, stageName: "语法内功",
  title: "字符串、编码与正则",
  subtitle: "把网页里的脏文本，变成干净可用的数据",
  time: "120 分钟", level: "基础", tags: ["Unicode", "文本清洗", "re 正则"],
  crawlerScene: "抓下来的中文全是乱码，价格字段用正则总是多抓一个字符，日期格式五花八门——解析环节 80% 的时间都耗在字符串上。",
  goals: [
    "说清 str 与 bytes 的关系，能定位并修复乱码",
    "熟练使用字符串方法与 f-string 完成文本清洗",
    "写出可维护的正则：分组、非贪婪、预编译，并能提取价格/日期/链接"
  ],
  blocks: [
    { t: "lead", x: "爬虫的产出质量，取决于字符串处理的基本功。编码搞错，整页都是乱码；正则写错，价格多抓一位、链接少抓一段。这一章把「文本」这条链路从头到尾捋一遍。" },
    { t: "h", x: "3.1 str 与 bytes：乱码的根源" },
    { t: "p", x: "<code>str</code> 是 Unicode 码点序列，<code>bytes</code> 是原始字节序列。网络传输、文件存储都是 bytes；<code>str</code> 是解码后的结果。乱码只有两种原因：用了错误的编码解码，或者根本没解码。" },
    { t: "code", title: "encoding.py", x: RAW`
text = "中文"
raw = text.encode("utf-8")
print(raw)                       # b'\xe4\xb8\xad\xe6\x96\x87'
print(raw.decode("utf-8"))       # 中文
print(raw.decode("gbk"))         # 涓枃 —— 用错编码，乱码

# 解码失败时不要无脑 ignore
try:
    raw.decode("ascii")
except UnicodeDecodeError as e:
    print("decode failed:", e)
` },
    { t: "note", kind: "danger", title: "errors='ignore' 会静默丢数据", x: "它把无法解码的字节直接删掉，程序不报错，但你的商品标题可能少一个字。调试阶段用严格模式暴露问题，生产环境再考虑 <code>errors='replace'</code> 并记录异常样本。" },
    { t: "p", x: "requests 的 <code>response.text</code> 会根据响应头 charset 猜测编码，响应头缺失时会猜错。更可靠的做法是显式解码：<code>response.content.decode(\"utf-8\")</code>，或者先看 <code>response.apparent_encoding</code>（chardet 推测，慢且不一定准）。" },
    { t: "code", title: "requests_decode.py", x: RAW`
import requests

resp = requests.get("https://example.com", timeout=10)
resp.encoding = "utf-8"          # 明确告诉 requests
html = resp.text

# 或者完全绕过猜测
html = resp.content.decode("utf-8", errors="replace")
` },
    { t: "h", x: "3.2 常用字符串方法" },
    { t: "table", head: ["方法", "作用", "注意"], rows: [
      ["<code>s.strip()</code>", "去掉首尾空白", "也可指定字符集合，见下方坑点"],
      ["<code>s.split(sep)</code>", "按分隔符切分", "不传 sep 时按任意空白切分并丢弃空串"],
      ["<code>sep.join(seq)</code>", "拼接", "比循环 += 快得多"],
      ["<code>s.replace(a, b)</code>", "替换", "返回新字符串，不改原串"],
      ["<code>s.startswith(p)</code>", "前缀判断", "比切片比较清晰"],
      ["<code>s.partition(sep)</code>", "切成三段", "找不到时返回 (s, '', '')"],
      ["<code>s.find(p)</code>", "查位置", "找不到返回 -1，不抛异常"]
    ] },
    { t: "code", title: "clean_text.py", x: RAW`
raw = "  \u3000 2026-11-02\t iPhone 15 Pro ￥6,999.00 \n"

text = raw.strip()                       # 去掉常见空白
text = text.replace("\u3000", " ")       # 全角空格单独处理
text = " ".join(text.split())            # 把连续空白压缩成一个空格
print(repr(text))

parts = ["https://a.com", "1", "detail"]
url = "/".join(parts)
print(url)                               # https://a.com/1/detail
` },
    { t: "h", x: "3.3 f-string 与格式化" },
    { t: "code", title: "fstring.py", x: RAW`
price = 6999.0
rate = 0.0831

print(f"价格：{price:,.2f}")       # 价格：6,999.00
print(f"税率：{rate:.1%}")         # 税率：8.3%
print(f"{'id':>6}|{'name':<8}")    # 右对齐 / 左对齐
print(f"{price = }")               # 调试写法（3.8+）

# 3.12+ 支持嵌套引号，3.11 及以前要注意引号不能复用
print(f"{'中文':>10}")
` },
    { t: "h", x: "3.4 正则核心语法" },
    { t: "table", head: ["写法", "含义", "示例"], rows: [
      ["<code>\\d</code> / <code>\\w</code> / <code>\\s</code>", "数字 / 单词字符 / 空白", "<code>\\d+</code> 匹配连续数字"],
      ["<code>.</code>", "任意字符（默认不含换行）", "<code>a.c</code> 匹配 abc、a-c"],
      ["<code>*</code> <code>+</code> <code>?</code>", "0+ / 1+ / 0 或 1 次", "<code>\\d+</code>"],
      ["<code>{m,n}</code>", "重复 m 到 n 次", "<code>\\d{4}</code> 四位数字"],
      ["<code>[...]</code>", "字符集合", "<code>[0-9a-f]</code>"],
      ["<code>()</code>", "分组，可取值", "<code>(\\d+)元</code>"],
      ["<code>(?P<name>...)</code>", "命名分组", "<code>(?P<price>\\d+)</code>"],
      ["<code>*?</code> <code>+?</code>", "非贪婪", "<code><p>.*?</p></code>"]
    ] },
    { t: "p", x: "正则默认贪婪：<code>.*</code> 会尽量吃到行尾。<code>.*?</code> 则尽量少吃。提取「两个标签之间」的内容时，几乎都要用非贪婪，或者用更精确的字符集合代替点号。" },
    { t: "code", title: "extract.py", x: RAW`
import re

raw = "价格：￥1,299.00 元，活动价 ￥999.50 元"
pattern = re.compile(r"￥([\d,]+(?:\.\d+)?)")

prices = [float(p.replace(",", "")) for p in pattern.findall(raw)]
print(prices)          # [1299.0, 999.5]

# 非贪婪示例
html = "<p>第一段</p><p>第二段</p>"
print(re.findall(r"<p>(.*?)</p>", html))   # ['第一段', '第二段']
` },
    { t: "h", x: "3.5 分组与命名分组" },
    { t: "p", x: "当一条正则要提取多个字段时，命名分组比位置下标可读性高得多；<code>match.groupdict()</code> 直接给出字典。" },
    { t: "code", title: "named_groups.py", x: RAW`
import re

line = "2026-11-02 10:23:45 ERROR timeout on https://a.com/1"
pattern = re.compile(
    r"(?P<date>\d{4}-\d{2}-\d{2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\s+"
    r"(?P<level>INFO|WARNING|ERROR)\s+"
    r"(?P<message>.*)"
)

m = pattern.match(line)
print(m.groupdict())
# {'date': '2026-11-02', 'time': '10:23:45', 'level': 'ERROR', 'message': 'timeout on https://a.com/1'}
` },
    { t: "h", x: "3.6 findall、finditer 与 sub" },
    { t: "code", title: "finditer.py", x: RAW`
import re

text = "联系 a@x.com，或 b@y.com。"
for m in re.finditer(r"[\w.]+@[\w.]+", text):
    print(m.group(), m.start(), m.end())
# a@x.com 3 10
# b@y.com 12 19

# sub 批量替换
clean = re.sub(r"\s+", " ", "a   b\t\tc")
print(clean)      # a b c
` },
    { t: "note", kind: "warn", title: "别用正则解析整页 HTML", x: "HTML 不是正则语言：嵌套、属性顺序、注释、坏标签都会让你的正则失效。解析页面用 BeautifulSoup / lxml / parsel（第 6、11 章会用到固定样本测试）；正则只负责清洗文本、提取局部字段。" },
    { t: "h", x: "3.7 预编译与可读性" },
    { t: "code", title: "compile_verbose.py", x: RAW`
import re

pattern = re.compile(r"""
    (?P<title>[^<]+)          # 标题：到 < 为止
    \s*                       # 中间空白
    <span[^>]*>              # 价格标签，属性任意
    (?P<price>[\d.]+)
""", re.VERBOSE)

m = pattern.search('<h2>键盘</h2> <span class="p">199.00</span>')
print(m.groupdict() if m else None)
` },
    { t: "p", x: "模块内复用同一个 pattern 时，预编译能避免重复解析，也让命名更清楚。Python 的 <code>re</code> 模块自带 512 个 pattern 的缓存，但显式 <code>compile</code> 在循环里仍然更稳。" }
  ],
  pitfalls: [
    { title: "普通字符串里写 \"\\d+\"", body: "反斜杠会被 Python 当转义序列处理，产生警告甚至错误。正则一律加 r 前缀：<code>r\"\\d+\"</code>。" },
    { title: "re.match 只从字符串开头匹配", body: "要找中间的内容用 <code>re.search</code>；要全部结果用 <code>findall</code> / <code>finditer</code>。" },
    { title: "strip(\"abc\") 删除的是字符集合", body: "它会删掉首尾所有 a/b/c 字符，不是删 \"abc\" 这个前缀。删前缀用 <code>removeprefix()</code>（3.9+）。" },
    { title: "以为 len(\"中文\") 是字节数", body: "len 返回字符数；字节数用 <code>len(s.encode(\"utf-8\"))</code>。中文一般 3 字节。" },
    { title: "decode(errors='ignore') 静默丢数据", body: "解析字段莫名少了几个字，往往就是它。先用严格模式把问题暴露出来。" }
  ],
  cheatsheet: [
    ["<code>s.encode(\"utf-8\")</code> / <code>b.decode(\"utf-8\")</code>", "str 与 bytes 互转"],
    ["<code>\" \".join(text.split())</code>", "压缩所有连续空白"],
    ["<code>f\"{price:,.2f}\"</code>", "千分位 + 两位小数"],
    ["<code>re.compile(pattern, re.S)</code>", "预编译，点号匹配换行"],
    ["<code>pattern.findall(text)</code>", "返回所有匹配的字符串列表"],
    ["<code>pattern.finditer(text)</code>", "返回 match 对象，可拿位置"],
    ["<code>m.groupdict()</code>", "命名分组转字典"],
    ["<code>re.sub(p, repl, text)</code>", "批量替换"]
  ],
  quiz: [
    { q: "响应头没有 charset，response.text 出现乱码，最稳妥的处理是？", options: ["直接 replace 掉乱码字符", "用 response.content.decode('utf-8') 显式解码", "用 errors='ignore'", "改成 http 协议"], answer: 1, explain: "content 是原始 bytes，按站点实际编码显式 decode 最可控；text 依赖 requests 的猜测。" },
    { q: "要提取 <p>...</p> 中间的内容，应该用哪个写法？", options: ["<p>.*</p>", "<p>.*?</p>", "<p>.+</p>", "p.*"], answer: 1, explain: "点号默认贪婪，会从第一个 <p> 吃到最后一个 </p>；加 ? 变非贪婪，才能逐段匹配。" },
    { q: "正则字符串为什么建议加 r 前缀？", options: ["性能更快", "避免反斜杠被 Python 先转义", "让正则区分大小写", "r 表示 raw，可以匹配中文"], answer: 1, explain: "r\"\\d+\" 让反斜杠原样传给 re 引擎；普通字符串里 \\d 可能被当成未知转义。" }
  ],
  tasks: [
    { title: "清洗一份脏数据", level: "基础", desc: "给定包含全角空格、制表符、换行、多个空格的字符串列表，输出统一压缩后的文本，并统计清洗前后的字符数。", file: "exercises/ch03_text.py" },
    { title: "用命名分组解析日志行", level: "进阶", desc: "解析形如 2026-11-02 10:23:45 ERROR timeout on https://a.com/1 的日志，输出结构化字典；解析失败的行要收集起来而不是崩溃。", file: "exercises/ch03_text.py" }
  ]
},

/* ================= 第 4 章 ================= */
{
  id: "ch04", no: 4, stage: 1, stageName: "语法内功",
  title: "函数、闭包与装饰器",
  subtitle: "把重试、限速、计时写成可复用的能力",
  time: "110 分钟", level: "进阶", tags: ["作用域", "闭包", "装饰器"],
  crawlerScene: "每个请求函数都复制一遍 try/except、sleep、重试计数，改一次重试策略要改二十个地方，还经常漏掉某个函数。",
  goals: [
    "掌握五种参数形态与 LEGB 作用域规则",
    "理解闭包如何保存状态，避开循环晚绑定",
    "独立写出带参数的重试、限速、计时装饰器"
  ],
  blocks: [
    { t: "lead", x: "装饰器不是「高级语法表演」，它是把「请求前限速、失败后重试、结束后计时」这类横切逻辑从业务代码里抽出来的工具。学会它，你的爬虫函数才能只剩「抓什么、怎么解析」。" },
    { t: "h", x: "4.1 参数的五种形态" },
    { t: "code", title: "params.py", x: RAW`
def demo(a, b=2, *args, sep="-", **kwargs):
    print("a =", a)
    print("b =", b)
    print("args =", args)
    print("sep =", sep)
    print("kwargs =", kwargs)

demo(1, 3, 4, 5, sep="+", timeout=10)
# a = 1 / b = 3 / args = (4, 5) / sep = + / kwargs = {'timeout': 10}
` },
    { t: "p", x: "<code>*args</code> 收集多余位置参数成元组，<code>**kwargs</code> 收集多余关键字参数成字典；<code>sep</code> 前面的 <code>*</code> 表示它之后只能是关键字参数。调用时反过来用 <code>*</code> / <code>**</code> 解包。" },
    { t: "code", title: "unpack_call.py", x: RAW`
params = {"timeout": 10, "headers": {"UA": "bot"}}
requests_kwargs = dict(params)

def call(url, **kwargs):
    print(url, kwargs)

call("https://a.com", **params)
call("https://a.com", **params)
` },
    { t: "h", x: "4.2 LEGB 作用域" },
    { t: "p", x: "名字查找顺序：Local → Enclosing（外层函数）→ Global（模块）→ Builtin。函数内部给变量赋值默认创建局部变量，要修改外层函数的变量必须 <code>nonlocal</code>，修改模块级变量必须 <code>global</code>。" },
    { t: "code", title: "scope.py", x: RAW`
count = 0

def outer():
    count = 10
    def inner():
        nonlocal count
        count += 1
        return count
    return inner

counter = outer()
print(counter())   # 11
print(counter())   # 12
print(count)       # 0 —— 模块级那个没被改
` },
    { t: "note", kind: "warn", title: "少用 global", x: "用全局变量在函数里累计结果，会让并发、测试、重试全部变得不可控。用返回值、类实例或闭包保存状态。" },
    { t: "h", x: "4.3 闭包：函数记住它出生的环境" },
    { t: "code", title: "closure.py", x: RAW`def make_counter():
    n = 0
    def step():
        nonlocal n
        n += 1
        return n
    return step

c = make_counter()
print(c(), c(), c())   # 1 2 3
print(c.__closure__[0].cell_contents)   # 3
` },
    { t: "p", x: "闭包保存的是变量，不是值。循环里创建闭包最容易踩晚绑定：所有函数最终都拿到循环结束时的那个变量。" },
    { t: "code", title: "late_binding.py", x: RAW`
funcs = []
for i in range(3):
    funcs.append(lambda: i)

print([f() for f in funcs])     # [2, 2, 2] —— 全是最后一个 i

funcs2 = [lambda i=i: i for i in range(3)]
print([f() for f in funcs2])    # [0, 1, 2] —— 默认参数在定义时绑定
` },
    { t: "h", x: "4.4 装饰器的本质" },
    { t: "p", x: "装饰器就是一个「接收函数、返回新函数」的可调用对象。<code>@deco</code> 只是语法糖：" },
    { t: "code", title: "timer.py", x: RAW`
import time
import functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        cost = time.perf_counter() - start
        print(f"{func.__name__} 耗时 {cost:.3f}s")
        return result
    return wrapper

@timer
def parse_page(html):
    return len(html)

parse_page("<html></html>")
# parse_page 耗时 0.000s

# 等价写法
parse_page = timer(parse_page)
` },
    { t: "p", x: "<code>functools.wraps</code> 会把原函数的 <code>__name__</code>、<code>__doc__</code>、签名信息复制到 wrapper。不加它，日志里全是 wrapper，IDE 也看不懂参数。" },
    { t: "h", x: "4.5 带参数的装饰器：多一层" },
    { t: "p", x: "带参装饰器需要三层：外层收参数，中层收函数，内层收调用参数。写不出三层时，先问自己是不是漏了一层。" },
    { t: "code", title: "retry.py", x: RAW`
import time
import functools

def retry(times=3, delay=1.0, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:
                    last_error = exc
                    print(f"[retry {attempt}/{times}] {func.__name__}: {exc}")
                    if attempt < times:
                        time.sleep(delay * attempt)   # 线性退避
            raise last_error
        return wrapper
    return decorator

@retry(times=3, delay=0.5, exceptions=(TimeoutError, ConnectionError))
def fetch(url):
    ...
` },
    { t: "h", x: "4.6 缓存：lru_cache" },
    { t: "code", title: "cache.py", x: RAW`
from functools import lru_cache

@lru_cache(maxsize=128)
def normalize_domain(domain):
    print("计算", domain)
    return domain.lower().strip(".")

print(normalize_domain("Example.COM"))
print(normalize_domain("Example.COM"))   # 只打印一次
print(normalize_domain.cache_info())
` },
    { t: "note", kind: "warn", title: "不要给有副作用的函数加缓存", x: "依赖时间的函数、会发请求的函数、参数是可变对象的函数，缓存后行为不可预期。缓存只适合纯函数：同样输入永远同样输出。" },
    { t: "h", x: "4.7 进阶：限速装饰器" },
    { t: "code", title: "throttle.py", x: RAW`
import time
import functools
import threading

def throttle(interval=0.5):
    lock = threading.Lock()
    last = [0.0]
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            with lock:
                wait = interval - (time.monotonic() - last[0])
                if wait > 0:
                    time.sleep(wait)
                last[0] = time.monotonic()
            return func(*args, **kwargs)
        return wrapper
    return decorator

@throttle(0.5)
def request_page(url):
    print(time.strftime("%H:%M:%S"), url)
` },
    { t: "p", x: "这里用列表 <code>last = [0.0]</code> 而不是整数，是因为闭包里重新绑定不可变变量需要 nonlocal；用单元素列表更直观。生产环境更推荐令牌桶或信号量（第 8、9 章），装饰器限速只适合单线程低频场景。" }
  ],
  pitfalls: [
    { title: "忘记 functools.wraps", body: "函数名、文档、签名全变成 wrapper，日志和调试信息失真，FastAPI 之类依赖签名的框架还会直接报错。" },
    { title: "带参装饰器写成两层", body: "@retry(3) 时，第一层收到的是 3 而不是函数，调用时报 int is not callable。" },
    { title: "循环里创建 lambda / 闭包", body: "晚绑定让所有函数共享最后一个值。用默认参数固定，或改用函数工厂。" },
    { title: "装饰器里吞掉异常", body: "try/except 后不 raise，调用方以为成功，最终数据缺失且无声。" },
    { title: "装饰顺序搞反", body: "@a 在上、@b 在下，实际执行是 b 先包住函数，再由 a 包住结果。" }
  ],
  cheatsheet: [
    ["<code>def f(*args, **kwargs)</code>", "接收任意参数"],
    ["<code>nonlocal x</code>", "修改外层函数变量"],
    ["<code>functools.wraps(func)</code>", "保留原函数元信息"],
    ["<code>@decorator</code>", "等价于 f = decorator(f)"],
    ["<code>@decorator(args)</code>", "需要三层嵌套"],
    ["<code>lru_cache(maxsize=None)</code>", "纯函数结果缓存"],
    ["<code>f.__wrapped__</code>", "拿到被装饰的原函数"]
  ],
  quiz: [
    { q: "def retry(times=3) 装饰器的正确结构是？", options: ["两层：参数 → 函数", "三层：参数 → 函数 → wrapper", "一层即可", "必须用类实现"], answer: 1, explain: "带参数时，最外层接收配置，返回一个真正的装饰器，由它再接收函数并返回 wrapper。" },
    { q: "for i in range(3): funcs.append(lambda: i) 后调用三个函数，结果是？", options: ["0 1 2", "2 2 2", "报错", "随机"], answer: 1, explain: "闭包捕获变量 i 本身，循环结束后 i 是 2，所以三个函数都返回 2。用 lambda i=i 固定默认值。" },
    { q: "functools.wraps 的主要作用是？", options: ["提升运行速度", "让 wrapper 保留原函数的名称和文档", "自动加锁", "把函数变成协程"], answer: 1, explain: "它复制 __name__、__doc__、__module__ 等元信息，必要时还设置 __wrapped__，方便调试和框架反射。" }
  ],
  tasks: [
    { title: "写一个带指数退避的重试装饰器", level: "进阶", desc: "支持 times、base_delay、异常类型列表；第 n 次失败后等待 base_delay * 2**(n-1) 秒；最终失败时抛出最后一次异常。", file: "exercises/ch04_functions.py" },
    { title: "给解析函数加计时与日志", level: "基础", desc: "用装饰器记录函数名、参数个数、耗时；耗时超过 1 秒时用 warning 级别输出。", file: "exercises/ch04_functions.py" }
  ]
},

/* ================= 第 5 章 ================= */
{
  id: "ch05", no: 5, stage: 1, stageName: "语法内功",
  title: "面向对象与数据模型",
  subtitle: "用 dataclass 定义 Item，用上下文管理资源",
  time: "110 分钟", level: "进阶", tags: ["class", "dataclass", "property", "dunder"],
  crawlerScene: "所有解析逻辑塞进一个 800 行的 Spider 类：请求、解析、存储、重试全在一层，改一个字段要读半小时代码，还不敢动。",
  goals: [
    "分清类属性与实例属性，避开可变类属性共享",
    "用 dataclass 定义清晰的数据模型，用 field 处理可变默认值",
    "理解 dunder 协议，知道什么时候该用类、什么时候用纯函数"
  ],
  blocks: [
    { t: "lead", x: "面向对象的价值不在于「把函数塞进类里」，而在于用对象承载状态、用协议对接生态。爬虫里真正值得写成类的，是数据模型（Item）和资源持有者（Session、Storage），不是整条业务流程。" },
    { t: "h", x: "5.1 类属性 vs 实例属性" },
    { t: "code", title: "class_attr.py", x: RAW`class Spider:
    headers = {}                 # 类属性：所有实例共享！

    def __init__(self, name):
        self.name = name          # 实例属性

a = Spider("a")
b = Spider("b")

a.headers["UA"] = "bot"
print(b.headers)                  # {'UA': 'bot'} —— 被 a 改了，b 也中招

class SpiderFixed:
    def __init__(self, name):
        self.name = name
        self.headers = {}          # 每个实例独立

c = SpiderFixed("c")
d = SpiderFixed("d")
c.headers["UA"] = "bot"
print(d.headers)                  # {}
` },
    { t: "p", x: "查找顺序是「实例字典 → 类字典 → 父类」。给实例赋值会创建实例属性，遮蔽同名的类属性；但修改类属性里的可变对象，是在原地改，所有实例都看得见。" },
    { t: "h", x: "5.2 dataclass：数据模型的默认答案" },
    { t: "code", title: "item.py", x: RAW`
from dataclasses import dataclass, field
from typing import Optional

@dataclass(slots=True)
class Item:
    title: str
    price: float
    url: str
    tags: list[str] = field(default_factory=list)
    stock: Optional[int] = None

item = Item("键盘", 199.0, "https://a.com/1", tags=["数码"])
print(item)
# Item(title='键盘', price=199.0, url='https://a.com/1', tags=['数码'], stock=None)
` },
    { t: "p", x: "<code>@dataclass</code> 自动生成 <code>__init__</code>、<code>__repr__</code>、<code>__eq__</code>。可变默认值必须用 <code>field(default_factory=list)</code>，否则 dataclass 会直接报错（它替你挡住了第 1 章那个坑）。<code>slots=True</code> 减少内存占用，适合百万级 Item。" },
    { t: "code", title: "dataclass_options.py", x: RAW`
from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True)
class UrlTask:
    url: str
    priority: int = 0
    retries: int = 0

task = UrlTask("https://a.com/1")
# task.url = "..."   # FrozenInstanceError
print(hash(task))      # 可哈希，能放进 set 去重

@dataclass
class Result:
    items: list = field(default_factory=list)
` },
    { t: "note", kind: "tip", title: "frozen 适合任务/配置", x: "不可变对象可以安全地放进 set、作为 dict key，也能在并发场景中放心共享。需要更新时用 <code>dataclasses.replace(task, retries=1)</code> 生成新对象。" },
    { t: "h", x: "5.3 property：给属性加一层校验" },
    { t: "code", title: "property.py", x: RAW`
class Page:
    def __init__(self, html: str):
        self._html = html
        self._text = None

    @property
    def text(self):
        if self._text is None:
            self._text = self._html.replace("<br>", "\n")
        return self._text

page = Page("<br>hello")
print(page.text)        # 换行 + hello
print(page.text)        # 第二次走缓存
` },
    { t: "p", x: "<code>property</code> 让「计算属性」看起来像普通字段，同时保留懒加载、校验、只读等能力。注意别在 property 里做昂贵又无缓存的事，调用方会以为它是一只读字段。" },
    { t: "h", x: "5.4 dunder：让对象接入 Python 生态" },
    { t: "code", title: "dunder.py", x: RAW`
class Basket:
    def __init__(self, items):
        self.items = list(items)

    def __repr__(self):
        return f"Basket({self.items!r})"

    def __len__(self):
        return len(self.items)

    def __iter__(self):
        return iter(self.items)

    def __contains__(self, x):
        return x in self.items

b = Basket(["apple", "pear"])
print(b)                 # Basket(['apple', 'pear'])
print(len(b), list(b), "apple" in b)
` },
    { t: "p", x: "常用协议：<code>__repr__</code> 给人看、<code>__str__</code> 给用户看；<code>__eq__</code> 定义相等；<code>__hash__</code> 定义可哈希；<code>__len__</code> / <code>__iter__</code> / <code>__contains__</code> 让对象像容器。<code>__enter__</code> / <code>__exit__</code> 支持 with。" },
    { t: "note", kind: "warn", title: "实现了 __eq__ 就失去默认 __hash__", x: "可变对象（比如 Item）一般不该可哈希；需要放进 set 的模型用 <code>frozen=True</code> 或显式定义 <code>__hash__</code>，并保证相等的对象哈希相同。" },
    { t: "h", x: "5.5 继承、MRO 与组合" },
    { t: "code", title: "mro.py", x: RAW`
class Base:
    def handle(self):
        return "base"

class FetchMixin(Base):
    def handle(self):
        return "fetch -> " + super().handle()

class ParseMixin(Base):
    def handle(self):
        return "parse -> " + super().handle()

class Spider(FetchMixin, ParseMixin, Base):
    pass

print(Spider().handle())        # fetch -> parse -> base
print([c.__name__ for c in Spider.__mro__])
` },
    { t: "p", x: "MRO 是 C3 线性化：子类 → 左父类 → 右父类 → 共同祖先。多重继承不是不能用，但爬虫里更推荐组合：抓取器、解析器、存储器各自独立，由流程函数串起来，改一个不影响另一个。" },
    { t: "h", x: "5.6 上下文管理器" },
    { t: "code", title: "context.py", x: RAW`
from contextlib import contextmanager
import sqlite3

@contextmanager
def open_db(path):
    conn = sqlite3.connect(path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

with open_db("items.db") as conn:
    conn.execute("CREATE TABLE IF NOT EXISTS item (title TEXT)")

# 类实现版
class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        import time
        print(f"耗时 {time.perf_counter() - self.start:.3f}s")
        return False      # False 表示不吞异常

with Timer():
    sum(range(1_000_000))
` },
    { t: "p", x: "<code>__exit__</code> 返回 True 会吞掉异常，除非你非常清楚在做什么，否则一律返回 False 或 None。" },
    { t: "h", x: "5.7 什么时候不该用类" },
    { t: "p", x: "纯函数 + dataclass 的组合更轻：解析函数只依赖输入，容易测试、容易并发。只有需要持有连接、会话、配置状态时，才值得写类。判断标准：这个对象去掉状态后还能工作吗？能，就别写类。" }
  ],
  pitfalls: [
    { title: "类属性里放可变对象", body: "所有实例共享同一个 dict/list，一处修改全局污染。放 <code>__init__</code> 里创建。" },
    { title: "dataclass 用 [] 当默认值", body: "dataclass 会抛出 ValueError；改用 <code>field(default_factory=list)</code>。" },
    { title: "在 __init__ 里做网络请求", body: "对象构造应该快且可预测；请求失败会让「创建对象」变成一个危险操作。用显式方法或工厂函数。" },
    { title: "重写 __eq__ 没定义 __hash__", body: "对象变成不可哈希，不能放进 set；或者哈希不一致导致去重失效。" },
    { title: "__exit__ 返回 True", body: "异常被静默吞掉，调用方永远不知道失败。除非在写事务回滚这类明确场景，否则返回 False。" }
  ],
  cheatsheet: [
    ["<code>@dataclass(slots=True)</code>", "自动生成构造/repr/eq，省内存"],
    ["<code>field(default_factory=list)</code>", "可变默认值的正确写法"],
    ["<code>@dataclass(frozen=True)</code>", "不可变、可哈希"],
    ["<code>@property</code>", "计算属性 / 只读属性"],
    ["<code>__repr__</code>", "调试时打印对象内容"],
    ["<code>__enter__ / __exit__</code>", "支持 with 语句"],
    ["<code>contextlib.contextmanager</code>", "用生成器写上下文管理器"],
    ["<code>super()</code>", "沿 MRO 调用下一个实现"]
  ],
  quiz: [
    { q: "class Spider: headers = {} 的问题是什么？", options: ["语法错误", "所有实例共享同一个 dict", "每次实例化都会复制", "无法读取"], answer: 1, explain: "类属性只创建一次，所有实例通过类字典访问同一个可变对象，任何实例修改都会影响其他实例。" },
    { q: "dataclass 中想给 list 字段一个独立空列表，正确写法是？", options: ["tags: list = []", "tags: list = list()", "tags: list = field(default_factory=list)", "tags: list = None"], answer: 2, explain: "dataclass 禁止可变默认值，default_factory 会在每次实例化时调用 list 生成新对象。" },
    { q: "上下文管理器的 __exit__ 返回 True 意味着？", options: ["正常退出", "异常被吞掉，不再向外传播", "强制关闭文件", "返回 True 给 with 变量"], answer: 1, explain: "__exit__ 返回真值时，with 块内的异常被抑制；返回 False/None 则继续传播。" }
  ],
  tasks: [
    { title: "把解析结果建模成 dataclass", level: "基础", desc: "定义 Item（title/price/url/tags/stock），用 slots 与 default_factory；实现 from_dict 类方法，缺字段时返回 None 而不是抛异常。", file: "exercises/ch05_oop.py" },
    { title: "写一个可复用的资源管理器", level: "进阶", desc: "用 contextlib.contextmanager 实现计时器：进入时记录开始时间，退出时打印耗时；异常退出时额外打印异常类型，但不吞异常。", file: "exercises/ch05_oop.py" }
  ]
},

/* ================= 第 6 章 ================= */
{
  id: "ch06", no: 6, stage: 1, stageName: "语法内功",
  title: "异常、文件与数据持久化",
  subtitle: "让爬到一半断网的进程，能从断点继续",
  time: "120 分钟", level: "进阶", tags: ["异常", "pathlib", "JSONL", "logging"],
  crawlerScene: "脚本跑到第 3 万条时断网崩溃，所有结果都在内存里，一起没了；重跑又要从头再来，IP 还被封了。",
  goals: [
    "精准捕获异常，保留上下文，不用裸 except 吞错误",
    "用 pathlib 与 with 安全读写文件，处理编码问题",
    "实现 JSONL 落盘 + 已完成集合，做到断点续爬"
  ],
  blocks: [
    { t: "lead", x: "爬虫是长时间、不可靠网络环境下的程序。异常不是意外，是常态；文件不是可选项，是生命线。这一章解决两件事：出错时知道发生了什么，中断后能接着跑。" },
    { t: "h", x: "6.1 异常层级与捕获原则" },
    { t: "table", head: ["异常", "典型场景", "处理方式"], rows: [
      ["<code>requests.Timeout</code>", "请求超时", "重试 + 退避"],
      ["<code>requests.ConnectionError</code>", "DNS/连接失败", "重试，多次失败记录"],
      ["<code>requests.HTTPError</code>", "4xx / 5xx", "按状态码分类处理"],
      ["<code>ValueError</code>", "int/float 转换失败", "返回 None 或跳过该字段"],
      ["<code>KeyError</code>", "字典缺字段", "用 get 或显式校验"],
      ["<code>FileNotFoundError</code>", "路径不存在", "创建目录或回退默认值"]
    ] },
    { t: "code", title: "try_structure.py", x: RAW`
def parse_price(raw):
    try:
        return float(raw.replace(",", "").replace("￥", ""))
    except (ValueError, AttributeError) as exc:
        raise ValueError(f"无法解析价格: {raw!r}") from exc

try:
    price = parse_price("N/A")
except ValueError as exc:
    print(exc)                      # 无法解析价格: 'N/A'
    print(exc.__cause__)            # could not convert string to float: 'N/A'
else:
    print("解析成功", price)
finally:
    print("无论成败都会执行")
` },
    { t: "p", x: "<code>try / except / else / finally</code> 各司其职：else 放「没异常时才做」的事，finally 放清理。用 <code>raise ... from exc</code> 保留原始异常链，日志里才能看到根因。" },
    { t: "note", kind: "danger", title: "裸 except 是事故之源", x: "<code>except: pass</code> 会连 KeyboardInterrupt、SystemExit 一起吞掉，按 Ctrl+C 都停不下来。至少写 <code>except Exception</code>，并且必须记录日志或重新抛出。" },
    { t: "h", x: "6.2 EAFP：先做，失败再处理" },
    { t: "code", title: "eafp.py", x: RAW`
# LBYL：先检查再操作，检查与操作之间状态可能变化
if raw.isdigit():
    value = int(raw)

# EAFP：直接尝试，捕获预期异常（Python 更推荐）
try:
    value = int(raw)
except ValueError:
    value = None
` },
    { t: "p", x: "对字典取值、文件读取、类型转换，EAFP 通常更简洁也更可靠。但不要用它掩盖真正的 bug：捕获范围要具体。" },
    { t: "h", x: "6.3 自定义异常" },
    { t: "code", title: "custom_error.py", x: RAW`
class SpiderError(Exception):
    """爬虫基础异常"""

class ParseError(SpiderError):
    def __init__(self, url, field, raw):
        super().__init__(f"解析失败 {url} 字段={field} 原值={raw!r}")
        self.url = url
        self.field = field
        self.raw = raw

try:
    raise ParseError("https://a.com/1", "price", "N/A")
except SpiderError as exc:
    print(exc)
    print(exc.field)
` },
    { t: "p", x: "自定义异常让调用方可以按业务分类处理（解析失败跳过、网络失败重试、封禁则暂停），而不是靠字符串匹配错误信息。" },
    { t: "h", x: "6.4 with 与文件安全写入" },
    { t: "code", title: "with_open.py", x: RAW`
from pathlib import Path

path = Path("data/output.txt")
path.parent.mkdir(parents=True, exist_ok=True)

with path.open("w", encoding="utf-8") as f:
    f.write("第一行\n")
# 离开 with 自动 close，即使中途抛异常

# 追加模式不会清空已有内容
with path.open("a", encoding="utf-8") as f:
    f.write("第二行\n")
` },
    { t: "note", kind: "warn", title: "encoding 不写，行为随平台变", x: "Windows 默认可能是 cp936/GBK，Linux 是 UTF-8。读写文本一律显式 <code>encoding=\"utf-8\"</code>，否则同一份代码换台机器就乱码。" },
    { t: "h", x: "6.5 pathlib：路径操作的正确姿势" },
    { t: "code", title: "paths.py", x: RAW`
from pathlib import Path

base = Path("data") / "2026-11-02"
base.mkdir(parents=True, exist_ok=True)

files = list(base.glob("*.json"))
print(files)
print(base.name, base.suffix, base.parent)

target = base / "items.jsonl"
print(target.exists(), target.stat().st_size if target.exists() else 0)

for p in Path(".").glob("*.py"):
    print(p.name, p.suffix)
` },
    { t: "p", x: "用 <code>/</code> 拼接路径、用 <code>glob</code> 找文件、用 <code>read_text</code>/<code>write_text</code> 快速读写小文件。不要在字符串里手拼 <code>C:\\\\a\\\\b</code>，跨平台会出问题。" },
    { t: "h", x: "6.6 JSON、JSONL 与 CSV" },
    { t: "code", title: "jsonl.py", x: RAW`
import json

item = {"title": "键盘", "price": 199.0, "tags": ["数码"]}

# 默认 ensure_ascii=True 会把中文变成 \uXXXX，人眼不可读
line = json.dumps(item, ensure_ascii=False)
print(line)      # {"title": "键盘", "price": 199.0, "tags": ["数码"]}

# JSONL：一行一个 JSON，适合流式追加与断点续写
with open("data/items.jsonl", "a", encoding="utf-8") as f:
    f.write(line + "\n")

# 读取时逐行解析，内存占用恒定
with open("data/items.jsonl", encoding="utf-8") as f:
    for line in f:
        if line.strip():
            print(json.loads(line)["title"])
` },
    { t: "p", x: "JSONL（.jsonl / .ndjson）是爬虫最实用的落盘格式：可以追加、可以逐行读取、可以在崩溃后只丢掉最后半行。整份 JSON 数组则必须整体解析，数据越大越痛苦。" },
    { t: "code", title: "csv_out.py", x: RAW`
import csv

rows = [
    {"title": "键盘", "price": 199.0},
    {"title": "鼠标", "price": 99.0},
]

with open("data/items.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["title", "price"])
    writer.writeheader()
    writer.writerows(rows)
` },
    { t: "note", kind: "tip", title: "CSV 给 Excel 看就用 utf-8-sig", x: "Excel 打开 UTF-8 CSV 中文会乱码；带 BOM 的 <code>utf-8-sig</code> 可以解决。另外必须写 <code>newline=\"\"</code>，否则 Windows 会多出空行。" },
    { t: "h", x: "6.7 断点续爬的实现" },
    { t: "code", title: "resume.py", x: RAW`
import json
from pathlib import Path

STATE = Path("data/state.json")

def load_state():
    if STATE.exists():
        return json.loads(STATE.read_text(encoding="utf-8"))
    return {"done": [], "last_page": 0}

def save_state(done, last_page):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(
        json.dumps({"done": sorted(done), "last_page": last_page}, ensure_ascii=False),
        encoding="utf-8",
    )

state = load_state()
done = set(state["done"])

for url in ["https://a.com/1", "https://a.com/2"]:
    if url in done:
        continue
    # ... 抓取并追加写入 JSONL ...
    done.add(url)
    save_state(done, last_page=1)
` },
    { t: "p", x: "真实项目里，把「已完成 URL」写进 SQLite（带唯一索引）比 JSON 更稳：断电也不会写坏，还能直接查询。数据量超过几万条时，尽早换 SQLite。" },
    { t: "code", title: "sqlite_dedupe.py", x: RAW`
import sqlite3

conn = sqlite3.connect("data/spider.db")
conn.execute("CREATE TABLE IF NOT EXISTS seen (url TEXT PRIMARY KEY)")
try:
    conn.execute("INSERT INTO seen (url) VALUES (?)", ("https://a.com/1",))
    conn.commit()
except sqlite3.IntegrityError:
    print("已经抓过，跳过")
finally:
    conn.close()
` },
    { t: "h", x: "6.8 logging 而不是 print" },
    { t: "code", title: "logging_setup.py", x: RAW`
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

Path("logs").mkdir(exist_ok=True)
handler = RotatingFileHandler("logs/spider.log", maxBytes=5_000_000, backupCount=3, encoding="utf-8")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    handlers=[handler, logging.StreamHandler()],
)
log = logging.getLogger("spider")

log.info("开始抓取")
try:
    ...
except Exception:
    log.exception("抓取失败")      # 自动附带 traceback
` },
    { t: "p", x: "日志要能回答三个问题：什么时候、哪个任务、为什么失败。<code>logger.exception</code> 只能在 except 块里用，它会自动记录异常栈。用 f-string 拼日志会提前求值，推荐 <code>log.info(\"url=%s\", url)</code> 的延迟格式化写法。" }
  ],
  pitfalls: [
    { title: "except: pass", body: "吞掉一切异常，包括 Ctrl+C。至少用 <code>except Exception</code>，并且记录或重抛。" },
    { title: "open 不指定 encoding", body: "Windows 与 Linux 默认编码不同，换机器就乱码。文本文件一律显式 utf-8。" },
    { title: "用 'w' 模式重复运行", body: "每次启动清空文件，昨天的数据全没了。追加用 'a'，或按日期分文件。" },
    { title: "json.dumps 遇到 datetime/set", body: "默认序列化器不支持，直接 TypeError。先转成字符串/列表，或用 default=str。" },
    { title: "日志里用 f-string", body: "即使日志级别不输出，字符串也已经拼接完成，浪费性能；大量日志时很明显。" }
  ],
  cheatsheet: [
    ["<code>try/except/else/finally</code>", "分区块处理异常与清理"],
    ["<code>raise X from exc</code>", "保留异常链"],
    ["<code>Path(...).mkdir(parents=True, exist_ok=True)</code>", "安全建目录"],
    ["<code>path.read_text(encoding=\"utf-8\")</code>", "读小文件"],
    ["<code>json.dumps(x, ensure_ascii=False)</code>", "中文不转义"],
    ["<code>open(..., \"a\", encoding=\"utf-8\")</code>", "追加写入"],
    ["<code>csv.DictWriter(..., newline=\"\")</code>", "避免 CSV 空行"],
    ["<code>logger.exception(...)</code>", "记录异常栈"]
  ],
  quiz: [
    { q: "关于 except: pass，说法正确的是？", options: ["最安全的写法", "会吞掉 KeyboardInterrupt 等异常且无日志", "只能捕获 ValueError", "等价于 except Exception: pass"], answer: 1, explain: "裸 except 捕获 BaseException 的所有子类，包括 Ctrl+C 与系统退出，且不记录任何信息。" },
    { q: "写 JSONL 相比写一个 JSON 数组的优势是？", options: ["文件更小", "可以逐行追加和读取，崩溃只损失最后一行", "自动压缩", "支持中文"], answer: 1, explain: "整份 JSON 数组必须完整解析，内存和损坏代价都高；JSONL 一行一条，天然适合流式与断点续写。" },
    { q: "日志为什么推荐 logger.info('url=%s', url) 而不是 f-string？", options: ["语法更古老", "延迟格式化，级别不输出时不浪费拼接", "能自动转义", "f-string 不能用于日志"], answer: 1, explain: "logging 会先判断级别，未达到就不格式化；f-string 在调用前就已求值。" }
  ],
  tasks: [
    { title: "实现 JSONL 断点续爬", level: "进阶", desc: "给一批 URL，跳过 state.json 中已完成的；每成功一条就追加到 items.jsonl 并更新 state；模拟中途异常后重新运行，验证不会重复。", file: "exercises/ch06_io.py" },
    { title: "写一个解析失败日志器", level: "基础", desc: "解析 10 条脏数据，失败的记录到 logs/parse_error.log（含 URL、字段、原值），成功的写入 CSV（utf-8-sig）。", file: "exercises/ch06_io.py" }
  ]
}

]);
})();

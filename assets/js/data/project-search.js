/* 项目 03 · 迷你搜索引擎
   分词 → 倒排索引 → 布尔查询 → TF-IDF 排序 → JSON 持久化。 */
window.PROJECTS.push({
  id: "mini-search",
  type: "project",
  index: "03",
  title: "迷你搜索引擎",
  subtitle: "倒排索引 + TF-IDF 排序",
  summary: "从零实现一个能解释清楚原理的搜索：中文 bigram 分词、倒排索引、AND 查询、TF-IDF 打分与 JSON 持久化。",
  level: "简历级 · 进阶",
  duration: "6–8 小时",
  mode: "browser",
  modeLabel: "浏览器可完整练习",
  accent: "#6a4bf0",
  stack: ["Python", "re", "math", "json", "argparse"],
  resumeLine: "从零实现迷你搜索引擎：中文 bigram 分词、倒排索引、布尔查询、TF-IDF 排序与索引持久化。",
  highlights: [
    "能讲清倒排索引与 TF-IDF 的原理，而不是调库",
    "有中文分词取舍与排序稳定性的工程细节",
    "可以继续扩展成向量检索 / 拼写纠错 / 增量索引",
  ],
  sections: [
    {
      type: "h",
      text: "搜索引擎的最小闭环",
    },
    {
      type: "p",
      html: "一个搜索引擎可以拆成三件事：<strong>把文本变成词</strong>（分词）、<strong>记住每个词出现在哪些文档</strong>（倒排索引）、<strong>把匹配结果排得有道理</strong>（打分）。这个项目用不到 200 行代码把闭环跑通，重点是你能否解释每一步为什么这么做。",
    },
    {
      type: "list",
      items: [
        "分词：英文按单词、中文按二元组（bigram），过滤停用词与标点。",
        "倒排索引：token → {doc_id: 词频}，支持 AND 查询。",
        "排序：TF-IDF，词频越高越相关，出现在越少文档里的词权重越大。",
        "持久化：索引写 JSON，支持保存与加载。",
        "CLI：输入查询，输出文档、分数与摘要。",
      ],
    },
    {
      type: "table",
      head: ["概念", "一句话解释"],
      rows: [
        ["倒排索引", "从“词”反查“文档”，而不是逐篇扫描"],
        ["TF", "词在文档里出现几次"],
        ["IDF", "词在多少文档里出现；越稀有越重要"],
        ["bigram", "中文每两个相邻字切一个词，避免依赖词典"],
      ],
    },
    {
      type: "callout",
      tone: "deep",
      title: "为什么不直接用 jieba",
      html: "用分词库当然可以，但简历项目里更重要的是“你知道索引和排序怎么工作”。先用 bigram 把原理跑通，再替换成 jieba 或向量检索，才有对比和取舍可讲。",
    },
    {
      type: "callout",
      tone: "warn",
      title: "避免“演示级”实现",
      html: "至少处理：空查询、查询词不在索引、重复词、中文单字、排序同分。否则面试官随便试一个边界就能看出是拼凑的。",
    },
  ],
  architecture: {
    tree: String.raw`mini-search/
├─ mini_search.py       # 分词 + 索引 + 排序 + CLI
├─ test_search.py       # 分词、AND、TF-IDF、持久化
├─ docs/                # 待索引的文本（可选）
├─ index.json           # 运行时生成
└─ README.md`,
    notes: [
      "分词与索引分离，方便替换分词器而不动排序。",
      "索引只存词频，不存全文；文档正文由 docs 字典或文件目录提供。",
      "TF-IDF 的 N 必须显式传入，否则删文档后分数会漂移。",
    ],
  },
  milestones: [
    {
      title: "M1 分词与归一化",
      desc: "英文小写、去停用词；中文按 bigram 切分；处理空串与标点。",
      exIds: ["pr3-1"],
    },
    {
      title: "M2 倒排索引与 AND 查询",
      desc: "token → {doc_id: 词频}；查询必须所有词都出现。",
      exIds: ["pr3-2"],
    },
    {
      title: "M3 TF-IDF 排序",
      desc: "用词频和文档频率打分，按分数降序、同分按文档 id。",
      exIds: ["pr3-3"],
    },
    {
      title: "M4 索引持久化",
      desc: "索引写 JSON，能重新加载并继续查询。",
      exIds: ["pr3-4"],
    },
  ],
  exercises: [
    {
      id: "pr3-1",
      kind: "code",
      title: "分词：英文单词 + 中文 bigram",
      difficulty: "★★☆",
      prompt:
        "实现 <code>tokenize(text)</code>：英文转小写、去停用词、丢弃长度小于 2 的词；中文连续片段切成相邻二元组（单字保留）；数字保留。",
      starter: String.raw`import re

TOKEN_RE = re.compile(r"[A-Za-z]+|[\u4e00-\u9fff]+|\d+")
STOPWORDS = {"a", "an", "the", "is", "are", "of", "to", "and", "in", "for", "with", "on", "at", "by"}

def tokenize(text):
    pass

for text in ["The quick brown fox", "Python 装饰器", "装饰器", "2026 Python 3"]:
    print(text, "->", tokenize(text))`,
      hints: [
        "先 <code>TOKEN_RE.findall(text)</code>，再按类型分别处理。",
        "中文：<code>part[i:i + 2] for i in range(len(part) - 1)</code>。",
        "英文单字符直接丢掉；数字不要丢。",
      ],
      solution: String.raw`import re

TOKEN_RE = re.compile(r"[A-Za-z]+|[\u4e00-\u9fff]+|\d+")
STOPWORDS = {"a", "an", "the", "is", "are", "of", "to", "and", "in", "for", "with", "on", "at", "by"}

def tokenize(text):
    tokens = []
    for part in TOKEN_RE.findall(text):
        if part.isdigit():
            tokens.append(part)
        elif part.isascii():
            word = part.lower()
            if len(word) >= 2 and word not in STOPWORDS:
                tokens.append(word)
        else:
            if len(part) == 1:
                tokens.append(part)
            else:
                tokens.extend(part[i:i + 2] for i in range(len(part) - 1))
    return tokens

for text in ["The quick brown fox", "Python 装饰器", "装饰器", "2026 Python 3"]:
    print(text, "->", tokenize(text))`,
      check: String.raw`assert tokenize("The quick brown fox") == ["quick", "brown", "fox"]
assert tokenize("Python 装饰器") == ["python", "装饰", "饰器"]
assert tokenize("装饰器") == ["装饰", "饰器"]
assert tokenize("器") == ["器"]
assert tokenize("2026 Python 3") == ["2026", "python", "3"]
assert tokenize("，。！") == []
assert tokenize("") == []
assert tokenize("A I") == []
print("通过：英文停用词、中文 bigram、单字与数字都正确")`,
    },
    {
      id: "pr3-2",
      kind: "code",
      title: "倒排索引与 AND 查询",
      difficulty: "★★★",
      prompt:
        "实现 <code>build_index(docs)</code>：返回 token → {doc_id: 词频}；实现 <code>search_and(index, query)</code>：先分词，再取所有查询词对应文档集合的交集，结果按文档 id 升序。",
      starter: String.raw`import re
from collections import Counter

TOKEN_RE = re.compile(r"[A-Za-z]+|[\u4e00-\u9fff]+|\d+")
STOPWORDS = {"a", "an", "the", "is", "are", "of", "to", "and", "in", "for", "with", "on", "at", "by"}

def tokenize(text):
    tokens = []
    for part in TOKEN_RE.findall(text):
        if part.isdigit():
            tokens.append(part)
        elif part.isascii():
            word = part.lower()
            if len(word) >= 2 and word not in STOPWORDS:
                tokens.append(word)
        else:
            if len(part) == 1:
                tokens.append(part)
            else:
                tokens.extend(part[i:i + 2] for i in range(len(part) - 1))
    return tokens

def build_index(docs):
    pass

def search_and(index, query):
    pass

docs = {"1": "Python 装饰器", "2": "Python 生成器", "3": "装饰器 与 生成器"}
print(build_index(docs))`,
      hints: [
        "每个文档先 <code>Counter(tokenize(text))</code>，再写进 postings。",
        "查询分词后，如果任何一个词不在索引，结果直接为空。",
        "<code>set.intersection(*sets)</code> 求交集，最后 <code>sorted()</code>。",
      ],
      solution: String.raw`import re
from collections import Counter

TOKEN_RE = re.compile(r"[A-Za-z]+|[\u4e00-\u9fff]+|\d+")
STOPWORDS = {"a", "an", "the", "is", "are", "of", "to", "and", "in", "for", "with", "on", "at", "by"}

def tokenize(text):
    tokens = []
    for part in TOKEN_RE.findall(text):
        if part.isdigit():
            tokens.append(part)
        elif part.isascii():
            word = part.lower()
            if len(word) >= 2 and word not in STOPWORDS:
                tokens.append(word)
        else:
            if len(part) == 1:
                tokens.append(part)
            else:
                tokens.extend(part[i:i + 2] for i in range(len(part) - 1))
    return tokens

def build_index(docs):
    index = {}
    for doc_id, text in docs.items():
        for token, count in Counter(tokenize(text)).items():
            index.setdefault(token, {})[doc_id] = count
    return index

def search_and(index, query):
    tokens = tokenize(query)
    if not tokens:
        return []
    sets = [set(index.get(token, {})) for token in tokens]
    result = set.intersection(*sets)
    return sorted(result)

docs = {"1": "Python 装饰器", "2": "Python 生成器", "3": "装饰器 与 生成器"}
print(build_index(docs))`,
      check: String.raw`docs = {"1": "Python 装饰器", "2": "Python 生成器", "3": "装饰器 与 生成器"}
index = build_index(docs)
assert index["python"] == {"1": 1, "2": 1}
assert index["装饰"] == {"1": 1, "3": 1}
assert index["饰器"] == {"1": 1, "3": 1}
assert search_and(index, "python") == ["1", "2"]
assert search_and(index, "python 装饰器") == ["1"]
assert search_and(index, "python 生成器") == ["2"]
assert search_and(index, "不存在的词") == []
assert search_and(index, "") == []
print("通过：倒排索引词频与 AND 查询都正确")`,
    },
    {
      id: "pr3-3",
      kind: "code",
      title: "TF-IDF 排序",
      difficulty: "★★★",
      prompt:
        "实现 <code>rank(index, query, n_docs)</code>：对每个匹配文档累加 <code>tf * idf</code>，其中 <code>idf = log((n_docs + 1) / (df + 1)) + 1</code>。返回 <code>[{\"doc\": id, \"score\": round(score, 4)}]</code>，按分数降序、同分按 id 升序。",
      starter: String.raw`import math
import re

TOKEN_RE = re.compile(r"[A-Za-z]+|[\u4e00-\u9fff]+|\d+")
STOPWORDS = {"a", "an", "the", "is", "are", "of", "to", "and", "in", "for", "with", "on", "at", "by"}

def tokenize(text):
    tokens = []
    for part in TOKEN_RE.findall(text):
        if part.isdigit():
            tokens.append(part)
        elif part.isascii():
            word = part.lower()
            if len(word) >= 2 and word not in STOPWORDS:
                tokens.append(word)
        else:
            if len(part) == 1:
                tokens.append(part)
            else:
                tokens.extend(part[i:i + 2] for i in range(len(part) - 1))
    return tokens

def rank(index, query, n_docs):
    pass

index = {
    "python": {"1": 1, "2": 1},
    "装饰": {"1": 1, "3": 1},
    "饰器": {"1": 1, "3": 1},
}
print(rank(index, "python 装饰器", 3))`,
      hints: [
        "每个查询 token 先算 idf，再遍历它的 postings 累加。",
        "文档没有该词就不加分；空查询返回 []。",
        "排序 key：<code>(-score, doc_id)</code>。",
      ],
      solution: String.raw`import math
import re

TOKEN_RE = re.compile(r"[A-Za-z]+|[\u4e00-\u9fff]+|\d+")
STOPWORDS = {"a", "an", "the", "is", "are", "of", "to", "and", "in", "for", "with", "on", "at", "by"}

def tokenize(text):
    tokens = []
    for part in TOKEN_RE.findall(text):
        if part.isdigit():
            tokens.append(part)
        elif part.isascii():
            word = part.lower()
            if len(word) >= 2 and word not in STOPWORDS:
                tokens.append(word)
        else:
            if len(part) == 1:
                tokens.append(part)
            else:
                tokens.extend(part[i:i + 2] for i in range(len(part) - 1))
    return tokens

def rank(index, query, n_docs):
    tokens = tokenize(query)
    scores = {}
    for token in tokens:
        postings = index.get(token)
        if not postings:
            continue
        idf = math.log((n_docs + 1) / (len(postings) + 1)) + 1
        for doc_id, tf in postings.items():
            scores[doc_id] = scores.get(doc_id, 0.0) + tf * idf
    ordered = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    return [{"doc": doc_id, "score": round(score, 4)} for doc_id, score in ordered]

index = {
    "python": {"1": 1, "2": 1},
    "装饰": {"1": 1, "3": 1},
    "饰器": {"1": 1, "3": 1},
}
print(rank(index, "python 装饰器", 3))`,
      check: String.raw`index = {
    "python": {"1": 1, "2": 1},
    "装饰": {"1": 1, "3": 1},
    "饰器": {"1": 1, "3": 1},
}
result = rank(index, "python 装饰器", 3)
assert [item["doc"] for item in result] == ["1", "3", "2"], result
assert result[0]["score"] > result[1]["score"] > result[2]["score"]
assert result[2]["score"] > 0
assert rank(index, "", 3) == []
assert rank(index, "不存在", 3) == []
print("通过：TF-IDF 排序与空查询处理正确")`,
    },
    {
      id: "pr3-4",
      kind: "code",
      title: "索引持久化",
      difficulty: "★★☆",
      prompt:
        "实现 <code>save_index(path, index)</code> 与 <code>load_index(path)</code>：写 UTF-8 JSON（ensure_ascii=False、indent=2），加载后结构与原索引一致，并验证加载后的索引仍能排序。",
      starter: String.raw`import json
import math
from pathlib import Path

def rank(index, query, n_docs):
    scores = {}
    for token in query.lower().split():
        postings = index.get(token, {})
        if not postings:
            continue
        idf = math.log((n_docs + 1) / (len(postings) + 1)) + 1
        for doc_id, tf in postings.items():
            scores[doc_id] = scores.get(doc_id, 0.0) + tf * idf
    ordered = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    return [{"doc": doc_id, "score": round(score, 4)} for doc_id, score in ordered]

index = {"python": {"1": 1, "2": 1}, "装饰": {"1": 1}}

def save_index(path, index):
    pass

def load_index(path):
    pass

save_index("index.json", index)
print(Path("index.json").read_text(encoding="utf-8"))`,
      hints: [
        "写入 <code>json.dumps(index, ensure_ascii=False, indent=2)</code>。",
        "读取后 json 的键是字符串，正好符合 doc_id 的用法。",
        "加载后直接调用 <code>rank(loaded, \"python\", 2)</code> 验证。",
      ],
      solution: String.raw`import json
import math
from pathlib import Path

def rank(index, query, n_docs):
    scores = {}
    for token in query.lower().split():
        postings = index.get(token, {})
        if not postings:
            continue
        idf = math.log((n_docs + 1) / (len(postings) + 1)) + 1
        for doc_id, tf in postings.items():
            scores[doc_id] = scores.get(doc_id, 0.0) + tf * idf
    ordered = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    return [{"doc": doc_id, "score": round(score, 4)} for doc_id, score in ordered]

index = {"python": {"1": 1, "2": 1}, "装饰": {"1": 1}}

def save_index(path, index):
    Path(path).write_text(
        json.dumps(index, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

def load_index(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

save_index("index.json", index)
print(Path("index.json").read_text(encoding="utf-8"))`,
      check: String.raw`save_index("check_index.json", index)
text = Path("check_index.json").read_text(encoding="utf-8")
assert "装饰" in text, "中文不应被转义"
loaded = load_index("check_index.json")
assert loaded["python"] == {"1": 1, "2": 1}
assert loaded["装饰"] == {"1": 1}
ranked = rank(loaded, "python", 2)
assert ranked[0]["doc"] == "1"
assert ranked[0]["score"] > 0
print("通过：索引 JSON 往返与加载后查询都正确")`,
    },
  ],
  files: [
    {
      name: "mini_search.py",
      note: "完整实现：分词 + 索引 + TF-IDF + CLI",
      lang: "python",
      code: String.raw`"""迷你搜索引擎：无第三方依赖。

用法：
    python mini_search.py --query "python 装饰器"
    python mini_search.py --query "倒排索引" --save index.json
    python mini_search.py --query "装饰器" --load index.json
"""
import argparse
import json
import math
import re
from collections import Counter
from pathlib import Path

TOKEN_RE = re.compile(r"[A-Za-z]+|[\u4e00-\u9fff]+|\d+")
STOPWORDS = {
    "a", "an", "the", "is", "are", "of", "to", "and", "in", "for",
    "with", "on", "at", "by", "from", "as", "it", "this", "that",
}

DOCS = {
    "d1": "Python 装饰器用于包装函数，不改变原函数逻辑。",
    "d2": "Python 生成器与迭代器，适合处理大数据流。",
    "d3": "装饰器与闭包，本质上是高阶函数。",
    "d4": "搜索引擎的倒排索引与 TF-IDF 排序。",
    "d5": "SQLite 是嵌入式数据库，适合本地数据。",
}


def tokenize(text):
    tokens = []
    for part in TOKEN_RE.findall(text):
        if part.isdigit():
            tokens.append(part)
        elif part.isascii():
            word = part.lower()
            if len(word) >= 2 and word not in STOPWORDS:
                tokens.append(word)
        else:
            if len(part) == 1:
                tokens.append(part)
            else:
                tokens.extend(part[i:i + 2] for i in range(len(part) - 1))
    return tokens


def build_index(docs):
    index = {}
    for doc_id, text in docs.items():
        for token, count in Counter(tokenize(text)).items():
            index.setdefault(token, {})[doc_id] = count
    return index


def search_and(index, query):
    tokens = tokenize(query)
    if not tokens:
        return []
    sets = [set(index.get(token, {})) for token in tokens]
    return sorted(set.intersection(*sets))


def rank(index, query, n_docs):
    tokens = tokenize(query)
    scores = {}
    for token in tokens:
        postings = index.get(token)
        if not postings:
            continue
        idf = math.log((n_docs + 1) / (len(postings) + 1)) + 1
        for doc_id, tf in postings.items():
            scores[doc_id] = scores.get(doc_id, 0.0) + tf * idf
    ordered = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    return [{"doc": doc_id, "score": round(score, 4)} for doc_id, score in ordered]


def search(index, docs, query, top_k=5):
    results = rank(index, query, len(docs))[:top_k]
    return [
        {"doc": item["doc"], "score": item["score"], "text": docs.get(item["doc"], "")}
        for item in results
    ]


def save_index(path, index):
    Path(path).write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")


def load_index(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main(argv=None):
    parser = argparse.ArgumentParser(description="迷你搜索引擎")
    parser.add_argument("--query", required=True)
    parser.add_argument("--save")
    parser.add_argument("--load")
    args = parser.parse_args(argv)

    if args.load:
        index = load_index(args.load)
    else:
        index = build_index(DOCS)
    if args.save:
        save_index(args.save, index)

    for item in search(index, DOCS, args.query):
        print(f"{item['score']:.4f}  {item['doc']}  {item['text']}")


if __name__ == "__main__":
    main()
`,
    },
    {
      name: "test_search.py",
      note: "分词、AND、TF-IDF、持久化测试",
      lang: "python",
      code: String.raw`import unittest

from mini_search import build_index, rank, save_index, load_index, search_and, tokenize


class SearchTest(unittest.TestCase):
    def setUp(self):
        self.docs = {
            "1": "Python 装饰器",
            "2": "Python 生成器",
            "3": "装饰器 与 生成器",
        }
        self.index = build_index(self.docs)

    def test_tokenize(self):
        self.assertEqual(tokenize("The quick brown fox"), ["quick", "brown", "fox"])
        self.assertEqual(tokenize("Python 装饰器"), ["python", "装饰", "饰器"])
        self.assertEqual(tokenize("装饰器"), ["装饰", "饰器"])

    def test_and(self):
        self.assertEqual(search_and(self.index, "python"), ["1", "2"])
        self.assertEqual(search_and(self.index, "python 装饰器"), ["1"])
        self.assertEqual(search_and(self.index, "不存在"), [])

    def test_rank(self):
        result = rank(self.index, "python 装饰器", 3)
        self.assertEqual([item["doc"] for item in result], ["1", "3", "2"])
        self.assertEqual(rank(self.index, "", 3), [])

    def test_persistence(self):
        save_index("test_index.json", self.index)
        loaded = load_index("test_index.json")
        self.assertEqual(loaded["python"], {"1": 1, "2": 1})
        self.assertEqual(rank(loaded, "python", 3)[0]["doc"], "1")


if __name__ == "__main__":
    unittest.main()
`,
    },
    {
      name: "README.md",
      note: "运行说明与原理速记",
      lang: "markdown",
      plain: true,
      code: String.raw`# 迷你搜索引擎

    python mini_search.py --query "python 装饰器"

## 原理

1. tokenize：英文小写去停用词；中文切相邻 bigram。
2. build_index：token -> {doc_id: 词频}。
3. search_and：查询词集合求交集。
4. rank：sum(tf * idf)，idf = log((N+1)/(df+1)) + 1。

## 已知限制

- bigram 分词会有噪声，替换成 jieba 可以对比效果
- 索引全量保存在内存，数据量大时应分片或落库
- 不支持 OR / 短语查询 / 拼写纠错
`,
    },
  ],
  localSetup: [
    "python mini_search.py --query \"python 装饰器\"",
    "python mini_search.py --query \"倒排索引\" --save index.json",
    "python mini_search.py --query \"装饰器\" --load index.json",
    "python -m unittest -v",
  ],
  localNotes: [
    "无第三方依赖；如果要替换分词器，只改 `tokenize`，索引与排序不用动。",
    "把 `index.json` 加入 .gitignore；示例文档可以直接写进代码，真实项目建议从 `docs/` 读取。",
    "演示时先展示查询结果，再解释 IDF 为什么让“稀有词”权重更高。",
  ],
  resume: {
    keywords: ["Python", "倒排索引", "TF-IDF", "中文分词", "JSON", "算法"],
    bullets: [
      "从零实现迷你搜索引擎：中文 bigram 分词 + 英文停用词过滤，构建 token → 文档词频的倒排索引。",
      "实现 AND 查询与 TF-IDF 排序，按分数降序、同分按文档 id 保证结果稳定；索引支持 JSON 持久化与重新加载。",
      "用 unittest 覆盖分词边界、空查询、缺失词、排序与索引往返（[N] 个用例）。",
    ],
  },
  extensions: [
    "支持 OR / NOT 与短语查询（把查询解析成布尔表达式）。",
    "引入 BM25，对比 TF-IDF 的排序差异并记录评测结果。",
    "用 jieba 替换 bigram，构造同一批查询做召回对比。",
    "加入拼写纠错与同义词扩展（编辑距离 / 词向量）。",
    "用 FAISS 或 sentence-transformers 做向量检索，再与倒排索引做混合排序。",
  ],
  refs: [
    {
      name: "facebookresearch/faiss",
      url: "https://github.com/facebookresearch/faiss",
      why: "向量相似度检索的工业级实现，理解倒排索引之后可以继续看 IVF / HNSW。",
    },
    {
      name: "TheAlgorithms/Python",
      url: "https://github.com/TheAlgorithms/Python",
      why: "用 Python 学习算法与数据结构的开源仓库，适合补排序、哈希与图算法。",
    },
    {
      name: "Python 官方文档：math / json",
      url: "https://docs.python.org/zh-cn/3/library/math.html",
      why: "IDF 用到的 log 与 JSON 持久化的权威说明。",
    },
  ],
});

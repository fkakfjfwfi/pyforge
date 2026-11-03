/* 书单数据：来自图灵社区、豆瓣与 GitHub 公开信息 */
window.BOOKS = [
  {
    title: "Python编程：从入门到实践（第3版）",
    orig: "Python Crash Course, 3rd Edition",
    author: "Eric Matthes / 袁国忠 译",
    spine: "CRASH\nCOURSE",
    cats: ["入门"], meta: ["图灵出品", "零基础", "项目驱动"], rating: "",
    why: "最适合「语法学过但不成体系」的人。前半本把列表、字典、类、文件讲透，后半本用三个项目（游戏、数据可视化、Web 应用）把知识串起来。第 3 版已更新到 Python 3.11+。",
    how: "第 1–11 章快速过，重点做每章末尾的练习；第 12 章之后挑一个项目跟着做完，不要只看。",
    link: "https://www.ituring.com.cn/search?q=Python编程从入门到实践",
    linkText: "图灵社区"
  },
  {
    title: "Python编程快速上手——让繁琐工作自动化（第2版）",
    orig: "Automate the Boring Stuff with Python, 2nd Edition",
    author: "Al Sweigart",
    spine: "AUTOMATE\nTHE BORING",
    cats: ["入门", "实战"], meta: ["图灵出品", "免费在线阅读", "实用导向"],
    why: "不讲抽象概念，直接教你用 Python 处理 Excel、PDF、网页、邮件、文件。对爬虫入门尤其友好：第 12 章就是 requests + BeautifulSoup 的完整入门。",
    how: "当工具书跳读。先读第 1–6 章补语法，再直接看第 12 章，把示例改成你要抓的站。",
    link: "https://automatetheboringstuff.com/",
    linkText: "免费在线阅读"
  },
  {
    title: "流畅的Python（第2版）",
    orig: "Fluent Python, 2nd Edition",
    author: "Luciano Ramalho / 安道 译",
    spine: "FLUENT\nPYTHON",
    cats: ["进阶"], meta: ["图灵出品", "豆瓣高分", "进阶必读"], rating: "",
    why: "Python 进阶的分水岭。数据模型、序列协议、函数即对象、生成器、协程、类型注解，每一章都在解释「为什么 Python 这么设计」。本站第 1、4、5、7、9 章的大量内容都能在这里找到更深的展开。",
    how: "不要从第一页读到最后一页。先读第 1、5、6 章（数据模型/一等函数/装饰器），再按需读第 14 章之后（迭代器/生成器/协程）。",
    link: "https://book.douban.com/subject/27028517/",
    linkText: "豆瓣条目"
  },
  {
    title: "Effective Python（第3版）",
    orig: "Effective Python: 90 Specific Ways to Write Better Python",
    author: "Brett Slatkin",
    spine: "EFFECTIVE\nPYTHON",
    cats: ["进阶"], meta: ["90 条建议", "英文第 3 版", "代码可下载"],
    why: "90 条短小具体的建议，每条都是「这样写会踩坑，改成那样」。适合已经能写项目、但代码总感觉不够专业的人。爬虫里的字典合并、异常处理、并发建议都能直接套用。",
    how: "当清单读。每周挑 5 条，回自己的项目里找对应写法改掉，比通读一遍有效。",
    link: "https://effectivepython.com/",
    linkText: "官方网站"
  },
  {
    title: "Python工匠：案例、技巧与工程实践",
    orig: "One Python Craftsman",
    author: "朱雷（@piglei）",
    spine: "PYTHON\n工匠",
    cats: ["进阶", "工程"], meta: ["图灵出品", "原创中文", "豆瓣 9.0"], rating: "9.0",
    why: "国内少见的原创进阶书，从变量、函数、类讲到工程化与性能，案例都来自真实项目。中文表达比译作更顺，适合作为《流畅的Python》之前的过渡。",
    how: "第 1–4 章夯实语言细节，第 5–7 章重点看工程化与性能；每章代码都自己敲一遍。",
    link: "https://www.ituring.com.cn/search?q=Python工匠",
    linkText: "图灵社区"
  },
  {
    title: "Python编程轻松进阶",
    orig: "Beyond the Basic Stuff with Python",
    author: "Al Sweigart",
    spine: "BEYOND\nBASICS",
    cats: ["进阶"], meta: ["图灵出品", "面向「会写但不精」", "含调试与性能"],
    why: "专门填「入门书看完、进阶书看不懂」的断层。讲代码格式、Pythonic 写法、面向对象、调试、性能测量，语气轻松，例子短小。",
    how: "第 1–6 章快速读，第 7–9 章（调试、性能、测试）精读并动手。",
    link: "https://www.ituring.com.cn/search?q=Python编程轻松进阶",
    linkText: "图灵社区"
  },
  {
    title: "Python Cookbook（第3版）",
    orig: "Python Cookbook, 3rd Edition",
    author: "David Beazley & Brian K. Jones",
    spine: "COOK\nBOOK",
    cats: ["进阶", "速查"], meta: [" recipes", "按问题查", "经典"],
    why: "不是教程，是「问题—解法」手册。字符串、数据结构、迭代器、并发、模块都有成熟配方。写爬虫时遇到「怎么把嵌套结构摊平」「怎么限制并发」可以直接查。",
    how: "不要通读。遇到具体问题时按目录查，读完配方要理解为什么，而不是复制。",
    link: "https://www.ituring.com.cn/search?q=Python+Cookbook",
    linkText: "图灵社区"
  },
  {
    title: "CPython设计与实现",
    orig: "CPython Internals",
    author: "Anthony Shaw",
    spine: "CPYTHON\nINTERNALS",
    cats: ["底层"], meta: ["图灵出品", "解释器内部", "进阶选读"],
    why: "讲 CPython 如何解析、编译、执行 Python 代码，包括对象模型、内存管理、GIL 的真实实现。读完你会真正理解「为什么 GIL 存在」「为什么小整数被缓存」。",
    how: "先读对象模型与内存管理两章，再读 GIL 与并发；不需要跟着编译整个解释器。",
    link: "https://www.ituring.com.cn/search?q=CPython设计与实现",
    linkText: "图灵社区"
  },
  {
    title: "Python源码剖析",
    orig: "Python Source Code Analysis",
    author: "陈儒",
    spine: "源码\n剖析",
    cats: ["底层"], meta: ["中文原创", "基于 2.5", "思想仍有效"],
    why: "国内最早的 CPython 源码分析书，基于 Python 2.5，部分实现已过时，但对象模型、虚拟机、内存管理的分析思路依然值得读。搭配 CPython 3.x 源码阅读。",
    how: "选读。重点看 PyObject、引用计数、dict 实现三部分，对照现代 CPython 源码验证差异。",
    link: "https://search.douban.com/book/subject_search?search_text=Python源码剖析",
    linkText: "豆瓣搜索"
  },
  {
    title: "Python Concurrency with asyncio",
    orig: "Python Concurrency with asyncio",
    author: "Matthew Fowler",
    spine: "ASYNC\nIN\nPYTHON",
    cats: ["工程", "并发"], meta: ["Manning", "asyncio 专书", "含实战"],
    why: "系统讲 asyncio：事件循环、协程、任务、同步原语、线程池协作，最后落到 Web 请求与数据库。本站第 9 章只是入门，这本能把异步讲透。",
    how: "第 1–6 章按顺序读并跑示例；第 7 章之后按需读（数据库/Web 框架）。",
    link: "https://www.manning.com/books/python-concurrency-with-asyncio",
    linkText: "Manning 官网"
  },
  {
    title: "Architecture Patterns with Python",
    orig: "Architecture Patterns with Python",
    author: "Harry Percival & Bob Gregory",
    spine: "ARCH\nPATTERNS",
    cats: ["工程"], meta: ["免费在线", "领域驱动", "可测试架构"],
    why: "讲如何用依赖倒置、仓储模式、服务层把业务逻辑与 IO 解耦。对「爬虫代码越写越乱」的人特别有用：解析、存储、调度可以各自独立测试。",
    how: "重点读第 4–7 章（服务层、仓储、工作单元），把示例映射到自己的爬虫分层。",
    link: "https://www.cosmicpython.com/",
    linkText: "免费在线阅读"
  },
  {
    title: "Python Testing with pytest（第2版）",
    orig: "Python Testing with pytest, 2nd Edition",
    author: "Brian Okken",
    spine: "PYTEST\nIN PRACTICE",
    cats: ["工程"], meta: ["pytest 专书", "fixture 深入", "工程必备"],
    why: "pytest 的权威入门到进阶：fixture 生命周期、参数化、插件、mock、覆盖率。第 11 章的测试写法只是最小集合，这本能让你建立完整的测试习惯。",
    how: "第 2–5 章精读（fixture/参数化/mock），其余当参考。边读边给现有项目补测试。",
    link: "https://pragprog.com/titles/bopytest2/python-testing-with-pytest-second-edition/",
    linkText: "出版方页面"
  },
  {
    title: "Python 3网络爬虫开发实战（第2版）",
    orig: "Python 3 Web Scraping in Action",
    author: "崔庆才",
    spine: "爬虫\n实战",
    cats: ["爬虫"], meta: ["图灵出品", "国内爬虫经典", "配套代码"],
    why: "你正在读的那本。前半部分讲 requests、解析、数据存储、异步爬虫，正好和本站第 3、6、7、8、9 章互相印证；后半部分是反爬、App 抓取、框架实战。",
    how: "第 2–7 章与本站课程对照着读；第 8 章之后按需查。JS 逆向部分单独安排时间，不要和基础语法混在一起学。",
    link: "https://www.ituring.com.cn/search?q=Python+3网络爬虫开发实战",
    linkText: "图灵社区"
  },
  {
    title: "Web Scraping with Python（第3版）",
    orig: "Web Scraping with Python, 3rd Edition",
    author: "Ryan Mitchell",
    spine: "WEB\nSCRAPING",
    cats: ["爬虫"], meta: ["O'Reilly", "英文", "体系完整"],
    why: "英文爬虫书里体系最完整的一本：HTML 解析、CSS 选择器、API、存储、并发、反爬与法律边界。适合在中文资料之外补一套完整视角。",
    how: "选读。第 1–6 章快速对照，第 7 章之后（并发、反爬、测试）重点读。",
    link: "https://search.douban.com/book/subject_search?search_text=Web+Scraping+with+Python",
    linkText: "豆瓣搜索"
  },
  {
    title: "Python Distilled",
    orig: "Python Distilled",
    author: "David Beazley",
    spine: "PYTHON\nDISTILLED",
    cats: ["进阶", "速查"], meta: ["精炼", "适合有经验者", "常翻常新"],
    why: "用最少的篇幅覆盖 Python 的核心语义与常用库，没有废话。适合已经写过一段时间、需要把零散知识重新缝合的人。",
    how: "通读一遍建立索引，之后当字典查。读的时候对照本站章节，补自己讲不清的概念。",
    link: "https://search.douban.com/book/subject_search?search_text=Python+Distilled",
    linkText: "豆瓣搜索"
  },
  {
    title: "Python数据结构与算法分析（第3版）",
    orig: "Problem Solving with Algorithms and Data Structures Using Python",
    author: "Bradley N. Miller & David L. Ranum",
    spine: "DS &\nALGO",
    cats: ["入门", "底层"], meta: ["图灵出品", "复杂度基础", "面试友好"],
    why: "用 Python 讲栈、队列、链表、递归、排序、树、图。爬虫里用到的 BFS 抓取策略、URL 队列、去重集合，都能在这里找到原理。",
    how: "第 1–5 章必读（复杂度、栈队列、递归），后面按兴趣。每章实现至少手写一遍。",
    link: "https://www.ituring.com.cn/search?q=Python数据结构与算法分析",
    linkText: "图灵社区"
  }
];

/* GitHub 优质开源资源 */
window.GITHUB_RESOURCES = [
  { star: "★ 16w+", title: "jackfrued / Python-100-Days", desc: "中文最系统的 Python 学习路线，从语法到 Django、爬虫、数据分析，按天推进。", link: "https://github.com/jackfrued/Python-100-Days" },
  { star: "★ 1w+", title: "fluentpython / example-code-2e", desc: "《流畅的Python》第 2 版全部示例代码，按章节组织，适合对照阅读。", link: "https://github.com/fluentpython/example-code-2e" },
  { star: "★ 5k+", title: "piglei / one-python-craftsman", desc: "《Python工匠》开源前身，中文原创的进阶技巧与工程实践文章。", link: "https://github.com/piglei/one-python-craftsman" },
  { star: "★ 2w+", title: "realpython / python-guide", desc: "《Python 最佳实践指南》中文版源仓库，讲项目结构、依赖、测试、文档。", link: "https://github.com/realpython/python-guide" },
  { star: "★ 20w+", title: "vinta / awesome-python", desc: "Python 生态资源大全，按领域分类，找库的时候先看这里。", link: "https://github.com/vinta/awesome-python" },
  { star: "★ 6w+", title: "TheAlgorithms / Python", desc: "用 Python 实现常见算法与数据结构，适合补算法基础、练读代码。", link: "https://github.com/TheAlgorithms/Python" },
  { star: "★ 1w+", title: "Pierian-Data / Complete-Python-3-Bootcamp", desc: "Udemy 课程的配套 Notebook，覆盖语法、NumPy、Pandas、Matplotlib。", link: "https://github.com/Pierian-Data/Complete-Python-3-Bootcamp" }
];

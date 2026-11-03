/* 视频与课程资源：已把核心知识点提炼进站点，原课用于复习与补充 */
window.VIDEOS = [
  {
    platform: "BILIBILI",
    title: "《零基础入门学习Python》最新版",
    author: "小甲鱼 / 鱼C工作室",
    level: "入门 · 系列课",
    length: "系列课 · 免费",
    chapter: "第 1–6 章",
    link: "https://www.bilibili.com/video/BV1c4411e77t",
    takeaways: [
      "变量是贴在对象上的标签，赋值不复制对象；这一点决定了后面所有的拷贝与传参行为",
      "列表、字典、集合的底层差异：字典按哈希查找，集合用于去重，列表用于顺序",
      "函数参数的默认值在定义时求值一次，可变默认值是经典陷阱",
      "文件操作必须用 with，编码要显式指定；异常要用具体类型捕获"
    ]
  },
  {
    platform: "BILIBILI",
    title: "Python语言程序设计",
    author: "嵩天 / 北京理工大学",
    level: "入门 · 体系化",
    length: "系列课 · 免费",
    chapter: "第 1–6 章",
    link: "https://www.bilibili.com/video/BV1Z64y1h7Rk",
    takeaways: [
      "用 IPO（输入—处理—输出）拆解程序结构，写爬虫时同样适用：请求是输入，解析是处理，落盘是输出",
      "数据类型与操作的体系化梳理，适合补「零散学过但不成体系」的短板",
      "函数与代码复用的基本范式：一个函数只做一件事",
      "文件与数据格式化：CSV、JSON 的读写是数据落盘的基础"
    ]
  },
  {
    platform: "BILIBILI",
    title: "黑马程序员 Python 全套教程",
    author: "黑马程序员",
    level: "入门 · 项目导向",
    length: "系列课 · 免费",
    chapter: "第 5–6、10 章",
    link: "https://space.bilibili.com/37974444",
    takeaways: [
      "面向对象部分讲得细：类属性/实例属性、继承、多态，适合第 5 章配套看",
      "异常处理与模块化：把功能拆成模块，是工程化的第一步",
      "项目课演示了从需求到目录结构的完整过程，可对照第 10 章的项目骨架",
      "课程偏长，建议只挑自己薄弱的章节看，不要从头刷到尾"
    ]
  },
  {
    platform: "YOUTUBE",
    title: "Learn Python – Full Course for Beginners",
    author: "freeCodeCamp",
    level: "入门 · 单课",
    length: "约 4.5 小时 · 免费",
    chapter: "第 1–6 章",
    link: "https://www.youtube.com/watch?v=rfscVS0vtbw",
    takeaways: [
      "英文语速慢、板书清晰，适合同时练技术英语听力",
      "覆盖变量、列表、函数、类、异常、文件、模块，是一条完整的最小知识链",
      "示例全部手敲一遍，比只看视频有效十倍；每段暂停后先自己写再看答案",
      "不涉及工程化与并发，看完只能算「会语法」，继续看本站第 7–12 章"
    ]
  },
  {
    platform: "YOUTUBE",
    title: "Python Tutorials（系列合集）",
    author: "Corey Schafer",
    level: "进阶 · 分主题",
    length: "系列课 · 免费",
    chapter: "第 1、4、5、7、9 章",
    link: "https://www.youtube.com/@coreyms",
    takeaways: [
      "装饰器讲得最清楚：函数是一等对象 → 闭包 → 装饰器 → 带参装饰器，层层递进",
      "生成器与迭代器：用「暂停/恢复」解释 yield，比背定义有效",
      "面向对象：类方法、静态方法、继承、魔术方法，配大量可运行示例",
      "虚拟环境与项目结构：早期就建立隔离依赖的习惯"
    ]
  },
  {
    platform: "YOUTUBE",
    title: "Intermediate Python Programming Course",
    author: "freeCodeCamp / Patrick Loeber",
    level: "进阶 · 单课",
    length: "约 6 小时 · 免费",
    chapter: "第 4、7、9、10 章",
    link: "https://www.youtube.com/watch?v=HGOBQPFzWKo",
    takeaways: [
      "列表/字典推导式、lambda、map/filter、zip 的进阶用法",
      "生成器、装饰器、上下文管理器的系统串讲",
      "类型注解与 dataclass：从「能跑」走向「可维护」的转折点",
      "异步 asyncio 入门：事件循环、协程、gather 的最小可用示例"
    ]
  },
  {
    platform: "YOUTUBE",
    title: "ArjanCodes · Software Design",
    author: "ArjanCodes",
    level: "工程 · 设计",
    length: "系列课 · 免费",
    chapter: "第 5、10、11 章",
    link: "https://www.youtube.com/@ArjanCodes",
    takeaways: [
      "用真实重构案例讲「为什么这个类设计是坏的」，比抽象讲设计模式好懂",
      "依赖注入、策略模式、仓储模式，可以直接映射到爬虫的抓取/解析/存储分层",
      "强调可测试性：把 IO 推到边界，核心逻辑保持纯函数",
      "适合在写完一个 500 行蜘蛛脚本之后看，会有强烈的共鸣"
    ]
  },
  {
    platform: "YOUTUBE",
    title: "mCoding · Advanced Python",
    author: "mCoding",
    level: "底层 · 性能",
    length: "系列课 · 免费",
    chapter: "第 1、8、12 章",
    link: "https://www.youtube.com/@mCoding",
    takeaways: [
      "用实验讲 GIL、引用计数、内存布局，解释「Python 为什么这样设计」",
      "性能分析实战：cProfile、timeit、缓存与复杂度，和本站第 12 章互补",
      "常有反直觉结论，比如某些「优化写法」其实更慢，强调测量",
      "语速快、信息密度高，建议 0.75 倍速并随手记笔记"
    ]
  },
  {
    platform: "DOC",
    title: "廖雪峰 Python 教程",
    author: "廖雪峰",
    level: "入门到进阶 · 文字",
    length: "在线教程 · 免费",
    chapter: "第 1–6、10 章",
    link: "https://liaoxuefeng.com/",
    takeaways: [
      "中文文字教程里体系最完整的一份，适合当「第二遍教材」快速翻阅",
      "函数式编程、模块、面向对象、异常、IO 章节与本站高度重合",
      "示例简洁，适合复制到本地改着跑；但工程化与并发部分较浅",
      "遇到概念讲不清时，用它换一种表述重新理解"
    ]
  },
  {
    platform: "DOC",
    title: "Python 官方文档（中文）",
    author: "Python Software Foundation",
    level: "工具书 · 权威",
    length: "在线文档 · 免费",
    chapter: "全章节",
    link: "https://docs.python.org/zh-cn/3/",
    takeaways: [
      "标准库参考是最终事实来源：参数、返回值、版本变更都以此为准",
      "「教程」部分适合系统过一遍，「语言参考」适合查语义细节",
      "每个模块页底部常有示例，比第三方博客可靠",
      "学会用 Ctrl+F 查文档，是脱离「到处问人」的标志"
    ]
  }
];

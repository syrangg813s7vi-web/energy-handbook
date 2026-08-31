---
title: Anthropic提出模型硬件标准：让AI Agent安全连接与控制真实设备
description: 解释模型硬件标准（Model Hardware Standard，MHS）怎样在AI Agent与真实设备之间统一连接、描述、编排和安全控制。
---

# Anthropic提出模型硬件标准：让AI Agent安全连接与控制真实设备

大模型已经能够理解实验步骤、编写程序和分析数据，但让它真正操作显微镜、机械臂、移液器、相机或激光器，仍然不是“给模型接一个API”这么简单。

Anthropic在2026年8月27日公布的模型硬件标准（Model Hardware Standard，MHS），试图解决的正是这个断层：**AI Agent有推理能力，却缺少一种统一、可理解、可编排并且受安全约束的方式连接真实设备。**

可以把MHS理解为位于AI Agent与真实设备之间的一层通用软件规范。它不是新的电气接口或现场总线，而是试图统一设备如何被发现、怎样描述自己的能力和状态、Agent通过什么方式下达操作，以及哪些安全限制必须由底层强制执行。

MHS目前仍是研究预览。Anthropic公开的是设计方向、合作案例和预览申请入口，并不是已经公开下载的完整标准、SDK或开源代码库。理解这一边界之后，才能准确讨论它在解决什么问题。

## 问题一：每台设备都说着不同的“语言”

实验室和工厂中的设备通常来自不同厂商。即使它们都能被程序控制，控制方式也可能完全不同：

- 一台设备提供现代REST API；
- 一台设备只有厂商SDK或旧式COM接口；
- 一台设备通过串口或文件目录接收任务；
- 另一台设备可能只有图形界面，没有正式API。

设备的命令、状态、单位和错误码同样缺乏统一定义。工程师要让几台设备协同工作，通常需要分别理解每一种接口，再编写大量一次性的适配代码。

因此，真正的瓶颈往往不是模型不会写代码，而是**每增加一台设备，都要重新完成一次集成工程**。这使自动化系统昂贵、脆弱，也很难在不同实验室或生产线上复用。

## 问题二：API没有告诉Agent足够的物理知识

即使设备已经提供API，函数名称也不等于完整的设备知识。

Agent还需要知道：

- 设备现在处于什么状态；
- 它能够测量什么、调节什么；
- 参数采用什么单位，允许范围是多少；
- 一个动作需要满足哪些前置条件；
- 设备的重量、位置和运动范围等物理特性；
- 哪些状态必须禁止动作；
- 什么情况下需要人工确认。

这些信息经常分散在纸质说明书、工程师电脑、操作规程和人员经验中。普通API只暴露“可以调用哪些函数”，却没有把“怎样正确、安全地使用设备”完整表达出来。

对于AI Agent来说，这意味着它虽然能发出命令，却不一定理解命令在物理世界中的后果。

## 问题三：真实任务需要多台设备共享状态

物理实验和制造任务通常不是对单台设备发出一次命令，而是一条跨设备流程：

```text
移液器完成操作
→ 相机确认样品存在且方向正确
→ 机械臂搬运样品
→ 测量仪器读取结果
→ 分析结果并调整下一轮参数
```

这条流程要求每台设备暴露可信状态，也要求系统理解步骤之间的依赖关系。机械臂不能在移液器尚未退出时进入工作区，测量设备不能在样品缺失时启动，失败后的恢复动作也必须知道其他设备当前在哪里。

如果设备没有共同的状态模型和操作接口，Agent就无法可靠判断“上一步是否完成”“下一步是否允许”以及“多台设备会不会冲突”。

## 问题四：语言模型不适合直接承担实时安全控制

大语言模型擅长理解目标、提出假设和生成程序，但它并不是确定性的实时控制器：

- 推理延迟不固定；
- 相同输入不一定产生完全相同的输出；
- 可能误解空间、物理或化学约束；
- 长流程中可能遗漏上下文；
- 不适合承担毫秒级闭环、急停和硬件联锁。

因此，把设备API直接交给Agent，并用提示词要求它“注意安全”，不能构成可靠的工业安全方案。安全限制必须由比模型更低、更确定的系统层执行。

## MHS的解决方案：在Agent与设备之间建立统一层

MHS的基本思路，是在AI Agent和真实设备之间增加一个标准化硬件抽象层：

```text
AI Agent
   │
   │  MCP / CLI / API
   ▼
MHS：设备发现、语义描述、状态、操作与安全边界
   │
   ├── MHS Driver ── 显微镜
   ├── MHS Driver ── 机械臂
   ├── MHS Driver ── 移液器
   └── MHS Driver ── 激光器
```

这个统一层不消灭厂商接口。它把不同接口包在各自的MHS Driver后面，使上层Agent面对一致的设备模型。

## 用标准化Driver屏蔽厂商差异

每台设备通过MHS Driver对外暴露统一的状态、能力、操作和错误。底层仍然可以使用厂商API、串口、COM、文件接口或其他控制方式，但这些差异不再直接泄漏给上层Agent。

Anthropic的原始说明把基础能力概括为类似`read`和`write`的简单原语，例如读取温度、获得位置、设置目标值。更复杂的拍摄、搬运或扫描过程可以在这些基础能力上组合。

这相当于把“每接一台设备就重写整条流程”，变成“为设备实现一次标准Driver，随后复用已有的发现、监控和编排能力”。

## 把设备知识变成机器可理解的语义

MHS Driver不只包装函数，还要描述设备本身。Anthropic提出通过自然语言标签和参考文件，表达设备：

- 能够测量和调整的对象；
- 当前状态与可执行操作；
- 参数单位、范围和前置条件；
- 代码中看不出来的物理特性；
- 必须强制执行的安全限制。

这样，Agent发现一台设备时，获得的不只是函数列表，还包括操作这台设备所需的上下文。

这里的目标不是让模型凭自然语言随意控制硬件，而是把过去隐藏在说明书和人员经验中的知识，转化为能够被程序读取、检查和复用的设备描述。

## 提供统一的发现与控制入口

Anthropic为MHS描述了三种控制入口：

- **MCP**：让Agent发现设备并调用其能力；
- **CLI**：供工程师调试、人工操作和脚本组合；
- **代码文件或API**：执行长时间、高速或重复任务。

因此，MHS并不是一个新的聊天界面。它试图成为统一控制平面，让Agent、人工工具和确定性程序使用同一套设备能力与状态描述。

MCP解决的是“Agent怎样调用一个工具”；MHS进一步关注“物理设备怎样成为带状态、能力、限制和安全语义的工具”。

## 把Agent推理与确定性执行分开

MHS设计中最重要的一点，是不要求语言模型实时决定每一个设备动作。

Agent可以负责：

- 理解实验或生产目标；
- 探索设备能力；
- 分析测量结果；
- 搜索和优化参数；
- 生成新的操作流程。

当流程已经确定，就可以把操作组合成代码文件或确定性脚本，由普通程序执行。这样既能利用模型处理开放问题的能力，也能让重复、高速和需要审查的部分摆脱逐步在线推理。

这形成了清晰的分工：**Agent负责“想什么和怎样改进”，确定性程序负责“按什么顺序可靠执行”。**

## 把安全边界放在设备层，而不是提示词里

设备安全不能依赖模型是否记得一条提示。MHS希望由Driver和设备描述强制表达：

- 参数上下限；
- 动作前置条件；
- 禁止状态和互锁条件；
- 急停、设备失联和传感器异常；
- 需要人工批准的高风险动作。

即使Agent提出了不合理操作，底层也应拒绝执行。模型可以参与诊断和提出恢复方案，但设备级联锁、实时闭环和最终执行权限仍应由确定性系统掌握。

## 六个早期案例：这些设计怎样落到真实设备上

Anthropic的原始发布收录了六组早期案例。它们能够说明MHS的不同设计分别解决了什么具体问题，但证据性质需要先说清楚：这些结果来自Anthropic及参与项目的团队自述，多数仍是研究预览或概念验证，并不等于独立复现、通用可靠性证明或安全认证。

| 案例 | 设备与任务 | MHS的作用与结果 | 限制与证据边界 |
|---|---|---|---|
| **Genentech** | 移液器、机械臂和酶标仪执行BCA蛋白检测 | 统一三台设备并闭环调整移液流速；得到水约140 µL/s、黏稠BSA约10 µL/s的设置 | Claude最初使用通用参数造成气泡，且错误重试使问题加重；需要专家解释物理原因并指导修正 |
| **UW Baker/Pinglay实验室** | 六台仪器统一监控；Agent观察qPCR曲线；机械臂与移液器交接孔板 | 六台设备连同driver在一周内接入；用完成信号和顺序条件避免两台设备进入冲突区域 | 团队明确称其为proof of concept；复杂流程仍需优化，长期在线监控存在计算成本 |
| **Carnegie Mellon** | 三台电脑上的移液器、酶标仪、机械臂和相机；接口包括目录文件、COM、USB和GUI | 约8小时完成driver和编排层，实验约快3倍；缺板、板旋转、设备繁忙、相机断开、设备不可达和急停六种状态都在动作前被阻断 | 使用染料代替真实药物；无API设备只能通过屏幕结果检查，尚非生产级药物实验验证 |
| **HHMI Janelia** | 原需按顺序启动七套厂商程序的显微成像装置 | 共享标准化状态字典；确定性程序运行采集—分析核心循环，Agent只在决策点选择区域、参数和分析方法；设备层限制激光功率 | 研究人员仍在监督实验；不是语言模型接管实时循环，也不是已经完成的无人实验室 |
| **QuEra** | 量子计算机激光失锁恢复 | 原脚本约150秒、58%成功率；迭代后开发阶段约6秒、96%；最终无Agent盲测700次成功695次（99.3%），产物为可检查的确定性脚本 | Claude不擅长诊断部分真实硬件故障，会等待人工批准而暂停，也需要团队提供大量上下文 |
| **Tetsuwan** | ResearchOS协调相机、机械臂和离心机处理qPCR移液气泡，并闭环优化移液模型 | 可从视觉发现气泡、寻找可用设备并提出跨设备恢复；记录9,143次dispense、300类transfer和1,508个条件，Anthropic页面称预测精度约优于厂商规格12% | 耗材补充仅半无人值守，Agent仍需提示且不擅长蒸发等物理效应；Anthropic页写31/45、p≈0.001，Tetsuwan当前页写33/45、p≈0.003，统计版本存在差异 |

六个案例没有证明“Agent已经可以独立控制任何硬件”。它们共同支持的是一条更具体的工程路线：用Driver统一异构设备，把状态、能力和安全限制变成机器可读语义，让Agent参与分析、诊断和参数搜索，同时把高速、重复和安全关键执行留给确定性程序，并在物理知识不足或风险较高时保留专家监督。

## MHS的本质

MHS可以理解为三部分的组合：

> 面向多厂商设备的统一Driver模型
>
> ＋ 面向Agent的设备语义和发现机制
>
> ＋ 带确定性执行与安全边界的多设备编排层

它真正想解决的不是“怎样让AI发出一条机械臂命令”，而是怎样把设备接口、物理知识、运行状态和安全约束组合成一套可复用的系统，使Agent能够在受控边界内参与真实世界任务。

目前，这仍是一条经过早期案例验证的架构方向，而不是已经完成的行业标准。其长期价值取决于完整规范是否公开、Driver生态能否形成、不同厂商能否实现一致语义，以及安全评测和认证机制能否真正落地。

## 原始来源

- [Anthropic：Previewing the Model Hardware Standard](https://www.anthropic.com/news/model-hardware-standard-research-preview)
- [Model Hardware Standard研究预览站](https://modelhardwarestandard.com/)
- [Anthropic：Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- [QuEra：Holding the Light](https://www.quera.com/blog-posts/holding-the-light-teaching-an-ai-to-lock-and-tune-our-quantum-computers-lasers)
- [Tetsuwan：Integrating Anthropic's Model Hardware Standard](https://www.tetsuwan.com/blog/mhs)

## Anthropic原始演示视频

以下10段视频均来自Anthropic原始公告。播放器采用按需加载，只有点击播放后才请求媒体；部分原始文件较大，请根据网络情况选择观看。

### MHS工作原理

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="MHS工作原理演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/af63049620774e379536a9bb28df7304c62f86af.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/af63049620774e379536a9bb28df7304c62f86af.mp4">打开原始视频</a>。
</video>

### 跨设备孔板交接

华盛顿大学案例中，Agent按照设备完成信号协调移液器和机械臂。

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="跨设备孔板交接演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/9b75ff5feffe2cb600d5b1111e5ce33f10b3c17b.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/9b75ff5feffe2cb600d5b1111e5ce33f10b3c17b.mp4">打开原始视频</a>。
</video>

### CMU剂量响应自动化

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="CMU剂量响应自动化演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/0b1b6ca4c78d207af4d8191e193616df2b2dabdd.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/0b1b6ca4c78d207af4d8191e193616df2b2dabdd.mp4">打开原始视频</a>。
</video>

### Janelia显微镜研究

下面四段依次展示显微成像案例、统一设备界面、定量监控和Agent参与的自适应实验。

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="Janelia显微成像案例">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/7104f46b19b038fefbaa382d8f1f2be4d4a6a850.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/7104f46b19b038fefbaa382d8f1f2be4d4a6a850.mp4">打开原始视频</a>。
</video>

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="Janelia统一设备界面演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/af084a36feacb3714d57e84c79c5750010da1b40.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/af084a36feacb3714d57e84c79c5750010da1b40.mp4">打开原始视频</a>。
</video>

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="Janelia定量监控和在线分析演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/04157144975f52a1e0d9ae8618b04947d51769e5.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/04157144975f52a1e0d9ae8618b04947d51769e5.mp4">打开原始视频</a>。
</video>

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="Janelia自适应实验演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/114e1e623740cf010903446523b8248f0088a2bc.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/114e1e623740cf010903446523b8248f0088a2bc.mp4">打开原始视频</a>。
</video>

### QuEra激光稳定

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="QuEra激光稳定演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/1541e894a040db490eac45bf62e65c023d4e90b8.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/1541e894a040db490eac45bf62e65c023d4e90b8.mp4">打开原始视频</a>。
</video>

### Tetsuwan移液监控与工作流

第一段展示相机识别移液中的液面、气隙、气泡和泡沫；第二段展示多设备qPCR工作流。

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="Tetsuwan移液视觉监控演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/ab7f460b93d47a528fe89266b243a1093bca295e.mp4" type="video/mp4">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/ab7f460b93d47a528fe89266b243a1093bca295e.mp4">打开原始视频</a>。
</video>

<video class="mhs-demo-video" controls preload="none" playsinline aria-label="Tetsuwan多设备qPCR工作流演示">
  <source src="https://cdn.sanity.io/files/4zrzovbb/website/79c765cd8ec0c2d9e6d06b9a283c78c097dccad1.mov" type="video/quicktime">
  浏览器不支持视频播放。<a href="https://cdn.sanity.io/files/4zrzovbb/website/79c765cd8ec0c2d9e6d06b9a283c78c097dccad1.mov">打开原始视频</a>。
</video>

---
title: FBD与SFC：从全网络扫描到活动步状态机
description: 结合灌装生产线动画，理解FBD的显式状态逻辑与SFC活动步状态机。
---

# FBD 与 SFC：从“全网络扫描”到“活动步状态机”

在 IEC 61131-3 PLC 编程体系中，FBD（Function Block Diagram，功能块图）和 SFC（Sequential Function Chart，顺序功能图）都可以完成设备控制，但它们擅长表达的问题并不相同。IEC将FBD定义为图形化编程语言，并将SFC定义为组织程序和功能块内部结构的一组图形及等价文本元素。[¹](https://webstore.iec.ch/en/publication/68533)

一句话概括：

- **FBD擅长表达“信号经过哪些逻辑得到输出”**；
- **SFC擅长表达“设备现在处于哪一步，满足什么条件后进入下一步”**。

为了把这种差别看得更直观，可以打开配套的 [PLC执行演示页面](../demos/plc/plc-fbd-sfc-execution/?v=20260715)。页面使用同一条灌装线，同时展示两种程序的内部执行过程。

## 一、先认识这个灌装线案例

这是一个经过简化的**单工位瓶装液体灌装线**。空瓶由输送带送入加工位置，设备把瓶子固定后完成灌装和封盖，最后再把成品瓶送走。

整条生产过程就是：空瓶进入、固定瓶子、注入液体、安装瓶盖，最后成品离开。

案例的重点不是模拟一台完整的工业灌装机，而是用一个容易理解、具有明显先后顺序的工艺，说明PLC如何记住“当前做到哪一步”，以及如何根据现场信号进入下一步。

### 灌装生产线交互动画

下面的动画展示一只空瓶从进入生产线到成为成品瓶的完整过程。可以选择“自动演示”连续观看，也可以选择“单步执行”，逐次观察现场输入、PLC当前工序和输出请求的变化。

<iframe
  src="../demos/plc/bottling-line-animation.html"
  width="100%"
  height="650"
  loading="lazy"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="灌装生产线交互动画"
></iframe>

流程很简单：输送带把空瓶送到加工工位，入口光电检测到瓶后，输送带停止、夹具闭合；夹紧到位后开始灌装，液位达到目标值后执行封盖；封盖完成后夹具松开，输送带把成品瓶送出，出口光电确认瓶子离开，系统再回到等待下一只空瓶的状态。

## 二、两者都运行在PLC的周期任务中

理解FBD和SFC之前，首先要明确：它们通常都不是只运行一次的脚本，而是被PLC周期性执行。

一个典型PLC周期可以简化为以下过程；不同控制器可能采用同步或异步I/O更新机制，因此这里展示的是便于理解的通用模型。[²](https://product-help.schneider-electric.com/Machine%20Expert/V2.0/en/m241prg/m241prg/gl_D_SE_0024697.166.html)

1. 读取输入映像，例如“到瓶”“夹紧到位”“液位满”；
2. 执行用户程序；
3. 更新输出映像，例如输送带、夹具、灌装阀和封盖机请求；
4. 下一个周期重新开始。

演示页面中的按钮代表现场信号到来。例如单击“发送‘到瓶’并扫描”，相当于在某次PLC扫描中让“到瓶”从 `FALSE` 变为 `TRUE`。

因此，FBD和SFC真正的区别并不是“一个循环执行、另一个不循环执行”，而是：**在同一个周期任务里，程序员如何组织状态、转换条件和动作。**

## 三、FBD如何表达这条灌装线

下面的演示同时给出完整代码、逐行扫描过程、状态BOOL和输出变化。点击按钮后，可以看到PLC即使只收到一个现场信号，仍会扫描全部网络。

<iframe
  src="../demos/plc/fbd-scan-excerpt.html"
  width="100%"
  height="720"
  loading="lazy"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="FBD代码执行、状态和输出变化"
></iframe>

### PLC如何执行FBD

每个PLC扫描周期都会先读取输入，然后按照程序确定的顺序执行全部FBD网络：先计算 `T0～T4`，再执行五组状态切换，最后重新计算全部输出。即使本周期只有 `T2=TRUE`，其他转换、状态切换和输出代码也会被逐行扫描。程序执行结束后，新的状态BOOL和输出值被保存，供下一个扫描周期继续使用。实际FBD工具通常根据功能块连线和数据依赖确定执行顺序，而不是简单依据屏幕位置；例如Logix Designer会在验证项目时确定功能块执行顺序。[³](https://www.rockwellautomation.com/en-us/docs/studio-5000-logix-designer/37-01/contents-ditamap/instruction-set/function-block-attributes/order-of-execution.html)

## 四、SFC如何表达同一条灌装线

下面使用与FBD相同的一组现场信号和按钮。左侧展示完整SFC程序及本周期实际处理的代码，右侧同步展示PLC维护的活动步、动作输出和四阶段执行过程。

<iframe
  src="../demos/plc/sfc-runtime-excerpt.html"
  width="100%"
  height="720"
  loading="lazy"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="SFC代码执行与活动步变化"
></iframe>

### PLC如何执行SFC

SFC运行时会维护活动步信息。演示页面用 `X0.X` 到 `X4.X` 表示五个步的活动状态，其中 `.X` 表示该步当前是否活动，`.T` 通常表示该步已经活动的时间。例如，`X2.X=TRUE`、`X2.T=650 ms` 表示“灌装步当前活动，并已持续约650毫秒”。Rockwell的IEC语言文档也使用 `StepName.x` 表示活动状态、`StepName.t` 表示激活时长。[⁴](https://www.rockwellautomation.com/en-pl/docs/aadvance-trusted-sis-workstation/2-01-00/aadvance-trusted-sis-workstation-software-ditamap/working-with-aadvance-applications/sfc-language/sfc-elements/steps.html) 这些名称和具体可用属性可能因开发环境而有差异，但“运行时保存活动步集合”是理解SFC的关键。

一次简化的SFC周期执行可以分为四个阶段：

1. 读取当前活动步集合；
2. 执行活动步关联的动作；
3. 检查从活动步出发、当前已使能的转换；
4. 若转换条件成立，停用前置步并激活后继步，然后保存新的活动步集合。

例如当前活动步是 `X2_灌装`，PLC先执行夹具和灌装阀动作，再检查“液位满”：条件不成立就保持X2，条件成立则停用X2并激活X3。SFC转换条件本质上必须产生布尔结果；条件为TRUE时，后继步才具备激活条件。[⁵](https://content.helpme-codesys.com/en/CODESYS%20SFC/_cds_sfc_element_step_transition.html)

后继步 `X3` 被激活，并不一定表示它的ACTION已经在同一瞬间执行。动作何时首次执行、转换能否在同一扫描中连续跨越多个步，取决于具体PLC厂商的SFC执行语义和任务配置。演示页采用便于教学的模型：本周期末激活后继步，然后自动展示下一扫描起点执行新步ACTION的结果，使最终停留画面中的活动步与输出保持一致。

还要注意，SFC并不一定“每次只执行一个步”。顺序流程通常只有一个活动步，但在并行分支中可以同时存在多个活动步；Rockwell将这种结构称为 simultaneous branch，并说明其中的路径会同时执行。[⁶](https://literature.rockwellautomation.com/idc/groups/literature/documents/pm/1756-pm006_-en-p.pdf) 更准确的说法是：**SFC每个周期处理当前活动步集合，而不是由程序员手写一组互斥BOOL位。**

## 五、状态表达是关键区别，但不是唯一差别

SFC直接表达状态机，确实是它和FBD最重要的差别。不过两者还存在几项关键区别。

| 比较项 | FBD | SFC |
|---|---|---|
| 主要表达对象 | 数据流、布尔逻辑、功能块关系 | 步骤、动作、转换和分支 |
| 状态保存 | 通常由程序员使用BOOL、锁存器或功能块显式实现 | 由SFC运行时维护活动步集合 |
| 顺序切换 | 显式计算条件，再RESET/SET状态 | 前置步、条件、后继步直接组成转换 |
| 周期执行观感 | 网络通常按确定顺序被扫描 | 围绕活动步执行动作并检查已使能转换 |
| 并行流程 | 需要自行组织状态位与互锁 | 可用选择分支、并行分支和汇合结构表达 |
| 调试观察 | 观察信号线、功能块和内部变量 | 直接观察活动步、转换条件和步持续时间 |
| 典型用途 | 联锁、模拟量处理、PID、设备功能逻辑 | 批处理、装配、输送、启停顺序、工艺流程 |
| 维护风险 | 顺序复杂时状态位和SET/RESET关系容易膨胀 | 流程直观，但步动作中的复杂算法仍需其他语言 |

## 六、为什么复杂顺序中SFC通常更简洁

在只有两三个状态时，FBD的BOOL状态机并不难理解。但随着工序增加，FBD通常还要增加：

- 每个状态的保存位；
- 每条转换的布尔逻辑；
- 旧状态RESET和新状态SET；
- 异常、暂停、复位和跳转逻辑；
- 防止多个状态同时为TRUE的互锁；
- 并行分支的同步条件。

如果流程有20个步骤，程序员不仅要画20个状态，还要维护状态之间的切换关系。SFC则把“步—转换—步”作为一等结构，程序图本身就是流程拓扑。在线调试时，活动步直接高亮，维护人员更容易看出现在在哪一步、动作为什么执行，以及还在等待哪个转换条件。

这正是演示页中橙色活动步、相邻转换条件和PLC内部状态存储区想表达的内容。

## 七、如何选择FBD还是SFC

可以使用一个简单判断方法：

### 更适合FBD的场景

- 逻辑重点是输入、联锁、运算和输出之间的关系；
- 需要组合定时器、计数器、PID或设备功能块；
- 顺序状态很少，或者状态机不是主要复杂度来源；
- 团队已有成熟的FBD功能块库。

### 更适合SFC的场景

- 工艺天然可以描述为“先做A，条件满足后做B”；
- 步骤多，并且存在暂停、分支、并行或汇合；
- 调试时需要快速定位“流程卡在哪一步”；
- 工艺人员需要直接参与程序审查。

实际工程中，两者往往不是二选一。常见做法是由SFC负责上层工艺顺序，再由FBD功能块负责每台设备的联锁与控制，最终生成物理输出。

例如，SFC的“灌装”步发出 `灌装请求`，FBD中的灌装阀功能块再综合安全门、气压、手自动模式和故障状态，决定是否真正打开物理阀门。这样既保留了流程的可读性，也保留了设备控制的模块化和安全联锁。

## 结语

FBD和SFC都在解决PLC控制问题，但它们提供了不同的观察角度：FBD关注信号如何经过逻辑得到结果，SFC关注现在处于哪一步以及何时进入下一步。

在配套演示中，可以先观察FBD蓝色扫描指针如何走完整张网络，再观察SFC如何读取活动步、执行动作、检查相邻转换并保存新状态。两段动画控制的是同一台机器，却把“状态”放在了完全不同的位置：FBD由程序员显式搭建，SFC由语言结构和运行时共同维护。

这就是两者最本质、也最实用的区别。

## 参考文献

1. IEC, [IEC 61131-3:2025 — Programmable controllers, Part 3: Programming languages](https://webstore.iec.ch/en/publication/68533)，第4版，2025。
2. Schneider Electric, [Machine Expert — Scan](https://product-help.schneider-electric.com/Machine%20Expert/V2.0/en/m241prg/m241prg/gl_D_SE_0024697.166.html)，PLC输入读取、程序执行与输出更新的扫描模型。
3. Rockwell Automation, [Logix Designer — Function Block Order of Execution](https://www.rockwellautomation.com/en-us/docs/studio-5000-logix-designer/37-01/contents-ditamap/instruction-set/function-block-attributes/order-of-execution.html)，FBD连线、数据依赖和反馈回路的执行顺序。
4. Rockwell Automation, [AADvance Trusted SIS Workstation — SFC Steps](https://www.rockwellautomation.com/en-pl/docs/aadvance-trusted-sis-workstation/2-01-00/aadvance-trusted-sis-workstation-software-ditamap/working-with-aadvance-applications/sfc-language/sfc-elements/steps.html)，SFC初始步、活动步以及 `.x`、`.t` 属性。
5. CODESYS, [SFC Elements: Step and Transition](https://content.helpme-codesys.com/en/CODESYS%20SFC/_cds_sfc_element_step_transition.html)，步动作、转换条件与后继步激活规则。
6. Rockwell Automation, [Logix 5000 Controllers — Sequential Function Charts](https://literature.rockwellautomation.com/idc/groups/literature/documents/pm/1756-pm006_-en-p.pdf)，选择分支、并行分支与SFC执行设置。

---
title: 柴发的逻辑组态
description: 从一次设备、PLC输入输出和过程映像出发，用交互动画理解柴油发电机启停、合闸与故障联锁逻辑。
---

# 柴发的逻辑组态：从物理设备到PLC程序

“母线失电后启动柴发，电压稳定后合上断路器”听起来只有一句话。真正落到控制系统里，却必须回答一连串问题：

- PLC怎样知道母线已经失电？
- 为什么不能检测到一次欠压就立即启动？
- 有启动需求时，哪些条件会禁止启动？
- 柴发启动成功后，怎样确认电压和频率已经稳定？
- QF1什么时候可以合闸，什么时候必须保持分闸？
- 命令已经发出，但设备没有动作时，程序应该怎么办？

把这些**条件、顺序、联锁、定时、反馈和异常处理**配置到PLC、柴发控制器或电站控制系统中，就是逻辑组态。

一句话概括：

> 逻辑组态是把“什么条件下允许设备做什么，以及动作失败时怎么办”变成控制器能够周期执行的确定规则。

本文从真实设备出发，逐层进入PLC的输入输出映射、扫描周期和状态机。文中的时间与电压范围仅用于说明方法，不是具体项目定值。

## 一、先看真实设备，而不是先看代码

一个最小柴发供电系统可以抽象为：

```text
柴油发动机 → 发电机 G1 → 出口断路器 QF1 → 母线 → 负载
```

这里有两条完全不同的路径。

第一条是**一次回路**，负责输送真正的电能。柴油机输出机械转矩，发电机把它转换为三相交流电，QF1决定发电机是否与母线连接。

第二条是**控制回路**，负责传递状态和命令。它通常采用24 V直流信号、无源触点或工业通信，而不是直接把母线高电压接入PLC。

典型控制链路为：

```text
母线电压
→ 电压检测装置
→ PLC数字量输入
→ PLC控制逻辑
→ PLC数字量输出
→ 中间继电器
→ 柴发控制器或QF1操作回路
```

实际工程中，PLC通常不会直接驱动柴油机的启动马达。PLC更常向柴发控制器GCU发出“远程启动请求”，由GCU完成供油、预热、启动马达控制以及发动机本体保护。PLC负责整个供电系统的协调：什么时候需要启动、什么时候允许合闸、什么时候退出运行。

### 动画1：从母线失电到柴发带载

下面的动画把一次设备、24 V控制回路和PLC中的C语言等价逻辑放在同一张图里。建议先选择“下一步”逐步观察，再播放完整过程。

<iframe
  src="../demos/diesel-logic/plc-physical-control-flow.html"
  width="100%"
  height="720"
  loading="lazy"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="柴发物理设备与PLC控制链路动画"
></iframe>

如果当前阅读器没有显示动画，可以
[单独打开柴发物理设备与PLC控制链路动画](../demos/diesel-logic/plc-physical-control-flow.html)。

动画中的信号传递可以压缩成一个闭环：

```text
物理状态变化
→ 检测装置转换
→ PLC输入
→ 程序判断
→ PLC输出
→ 现场设备动作
→ 设备反馈重新进入PLC
```

PLC并不理解“母线”“断路器”或“柴油机”这些工程概念。它首先看到的只是某个输入通道上的0或1。工程师通过硬件组态和变量命名，才赋予这些位明确含义。

## 二、PLC如何把物理信号变成变量

以母线失电为例，PLC不能直接测量400 V母线。常见实现是由电压检测继电器或测控装置判断电压状态，再向PLC提供一个24 V开关量。

假设硬件组态建立了以下映射：

| 物理来源 | PLC过程数据 | 程序变量 | `TRUE`的工程含义 |
|---|---|---|---|
| 电压检测继电器触点 | `%IX0.0` | `BusDeadRaw` | 母线失电 |
| 柴发控制器运行触点 | `%IX0.1` | `DG_Running` | 柴发已经运行 |
| QF1辅助触点52b | `%IX0.2` | `QF1_Open` | QF1确认在分位 |
| PLC输出模块CH0 | `%QX0.0` | `DG_Start_CMD` | 请求柴发启动 |
| PLC输出模块CH1 | `%QX0.1` | `QF1_Close_CMD` | 请求QF1合闸 |
| PLC输出模块CH2 | `%QX0.2` | `QF1_Open_CMD` | 请求QF1分闸 |

这里的地址只是教学示例。PLCnext Engineer等工程环境可以通过数据列表或角色映射，把IEC变量与I/O过程数据项关联起来；官方帮助将I定义为应用程序可读的输入过程数据，将Q定义为应用程序可写的输出过程数据。[¹](https://engineer.plcnext.help/2025.0_en/UI_PLANT_ProfinetDevice_DataList.htm)

### 输入过程映像区

在便于理解的典型循环模型中，控制器在一次扫描开始时采样输入模块，并把结果复制到输入过程映像区。用户程序随后读取的是这份稳定快照：

```text
现场触点 → DI输入模块 → 输入过程映像区I → PLC程序
```

这样做的意义是：程序从上到下执行时，不会因为某个现场输入在扫描中途变化而让前半段和后半段看到不同的值。

### 输出过程映像区

程序计算出的输出通常先写入输出过程映像区：

```text
PLC程序 → 输出过程映像区Q → DO输出模块 → 现场继电器
```

扫描结束时，运行时把Q区提交给物理输出模块。于是程序中的`DG_Start_CMD = TRUE`最终变成DO通道上的电压，驱动中间继电器KR1。

不同控制器、现场总线和任务配置可能采用不同的I/O更新时间，甚至支持直接或异步I/O访问。因此“扫描开始读I、扫描结束写Q”是本文用于建立心智模型的典型循环模型，不应替代具体控制器的任务和I/O更新配置。PLCnext Engineer也允许为PROFINET I/O选择更新任务。[²](https://engineer.plcnext.help/latest/Profinet_UpdateTasks.htm)

### 动画2：独立观察I区和Q区

下面的动画把输入映像区和输出映像区作为两块独立内存展示。重点观察第6至第8步：程序已经把`DG_Start_CMD`写成1时，物理DO仍可能保持0，直到本周期输出提交阶段。

<iframe
  src="../demos/diesel-logic/plc-process-image-memory.html"
  width="100%"
  height="720"
  loading="lazy"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="PLC输入和输出过程映像区动画"
></iframe>

如果当前阅读器没有显示动画，可以
[单独打开PLC输入和输出过程映像区动画](../demos/diesel-logic/plc-process-image-memory.html)。

对熟悉C语言的读者，可以把PLC运行时近似理解为：

```c
int main(void)
{
    plc_initialize();

    while (1)
    {
        copy_physical_inputs_to_I_image();
        run_user_control_program();
        copy_Q_image_to_physical_outputs();
        wait_next_cycle();
    }
}
```

区别在于，这个主循环、I/O驱动、周期调度、看门狗和在线监视通常由PLC运行时提供，而不是由应用程序从零实现。

## 三、从顶层目标推导逻辑，而不是堆条件

现在开始设计控制逻辑。最上层目标是：

> 母线持续失电后，在安全条件满足时启动柴发；柴发就绪后，在母线无压条件下合上QF1并向负载供电。

为了实现它，先拆成五个问题：

```text
为什么需要动作？        → Request 请求
现在是否允许动作？      → Permit 许可
最终是否发出动作？      → Command 命令
设备是否真的完成动作？  → Feedback 反馈
没有完成怎么办？        → Timeout/Fault 超时与故障
```

这五类信号构成逻辑组态最实用的骨架。

### 1. 启动请求：为什么需要启动

如果只写：

```text
母线欠压 → 启动柴发
```

一次短暂电压跌落也可能触发启动。因此，先要求欠压持续一定时间：

```text
母线欠压
AND 持续5秒
→ StartRequest
```

ST示意：

```text
BusDeadTimer(
    IN := BusDeadRaw,
    PT := T#5s
);

StartRequest := BusDeadTimer.Q;
```

其中`TON`不是一个没有记忆的普通函数，而是带内部状态的功能块。用C语言近似理解，它更像一个结构体实例：

```c
typedef struct {
    bool in;
    bool q;
    uint32_t preset_ms;
    uint32_t elapsed_ms;
} TonTimer;
```

### 2. 启动许可：当前是否安全

有启动需求，不代表一定能启动。许可条件可以从设备和安全边界逐项推导：

```text
自动模式
AND 急停回路正常
AND 无停机故障
AND QF1确认在分位
→ StartPermit
```

ST写法：

```text
StartPermit :=
    AutoMode
    AND EStopHealthy
    AND NOT ShutdownFault
    AND QF1_Open;
```

C语言等价写法：

```c
StartPermit =
    AutoMode &&
    EStopHealthy &&
    !ShutdownFault &&
    QF1_Open;
```

这里最值得保留的不是具体条件，而是分层方式：

```text
StartRequest：系统想不想启动
StartPermit：设备能不能启动
```

当柴发没有启动时，调试人员可以立即判断：究竟是没有需求，还是某个联锁条件不满足。

### 3. 启动命令：请求和许可的合取

只有请求和许可同时成立，才进入启动顺控：

```text
StartSequence :=
    StartRequest
    AND StartPermit
    AND NOT DG_Running;
```

但是不能直接长期驱动启动马达。在常见系统架构中，`DG_Start_CMD`是给GCU的持续远程运行请求，GCU负责限制启动马达动作时间；如果PLC承担更底层的启动马达控制，就必须另外实现单次启动时间、启动间隔、最大尝试次数和启动成功后立即退出马达等逻辑。

## 四、为什么柴发控制需要状态机

柴发启动不是一个瞬间动作，而是一段有明确先后顺序的过程：

```text
待机
→ 启动准备
→ 启动发动机
→ 暖机建压
→ QF1合闸
→ 带载运行
→ 卸载分闸
→ 冷却停机
```

如果只使用大量互相锁存的BOOL变量，随着步骤、异常和复位路径增加，逻辑很快变得难以验证。更清楚的做法是使用枚举和状态机。

C语言结构：

```c
typedef enum {
    DG_IDLE,
    DG_STARTING,
    DG_WARMING,
    DG_CLOSING_BREAKER,
    DG_RUNNING,
    DG_STOPPING,
    DG_FAULT
} DG_State;

void run_generator_sequence(void)
{
    switch (dg_state)
    {
        case DG_IDLE:
            if (StartRequest && StartPermit)
                dg_state = DG_STARTING;
            break;

        case DG_STARTING:
            DG_Start_CMD = true;
            if (DG_Running)
                dg_state = DG_WARMING;
            else if (StartTimeout)
                dg_state = DG_FAULT;
            break;

        case DG_WARMING:
            if (DG_Ready && BusDead)
                dg_state = DG_CLOSING_BREAKER;
            break;

        case DG_CLOSING_BREAKER:
            QF1_Close_CMD = true;
            if (QF1_Closed)
                dg_state = DG_RUNNING;
            else if (CloseTimeout)
                dg_state = DG_FAULT;
            break;

        default:
            break;
    }
}
```

ST中的`CASE`与C语言`switch`承担相同角色。IEC 61131-3定义了ST、LD、FBD以及用于组织顺序结构的SFC等语言和元素。[³](https://webstore.iec.ch/en/publication/68533)

### 动画3：完整启停顺控

下面的动画把请求、许可、命令和一次设备状态放在一起。动画中的“启动命令”代表启动逻辑动作；在典型项目中，它通常映射为柴发控制器的远程启动输入，而不是由PLC直接给启动马达供电。

<iframe
  src="../demos/diesel-logic/diesel-generator-sequence.html"
  width="100%"
  height="680"
  loading="lazy"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="柴发自动启停顺控动画"
></iframe>

如果当前阅读器没有显示动画，可以
[单独打开柴发自动启停顺控动画](../demos/diesel-logic/diesel-generator-sequence.html)。

## 五、QF1合闸逻辑为什么比启动更严格

QF1是柴发出口断路器。它处于分位时，发电机和母线断开；处于合位时，发电机与母线形成电气连接。

### 向无压母线合闸

黑启动场景下，柴发建立电压后向无压母线合闸。典型许可结构为：

```text
柴发运行
AND 发电机电压正常
AND 发电机频率正常
AND 母线确认无压
AND QF1当前在分位
AND 无保护动作
→ QF1_ClosePermit
```

这里要区分两个概念：

- **母线失电**用于产生柴发启动需求，通常允许一定欠压阈值和延时；
- **母线无压**用于判断能否直接合闸，通常要求更低的残余电压。

二者不能简单共用同一个BOOL和同一个定值。

### 向带电母线合闸

如果母线已经带电，不能再按“无压合闸”处理。必须由同期装置或经过验证的同期逻辑判断电压差、频率差、相角差和相序。没有同期许可时，程序必须禁止合闸。

### 命令和反馈必须分开

程序发出合闸命令，不代表断路器已经合上：

```text
QF1_Close_CMD = TRUE
≠
QF1_Closed = TRUE
```

正确的顺控是：

```text
发出限时合闸命令
→ 等待52a合位反馈
→ 规定时间内收到反馈：进入运行状态
→ 超时仍未收到反馈：报警、撤销命令并进入故障处理
```

QF1常见位置组合为：

| 分位反馈52b | 合位反馈52a | 程序解释 |
|---:|---:|---|
| 1 | 0 | 确认分闸 |
| 0 | 1 | 确认合闸 |
| 0 | 0 | 动作中、反馈断线或位置不确定 |
| 1 | 1 | 反馈矛盾，应报警并闭锁相关操作 |

## 六、逻辑组态不是“能运行就完成”

一段柴发逻辑至少需要同时设计正常路径和异常路径。

### 正常路径

```text
失电确认
→ 启动请求
→ 启动许可
→ 柴发启动
→ 运行反馈
→ 建压稳定
→ 无压合闸
→ 合位反馈
→ 带载运行
```

### 异常路径

至少要考虑：

- 母线电压在延时内恢复；
- 柴发拒绝启动或启动超时；
- 启动许可在过程中消失；
- 柴发运行后电压或频率不合格；
- 母线意外恢复带电；
- QF1合闸命令发出但没有合位反馈；
- QF1分位和合位反馈矛盾；
- 急停、超速、低油压或保护动作；
- PLC、GCU或通信失效；
- PLC重启后状态如何恢复。

工程实现中，急停、超速、短路等关键保护不能只依赖普通PLC软件。它们通常由硬接线安全回路、柴发控制器和专用保护装置承担，PLC负责协调、顺控、报警和状态记录。

## 七、从需求到程序的开发顺序

一套可审查、可测试的柴发逻辑可以按以下顺序开发。

### 1. 写清场景边界

例如：

```text
单台柴发
孤网黑启动
母线原本由上级电源供电
上级电源失效后由柴发接管
不允许与带电母线直接并列
```

### 2. 画一次系统图和控制边界

明确G1、QF1、母线、负载、GCU、PLC、保护装置和中间继电器各自负责什么。

### 3. 建立I/O点表

每个点至少记录：

- 变量名；
- 物理来源或去向；
- 常开或常闭逻辑；
- `TRUE`的工程含义；
- 断线时的安全状态；
- PLC地址或过程数据项；
- 是否需要滤波、延时或锁存。

### 4. 区分请求、许可、命令和反馈

不要把它们压缩成一个变量：

```text
StartRequest
StartPermit
DG_Start_CMD
DG_Running
StartTimeout
```

### 5. 画状态机

先确定正常步骤和故障出口，再写ST、LD、FBD或SFC程序。

### 6. 为每个动作定义超时

任何“发命令后等待反馈”的步骤都必须回答：

```text
最多等多久？
超时后撤销什么？
报什么警？
能否自动重试？
是否需要人工复归？
```

### 7. 用测试用例验收

最小测试集合包括：

1. 短时欠压不启动；
2. 持续失电后正常启动；
3. 急停动作时禁止启动；
4. QF1不在分位时禁止启动或进入明确处理；
5. 柴发启动超时后报警；
6. 电压、频率不合格时禁止合闸；
7. 母线带电且无同期许可时禁止合闸；
8. 合闸无反馈时进入合闸失败；
9. 正常停机时先卸载分闸，再冷却停机；
10. 严重故障时按保护设计跳闸、停机并闭锁。

## 八、用C语言建立PLC心智模型

如果已经熟悉C语言，可以用下面的对应关系快速理解PLC：

| PLC概念 | C语言近似物 | 需要注意的差别 |
|---|---|---|
| 周期任务 | `while (1)`主循环 | 周期和看门狗由PLC运行时管理 |
| 输入映像区 | 一次性读取的输入结构体 | 通常在任务边界更新 |
| 输出映像区 | 等待提交的输出结构体 | 程序写Q不一定立即改变物理DO |
| ST程序 | 周期调用的控制函数 | 变量常跨扫描保持 |
| 功能块FB | `struct`加操作函数 | 每个实例有独立内部状态 |
| TON定时器 | 带累计时间的状态对象 | 由任务周期驱动 |
| `CASE`状态机 | `enum + switch` | 通常无需手写主循环 |
| 在线监视 | 调试器加实时变量面板 | 可直接观察逻辑状态和I/O |
| `RETAIN`变量 | 持久化存储 | 是否保持必须按安全要求设计 |

PLC和普通C程序真正的差别，不是`AND`与`&&`，而是运行环境：

> PLC是一台集成了工业I/O、周期调度、过程数据映射、定时功能块、在线调试和工业通信的实时控制器；用户程序是在这个确定运行模型中反复执行的控制逻辑。

## 结语

理解柴发逻辑组态，最有效的顺序不是先记某段梯形图，而是始终沿着一条真实信号链思考：

```text
现场发生了什么
→ 哪个传感器或辅助触点检测到它
→ 它映射到哪个PLC输入变量
→ 程序为什么产生请求
→ 哪些许可条件必须成立
→ 命令通过哪个输出到达设备
→ 哪个反馈证明动作真的完成
→ 如果反馈没有回来，系统怎样进入安全状态
```

当这条链路能够完整解释时，逻辑组态就不再是一堆AND、OR、定时器和网络，而是一套把物理设备行为转化为确定、可验证控制规则的方法。

## 参考资料

1. Phoenix Contact, [PLCnext Engineer Data List：I/Q过程数据方向与PLC变量映射](https://engineer.plcnext.help/2025.0_en/UI_PLANT_ProfinetDevice_DataList.htm)。
2. Phoenix Contact, [Defining the I/O update task for PROFINET](https://engineer.plcnext.help/latest/Profinet_UpdateTasks.htm)。
3. IEC, [IEC 61131-3:2025 — Programmable controllers, Part 3: Programming languages](https://webstore.iec.ch/en/publication/68533)，第4版，2025。

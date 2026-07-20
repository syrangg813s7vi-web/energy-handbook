---
title: 柴发的逻辑组态
description: 通过三个交互动画，理解停电后柴油发电机怎样自动启动、接管负载，以及PLC如何连接真实设备。
---

# 柴发逻辑组态：停电后，系统怎样自动恢复供电

正常情况下，负载由上级电源供电，柴油发电机处于待机状态。当上级电源失效，控制系统需要自动完成：

```text
确认母线失电
→ 启动柴发
→ 等待发电稳定
→ 合上柴发出口断路器
→ 恢复负载供电
```

**逻辑组态**，就是把这套人工操作规程变成控制器可以自动判断和执行的规则。

本文通过三个动画回答三个问题：

1. 停电后，系统整体发生什么？
2. 控制系统怎样决定是否启动和合闸？
3. PLC程序怎样连接真实的输入与输出？

文中的时间和电压范围只用于解释原理，不是具体项目定值。

## 一、停电后，系统整体发生什么

先看完整过程。暂时不用理解每个变量，只观察信号怎样从现场进入PLC，又怎样从PLC返回设备。

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

### 动画中有哪些设备

```text
柴油发动机 → 发电机G1 → 出口断路器QF1 → 母线 → 负载
```

- **柴油发动机**提供机械动力。
- **发电机G1**把机械能转换成电能。
- **QF1**是柴发出口断路器，决定柴发是否接入母线。
- **母线**可以理解为配电系统的电力总干道。
- **GCU**是柴发自带的控制器，负责供油、启动马达和本体保护。
- **PLC**负责系统协调，判断什么时候启动、合闸和停机。

系统中同时存在两条路径：

```text
一次回路：柴发 → QF1 → 母线 → 负载
控制回路：检测装置 → PLC → 继电器 → GCU或QF1
```

一次回路输送真正的电能；控制回路只传递状态和命令。

### 从动画中抓住一条主线

```text
母线失电
→ 电压检测装置产生开关信号
→ PLC收到输入
→ PLC发出远程启动命令
→ GCU启动柴发
→ 柴发返回运行和就绪反馈
→ PLC控制QF1合闸
→ 母线恢复供电
```

PLC通常不会直接驱动启动马达，而是向GCU提出远程启动请求。GCU控制柴发本体，PLC协调整个供电过程。

## 二、控制系统怎样作出决定

母线失电并不等于立即启动。控制系统还要确认失电持续时间、安全条件和设备反馈。

下面的动画把整个过程拆成“待机、请求、许可、启动、建压、合闸和运行”。

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

### 五个核心概念

所有控制动作都可以拆成五个问题：

| 概念 | 要回答的问题 | 柴发启动示例 |
|---|---|---|
| Request 请求 | 为什么要动作？ | 母线持续失电 |
| Permit 许可 | 现在能否动作？ | 自动模式、无故障、QF1分位 |
| Command 命令 | 最终发出什么要求？ | 向GCU发出远程启动 |
| Feedback 反馈 | 设备真的完成了吗？ | GCU返回柴发运行 |
| Timeout/Fault 超时与故障 | 没有完成怎么办？ | 启动超时并报警 |

最小启动逻辑是：

```text
母线失电持续5秒
→ StartRequest = TRUE
```

```text
自动模式
AND 急停回路正常
AND 无停机故障
AND QF1确认分位
→ StartPermit = TRUE
```

```text
StartRequest
AND StartPermit
→ DG_Start_CMD
```

为什么要延时？因为短时电压波动不应造成柴发频繁误启动。

为什么要求QF1分位？因为柴发通常应先在与母线断开的状态下启动和建压。

### 命令不等于完成

```text
DG_Start_CMD = TRUE
≠
DG_Running = TRUE
```

前者表示PLC已经提出启动要求，后者才表示柴发真的运行。因此，程序必须：

```text
发出命令
→ 等待独立反馈
→ 反馈按时到达：进入下一步
→ 反馈超时未到：进入故障处理
```

### 用状态机组织顺序

柴发控制不是一次布尔运算，而是一段有先后关系的过程：

```text
待机
→ 确认失电
→ 启动柴发
→ 暖机建压
→ QF1合闸
→ 带载运行
→ 卸载分闸
→ 冷却停机
```

熟悉C语言时，可以把它理解为`enum + switch`：

```c
typedef enum {
    DG_IDLE,
    DG_STARTING,
    DG_WARMING,
    DG_CLOSING_BREAKER,
    DG_RUNNING,
    DG_FAULT
} DG_State;

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
        if (DG_Ready && BusNoVoltage)
            dg_state = DG_CLOSING_BREAKER;
        break;
}
```

PLC的ST语言可以使用`CASE`表达相同状态机。

### 母线失电和母线无压不是一回事

- **母线失电**用于决定是否启动柴发，通常带欠压阈值和延时。
- **母线无压**用于决定能否直接合闸，通常要求更低的残余电压。

如果母线已经带电，QF1不能按无压条件直接合闸，必须经过同期判断。

## 三、PLC程序怎样连接真实设备

PLC不认识“母线”或“柴油机”。它首先看到的只是输入模块上的0和1。

下面的动画把输入过程映像区I和输出过程映像区Q独立展示出来。重点观察：现场输入何时进入I区，程序结果何时从Q区送到物理输出。

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

### 输入方向

```text
现场触点
→ DI输入模块
→ 输入过程映像区I
→ PLC程序变量
```

例如：

| 物理来源 | 过程数据 | 程序变量 | `TRUE`的含义 |
|---|---|---|---|
| 电压检测触点 | `%IX0.0` | `BusDeadRaw` | 母线失电 |
| GCU运行触点 | `%IX0.1` | `DG_Running` | 柴发运行 |
| QF1辅助触点52b | `%IX0.2` | `QF1_Open` | QF1在分位 |

硬件组态把物理通道与程序变量关联起来。PLC程序读取`BusDeadRaw`，而不是直接理解母线电压。

### 输出方向

```text
PLC程序变量
→ 输出过程映像区Q
→ DO输出模块
→ 中间继电器
→ 现场设备
```

例如：

| 程序变量 | 过程数据 | 物理去向 |
|---|---|---|
| `DG_Start_CMD` | `%QX0.0` | 柴发启动继电器 |
| `QF1_Close_CMD` | `%QX0.1` | QF1合闸继电器 |
| `QF1_Open_CMD` | `%QX0.2` | QF1分闸继电器 |

在典型循环模型中，PLC运行过程可以近似理解为：

```c
while (1)
{
    copy_physical_inputs_to_I_image();
    run_control_logic();
    copy_Q_image_to_physical_outputs();
    wait_next_cycle();
}
```

因此：

- 输入映像区是本次扫描读取的现场快照。
- 输出映像区保存程序准备提交给硬件的结果。
- 程序写入输出命令，不代表设备已经完成动作。
- 下一次输入反馈才证明现场动作结果。

不同PLC和现场总线可能采用不同的I/O更新时间。动画展示的是便于入门理解的典型循环模型。

## 四、把三个动画合成一条闭环

现在可以把柴发逻辑组态概括为：

```text
现场发生变化
→ PLC获得输入
→ 程序产生请求
→ 检查动作许可
→ 状态机发出命令
→ 设备执行
→ 反馈返回PLC
→ 成功进入下一步，失败进入超时或故障处理
```

逻辑组态不是单独的一条`AND`语句，而是由四部分共同组成：

1. 物理设备和控制边界；
2. 输入输出和变量映射；
3. 请求、许可、命令与反馈；
4. 顺序、超时、故障和保护。

急停、超速、短路等关键保护通常由硬接线、GCU和专用保护装置承担。PLC负责顺控、协调和报警，不能作为唯一保护。

如果能沿着“现场输入—程序判断—输出命令—设备反馈”解释完整过程，就已经建立了柴发逻辑组态的基本框架。

## 参考资料

1. Phoenix Contact, [PLCnext Engineer Data List：I/Q过程数据方向与PLC变量映射](https://engineer.plcnext.help/2025.0_en/UI_PLANT_ProfinetDevice_DataList.htm)。
2. Phoenix Contact, [Defining the I/O update task for PROFINET](https://engineer.plcnext.help/latest/Profinet_UpdateTasks.htm)。
3. IEC, [IEC 61131-3:2025 — Programmable controllers, Part 3: Programming languages](https://webstore.iec.ch/en/publication/68533)，第4版，2025。

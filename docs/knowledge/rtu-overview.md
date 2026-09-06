---
title: RTU：把电站现场连接到站控与调度
description: 用三张图理解RTU是什么、做什么、怎样连接现场设备与站控调度，以及它和I/O、数采、PLC与通信网关的关系。
---

# RTU：把电站现场连接到站控与调度

<iframe
  src="/demos/rtu/architecture.html"
  width="100%"
  height="854"
  scrolling="no"
  allow="fullscreen"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="电站RTU输入、输出与南北向连接架构图"
></iframe>

::: tip 一句话理解
<strong>RTU是电站现场与站控、调度之间的“采集 + 控制 + 通信”枢纽。</strong>图中的“南向”面对现场，“北向”面对主站；两侧都可以双向通信。
:::

## 一次遥控，怎样形成闭环

<iframe
  src="/demos/rtu/remote-control-loop.html"
  width="100%"
  height="650"
  scrolling="no"
  loading="lazy"
  allow="fullscreen"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="RTU遥控闭环时序图"
></iframe>

<p><strong>命令发出不等于动作成功。</strong>RTU下发命令后，还要重新采集设备实际状态，加上时间戳，再把结果送回主站。</p>

## RTU做什么

| 方向 | 功能 | 常见内容 |
|---|---|---|
| ↑ 上送 | 遥测 | 电压、电流、功率、温度等连续数值 |
| ↑ 上送 | 遥信 | 分合位、运行、故障、保护动作 |
| ↑ 上送 | 遥脉 | 电能、流量、转速等累计或频率信息 |
| ↓ 下发 | 遥控 | 分闸、合闸、启动、停止、复归 |
| ↓ 下发 | 遥调 | 功率、电压、功率因数、阀位设定值 |

除此之外，RTU还会做量程换算、品质标记、越限判断、SOE事件顺序记录、对时、缓存、断线重连和协议转换。

## 一个I/O通道，对应一个信号

<iframe
  src="/demos/rtu/io-signal-types.html"
  width="100%"
  height="850"
  scrolling="no"
  loading="lazy"
  allow="fullscreen"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  class="demo-frame"
  title="RTU I/O信号分类图"
></iframe>

| 接口 | 看什么 | 例子 |
|---|---|---|
| DI 数字量输入 | 0或1 | 分位、合位、运行、故障 |
| AI 模拟量输入 | 幅值 | 4～20 mA、0～10 V |
| PI 脉冲量输入 | 次数或频率 | 电能、流量、转速脉冲 |
| DO 数字量输出 | 动作或不动作 | 分闸、合闸、启停 |
| AO 模拟量输出 | 连续设定值 | 功率、电压、阀位给定 |

模拟量靠**幅值**表示数值，要滤波和模数转换；脉冲量靠**次数、频率或宽度**表示数值，要检测边沿、去抖和计数，所以必须用不同通道处理。

::: info 通道不等于设备
一台断路器可能占用多个DI和DO；一块16点DI模块也可能连接多台简单设备。RTU容量要按**信号点数**统计，不能只数设备台数。
:::

## 南向接什么，北向接什么

| 南向：生产现场 | RTU内部 | 北向：监控与调度 |
|---|---|---|
| 断路器、刀闸、传感器 | I/O模块 | 站控SCADA |
| 保护、测控、电表 | 主控CPU与点表 | 集控中心 |
| 逆变器、PCS、BMS、箱变 | SOE、缓存、对时 | 电网调度主站 |
| PLC、数采、通信网关 | 协议与通信模块 | EMS、DMS |

硬接线信号进入I/O模块；智能设备通常通过RS-485、以太网或光纤，以Modbus、IEC 61850等协议接入。北向常见IEC 60870-5-101/104、DNP3等远动协议。

## RTU和数采、PLC、网关的关系

| 设备 | 最主要的任务 | 与RTU的关系 |
|---|---|---|
| 数采装置 | 采集、汇集、转发 | 可接在RTU南向，也可由RTU内部模块承担 |
| PLC | 快速顺序控制和工艺联锁 | 可向RTU提供数据；部分PLC可配置成RTU使用 |
| 通信网关 | 协议转换和数据路由 | 可能只承担RTU的通信部分 |
| RTU | 远程采集、事件、控制、主站通信 | 面向SCADA远程站点的完整闭环 |

```text
现场设备 → 数采 / PLC / 网关 → RTU → 站控 / 调度
             └──── 能力也可能集成在同一台设备中 ────┘
```

## 能不能不设独立RTU

可以，但要同时满足两点：

1. 站控系统、网关或测控装置已经承担点表、SOE、遥控校验、缓存和远动通信；
2. 系统满足当地电网的远动、网络安全、冗余和验收要求。

取消的是**独立RTU机箱**，不是RTU承担的系统功能。

## 选型只看这八项

`I/O点数` · `通信设备数` · `总测点数` · `刷新周期` · `SOE分辨率` · `协议能力` · `冗余方式` · `扩展上限`

## 参考资料

- [NIST SP 800-82 Rev.3：Guide to Operational Technology Security](https://csrc.nist.gov/pubs/sp/800/82/r3/final)
- [IEC 60870-5-104：远动传输规约](https://webstore.iec.ch/en/publication/25035)
- [IEC TS 60870-5-7:2025：IEC 101/104安全扩展](https://webstore.iec.ch/en/publication/87773)
- [Modbus Organization：协议规范与实施指南](https://www.modbus.org/modbus-specifications)

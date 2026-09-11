---
title: 什么是电气间隔？先把它想成电站里的一套“门”
description: 面向初学者，用一条35 kV新能源集电线路讲清电气间隔的作用、三种状态、组成、通信、分类，以及Siemens产品分别位于哪里。
---

# 什么是电气间隔？先把它想成电站里的一套“门”

如果把一段母线看成电站里的**公共电源通道**，那么每条接入母线的线路，都需要一套自己的“门、传感器、安全员和门禁控制”。这整套功能，就是一个**电气间隔（Bay）**。

> **一句话先记住：间隔负责管理一条电气支路，让它能独立送电、独立停电、故障时独立切除、检修时安全隔离。**

它不是一只开关，也不等于一面柜子。柜子是外壳，断路器是其中一个执行部件；“间隔”说的是这一整套功能。

## 先看一条真实线路

假设一条 35 kV 光伏或储能集电线路要接到升压站母线。先不管设备型号，只看电气连接：

<div class="bay-simple-flow" role="img" aria-label="35千伏母线依次经过隔离开关、电流电压传感器和断路器，连接到光伏或储能集电线路">
  <div class="bay-flow-node"><strong>35 kV 母线</strong><span>公共电源通道</span></div>
  <span class="bay-flow-arrow" aria-hidden="true"></span>
  <div class="bay-flow-node"><strong>隔离开关</strong><span>检修时拉开</span></div>
  <span class="bay-flow-arrow" aria-hidden="true"></span>
  <div class="bay-flow-node"><strong>CT / VT</strong><span>测电流、电压</span></div>
  <span class="bay-flow-arrow" aria-hidden="true"></span>
  <div class="bay-flow-node bay-flow-node--key"><strong>断路器</strong><span>真正切断电流</span></div>
  <span class="bay-flow-arrow" aria-hidden="true"></span>
  <div class="bay-flow-node"><strong>集电线路</strong><span>光伏或储能</span></div>
</div>

<div class="bay-ground-note"><strong>还有一条安全支路：</strong>线路停电、隔离并确认无电后，接地刀闸把检修部分接到大地。</div>

图从母线向外画，只是为了方便识别设备顺序，**不表示电能只能向右流**。光伏通常从集电线路向母线送电；储能则可能双向流动。

为什么一条线路需要这么多东西？因为它必须处理三种完全不同的状态。

## 间隔每天只是在处理三件事

<div class="bay-state-grid">
  <section class="bay-state-card bay-state-card--run">
    <div class="bay-state-label">① 正常运行</div>
    <div class="bay-state-switches"><b>隔离：合</b><b>断路器：合</b><b>接地：分</b></div>
    <p>线路与母线接通，电能正常流动；系统持续测量电流、电压和开关位置。</p>
  </section>
  <section class="bay-state-card bay-state-card--fault">
    <div class="bay-state-label">② 发生故障</div>
    <div class="bay-state-switches"><b>保护：判断</b><b>断路器：跳开</b></div>
    <p>保护装置发现短路后，直接命令断路器切断故障电流，尽量只停这一条支路。</p>
  </section>
  <section class="bay-state-card bay-state-card--work">
    <div class="bay-state-label">③ 停电检修</div>
    <div class="bay-state-switches"><b>断路器：分</b><b>隔离：分</b><b>验电后接地</b></div>
    <p>先停止电流，再建立明显隔离，确认无电后接地，给检修人员建立安全边界。</p>
  </section>
</div>

这就是间隔存在的原因：如果所有线路共用一套开关和保护，一条线路出故障，就很难只切除它自己；检修其中一条线路，也可能迫使更大范围停电。

::: warning 操作顺序不是口令
上面是帮助理解的典型逻辑，不是现场操作票。实际操作必须遵守项目接线、五防联锁和当地规程。
:::

## 再把周边关系放进来

现在再看完整图就容易了：**最下方是电流真正经过的一次设备；中间是本间隔的传感、保护和控制；最上方是操作员、站控和调度。**

<iframe class="demo-frame bay-overview-frame" src="/demos/electrical-bay/overview.html" title="35千伏新能源集电线路间隔完整关系图" loading="lazy"></iframe>

<small>图中一次设备箭头表示从母线向外的阅读顺序，不代表固定潮流方向。可在图内切换深浅主题、缩放，或[打开全屏图](/demos/electrical-bay/overview.html)。</small>

读这张图，只需抓住两条路径：

1. **粗的横向路径是电能通道。** 真正承载和切断高压电流的是母线、隔离开关、互感器、断路器和线路。
2. **竖向路径是信息通道。** 传感器把情况告诉保护和控制装置；它们判断后发命令；实际位置再返回，证明动作是否成功。

调度和操作员通常不会“亲手”切断故障电流。故障发生得很快，本地保护必须能在站控服务器或画面暂时失联时独立动作。

## 主要组件：每个部件只解决一个关键问题

把间隔想成一套门禁系统，会更容易区分这些组件。

| 间隔组件 | 类似什么 | 它解决的问题 | 如果缺少会怎样 |
|---|---|---|---|
| **断路器** | 能在事故中强行关断的门 | 可在正常负荷和短路电流下分闸，利用灭弧结构切断电流 | 保护即使发现故障，也没有最终执行器 |
| **隔离开关** | 看得见的安全门闩 | 断路器已分闸后，建立可确认的检修断口 | “停电”不一定形成可安全工作的隔离边界 |
| **接地刀闸** | 把检修区锁到安全地电位 | 验电后释放残余电荷，防范感应电和误送电 | 人员仍可能受到残压、感应或反送电威胁 |
| **CT / VT** | 电流、电压传感器 | 把一次大电流和高电压变成保护、测量可用的信号 | 系统看不见真实电气状态，无法可靠判断 |
| **保护装置（IED）** | 反应很快的安全员 | 持续计算是否短路、接地或异常，必要时发跳闸命令 | 只能等更上级的后备保护，停电更慢、范围更大 |
| **间隔控制器与联锁** | 门禁控制器 | 检查操作条件、执行分合闸、确认位置，阻止危险误操作 | 错误命令可能被执行，动作失败也可能无人确认 |
| **操作电源、线圈与辅助接点** | 门的电机和到位开关 | 把小信号变成机械动作，再把真实位置反馈回来 | “命令已发出”不能证明开关真的动作 |

这里说“不能缺”，指的是**功能不能缺**，不代表每个间隔都要独占一台物理设备。例如母线电压互感器、母线保护和站控服务器可以被多个间隔共享；GIS 或中压开关柜也可能把隔离、接地等功能集成在组合设备里。

### 三个最容易混淆的部件

- **断路器负责切电流。** 它可以切负荷，也能按额定能力切故障电流。
- **隔离开关负责造断口。** 它通常不能代替断路器切负荷或短路。
- **接地刀闸负责保安全。** 它只能在确认无电后合上，带电合接地相当于制造接地故障。

可以把检修逻辑记成：**先断流 → 再隔离 → 确认无电 → 最后接地。**

## 它们怎样“交流”

间隔里同时存在两种交流，速度和目的不同。

### 对话一：保护动作，快而且本地闭环

```text
CT / VT 测到异常
  → 保护装置判断是本线路故障
  → 发出跳闸命令
  → 断路器分闸，切断电流
  → 辅助接点和电流返回，确认切除成功
```

这条链要求快、可靠，通常用硬接线，或 IEC 61850 的采样值（SV）与快速报文（GOOSE）。

### 对话二：运行监控，向上汇报并接受操作

```text
间隔把电流、电压、位置、告警和事件
  → 送到站控 / 远动系统
  → 显示在操作员画面，并按需上送电网调度

操作命令则反向下达
  → 间隔联锁检查是否允许
  → 执行开关动作
  → 用真实位置反馈结果
```

“命令发送成功”不等于“设备动作成功”。一个完整控制闭环，必须看到实际位置和电流状态返回。

## 间隔怎样分类

最简单的方法不是背设备，而是问：**这条支路连接谁？**

| 类型 | 它连接什么 | 主要关注什么 |
|---|---|---|
| **馈线 / 集电线路间隔** | 光伏、风电、储能或中压负荷线路 | 过流、接地故障，必要时线路差动 |
| **送出线路间隔** | 本站与远方电网 | 线路差动、距离保护、重合闸 |
| **主变间隔** | 主变某一侧与对应母线 | 变压器差动、后备保护、非电量联动 |
| **母联 / 分段间隔** | 两段母线 | 合并或分开母线、同期和跨间隔联锁 |
| **无功设备间隔** | 电容器组或电抗器 | 无功投切、过压、过流和不平衡 |

另外还有站用变、接地变、发电机、PT/VT 和避雷器间隔。它们仍遵循同一个判断方法：先看连接对象，再确定需要哪些开断、测量、保护和检修功能。PT/VT 等特殊间隔可能没有主断路器，因此不要用“有没有一只断路器”机械地判断它是不是间隔。

## 以 Siemens 为例：产品放在哪一环

理解产品时，不要先背型号。先问它在做哪件事：**感知、判断、操作、站级管理，还是工程分析？**

| 要完成的事 | Siemens 代表产品 | 放在间隔的哪里 |
|---|---|---|
| **把现场量送给二次系统** | **SIPROTEC 6MU85** | 过程层：接互感器和开关量，发布采样值、交换 GOOSE，让上层“看见”现场 |
| **判断故障并发跳闸** | **SIPROTEC 5 保护系列** | 间隔层保护：7SJ85 用于馈线；7SA / 7SD / 7SL 用于线路；7UT 用于主变；7SS 用于母线；7UM 用于发电机或调相机 |
| **操作开关并做联锁** | **SIPROTEC 6MD85** | 间隔层控制：分合闸、联锁、位置确认、测量和自动化 |
| **汇聚全站并连接调度** | **SICAM S8000、SICAM PAS、SICAM A8000** | 站控 / 远动层：汇聚各间隔、运行站级自动化、做协议和调度接口 |
| **给操作员看和操作** | **SICAM SCC / SICAM HMI** | 站内界面：一次图、告警、趋势、事件和人工操作入口 |
| **配置和事后分析** | **DIGSI 5、SIGRA、SICAM DISTO / PQS** | 工程工具：定值与逻辑配置、故障录波分析、集中归档和电能质量分析 |
| **把装置软件化** | **SIPROTEC V** | 功能仍属于间隔保护与控制，但算法可以作为虚拟 IED 运行在站级服务器 |

用一条故障链把这些产品串起来：

```text
线路 CT / VT
  → 6MU85 把采样送上来（也可用传统铜缆直入保护）
  → 7SJ、7SA、7SD 或 7SL 判断故障
  → 断路器跳闸
  → 事件上送 SICAM S8000 / PAS
  → SCC / HMI 显示告警
  → DISTO 取回录波，SIGRA 帮助分析
```

这里最重要的边界是：**SIPROTEC 主要负责看见、判断、控制和发命令；SICAM 主要负责汇聚、协调和显示；真正承载并切断高压电流的，仍是断路器等一次设备。** 一次设备还要根据电压等级、短路开断能力、绝缘方式和项目认证单独选型。

## 最后只记四句话

1. **间隔是一条可独立管理的电气支路，不是一只开关。**
2. **正常时送电，故障时只切本支路，检修时隔离并接地。**
3. **断路器切电流，隔离开关造断口，接地刀闸保检修安全。**
4. **保护在本地快速动作，站控负责全站监视和协调。**

## 参考资料

- [Siemens SIPROTEC 5 Catalog](https://cache.industry.siemens.com/dl/files/143/109792143/att_1054750/v1/SIDG-C10059-00-7600_SIPROTEC_5_Catalog_EN.pdf)
- [Siemens SIPROTEC 7SJ85](https://www.siemens.com/en-us/products/siprotec/7sj85/)
- [Siemens SIPROTEC 6MD85 Bay Controller](https://www.siemens.com/en-gb/products/siprotec/6md85/)
- [Siemens SIPROTEC 6MU85 Merging Unit](https://www.siemens.com/en-us/products/siprotec/6mu85/)
- [Siemens SIPROTEC 7SS85 Busbar Protection](https://www.siemens.com/en-us/products/siprotec/7ss85/)
- [Siemens SIPROTEC V](https://resources.sw.siemens.com/en-US/brochure-siprotec-v/)
- [Siemens SICAM Power Automation Platform](https://www.siemens.com/en-us/products/sicam/)
- [Siemens SICAM S8000](https://www.siemens.com/es-es/products/sicam/s8000/)
- [Siemens SICAM A8000 CP-8050](https://www.siemens.com/en-us/products/sicam/a8000-cp-8050/)
- [Siemens DIGSI 5](https://www.siemens.com/en-gb/products/siprotec/digsi-5/)
- [Siemens SIGRA](https://www.siemens.com/en-us/products/siprotec/sigra/)
- [EnergyBook：西门子电力自动化资料库](/insights/siemens-power-automation-source-library)

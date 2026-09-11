---
title: 什么是电气间隔？用一条线路看懂它
description: 面向初学者，用同一张状态图讲清电气间隔在正常、故障和检修时怎样工作，以及各组件和Siemens产品分别位于哪里。
---

# 什么是电气间隔？用一条线路看懂它

把母线想成电站里的**公共电能通道**。光伏、储能、主变或送出线路要接入母线，不能只拉一根电缆过去：每条支路都需要自己的开关、传感器、保护和控制。

这套围绕一条支路、能独立监视、操作、保护和检修的功能单元，就是**电气间隔（Bay）**。

> **间隔的作用：正常时让一条支路可靠运行；故障时尽量只切除这条支路；检修时为它建立安全边界。**

## 先用三种典型状态理解间隔

下面始终是同一条 35 kV 新能源集电线路。点击“正常、故障、检修”，观察哪些开关改变、谁发出命令，以及电流还能不能通过。

<iframe
  class="demo-frame bay-state-story-frame"
  src="/demos/electrical-bay/bay-state-story.html"
  loading="eager"
  referrerpolicy="no-referrer"
  title="同一条35千伏集电线路间隔在正常、故障和检修状态下的变化"
></iframe>

<small>这是理解原理的典型示意，不是现场操作票。实际设备顺序与操作必须遵守项目接线、五防联锁和当地规程。</small>

从这张图先得出三个结论：

1. **保护装置负责发现和判断，断路器负责真正切断电流。**
2. **断路器分闸不等于已经可以检修。** 还要形成隔离、确认无电，并按规程接地。
3. **间隔不是某一台设备。** 它是从测量、判断、执行到确认的一整条闭环。

## 为什么不能只装一只断路器

同一只“开关”无法同时完美承担切故障电流、建立检修断口和可靠接地。每个组件只解决一个关键问题。

<div class="bay-component-grid">
  <section>
    <strong>断路器｜负责断流</strong>
    <p><b>原理：</b>触头分开时用真空、气体等介质熄灭电弧，因此能切正常负荷和额定范围内的故障电流。</p>
    <p><b>不能缺：</b>保护只会发命令；没有断路器或等效开断器，故障电流没有最终执行器来切断。</p>
  </section>
  <section>
    <strong>隔离开关｜负责造断口</strong>
    <p><b>原理：</b>在电流已被切断后拉开，形成可确认的电气隔离；它通常不具备切故障电流的能力。</p>
    <p><b>不能缺：</b>断路器分位只说明触头断开，不自动等于检修所需的可靠隔离。</p>
  </section>
  <section>
    <strong>接地刀闸｜负责检修接地</strong>
    <p><b>原理：</b>停电、隔离并验电后，把检修部分接到大地，释放残余电荷并防范感应或误送电。</p>
    <p><b>不能缺：</b>隔离只断开电源，不会自动把检修区保持在安全地电位。</p>
  </section>
  <section>
    <strong>电流 / 电压互感器｜负责感知</strong>
    <p><b>原理：</b>电流互感器（CT）和电压互感器（VT）把一次大电流、高电压变成保护和测量可使用的信号。</p>
    <p><b>不能缺：</b>没有可信测量，保护装置就看不见一次系统发生了什么。</p>
  </section>
  <section>
    <strong>保护装置｜负责快速判断</strong>
    <p><b>原理：</b>保护用 CT / VT 信号计算过流、差动、距离等判据，确认故障后发出跳闸。</p>
    <p><b>不能缺：</b>若只等站控或上级后备保护，切除会更慢，停电范围也可能更大。</p>
  </section>
  <section>
    <strong>间隔控制与联锁｜负责防误操作</strong>
    <p><b>原理：</b>检查开关位置、控制权和操作条件，允许或拒绝命令，并确认设备是否到位。</p>
    <p><b>不能缺：</b>保护处理电气故障，但不会替代所有正常操作条件和防误闭锁。</p>
  </section>
  <section>
    <strong>操作电源、线圈和辅助接点｜负责落地与反馈</strong>
    <p><b>原理：</b>直流电源和跳合闸线圈驱动机械机构，辅助接点把真实位置送回来。</p>
    <p><b>不能缺：</b>通信显示“命令成功”，并不能证明断路器已经机械动作。</p>
  </section>
</div>

这里的“不能缺”指**功能不能缺**，不代表每个间隔都独占一台设备。母线 VT、母线保护和站控服务器可以共享；GIS 或开关柜也可以把多种功能集成在同一组合设备中。

## 间隔和周边系统怎样交流

间隔同时进行两类“对话”。

### 快对话：故障保护在本地闭环

```text
CT / VT 测到异常
  → 保护装置在本地判断
  → 跳闸回路动作
  → 断路器分闸
  → 位置和电流返回，确认故障已切除
```

这条链关系到设备安全，通常采用硬接线，或 IEC 61850 的采样值（SV）和快速报文（GOOSE）。即使操作员画面暂时失联，本地保护仍应能够动作。

### 慢对话：运行信息向上汇报

间隔把电流、电压、开关位置、告警和事件送到站控或远动系统，再按需上送调度。操作员的正常分合闸命令则反向下达，经联锁检查后执行，并用真实位置完成确认。

所以，**命令已发出 ≠ 设备已动作**。闭环必须有反馈。

<details class="bay-advanced">
  <summary>进阶：打开间隔与站控、调度的完整四层关系图</summary>
  <p>已经理解三种状态后，再读这张图：最下方是承载电流的一次设备；中间是本间隔的传感、保护和控制；最上方是站控、操作员和调度。</p>
  <iframe class="demo-frame bay-overview-frame" src="/demos/electrical-bay/overview.html" title="35千伏新能源集电线路间隔完整关系图" loading="lazy"></iframe>
  <small>一次设备箭头表示从母线向外的阅读顺序，不代表固定潮流方向。也可[打开全屏图](/demos/electrical-bay/overview.html)。</small>
</details>

## 间隔怎样分类

最简单的分类方法是问：**这条支路连接谁？**

| 间隔类型 | 连接对象 | 最需要关注 |
|---|---|---|
| 馈线 / 集电线路 | 光伏、风电、储能或中压负荷线路 | 过流、接地故障，必要时线路差动 |
| 送出线路 | 本站与远方电网 | 线路差动、距离保护、重合闸 |
| 主变 | 主变某一侧与对应母线 | 变压器差动、后备保护、非电量联动 |
| 母联 / 分段 | 两段母线 | 合并或分开母线、同期和跨间隔联锁 |
| 无功设备 | 电容器组或电抗器 | 无功投切、过压、过流和不平衡 |

站用变、接地变、发电机、PT/VT 和避雷器也可以形成相应间隔。特殊间隔未必有主断路器，因此不能只用“有没有一只断路器”来判断。

## 把 Siemens 产品贴回这条线路

不要先背型号。沿着主图的“感知 → 判断 → 操作 → 上送”顺序看，产品的位置就清楚了。

| 主图中的位置 | Siemens 代表产品 | 它接过哪一棒 |
|---|---|---|
| **CT / VT 后面的过程接口** | **SIPROTEC 6MU85** | 接入互感器和开关量，发布采样值并交换 GOOSE，让保护和控制看见现场 |
| **保护装置** | **SIPROTEC 5 保护系列** | 7SJ85 对应馈线；7SA / 7SD / 7SL 对应线路；7UT 对应主变；7SS 对应母线；7UM 对应发电机或调相机 |
| **间隔控制与联锁** | **SIPROTEC 6MD85** | 操作开关、执行联锁、确认位置，并承担测量和间隔自动化 |
| **站控 / 远动** | **SICAM S8000、PAS、A8000** | 汇聚多个间隔，运行站级自动化，连接操作员和电网调度 |
| **操作员界面** | **SICAM SCC / HMI** | 显示一次图、告警、趋势和事件，提供人工操作入口 |
| **配置与故障分析** | **DIGSI 5、SIGRA、SICAM DISTO / PQS** | 配置定值和逻辑，收集与分析故障录波、电能质量数据 |

SIPROTEC V 把部分保护和控制算法作为虚拟智能电子设备（vIED）运行在站级服务器上。虽然物理位置变化了，它承担的仍是间隔保护与控制功能。

这些产品主要负责“感知、判断、控制、汇聚和分析”。真正承载并切断高压电流的，仍是断路器、隔离开关等一次设备；它们还要按电压等级、短路开断能力、绝缘方式和项目认证单独选型。

## 最后只记四句话

1. **间隔是一条可独立管理的电气支路，不是一只开关。**
2. **故障时，保护负责判断，断路器负责切断。**
3. **检修时，断流之后还要隔离、验电和接地。**
4. **本地保护快速自治，站控负责全站监视与协调。**

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

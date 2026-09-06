---
title: 西门子变电站自动化架构图谱：从 SICAM PAS 到 SIPROTEC V
description: 按传统站控、IEC 61850 数字站、集中式控制、站控虚拟化和保护软件化，整理 Siemens 架构原图、产品边界与原始出处。
---

# 西门子变电站自动化架构图谱：从 SICAM PAS 到 SIPROTEC V

> **核心判断**：西门子的公开材料并不是一条产品整齐换代的单线历史，而是两条相互交织的演进线：一条是 **SICAM 站控与自动化**，从分布式服务器部署走向可在 IPC、服务器和虚拟化环境中运行的软件平台；另一条是 **SIPROTEC 保护与间隔控制**，从物理 IED、过程总线和集中式保护控制，进一步走向 SIPROTEC V 服务器化保护。工程配置、自动测试和网络安全贯穿两条线。

本文把此前搜集到、且能够辨认为“架构图”的材料集中整理。为了便于理解，使用“**分系统控制 → 整站协同 → 软件定义**”作为分析框架；这不是 Siemens 官方公布的“三代产品”命名，也不意味着旧产品在某一年被新产品整体替换。

::: warning 先区分两个公司主体
SIPROTEC、SICAM、RUGGEDCOM 和 Electrification X 主要属于 **Siemens AG / Smart Infrastructure** 的电气化与自动化产品线；Noedra、变电站 EPC 和 PAC 集成服务图属于 **Siemens Energy**。两者不能仅因都带有 Siemens 名称而当成同一套产品架构。
:::

## 一张表看清演进关系

| 分析阶段 | 典型架构 | 硬件形态 | 软件与产品 | 关键变化 |
|---|---|---|---|---|
| 分系统控制 | 控制中心—SCC—PAS Full Server/DIP—间隔设备 | 多台专用或工业计算机，保护仍在物理 IED | SICAM PAS、SICAM SCC、SIPROTEC | 功能按服务器、协议接入节点和 IED 分散部署 |
| 整站协同 | 控制中心—站控层—IEC 61850 站总线—IED—过程总线/MU | 站控计算机、IED、交换机、时钟、MU | SICAM 8/A8000/S8000、SIPROTEC 5、DIGSI 5 | IEC 61850、统一模型、时间同步和整站工程把分系统连起来 |
| 过渡形态 | 集中式保护控制（CPC）与物理 IED 混合 | 专用集中式控制硬件或冗余计算平台 | 集中式保护/间隔控制应用 | 功能集中，但未必采用虚拟机，也未必与硬件解耦 |
| 软件定义 | 服务器/IPC—实时 OS 或虚拟化层—多个软件功能实例 | 通用或变电站加固服务器，主/备部署 | SIPROTEC V、SICAM S8000、SICAM 8 应用 | 软件与硬件生命周期开始解耦，配置、测试、版本和安全成为核心 |

这张表还回答了一个容易混淆的问题：**集中式控制位于数字站和全面软件定义之间，但集中化不等于虚拟化。** 一台专用 CPC 把多个间隔功能集中起来，仍可能是“功能绑定专用硬件”；只有当功能被封装成可部署的软件实例，并由实时平台、虚拟机或容器承载，才进入软件定义范畴。

## 1. 官方历史总图：从硬接线到数字过程总线

![Siemens 变电站自动化四代演进图](/visuals/siemens-substation-architecture/digital-substation-evolution.png)

**读图。** Siemens 将变电站自动化历史画成四代：20 世纪 60 年代的标准电缆、1985 年的点对点连接、2004 年的 IEC 61850 数字站总线，以及“Today”的过程总线与 IoT。最重要的结构变化不是服务器数量，而是信息入口逐步从并行铜缆变为站总线，再下沉到过程总线和合并单元。

**边界。** 这是一张数字化通信与系统层次演进图，**没有呈现虚拟机、服务器化保护或 SIPROTEC V**，因此不能单独用来证明保护虚拟化。

**原始出处：** Siemens，《[The Digital Substation](https://assets.new.siemens.com/siemens/assets/api/uuid:6d8d8d9b-d5db-4540-9b5f-6fd6e9ecefac/di-pa-ci-digital-substation-ipdf-en.pdf)》，PDF 第 13 页（文件页索引 12），图题 “Evolution of Substation Automation”。

## 2. 第一阶段：传统 SICAM PAS 的分布式站控

传统系统并非“没有软件”，而是软件与计算机角色绑定得更紧：SICAM SCC 负责 HMI，PAS Full Server 承担站控核心，DIP（Device Interface Processor）扩展协议和设备接入，保护与控制功能主要留在间隔层 IED。

### 2.1 Full Server + DIP：按接入规模分布式扩展

![SICAM PAS Full Server 与 DIP 分布式架构](/visuals/siemens-substation-architecture/sicam-pas-2023-distributed.png)

图中控制中心经企业网络到站内，SCC、Full Server、DIP 和间隔设备沿 Ethernet TCP/IP 与串口接入。这里的“分布式”是 **PAS 应用与设备接入工作负载分布到多台计算机**，不是今天语境下的虚拟化。

**原始出处：** Siemens，《[SICAM PAS Overview](https://cache.industry.siemens.com/dl/files/076/109758076/att_1143897/v1/pas_overview_b.pdf)》，文档号 E50417-X8976-C431-C8，Edition 05.2023，PDF 第 23 页，Figure 1-2。

### 2.2 冗余站控与小型站同机部署

![SICAM PAS 冗余与小型站配置](/visuals/siemens-substation-architecture/sicam-pas-2023-redundant-small.png)

上半部分展示冗余 SICAM SCC、冗余 Full Server 和双连接间隔设备；下半部分说明小型应用可以把 SICAM PAS 与 SICAM SCC 放在同一台计算机。它证明“合并部署”早已存在，但这种同机部署仍不等于虚拟化。

**原始出处：** Siemens，《[SICAM PAS Overview](https://cache.industry.siemens.com/dl/files/076/109758076/att_1143897/v1/pas_overview_b.pdf)》，Edition 05.2023，PDF 第 24 页，Figures 1-3、1-4。

### 2.3 中大型站：Full Server 与多个 DIP

![SICAM PAS 中大型站配置](/visuals/siemens-substation-architecture/sicam-pas-2023-medium-large.png)

中型应用将 SCC 与 PAS 分机；大型应用由 Full Server 加最多两个 DIP 扩展。传统架构的伸缩方式是“增加角色明确的计算机节点”，而软件定义架构更倾向在标准平台上增加软件实例或计算资源。

**原始出处：** Siemens，《[SICAM PAS Overview](https://cache.industry.siemens.com/dl/files/076/109758076/att_1143897/v1/pas_overview_b.pdf)》，Edition 05.2023，PDF 第 25 页，Figures 1-5、1-6。

<details>
<summary>历史归档图：2005、2007 与 2019（点击展开）</summary>

这些图用于证明 PAS 的长期部署逻辑，不作为现行选型依据。2005、2007 资料来自公开第三方镜像，原文版权页和图面显示为 Siemens 材料，但在线来源等级低于 Siemens 官方支持站。

![2005 年 PAS Full Server 与 DIP](/visuals/siemens-substation-architecture/sicam-pas-2005-full-server-dip.png)

**出处：** Siemens 项目资料《SICAM PAS System Description》，文内日期 2005-01-10；公开镜像：[PDFCoffee](https://pdfcoffee.com/sicam-pas-system-description-pdf-free.html)。图示控制中心、HMI、Full Server、DIP 与多类间隔设备。

![2005 年 PAS Hot-Hot 冗余](/visuals/siemens-substation-architecture/sicam-pas-2005-hot-hot.png)

**出处：** 同上，《SICAM PAS System Description》（2005），Hot-Hot redundancy 架构页；公开镜像同上。

![2007 年 PAS 典型配置](/visuals/siemens-substation-architecture/sicam-pas-2007-typical.png)

**出处：** Siemens，《SICAM PAS》演示材料，文件生成时间 2007-09-11；公开镜像：[PDFCoffee](https://pdfcoffee.com/download/sicam-pas-pdf-free.html)。资料为历史演示稿，不代表当前版本。

![2019 年 SICAM SCC 软件架构](/visuals/siemens-substation-architecture/sicam-scc-software-architecture-2019.png)

**出处：** Siemens，《[SICAM SCC Bedien- und Beobachtungssystem](https://cache.industry.siemens.com/dl/files/817/109756817/att_987824/v1/scc_a.pdf)》，V9.04，文档号 E50417-H8900-C501-B3.01，Edition 05.2019，PDF 第 354 页。

</details>

## 3. 第二阶段：IEC 61850 把整站连成一个工程对象

### 3.1 物理 IED 数字站

![物理 IED 数字变电站架构](/visuals/siemens-substation-architecture/digital-substation-physical-ieds-2025.png)

这张图把客户主数据中心、控制中心、站控层、间隔层和过程层串起来：站总线承载 IEC 61850/IEC 104 等通信，过程网络承载 SV、GOOSE、PRP 和 PTP，保护继电器、控制继电器、故障录波和电能质量仍由不同物理装置承担。

它代表“整站协同”的关键基线：**数据、网络和工程开始统一，但保护功能仍主要绑定物理 IED。**

**原始出处：** Siemens Smart Infrastructure Hrvatska，《[Virtualizirana zaštita & upravljanje](https://hro-cigre.hr/wp-content/uploads/2026/02/CIGRE_2025_SIEMENS.pdf)》，CIGRE 2025 演示稿第 15 页。

### 3.2 CIGRE 2026 现场产品拓扑

![Siemens CIGRE 2026 数字变电站产品墙](/visuals/cigre-2026-vendors/iec-61850/siemens/078-f038973032.jpg)

现场产品墙把 SICAM HMI、S8000、A8000、GridPass、SIPROTEC 5 和 Reyrolle 接到站总线，并把控制中心与 Electrification X 放在上层。它更像“站控与产品组合图”，没有展示服务器化保护。

**原始出处：** CIGRE Paris Session 2026，Siemens 展台 A164，现场照片 078，拍摄归档；展会与展品主题可交叉核对 Siemens 的 [CIGRE 2026 专题页](https://www.siemens.com/en-gb/events/cigre/)。

![Siemens CIGRE 2026 站总线与过程总线产品墙](/visuals/cigre-2026-vendors/iec-61850/siemens/080-741ad1e263.jpg)

第二块产品墙清楚区分 IEC 61850-8-1 站总线与 IEC 61850-9-2 过程总线，并展示 PTP Grandmaster、SIPROTEC 5、6MU85 合并单元和工程/投运/运维工具。这是 SIPROTEC V 的基础条件：现场量测和 I/O 需要先以标准化过程接口进入网络。

**原始出处：** CIGRE Paris Session 2026，Siemens 展台 A164，现场照片 080；[CIGRE 官方会议信息](https://session.cigre.org/)。

## 4. 第二代与第三代之间：集中式控制

集中式保护控制（Centralized Protection and Control，CPC）解决的是“多个间隔功能是否必须各占一台装置”；虚拟化解决的是“功能是否能与某一台硬件解耦”。二者有关联，但不是同一概念。

<details open>
<summary>CIGRE/IEEE 行业参考图：IED → CPC → 冗余 CPC → 服务器化（点击收起）</summary>

![传统 PAC 技术演进](/visuals/cigre-2026-vendors/digital-transition/siemens/190-55926a89d5.jpg)

**照片 190。** 从机电/固态继电器、IED、IEC 61850 到站控系统的历史背景图。原幻灯片明确引用 IEEE Power System Relaying Committee WG K15 的 2015 报告，因此它是 **CIGRE/IEEE 行业参考**，不是 Siemens 产品代际图。

![混合 PACS 与备份 CPC](/visuals/cigre-2026-vendors/digital-transition/siemens/194-bd731178a5.jpg)

**照片 194。** 物理 IED、过程总线和备份 CPC 共存，说明集中式控制通常先以混合架构进入。

![PACS 软件架构抽象](/visuals/cigre-2026-vendors/digital-transition/siemens/197-1f18b40e6d.jpg)

**照片 197。** 应用层、平台层、驱动层和硬件层被明确分开，FIH（Function Independent from Hardware）从系统拓扑问题变成软件接口问题。

![冗余 CPC 系统](/visuals/cigre-2026-vendors/digital-transition/siemens/198-1c9eda3140.jpg)

**照片 198。** 冗余 CPC 加冗余过程接口单元，功能高度集中但图中没有 VM 或容器，属于“集中化但不一定虚拟化”的典型证据。

![五种 PAC 架构评价对比](/visuals/cigre-2026-vendors/digital-transition/siemens/199-fecda81a0b.jpg)

**照片 199。** 用设备数量、安装测试、维护、可靠性、更新和成本对五种架构评分；它强调集中化收益与共同失效风险要同时评估。

![VM 与容器承载的服务器化 PACS](/visuals/cigre-2026-vendors/digital-transition/siemens/200-db58f23ea6.jpg)

**照片 200。** 到这里才出现 VM、Container、Virtual Switch、Hypervisor、Host RTOS 和 Container Daemon，进入明确的虚拟化/容器化语义。

**六图共同出处：** CIGRE Paris Session 2026 技术报告现场屏摄，2026-08-25，照片 190、194、197—200。课件页眉为 CIGRE，部分页面引用 IEEE PSRC WG K15；这些照片与 Siemens 展区素材相邻归档，但**不能据此认定为 Siemens 原创产品架构**。

</details>

## 5. 第三阶段 A：站控系统虚拟化

### 5.1 CIGRE 2026 的“传统—虚拟化”直接对比

![传统站控与虚拟化站控对比](/visuals/cigre-2026-vendors/digital-transition/siemens/509-1204946f4b.jpg)

左侧 Conventional System 在站控层分设 Service、Monitor、Control、Security 等工业计算机；右侧把这些工作负载收敛到一台 Industrial PC 上，由 Hypervisor 承载 VM1—VM6。下方网络交换机、保护和现场设备仍保留。

因此这张图证明的是 **站控层工作负载虚拟化**，不能外推为“所有保护 IED 都已经消失”。这也是传统系统与虚拟化系统最直接的一张对比图。

**原始出处：** CIGRE Paris Session 2026，Siemens 展台 A164，现场照片 509；屏幕页标题 “Power Automation Solutions – Virtualization / Conventional to Virtualized”，图内标注 © Siemens 2026。

### 5.2 虚拟化必须放进安全分区与恢复架构

![Siemens Secure Substation Blueprint](/visuals/cigre-2026-vendors/digital-transition/siemens/511-9093d7af69.jpg)

这张图把虚拟化平台放到 Substation Control Zone / Trusted Zone 内，并把 Service PC、日志、RBAC、证书管理、路由/防火墙、SICAM SCC、SICAM PAS/PQS、A8000、时钟和 SIPROTEC 5 纳入同一安全蓝图。右侧措施还覆盖补丁、备份恢复、恶意软件防护、数据完整性和安全远程访问。

它提示了虚拟化后的真正系统边界：减少计算机并不等于减少责任，反而需要把身份、证书、日志、补丁和恢复作为平台级能力。

**原始出处：** CIGRE Paris Session 2026，Siemens 展台 A164，现场照片 511；屏幕页标题 “Siemens Secure Substation Blueprint and Migration Service”，图内标注 Siemens EA OT Cybersecurity Services、© Siemens 2026 / CIGRE 2026。

## 6. 第三阶段 B：SICAM 8 把同一软件能力放到不同硬件

### 6.1 SICAM 8 平台家族

![SICAM 8 平台、软件与硬件家族](/visuals/siemens-substation-architecture/sicam8-platform-2025.png)

SICAM 8 把 Device Manager、S8000 软件、EGS 边缘硬件、A8000 嵌入式硬件和 Linux 放在同一平台图里。这里最关键的不是某一型号，而是“同一自动化平台可跨不同承载形态”。

**原始出处：** Siemens Smart Infrastructure Hrvatska，《[Virtualizirana zaštita & upravljanje](https://hro-cigre.hr/wp-content/uploads/2026/02/CIGRE_2025_SIEMENS.pdf)》，CIGRE 2025 演示稿第 40 页。

### 6.2 “SICAM A8000 or SICAM S8000 on IPC” 的整体架构

![SICAM 8 Runtime 整体架构](/visuals/siemens-substation-architecture/sicam8-runtime-architecture-2025.png)

这张图把控制中心、站控层和现场层完整连接起来：

- **SICAM A8000**：软件运行在 Siemens 的嵌入式、模块化自动化硬件上；
- **SICAM S8000 on IPC**：相近的 SICAM 8 应用运行在工业 PC（Industrial PC）上；
- **Virtualized SICAM S8000**：进一步运行于控制中心或数据中心的虚拟化环境，可按需要冗余；
- 站控 HMI、IoT Gateway 与多种现场应用仍通过分层网络组合。

因此 “A8000 **or** S8000 on IPC” 不是两代产品互相替换，而是在同一功能位置选择不同承载：前者强调加固嵌入式硬件，后者强调软件部署与算力伸缩。

**原始出处：** Siemens Smart Infrastructure Hrvatska，《[Virtualizirana zaštita & upravljanje](https://hro-cigre.hr/wp-content/uploads/2026/02/CIGRE_2025_SIEMENS.pdf)》，CIGRE 2025 演示稿第 47 页。产品补充：[SICAM S8000 官方页](https://www.siemens.com/en-us/products/sicam/s8000/)。

## 7. 第三阶段 C：SIPROTEC V 把间隔保护变成服务器软件

### 7.1 从物理 IED 到主/备服务器

![SIPROTEC V 主备服务器化保护架构](/visuals/siemens-substation-architecture/siprotec-v-server-based-station-2025.png)

与第 15 页相比，第 16 页把间隔层的多台保护、控制和录波装置替换为主硬件服务器与冗余服务器，过程层合并单元和过程网络仍然存在。这是“保护功能上移”的核心变化。

**原始出处：** Siemens Smart Infrastructure Hrvatska，《[Virtualizirana zaštita & upravljanje](https://hro-cigre.hr/wp-content/uploads/2026/02/CIGRE_2025_SIEMENS.pdf)》，CIGRE 2025 演示稿第 16 页。

### 7.2 软件栈：硬件、实时 Linux、核心系统和间隔应用

![SIPROTEC V 软件栈与工程工具](/visuals/siemens-substation-architecture/siprotec-v-software-stack-2025.png)

从下到上依次是变电站级计算机、实时 Linux、变电站核心系统、按间隔部署的 SIPROTEC 5 保护软件和 Web UI；工程侧继续使用 DIGSI 5 与 System Configurator。软件定义的价值由此变得具体：保护算法、运行平台、UI 与工程工具各自形成边界。

Siemens 2026 年发布信息称 SIPROTEC V 可在一套服务器方案中整合最多 60 台硬件 SIPROTEC 5 的功能。该数字以及 CAPEX、空间、碳排和生命周期节省均是厂商公布的方案指标，应在具体项目中结合间隔类型、冗余和测试范围验证。

**原始出处：** Siemens Smart Infrastructure Hrvatska，CIGRE 2025 演示稿第 17 页；产品发布：[Siemens Press，2026-02-03](https://press.siemens.com/global/en/pressrelease/siemens-virtualized-protection-power-grids-cuts-costs-saves-space-digital-substations)；[SIPROTEC V 官方页](https://www.siemens.com/en-us/products/siprotec/siprotec-v/)。

## 8. 工程与测试：软件化之后必须补上的闭环

![iPA Suite Tester 与数字孪生测试架构](/visuals/cigre-2026-vendors/digital-transition/siemens/513-8f94112673.jpg)

iPA Suite Configurator 把工程数据交给 Tester；自动化测试框架结合 Digital Twin、数字/模拟 I/O 仿真、ITM Tester Module 和 Omicron 设备，覆盖 IEC 61850 GOOSE、硬接线和交叉接线检查。

这张图不是运行时架构，而是 **工程验证架构**。当多个保护功能共享服务器后，平台变更、应用变更和接口变更必须能被分层测试，否则硬件减少会转化成更大的共同变更风险。

**原始出处：** CIGRE Paris Session 2026，Siemens 展台 A164，现场照片 513；屏幕页 “Integrated Power Automation Suite Tester — Enabling future of Automated Testing”，图内标注 © Siemens 2026。

## 9. Siemens Energy：另一条 EPC、集成与 SCADA 平台线

### 9.1 PAC 工程与系统集成

![Siemens Energy 变电站 PAC 工程与集成架构](/visuals/cigre-2026-vendors/digital-transition/siemens/536-477db5e1fc.jpg)

该图从控制中心、站控、IEC 61850-8-1、过程总线、合并单元到数字一次设备，强调设计、项目执行、过程总线、硬件供应、网络安全和控制中心连接的一体化交付。它是 Siemens Energy 的工程与集成服务图，不能直接当成 SICAM/SIPROTEC 的产品 BOM。

**原始出处：** CIGRE Paris Session 2026，Siemens Energy 展示，现场照片 536，图内标注 © Siemens Energy 2026；补充资料：[Substation EPC / Noedra Node brochure](https://assets.siemens-energy.com/dam/ada384fe-5ee9-4bfb-aa17-b3e200747aeb/2026_01_27_Substation_EPC_brochure_v02-pdf_Original%20file.pdf)。

### 9.2 Noedra SCADA 软件层

![Siemens Energy Noedra SCADA 平台层次](/visuals/cigre-2026-vendors/digital-transition/siemens/537-aee03162f5.jpg)

Noedra SCADA 由加固 Linux/Windows 与工业硬件构成基础层，中间是 HMI、标准自动化、数据管理和通信协议，顶部再叠加专用控制、分析与优化库。这是 Siemens Energy 的 SCADA 平台分层，不应据此推断 SIPROTEC V 或 SICAM S8000 的内部实现。

**原始出处：** CIGRE Paris Session 2026，Siemens Energy 展示，现场照片 537，图内标注 © Siemens Energy 2026；补充资料同上。

## 10. 如何理解这几代变化

### 层次变化

传统 PAS 把控制中心、站控服务器和间隔设备连接起来；数字站通过 IEC 61850 把站总线和过程总线标准化；集中式控制把多个间隔功能上移；服务器化之后，站控、保护和工程平台的边界变成可管理的软件边界。

### 硬件变化

硬件没有简单消失，而是重组：

- 大量角色固定的站控计算机，可收敛为 IPC/服务器上的 VM；
- 多台物理保护 IED，可在适用场景中收敛为主/备 SIPROTEC V 服务器；
- MU、交换机、时间同步、过程接口和跳闸链路仍是物理系统；
- 冗余从“每台设备一套”转为服务器、网络、应用和过程接口的组合设计。

### 软件变化

软件从“设备固件或某台服务器上的程序”变成有明确接口、资源、版本和部署边界的应用。SICAM S8000 体现站控软件跨 IPC/虚拟化承载，SIPROTEC V 体现保护功能软件化；iPA Suite、DIGSI 5、System Configurator、数字孪生和安全蓝图负责把这些运行应用纳入可验证生命周期。

## 11. 结论：西门子的演进不是一条线，而是四层同时变化

可以把全部架构图压缩为四条同步发生的变化：

1. **通信层**：硬接线、串口 → Ethernet、IEC 61850 站总线 → 过程总线、SV/GOOSE/PTP；
2. **控制层**：分散 IED → 混合 CPC → 冗余集中式控制 → 服务器化保护；
3. **计算层**：角色固定的多台计算机 → IPC/服务器 → VM/容器与可伸缩软件平台；
4. **工程治理层**：单设备组态 → 整站模型 → 自动测试、数字孪生、安全分区、版本与恢复。

所以，“分系统控制 → 整站协同 → 软件定义”可以作为理解路线，但产品映射应写得更准确：

- **传统站控线**：SICAM PAS + SICAM SCC + 物理 SIPROTEC；
- **整站数字化线**：SICAM 8 / A8000 / S8000 + SIPROTEC 5 + IEC 61850 站/过程总线；
- **站控软件化线**：SICAM S8000 on IPC / Virtualized SICAM S8000；
- **保护软件化线**：SIPROTEC V 主/备服务器；
- **工程与安全线**：DIGSI 5、System Configurator、iPA Suite、Digital Twin、Secure Substation Blueprint。

更进一步的产品判断、虚拟化技术原理和业主验收问题，可继续阅读《[软件定义保护与控制：变电站 PAC 如何摆脱专用硬件](/insights/software-defined-pac-architecture)》。

## 12. 资料分类与本地归档

本文引用尽量指向 Siemens 或 Siemens Energy 的官方网页和官方 PDF。为防止官方链接迁移、版本覆盖或下载限制，本次研究实际使用的原件、原图、现场照片与阶段性成果，已分类保存到此前指定的 [Google Drive：Siemens_西门子资料归档](https://drive.google.com/drive/folders/16HaDKX0tzsud5e5QSc2SQvwhDoV82AxM)。该目录是本研究的本地归档，不是 Siemens 官方发布站；产品选型、兼容性和硬件白名单仍应以目标版本的官方页面与手册为准。

| 归档分类 | 主要内容 | 官方在线入口 |
|---|---|---|
| 01 变电站自动化总览 | *The Digital Substation*、Substation Automation Catalog、CIGRE 2025 虚拟化演示 | [Catalog Edition 8.1](https://cache.industry.siemens.com/dl/files/152/109801152/att_1353758/v1/Substation_and_Automation_Catalog_Edition_8.1_.pdf?download=true)、[Siemens CIGRE 2026](https://www.siemens.com/en-gb/events/cigre/) |
| 02 SICAM PAS 与 SCC | PAS 总览、安装手册、SCC 产品与操作资料 | [SICAM PAS Overview](https://cache.industry.siemens.com/dl/files/076/109758076/att_1143897/v1/pas_overview_b.pdf)、[SICAM SCC](https://www.siemens.com/en-us/products/sicam/hmi-human-machine-interface/) |
| 03 SICAM 8、S8000 与 GridEdge | SICAM S8000 平台、A8000 RTU、GridEdge 网关与部署要求 | [SICAM S8000](https://www.siemens.com/en-us/products/sicam/s8000/)、[SICAM A8000](https://www.siemens.com/en-us/products/sicam/a8000-cp-8050/)、[SICAM GridEdge V25.30 手册](https://cache.industry.siemens.com/dl/files/895/109954895/att_1351697/v1/SICAM_GridEdge_IoT_Monitoring_and_Control_V25.30_enUS1.pdf) |
| 04 SIPROTEC 5、SIPROTEC V 与过程层 | SIPROTEC 5 系列目录、6MU85、SIPROTEC V 软件化保护 | [SIPROTEC 5 Catalog](https://cache.industry.siemens.com/dl/files/143/109792143/att_1051200/v1/SIDG-C10059-00-7600_SIPROTEC_5_Catalog_EN.pdf)、[SIPROTEC V](https://www.siemens.com/en-us/products/siprotec/siprotec-v/)、[SIPROTEC V 发布信息](https://press.siemens.com/global/en/pressrelease/siemens-virtualized-protection-power-grids-cuts-costs-saves-space-digital-substations) |
| 05 工程、测试与网络安全 | SIMIT、数字孪生测试、安全蓝图与工程闭环 | [SIMIT](https://www.siemens.com/en-gb/products/simit/)、[Siemens CIGRE 2026](https://www.siemens.com/en-gb/events/cigre/) |
| 06 发电与电站控制 | Omnivise T3000、仿真、同步调相机、小水电与设备保护 | [Omnivise T3000](https://www.siemens-energy.com/global/en/home/products-services/product/omnivise-t3000.html) |
| 07 Siemens Energy PAC 与 CIGRE | 变电站 EPC/PAC、Noedra SCADA、Blue GIS 与展会材料 | [Substation EPC / PAC brochure](https://assets.siemens-energy.com/dam/ada384fe-5ee9-4bfb-aa17-b3e200747aeb/2026_01_27_Substation_EPC_brochure_v02-pdf_Original%20file.pdf)、[Siemens Energy CIGRE](https://www.siemens-energy.com/global/en/home/events/cigre.html) |
| 08 历史资料 | SICAM PAS 2005/2007 系统说明与演示资料 | 历史镜像不是当前 Siemens 官方托管，仅用于追溯架构演进 |
| 09 图像与现场资料 | 官方架构图原页、CIGRE 2026 现场照片、官方视觉素材 | 官方出处分别记录在压缩包内的来源说明和本页图片说明中 |
| 10 研究索引与成果 | 对比 PPT、专题报告、交互解说与本文归档副本 | [本篇 EnergyBook 文章](/insights/siemens-substation-architecture-evolution) |

归档根目录中的 `README_归档索引.md` 给出逐文件说明、来源边界和官方入口，`SHA256SUMS.txt` 用于检查本地归档文件在传输后是否保持一致。`SICAM 8 Application Group Visualization & Operation` 手册的官方附件可在线读取，但其下载端点拒绝自动归档，因此资料库只记录[官方手册入口](https://support.industry.siemens.com/cs/attachments/109963293/SICAM_8_Visualization__Operation_enEN.pdf)，未保存本地副本。

## 来源索引与证据等级

| 编号 | 原始材料 | 年份 | 本文图片 | 性质 |
|---|---|---:|---|---|
| S1 | Siemens, *The Digital Substation*，PDF 第 13 页 | 未标注 | 四代演进 | Siemens 官方 PDF 原页 |
| S2 | Siemens, *SICAM PAS Overview*, E50417-X8976-C431-C8，PDF 23—25 | 2023 | PAS 分布式、冗余、规模化 | Siemens 官方支持站 PDF 原页 |
| S3 | Siemens Smart Infrastructure Hrvatska, CIGRE 2025 演示稿，15—17、40、47 | 2025 | 物理 IED、SIPROTEC V、SICAM 8 | Siemens 地区公司演示稿，由 CIGRE Croatia 托管 |
| S4 | Siemens CIGRE 2026 专题页与新闻稿 | 2026 | 产品主题与 SIPROTEC V 指标 | Siemens 官方网页 |
| S5 | CIGRE Paris Session 2026 现场照片 078、080、509、511、513 | 2026 | 数字站、站控虚拟化、安全、测试 | 展会现场一手照片 |
| S6 | CIGRE 2026 报告现场照片 190、194、197—200 | 2026 | FIH/CPC/VM/容器参考架构 | CIGRE/IEEE 行业参考，不归为 Siemens 产品图 |
| S7 | Siemens Energy 现场照片 536、537 与 Noedra brochure | 2026 | PAC 集成、Noedra SCADA | Siemens Energy，不归为 Siemens AG 产品图 |
| S8 | SICAM PAS 2005/2007 历史资料、SICAM SCC V9.04 Manual | 2005—2019 | 历史部署图 | 归档原页；前两份在线镜像非原厂托管 |

::: info 纳入与排除规则
本文纳入此前收集且能表达系统层次、软件栈、部署、冗余或工程数据流的架构图。相同页面的连拍、纯产品实物照、营销价值页和文字缺失的 2004 年渲染页未重复收入；它们仍保留在原始照片档案中。所有现场图只证明展会展示内容，不等同于独立认证或投运业绩。
:::

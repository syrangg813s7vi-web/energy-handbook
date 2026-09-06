---
title: 西门子电力自动化资料库：按电站四层架构分类
description: 按控制中心层、站控层、间隔层和过程层，整理 Siemens 与 Siemens Energy 的官方资料、历史材料、现场图片与研究成果。
---

# 西门子电力自动化资料库：按电站四层架构分类

这是一篇 **资料导航文章**。它不重复讲解某一张架构图，而是帮助读者一眼看清：已经收集了哪些 Siemens / Siemens Energy 资料、每份资料是干什么的、属于电站哪一层，以及应该去哪里找到原文件。

本次研究使用的 PDF、官方网页快照、架构图原页、CIGRE 现场照片和阶段性成果，已经保存到此前指定的 [Google Drive：Siemens_西门子资料归档](https://drive.google.com/drive/folders/16HaDKX0tzsud5e5QSc2SQvwhDoV82AxM)。Drive 是本研究的 **本地归档**，不是 Siemens 官方发布站；产品选型、兼容性、硬件白名单和项目实施要求，仍应以目标版本的官方资料和 Siemens 项目支持答复为准。

## 一、分类框架：四层架构加一个跨层入口

资料库采用变电站常见的四层架构：

| 层级 | 主要对象 | 本资料库对应内容 |
|---|---|---|
| 控制中心层 | 调度主站、网络控制中心、远方通信 | 当前没有独立主站手册；接口散见整站目录、PAS 与 GridEdge 资料 |
| 站控层 | 站控服务器、HMI、网关、RTU、边缘应用 | SICAM PAS、SICAM SCC、SICAM S8000、SICAM A8000、SICAM GridEdge |
| 间隔层 | 保护、测控、间隔控制 IED | SIPROTEC 5 与承担间隔功能的 SIPROTEC V |
| 过程层 | 合并单元、CT/VT、开关量 I/O、一次设备 | SIPROTEC 6MU85、Blue GIS 和数字化一次设备 |

另设 `00_整站与跨层`。它不是第五个运行层，而是把覆盖多层的整站目录、工程测试、安全、发电控制、现场资料和研究成果集中起来。强行把这些资料放进单一层级，反而会误导读者。

::: warning 功能层和物理部署层可能不同
SIPROTEC V 承担的是间隔保护与控制功能，但软件运行在站级服务器。因此本资料库把它放在“间隔层”，同时明确其物理部署位于站控层。分类表达的是资料的主要功能主题，不是简单按机柜位置归档。
:::

## 二、一眼看清归档结构

| Drive 入口 | 原始资料数 | 用来回答什么问题 |
|---|---:|---|
| `00_整站与跨层` | 25 份既有资料 + 本文副本 | 整站如何演进？跨层如何工程化、测试和保护？研究成果和原图在哪里？ |
| `01_控制中心层` | 0 份独立原件 | 目前缺少什么？哪些现有资料包含控制中心接口？ |
| `02_站控层` | 10 | PAS/SCC 如何部署？S8000/A8000/GridEdge 的角色和硬件环境是什么？ |
| `03_间隔层` | 2 | SIPROTEC 5 与 SIPROTEC V 分别是什么，硬件和软件边界怎样变化？ |
| `04_过程层` | 3 | 合并单元、一次设备和数字过程接口保留了什么？ |

以下清单覆盖重分类前已经归档的全部 40 份原始资料与研究成果；本文的本地副本作为新增索引文件另行保存在研究成果目录。

## 三、00 整站与跨层：先看全局，再进入设备层

### 3.1 整站架构与目录

| 文件 | 这份资料是干什么的 |
|---|---|
| `Siemens_The_Digital_Substation.pdf` | 官方演进总图：硬接线、串口、IEC 61850 站总线、过程总线与 IoT |
| `Siemens_Substation_Automation_Catalog_Ed8.1.pdf` | 核对整站产品、SICAM 8/S8000、预认证 IPC 和虚拟化支持的核心目录 |
| `Siemens_SICAM_Substation_Automation_Catalog_Ed9.pdf` | 更新版整站自动化目录，用于检查当前产品线 |
| `Siemens_Substation_Automation_Catalog_Ed5_2021.pdf` | 查看 PAS、SCC、RTU 和 SIPROTEC 的较早整站架构及产品关系 |
| `Siemens_CIGRE_Croatia_2025_Virtualized_Protection_Control.pdf` | 跨层观察 SIPROTEC 5/V、SICAM 8、工程与安全主题 |
| `Siemens_Energy_Substation_EPC_PAC_Brochure_2026.pdf` | 理解 Siemens Energy 的变电站 EPC/PAC、Noedra 与整站集成范围 |

官方入口：[Catalog Edition 8.1](https://cache.industry.siemens.com/dl/files/152/109801152/att_1353758/v1/Substation_and_Automation_Catalog_Edition_8.1_.pdf?download=true)、[Siemens CIGRE 2026](https://www.siemens.com/en-gb/events/cigre/)、[Siemens Energy Substation EPC / PAC](https://assets.siemens-energy.com/dam/ada384fe-5ee9-4bfb-aa17-b3e200747aeb/2026_01_27_Substation_EPC_brochure_v02-pdf_Original%20file.pdf)。

### 3.2 工程测试与网络安全

| 文件 | 这份资料是干什么的 |
|---|---|
| `Siemens_SIMIT_V11.3_SP1_Manual.pdf` | 查询虚拟调试、数字孪生、自动化程序测试和操作员培训 |
| `Siemens_Omnivise_T3000_Cybersecurity_Whitepaper.pdf` | 查询电厂控制系统的纵深防御、白名单、补丁和安全运营 |

官方入口：[SIMIT](https://www.siemens.com/en-gb/products/simit/)、[Omnivise T3000](https://www.siemens-energy.com/global/en/home/products-services/product/omnivise-t3000.html)。

### 3.3 发电控制与 Siemens Energy

| 文件 | 这份资料是干什么的 |
|---|---|
| `Siemens_Energy_Omnivise_T3000_Brochure.pdf` | 发电厂 DCS/SCADA 平台能力总览 |
| `Siemens_Energy_Omnivise_T3000_Simulator_Whitepaper.pdf` | T3000 集成仿真、培训与变更验证 |
| `Siemens_Energy_Nuclear_Plant_Modernization.pdf` | 核电控制系统现代化场景 |
| `Siemens_Energy_Sipocon-H_Small_Hydro.pdf` | 小水电自动化与控制方案 |
| `Siemens_Energy_Synchronous_Condenser_Integrated_Controls.pdf` | 同步调相机及其集成控制 |
| `Siemens_Energy_VIB3000_Machinery_Protection.pdf` | 旋转机械保护；不要与 SIPROTEC 变电站保护线混淆 |

这组资料覆盖电厂和机组控制，不能被当作 SICAM PAS 的直接后继。Siemens Energy 与 Siemens AG / Smart Infrastructure 的产品边界应始终分开记录。

### 3.4 现场图像与网页快照

| 文件 | 这份资料是干什么的 |
|---|---|
| `Siemens_官方架构图原页.zip` | 保存已验证官方 PDF 的完整架构图原页，便于回看上下文 |
| `Siemens_CIGRE_2026_现场照片_A_01-32.zip` | 65 张现场照片的前 32 张，无损分卷 |
| `Siemens_CIGRE_2026_现场照片_B_33-65.zip` | 65 张现场照片的后 33 张，无损分卷 |
| `Siemens_Energy_CIGRE_2026_官方视觉资料.zip` | Siemens Energy 官方视频关键帧和来源说明 |
| `Siemens_Energy_CIGRE_2026_Web_Snapshot.html` | 保存 CIGRE 官方页面在研究时的网页上下文 |

现场照片只能证明展会展示内容，不自动等同于产品认证、投运案例或合同承诺。

### 3.5 研究成果

| 文件 | 这份资料是干什么的 |
|---|---|
| `EnergyBook_西门子变电站自动化架构图谱.md` | 架构演进文章的本地归档副本 |
| `EnergyBook_西门子电力自动化资料库_四层分类.md` | 本篇资料导航文章的本地归档副本 |
| `西门子虚拟化变电站与工程平台分析.md` | 站控虚拟化、工程平台和测试闭环专题分析 |
| `西门子_VPAC_VIED_产品调研报告.md` | vPAC/vIED 产品、功能和证据边界调研 |
| `SIPROTEC_5到SIPROTEC_V_演进与变化.md` | SIPROTEC 5 到 SIPROTEC V 的演进说明 |
| `SIPROTEC_5_vs_V_架构与主要产品.pptx` | 两类架构图、主要产品和变化点的可编辑演示稿 |
| `Siemens_vPAC_交互解说.html` | 带原图、配音、字幕和章节跳转的离线解说 |

这些文件是研究成果，不是 Siemens 官方发布物。文中的产品事实应回到相邻分类的官方原件核验。

## 四、01 控制中心层：当前资料缺口

当前归档没有一份只讲 Siemens 调度主站或网络控制中心的独立手册。相关内容主要分散在：

- `Siemens_Substation_Automation_Catalog_Ed8.1.pdf`：控制中心—站控层—间隔层—过程层的完整通信图；
- `Siemens_SICAM_PAS_Overview_2023.pdf`：PAS 与上级控制中心的连接、协议和网络边界；
- `Siemens_SICAM_GridEdge_V25.30_2025.pdf`：站端到 IoT/云端的数据接口。

特别需要避免一个误分类：SICAM SCC 是站内操作员 HMI/过程可视化系统，不等同于调度主站。因此它仍放在站控层，控制中心层目录保留一份资料缺口说明。

## 五、02 站控层：PAS/SCC 与 SICAM 8 平台

| 文件 | 这份资料是干什么的 | 证据属性 |
|---|---|---|
| `Siemens_SICAM_PAS_Overview_2023.pdf` | Full Server、DIP、SCC、小/中/大型站和冗余架构 | Siemens 官方 |
| `Siemens_SICAM_PAS_Installation_2021.pdf` | PAS 安装、计算机角色和软件环境 | Siemens 官方 |
| `Siemens_SICAM_SCC_Brochure.pdf` | 站内 HMI 和过程可视化能力 | Siemens 官方 |
| `Siemens_SICAM_SCC_Manual_2019.pdf` | SCC 操作、冗余和软件结构 | Siemens 官方 |
| `Siemens_SICAM_S8000_Profile.pdf` | S8000 软件平台定位和部署方式 | Siemens 官方 |
| `Siemens_S8000_RTU_Automation_Telecontrol_2023.pdf` | S8000 Runtime、硬件环境、自动化和远动能力 | Siemens 官方 |
| `Siemens_SICAM_A8000_Profile_2025.pdf` | 嵌入式 RTU、通信和自动化能力 | Siemens 官方 |
| `Siemens_SICAM_GridEdge_V25.30_2025.pdf` | IoT 监测/控制、S8000/A8000 环境和网络要求 | Siemens 官方 |
| `Siemens_SICAM_PAS_System_Description_2005.pdf` | 早期 Full Server、DIP 和 Hot-Hot 冗余 | Siemens 原稿，第三方历史托管 |
| `Siemens_SICAM_PAS_Presentation_2007.pdf` | 早期 PAS 典型配置和产品角色 | Siemens 原稿，第三方历史托管 |

官方入口：[SICAM PAS Overview](https://cache.industry.siemens.com/dl/files/076/109758076/att_1143897/v1/pas_overview_b.pdf)、[SICAM SCC](https://www.siemens.com/en-us/products/sicam/hmi-human-machine-interface/)、[SICAM S8000](https://www.siemens.com/en-us/products/sicam/s8000/)、[SICAM A8000](https://www.siemens.com/en-us/products/sicam/a8000-cp-8050/)、[GridEdge V25.30 手册](https://cache.industry.siemens.com/dl/files/895/109954895/att_1351697/v1/SICAM_GridEdge_IoT_Monitoring_and_Control_V25.30_enUS1.pdf)。

公开资料对 S8000 使用的准确表述是 **Selected prequalified IPCs**，不能扩写成任意硬件均受支持。公开代表包括 SIMATIC IPC 227G/277G、RUGGEDCOM APE1808LNX、WELOTEC RSAEC/RSAPC，以及 VMware、Hyper-V、Debian、Red Hat Enterprise Linux、SIMATIC Industrial OS 等环境。完整 tested hardware / sizing 矩阵仍需按软件版本向 Siemens 获取。

## 六、03 间隔层：SIPROTEC 5 与 SIPROTEC V

| 文件 | 这份资料是干什么的 | 层级边界 |
|---|---|---|
| `Siemens_SIPROTEC_5_Catalog.pdf` | 物理保护/控制 IED、DIGSI 5、站总线和过程总线产品 | 主要是间隔层，同时覆盖整站接口 |
| `Siemens_SIPROTEC_V_Brochure.pdf` | SIPROTEC 5 功能的软件化、虚拟 IED、主/备服务器和工程工具 | 功能在间隔层，软件物理部署在站级服务器 |

官方入口：[SIPROTEC 5 Catalog](https://cache.industry.siemens.com/dl/files/143/109792143/att_1051200/v1/SIDG-C10059-00-7600_SIPROTEC_5_Catalog_EN.pdf)、[SIPROTEC V](https://www.siemens.com/en-us/products/siprotec/siprotec-v/)、[SIPROTEC V 发布信息](https://press.siemens.com/global/en/pressrelease/siemens-virtualized-protection-power-grids-cuts-costs-saves-space-digital-substations)。

把 SIPROTEC 5 换成 SIPROTEC V，不代表过程层设备可以整体删除。服务器化的是保护与控制应用；合并单元、开关量 I/O、跳闸链路、时间同步、网络和一次设备仍然属于物理系统设计。

## 七、04 过程层：合并单元与一次设备

| 文件 | 这份资料是干什么的 | 层级边界 |
|---|---|---|
| `Siemens_SIPROTEC_6MU85_V9.30_Manual.pdf` | CT/VT 与开关量接入、Sampled Values、GOOSE 和过程接口 | 过程层合并单元 |
| `Siemens_Energy_Blue_Portfolio_Customer_Material.pdf` | Blue GIS、数字化一次设备和环保绝缘技术 | 一次设备/过程层，Siemens Energy |
| `Siemens_Energy_Blue_420kV_GIS_Web_Snapshot.html` | 420 kV Blue GIS 官方网页快照 | 一次设备/过程层，Siemens Energy |

过程层是虚拟化讨论中最容易被“画没”的一层。即使间隔保护功能进入服务器，模拟量和开关量仍要在靠近一次设备的位置被采集、数字化并可靠输出跳闸命令。

## 八、证据等级与使用方法

资料库按以下顺序判断证据强度：

1. Siemens / Siemens Energy 当前官方产品页与官方支持站 PDF；
2. Siemens 地区公司演示稿或由 CIGRE 托管的厂商材料；
3. CIGRE 现场拍摄的一手照片；
4. 可辨认为 Siemens 原稿、但由第三方网站托管的历史 PDF；
5. 本项目制作的 PPT、翻译图、文章和分析报告。

建议先用本页判断层级和用途，再去 Drive 打开对应原件；引用图片时回到完整 PDF 页或现场照片上下文；形成方案、采购或验收要求时，最后核对目标版本和 Siemens 项目支持文件。

Drive 根目录中的 `README_归档索引.md` 是逐文件用途矩阵，`SHA256SUMS.txt` 用于检查传输后的文件完整性。`SICAM 8 Application Group Visualization & Operation` 手册的官方附件可在线读取，但下载端点拒绝自动归档，因此资料库只记录[官方手册入口](https://support.industry.siemens.com/cs/attachments/109963293/SICAM_8_Visualization__Operation_enEN.pdf)，没有保存本地副本。

## 九、相关文章

- 《[西门子变电站自动化架构图谱：从 SICAM PAS 到 SIPROTEC V](/insights/siemens-substation-architecture-evolution)》：按原图解释分散式、整站协同、集中式控制和虚拟化演进。
- 《[软件定义保护与控制：变电站 PAC 如何摆脱专用硬件](/insights/software-defined-pac-architecture)》：讨论 vPAC、vIED、服务器冗余、过程接口和工程验收。
- 《[CIGRE 2026 厂商观察](/insights/cigre-2026-vendor-observer)》：从展会现场比较不同厂商的数字化与软件定义方向。

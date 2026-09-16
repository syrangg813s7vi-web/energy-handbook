---
title: 西门子新能源电站整体解决方案产品矩阵
description: 从风、光、储、氢设备到场站控制、升压并网和运维，梳理 Siemens Gamesa、Siemens Energy 与 Siemens AG 的硬件和软件组合。
---

# 西门子新能源电站整体解决方案产品矩阵

**核对日期：2026 年 9 月 16 日。** 这张矩阵回答的是：建设一座风电、光伏或风光储电站时，西门子体系的产品分别处在哪一层、怎样配合、哪些设备仍要由其他厂家提供。这里的“西门子体系”包括 **Siemens Gamesa、Siemens Energy 和 Siemens AG**；三者的产品目录与供货主体不能混为一家公司。

::: tip 先看整体定位
西门子体系在新能源场站的完整链条是：**风机主机 → 场站控制与监控 → 升压站、保护和并网 → 运维服务**，并能集成光伏、储能与制氢。它没有在当前官方目录中形成“自有光伏组件 + 自有常规光伏逆变器 + 自有电芯”的全套主设备组合。下文中的系统方案也不表示每个项目都由同一主体交付全部设备。
:::

## 一、先分清两条路径

**电能路径：** 风机／光伏逆变器／储能变流器 → 集电系统 → 升压变压器与开关设备 → 并网点 → 交流电网；远距离或海上送出项目可能增加高压直流系统。

**控制路径：** 设备本体控制器 → PPC 或混合控制 → SCADA／EMS 与调度接口。SIPROTEC 保护独立检测电气故障并跳闸，不能由 PPC、SCADA 或 EMS 代替。

这两条路径在并网点汇合，却有不同的响应速度和验收方法。下面的矩阵按**资源设备、场站软件、站控保护、一次并网、运维工程**五层列出产品。

## 二、整体产品矩阵

### 1. 资源设备层：风、光、储、氢

| 场景 | 硬件或交付对象 | 配套软件／控制 | 西门子体系的责任边界 |
|---|---|---|---|
| 陆上风电 | [SG 陆上风机](https://www.siemensgamesa.com/global/en/home/products-and-services/onshore.html) | 风机本体控制、SCADA 数据和诊断服务 | Siemens Gamesa 是风机 OEM；机型和地区可售状态需按项目确认。 |
| 海上风电 | [SG DD 海上直驱风机](https://www.siemensgamesa.com/global/en/home/products-and-services/offshore.html) | 风机监测、诊断与风场数据接入 | Siemens Gamesa 是风机 OEM；海上升压、送出和全场控制可另行组合。 |
| 光伏电站 | 组件、汇流设备与逆变器由项目选定的 OEM 提供 | [SICAM Photovoltaic Plant Control（PPC／PPC Compact）](https://www.siemens.com/en-us/products/microgrids/photovoltaic-plant-control/) | Siemens AG 提供并网点有功、无功及相关场站控制；PPC 不等于组件或逆变器。 |
| 风光储配套储能 | [Qstor 电池储能系统方案](https://www.siemens-energy.com/global/en/home/products-services/solutions-usecase/storage-solutions.html) | 储能控制与混合场站协调接口 | Siemens Energy 提供系统集成方案；电芯、PCS、BMS 等实际 OEM 与质保边界需在项目 BOM 中确认。 |
| 绿电制氢，按场景选配 | [Elyzer P-300 PEM 电解槽](https://www.siemens-energy.com/global/en/home/products-services/product-offerings/hydrogen-solutions.html) | 电解系统控制并接入上层能源管理 | Siemens Energy 提供电解槽及制氢项目方案；它是绿电消纳设备，不是发电设备。 |

风机是该矩阵中最明确的西门子自有新能源发电主机。光伏侧的西门子产品重点在 **PPC、站控、保护与并网**；储能侧重点是 **Qstor 系统集成与控制**，不能凭方案名称推断电芯自产。

### 2. 场站控制与软件层：各系统如何协同

| 软件／系统 | 常见硬件载体或接口 | 主要职责 | 适用组合 |
|---|---|---|---|
| [SICAM PPC／PPC Compact](https://www.siemens.com/en-us/products/microgrids/photovoltaic-plant-control/) | [SICAM A8000](https://www.siemens.com/en-us/products/sicam/)；连接并网点计量、逆变器及储能控制器 | 跟踪并网点有功、无功等目标，并向设备分配设定值 | 光伏电站；也可参与光储控制。PPC 和 A8000 分别是应用与平台，不应算作两套独立场站控制系统。 |
| [SICAM Microgrid Control（MGC）](https://www.siemens.com/en-gb/products/microgrids/sicam-microgrid-control/) | SICAM 平台，连接分布式电源、储能、负荷及开关状态 | 微网能量协调、孤岛运行与负荷管理 | 园区微网、分布式光储等；不等于大型风光储电站必须配置的系统。 |
| [Omnivise Hybrid Control（OHC）](https://www.siemens-energy.com/global/en/home/products-services/service/omnivise-hybrid-control.html) | 基于 Omnivise T3000，连接风、光、储、制氢等子系统 | 跨资源协调、功率交换、频压控制与运行模式切换 | 多种电源和储能组成的复杂混合电站。 |
| [Omnivise T3000／T3000 SCADA](https://www.siemens-energy.com/global/en/home/products-services/product/omnivise-t3000.html) | 服务器、控制网络及现场接口，按工程配置 | 全站监视、操作、告警、历史与自动化平台 | 大型或复杂场站，尤其与 OHC 组合；不意味着风机、PPC 和保护功能都运行在 T3000 中。 |
| [EMS 调度优化](https://www.siemens-energy.com/global/en/home/products-services/service/omnivise-hybrid-control.html) | 接收预测、储能状态、电价／计划和设备约束 | 生成较慢时间尺度的运行计划与功率设定值 | 风光储氢混合项目按需配置；EMS 不承担保护或逆变器电流环。 |
| [风机诊断与 SCADA 服务](https://www.siemensgamesa.com/global/en/home/products-and-services/service-wind/asset-optimization.html) | 风机传感器、风场 SCADA 和远程诊断链路 | 设备状态监测、故障诊断及性能改进 | Siemens Gamesa 风机运维；与全场 SCADA 的数据接口和责任需要项目定义。 |

**层级关系：** EMS 给出计划，OHC／MGC 协调多种资源，PPC 闭环跟踪光伏并网点目标，设备控制器执行本体控制；SCADA 让运行人员监视和操作这些系统。实际工程可以只选择其中必要的层级，不是把表中软件全部安装一次。

### 3. 站控、保护与并网层：把电站安全接入电网

| 硬件或软件组合 | 主要职责 | 典型项目位置／主体 |
|---|---|---|
| [SICAM 8、S8000、A8000、HMI／SCC](https://www.siemens.com/en-us/products/sicam/) | RTU、站控、规约转换、现场 I/O 与站级监控；S8000 是软件平台，A8000 是嵌入式硬件系列。 | 升压站及集控接口；Siemens AG。 |
| [SIPROTEC 5／SIPROTEC V](https://www.siemens.com/en-us/products/siprotec/) | 线路、主变、母线和间隔保护控制；V 为虚拟化保护控制路径。 | 升压站保护与间隔；Siemens AG。 |
| [变压器、GIS／AIS、断路器和升压站方案](https://www.siemens-energy.com/global/en/home/products-services/product-offerings/substations.html) | 集电、升压、开断、隔离和送出。 | 电站一次电气与升压站；Siemens Energy，具体设备与合同主体按地区确认。 |
| [SVC PLUS、SVC PLUS FS、同步调相机](https://www.siemens-energy.com/global/en/home/products-services/product-offerings/flexible-ac-transmission-systems.html) | 动态无功、电压支撑，以及按方案提供频率和惯量支撑。 | 弱网接入或电网稳定要求较高时选配；Siemens Energy。 |
| [HVDC PLUS](https://www.siemens-energy.com/global/en/home/products-services/product-offerings/high-voltage-direct-current-transmission-solutions.html) | 大容量、远距离或部分海上风电场景的直流送出。 | 送出系统按电网方案选配；Siemens Energy。 |

站控负责采集、通信和操作，保护负责故障判断与跳闸，一次设备承载电流和电压。即使选用 OHC 或 T3000，也仍需分别设计这些功能。

### 4. 运维与工程验证层

| 产品或服务 | 用途 | 适用边界 |
|---|---|---|
| [Siemens Gamesa 风机优化与诊断服务](https://www.siemensgamesa.com/global/en/home/products-and-services/service-wind/asset-optimization.html) | 风机状态分析、SCADA 升级和性能优化 | 服务范围取决于机型、合同与数据权限。 |
| [Omnivise 数字化性能管理](https://www.siemens-energy.com/global/en/home/products-services/product-offerings/omnivise-digital-solutions/performance-solutions.html) | 运行数据分析、能源管理和性能优化 | 需核对具体模块是否支持目标风、光、储设备，不把通用电厂分析功能默认视为新能源标配。 |
| [SIMIT 仿真平台](https://www.siemens.com/en-us/products/simit/) | 自动化逻辑测试、虚拟调试与人员培训 | 工程验证工具，不能替代生产控制系统。 |

## 三、按项目类型组合

| 电站类型 | 基础设备与控制路径 | 按条件增加 |
|---|---|---|
| 陆上／海上风电 | SG 风机及本体控制 → 风场监控 → 升压站 SICAM／SIPROTEC → 变压器和开关设备 → 电网 | 大型海上项目的 HVDC PLUS；弱网的 SVC PLUS／同步调相机；跨资源协调的 OHC。 |
| 集中式光伏 | 第三方组件与逆变器 → SICAM PPC → SICAM 站控与 SIPROTEC 保护 → 升压并网 | Qstor 储能；弱网补偿；全站 T3000 监控或上层 EMS。 |
| 风光储混合电站 | SG 风机 + 第三方光伏 + Qstor → 各设备控制器／PPC → OHC + T3000 SCADA／EMS → 升压并网 | 微网场景的 SICAM MGC；绿电制氢的 Elyzer；远距离 HVDC 送出。 |

**这些是参考组合，不是三个固定报价包。** PPC、MGC 与 OHC 的控制范围会因单并网点还是多资源协调、是否孤岛运行、调度接口和性能保证而变化；一个项目未必同时采购三者。

## 四、做方案对标时应核对的五个接口

1. **风机、逆变器、储能与电解槽接口：** 各 OEM 的可控量、状态、告警、协议版本及响应能力。
2. **PPC／OHC／MGC 职责：** 哪一层拥有并网点闭环、储能 SOC 约束、孤岛切换和控制权切换。
3. **SCADA／EMS／保护边界：** 监控、优化和跳闸分开验收；上层系统失联时本地控制如何降级。
4. **升压与并网性能：** 变压器、开关设备、无功补偿及送出方式是否满足目标电网要求。
5. **供货与服务责任：** 逐项确认 Siemens Gamesa、Siemens Energy、Siemens AG 和第三方 OEM 的合同、质保、补丁与数据边界。

站内延伸阅读：[西门子电力自动化资料库](/insights/siemens-power-automation-source-library)与[西门子变电站架构图谱](/insights/siemens-substation-architecture-evolution)。

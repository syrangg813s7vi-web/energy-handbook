# 发现与决策依据

## 2026-09-06：RTU图表一次完整显示

- 用户要求图表不在iframe内部滑动，并能“一把直接看到”；本轮应测量正文实际宽度下每张独立图的完整文档高度，再将iframe设置为足够高度。
- 继续采用桌面优先，不改图形的节点尺寸、信息密度或内部排版。
- 在文章实际内容宽度688px下，原高度分别造成总架构图1210px、遥控闭环图737px、I/O分类图1181px的完整文档高度；复测1230px、760px、1200px时三图均无内部纵向或横向溢出。
- 嵌入本地生产预览后，三张iframe的实际内部视口为686×1228、686×758、686×1198，三者`scrollWidth/scrollHeight`都与内部视口完全相等；文章页面本身也无横向溢出。
- 完整截图复核发现上述文档级指标不足：遥控闭环图的内部画布仍有横向滚动条、右侧内容被截断；另外两张图在未主动滚入视口时受懒加载影响，元素截图为空。最终验收必须检查图内所有可滚动容器，并让三图真正完整可见。
- 图内真正产生横向滑动的是`.diagram-container`：688px外层下客户区654px、内容宽744px，三张图都需要至少约780px的iframe宽度。最终方案在桌面端仅为RTU文章隐藏右侧目录，并把正文扩为960px，使图本身完整缩放；侧栏和其他文章不受影响。
- 宽幅规则生效后iframe内部宽958px；逐一扫描三个frame的全部元素，未发现任何横向或纵向可滚动容器，主页面宽度也保持在视口内。下一步只需收紧多余高度并做最终截图。
- 在958px宽度下复测最小实用高度：总架构图850px和I/O分类图850px均无滚动；遥控闭环图620px时正文高634px，因此保留30px余量设为650px。无需使用先前为窄列准备的超高iframe。
- 最终嵌入尺寸为958×852、958×648、958×848；再次遍历三张图内全部元素，可滚动容器均为0，文章页面宽度也与视口一致。
- 三张最终完整截图经实际查看：总架构、遥控闭环和I/O分类的全部节点、连线、图例及说明卡均在单个画面内，没有内部滚动条或被截断的右侧节点；顶部粘性导航只会在截图自动对齐时覆盖边缘，不属于图内裁切。

## 2026-09-06：RTU文章图形化改版

- 用户要求总架构图置于文章最前，并进一步要求多用图、少用文字；信息架构调整为先建立全局心智模型，再用两张专题图解释动作闭环与I/O分类。
- 现有总架构图已通过showcase与多视口检查，可以直接前移；新增图需要保留自包含HTML和JSON源，避免只保留不可恢复的生成物。
- 新增遥控闭环图采用sequence：站控/调度→RTU→I/O或测控→断路器，再由现场状态与SOE反向返回；新增I/O分类图采用architecture：DI/AI/PI三类输入汇入I/O模块，DO/AO两类输出从I/O模块发出。
- 两张候选图经针对性几何修正后均达到showcase 9/9、0错误、0警告；最终闭环图最小消息线段288.7px，I/O图最小标签净距11.4px。
- 遥控闭环图首次浏览器视觉检查中，主时序本身清晰，但三张解释卡造成页面高度超出常见桌面视口；解释内容与时序箭头重复，按“少文字”目标移除卡片和参与者副标题，并将画布改为更扁的1200×620。
- I/O信号分类图已在1440×900至2048×1320、浅色与深色模式下通过自动浏览器检查。
- 文章正文已由“长段落 + 单图”改成“三张交互图 + 四张短表 + 极短结论”；总架构图紧跟一级标题，是正文中的第一个内容块。
- 用户明确要求不要总是适配手机UI；本轮以桌面图形阅读为设计基准，手机端仅保留页面级无横向溢出和图表全屏能力，不压缩桌面信息密度。
- 正式站点复验确认总架构图仍是标题后的首个内容块，三张iframe地址均存在、桌面页面无横向溢出，且四个正式URL均返回HTTP 200。

## 2026-09-06：RTU基础文章

- 正式站点为`energybook.foxtiny.com`，响应头表明由GitHub Pages托管；对应权威仓库是`owner/repository`占位描述下的现有私有工作流，实际远端信息不写入文章。
- 站点是VitePress 1.6.4，工业控制知识文章位于`docs/knowledge/`，导航由`docs/.vitepress/config.mts`管理，演示以`docs/public/demos/<topic>/`内的独立HTML通过iframe嵌入。
- 文章主线采用“RTU是现场与站控/调度之间的远动终端”，用数据上行和命令下行的闭环解释功能；不把RTU简化成数采盒。
- I/O按信号点说明：DI、AI、PI为输入，DO、AO为输出；数采是能力或独立设备，可能位于RTU南向，也可能由RTU内部I/O和通信模块承担。
- 本轮已有RTU架构HTML，确定性检查9/9通过，自动浏览器检查覆盖1440×900至2048×1320并通过，可作为文章的站内演示输入。
- NIST SP 800-82 Rev.3把RTU描述为服务于SCADA远程站点的专用数据采集与控制单元，支持文章对“采集＋控制＋远程通信”的基础定义。
- IEC官方说明IEC 60870-5-104面向地理分散过程的监视与控制设备互操作，可作为RTU北向远动通信场景的标准依据；IEC TS 60870-5-7:2025进一步说明101/104安全扩展需结合IEC 62351。
- Modbus Organization的V1.1b3规范把Modbus定义为设备间的应用层客户端/服务器消息协议，并列出TCP/IP、EIA/TIA-232与EIA/TIA-485等承载，可作为RTU南向设备通信示例依据。
- 本地生产预览已确认文章路由、顶部RTU入口和工业控制侧栏入口正确生成；1440×900桌面与390×844移动视口正文排版可读，未见横向溢出。
- 站内iframe成功加载完整RTU架构图；嵌套浏览器快照识别9个组件、8条关系和3个引导章节，点击“RTU核心”章节后交互事件成功执行。
- 本地文章、演示和sitemap均返回HTTP 200；NIST与两条IEC官方来源返回200，Modbus官方索引对命令行检查返回403但网页读取器能够访问并确认内容。

## 2026-09-06：HubPort三产品研究与发布

- HubPort官网把系统集成、工业软网关和设备集成列为三条独立方案线；三者共用能力规范、协议驱动、接入实例和Runtime的架构，但对象、部署位置和采购问题不同，因此各写一篇。
- 官方材料足以证明南向协议适配依赖“协议驱动”，以及运行阶段由“驱动×连接参数”的接入实例完成通信；“AI生成”改变驱动的生产方式，没有消除驱动资产与真机验证。
- 官方材料说明点位和物模型可动态配置，但没有公开驱动封装形态或不停机热加载机制；文章不得把动态配置推演为驱动热插拔。
- 工业软网关公开主张包括实时变量读写和命令下发，说明其不止能采集；在缺少实时性、功能安全、EMC、容量和第三方测试证据时，只建议用于非关键数采及受控业务指令POC。
- 官方称软件可部署于工控机、边缘服务器或软硬一体机，意味着已有数采硬件具备兼容OS、算力和接口时可能复用；不能据此保证任意封闭式DTU都可原位安装。
- 官网未公开驱动SDK手册、能力模型Schema、完整兼容矩阵及视频金属盒的硬件制造商；下载体验入口转到联系渠道，相关开发资料需向厂商索取。
- 采用官方PDF直链附完整原始资料，并把关键证据页渲染为六张图片随文章版本化；不将带联系信息的整份PDF复制进仓库。
- PR #66通过构建门禁并以squash方式合入`main`，合并提交为`1a2a258`；GitHub Pages运行`34009745778`的build和deploy均成功。
- 三篇正式文章、六张引用原页、首页入口和sitemap均返回HTTP 200；生产HTML包含对应官方PDF直链和原页图片路径。
- Pages工作流提示部分官方Action声明Node.js 20并由运行器强制切换到Node.js 24；不影响本次发布，继续作为全站CI维护项。

## 场站 V/F/P/Q 原版动画发布

- 源码快照固定到原版提交 f11fccfd3d2a5c1ed639b1d56c34a8174cb71039，6 个动画实现文件逐字节一致。
- 自包含静态 HTML 内联 React bundle 与原版 Tailwind/CSS，不引用外站脚本或样式，不要求 Sites 登录。
- 23 项仓库检查和 VitePress 构建通过；原版哈希和重建入口随源码版本化。未执行浏览器视觉验收及全新机器安装演练。

## 2026-08-05：构网型微电网厂商满足度补充

- 厂商比较必须先固定系统要求：构网电源、离并网/黑启动状态机、多电源协调、能量持续性、保护协同、异构设备接入、测试与版本证据。
- 评价对象是“官方公开材料能够证明到什么程度”，不是统一工况下的现场性能；未见公开证据必须记为“尚未证实”，不能写成“不具备”。
- 当前六家形成三种互补边界：华为、阳光电源偏构网储能及端到端设备栈；施耐德、西门子、SEL偏控制、自动化和保护；日立能源覆盖PCS、PPC、e-mesh、变电站和系统集成。
- 同一厂商在不同采购模式下满足度不同：整套同品牌交付、开放多厂商控制平台、关键负荷保护、独立构网储能不能用一个总分替代。
- 当前公开证据仍不能充分证明跨厂商多构网PCS长期并联、控制限流与保护/接地全状态协调、软件升级后的自动回归与HIL一致性。
- 新增10条官方链接中8条可由直接HTTP请求返回200；施耐德产品页和官方PDF对命令行返回403，但网页读取器在同日成功读取产品说明与18页PDF，属于访问策略差异。
- PR #46通过构建门禁并以squash方式合入`main`，合并提交为`72bfae2`；GitHub Pages运行`30987004476`的build和deploy均成功。
- 正式文章与sitemap均返回HTTP 200；生产HTML已包含厂商满足度标题、PowerTitan 3.0依据和“按采购场景选择”结论。
- Pages工作流仍提示部分官方Action声明Node.js 20并由运行器强制切换到Node.js 24；不影响本次发布，继续作为全站CI维护项。

## 2026-08-05：构网型微电网控制器洞察

- 当前证据基线为 250 条有效身份：南网采购/技术规范 77 条、DOE OSTI 测试与项目资料 71 条、政策和厂商产品/案例资料 102 条。
- 证据对象必须分开：采购需求说明买方要求什么，厂商页面说明供应商声称和展示什么，独立测试说明在特定边界内验证了什么；三者不能互相替代。
- 三类证据共同支持“行业进入工程验证阶段”的判断：厂商形成软硬件一体化产品栈，买方采购转向无缝切换、在线评估、涉网性能和安全评价，独立试验转向多构网单元、混合电源和复杂状态切换。
- 对控制器软件最重要的产品推论不是继续堆叠单点算法，而是形成可配置的异构设备协同、显式运行状态、验证与回放、版本可追溯和工程交付能力。
- 友商只能按公开产品边界分类，不能据此排名：施耐德/西门子/SEL偏控制与自动化；华为/阳光电源偏储能平台；日立能源偏电网接口与系统集成。
- 现有信息足以支持行业方向和产品路线判断，不足以支持统一工况下的性能排名或市场份额判断；缺口主要是验收报告、故障/事件记录、发布说明、兼容矩阵和长期运行指标。
- 报告采用原生 Markdown、表格和提示块，不新增脚本或依赖；页面优化重点是先给结论、再展开证据、最后给行动清单，保证移动端连续阅读。
- 发布前链接复核发现华为案例与日立PPC旧官网路径返回404；ForesightScope对应收录页返回200且保留正文，因此报告改引稳定快照并显式说明原厂链接失效。
- PR #44通过构建门禁并以squash方式合入`main`，合并提交为`86c0504`；GitHub Pages运行`30974281653`的build和deploy均成功。
- 正式文章、首页和sitemap均返回HTTP 200并包含新路由；生产端390×844真实浏览器复验标题、结论和导航完整，控制台无警告或错误。
- Pages工作流继续提示部分官方Action声明Node.js 20并由运行器强制切换到Node.js 24；本次构建与部署不受影响，后续应在全站CI维护中升级Action版本。
## 2026-09-04：继电保护架构演进文章与五代动画

- EnergyBook生产地址为`https://energybook.foxtiny.com`，HTTP响应显示由GitHub Pages提供；本地保存有对应的权威Git项目。
- 站点已有VitePress文章、独立HTML动画和GitHub Pages发布流程；新内容应复用现有模式，不通过网页富文本编辑器直接写入。
- 新文章采用五阶段叙事，但必须明确前三至四代属于常见技术划分，“第五代”是对集中化、虚拟化、站域协同、自适应和智能运维方向的概括，不是IEC/IEEE统一代际名称。
- 动画应分别展示每一代完整的测量—判断—跳闸链；第四代突出MU、SV、保护IED、GOOSE和智能终端，第五阶段突出PIU、边缘保护、虚拟IED集群和确定性执行。
- 浏览器直接打开生产站点连续两次等待超时；站点通过`curl`正常返回HTTP 200。本轮改用本地Git仓库实施和验证，避免重复相同失败操作。
- 现有站点规范要求Codex生成的原版HTML进入`docs/public/demos/`，文章通过受限iframe嵌入；核心结论必须在Markdown中保留，避免动画成为唯一信息源。
- 选定一个五标签的统一动画作为唯一权威源，内部为各阶段保存独立控制步骤；比在五个文件中复制同一运行框架更容易保持交互、无障碍和后续修订一致。
- 正式文章放入`docs/knowledge/relay-protection-evolution.md`，归入“工业控制”；首页、顶部导航和侧边栏各提供入口。
- 五代动画的末端状态均由真实控件事件验证：前三代各6步，第四、第五阶段各7步；第四代自动播放可推进、暂停后保持、复位后回到第1步。
- 375 px视口下站点文档和动画根容器的`scrollWidth`均等于`clientWidth`，没有横向溢出。
- 当前锁文件安装会报告2项既有依赖告警（1项中等、1项高）；本轮没有修改`package.json`或锁文件，依赖升级应作为独立维护任务处理。
- 当前提交在不复用工作区`node_modules`的干净副本中可以按锁文件安装并通过全部测试和生产构建，文章与动画恢复不依赖生成时的临时目录。
- PR #59通过门禁并以squash方式合入`main`，合并提交为`efb00f6`；GitHub Pages运行`33881984910`构建和部署成功。
- 正式文章、独立动画、首页和sitemap均返回HTTP 200；生产HTML已包含文章标题、动画入口、代际口径边界及首页导航路由。
## 2026-08-04：近十年华为系新能源创业观察

- 正式文章归入`docs/insights/`，路由为`/insights/huawei-new-energy-entrepreneurs-2016-2026`。
- 观察窗口固定为2016年8月4日至2026年8月4日；正文仅保留李一男、许映童、史耀宏、陈永强和陈国光5位代表人物。
- 根据用户要求，文章不列本次排除公司，也不展示证据可靠性分级；用独立来源索引保留事实可追溯性。
- 文章使用原生Markdown表格和正文，不新增组件、脚本或运行时依赖；发布层沿用现有GitHub Pages工作流。
- 首页、顶部导航和侧边栏均提供入口，既有洞察文章URL不变。
- PR #40通过构建门禁并完成squash合并；GitHub Pages运行`30909326576`的构建与部署均成功。
- 正式文章与首页均返回HTTP 200；生产HTML包含文章标题、“四个简单结论”和新路由。
- 工作流仍提示部分官方Action声明Node.js 20并由运行器强制切换至Node.js 24；本次构建和部署未受影响。

## 2026-07-24：储能与微网文章发布

- 文章应进入`docs/insights/`，并由`docs/.vitepress/config.mts`维护顶部导航和侧边栏入口。
- 生产站点为`https://energybook.foxtiny.com`，`main`分支更新后由GitHub Pages工作流发布。
- 当前分支比`main`多一个既有发布记录提交；本次发布需保留该提交，采用非破坏方式整合。
- 新文章路由确定为`/insights/europe-storage-microgrid-opportunities`；顶部“行业洞察”改为下拉菜单，以同时保留现有文章与新文章入口。
- GitHub Pages运行`30078648324`构建与部署成功。工作流提示部分官方Action仍声明Node.js 20并由运行器强制切换至Node.js 24；本次构建未受影响，后续可在工作流依赖升级时消除提示。

## 2026-07-24：欧洲能源产业洞察发布

- EnergyBook现有内容按`docs/knowledge/`组织，洞察类内容单独放入`docs/insights/`，避免与基础知识和工业控制教程混杂。
- 站点生产地址为`https://energybook.foxtiny.com`，`main`分支推送后由GitHub Pages工作流构建发布。
- 新文章不需要交互组件；正文、表格和原始来源在JavaScript失效时仍可完整阅读。
- 正式路由为`/insights/europe-energy-outlook-2026-2030`；首页、顶部导航、侧边栏和sitemap均已包含入口。
- 本次GitHub Pages部署耗时约4分钟，明显长于以往但最终成功；GitHub状态页在此期间显示Actions与Pages均正常。

## 2026-08-04：批阅功能健康检查

- 用户要求确认现有批阅功能是否正常；本轮以诊断和验证为范围，不主动提交真实批阅任务，避免产生 Cloud 任务、分支或 PR 等外部写入。
- 已有计划记录显示批阅链路包括：VitePress 前端、GitHub OAuth/短期会话网关、n8n 工作流、Codex Cloud 执行器、READY diff 发布器与 GitHub PR 门禁。
- `package.json` 的 `npm run check` 会依次执行全部批阅 Node 测试和 VitePress 生产构建；当前批阅测试覆盖策略、网关、执行器 API 与发布器。
- Pages 工作流已向生产构建注入批阅网关地址，前端仅在 `VITE_REVIEW_API_URL` 存在时显示批阅层。
- 批量交互实现位于 `ReviewLayer.vue`：使用 sessionStorage 保存短期会话和最多 20 条批阅草稿，通过 `/reviews` 一次提交整批内容。
- `npm run check` 实测通过：20/20 项批阅测试成功，VitePress 1.6.4 客户端、服务端渲染与 sitemap 生成均成功。
- 生产站点首页和批阅网关健康端点均返回 HTTP 200；网关健康负载为 `{"ok":true,"service":"energy-review-gateway"}`。
- 登录起点返回 HTTP 302 到 GitHub OAuth，包含独立 `state`、S256 PKCE `code_challenge`、回调地址和 `allow_signup=false`。
- 生产文章页在未登录状态下真实浏览器渲染正常，可访问树中存在“登录批阅”按钮，批阅入口未丢失。
- 在生产文章页真实点击“登录批阅”后，浏览器成功到达 GitHub 登录页，OAuth 参数保留 PKCE、state 和正确的回调路径。
- GitHub 实际 PR 历史显示，最后几个明确由“在线批阅”触发的 PR 停留在 2026-07-20 及之前；之后的内容 PR 都是其他发布分支，没有新的批阅分支记录。
- 服务器上网关、执行器和发布器三个 systemd 服务当前均为 `active`，但持久化任务目录只有 2026-07-15 和 2026-07-16 两条旧任务，一条 `pushed`、一条 `failed`；没有用户近期批阅对应的新任务文件。
- 上述证据将故障范围收窄到“前端提交→网关/n8n→执行器入队”之间，而不是 GitHub 合并或 Pages 发布阶段。
- n8n 数据库确认批阅工作流仍为 active，POST 提交和 GET 状态查询两个 webhook 均已注册。
- 实际批阅工作流在 2026-08-04 12:39 UTC 有一次 webhook 执行（执行 ID 8133），约 2.6 秒后以 n8n 状态 `success` 结束；这与用户当时网站批阅的时间线吻合。
- 该执行没有在受限执行器中生成新任务文件；因此 n8n 的 `success` 很可能表示“错误处理/响应分支成功执行”，而不是批阅任务创建成功。
- 执行 ID 8133 的脱敏错误输出已确认：“站点来源不在白名单内”，HTTP 400，错误类型 `validation_error`。
- 根因是两层白名单不一致：网关允许正式自定义域名，而 `review-policy.mjs` 的执行器负载校验仍只硬编码了 GitHub Pages 来源和本地预览来源，漏掉正式自定义域名。
- 因此所有从正式自定义域名发起的批阅都会在进入 Codex Cloud 前被拒绝；不会生成任务、分支、PR 或 Pages 发布。
- 现有 20 项自动化测试全部使用 GitHub Pages 来源或单层注入的测试来源，没有覆盖“正式自定义域名同时通过网关与执行器”的集成场景，所以本次白名单漂移未被测试发现。

## 2026-08-04：修复批阅来源白名单漂移

- 已建立 Linear TIN-408，状态为 In Progress，优先级为 High。
- 设计决定：不再将真实部署来源硬编码在策略中；网关、API 和 Runner 共用 `REVIEW_ALLOWED_ORIGINS` 契约，但仍在独立进程中分别校验。
- 未配置时只保留本地预览默认值，生产来源必须由仓库外环境文件显式注入。
- API 进程和 Cloud Runner 是两次独立的负载校验；修复已同时向两处注入解析后的来源集合，避免 API 通过后 Runner 再次拒绝。
- 单元测试已从真实环境值改为 `example.com` 类中性夹具，并显式注入允许来源；新增未知来源不调用 runner 的断言。
- 批阅测试由 20 项增加到 23 项，23/23 全部通过。
- 仓库完整 `npm run check` 通过：23 项批阅测试、VitePress 客户端和 SSR 构建、sitemap 生成均成功，`git diff --check` 无错误。
- 恢复演练在排除 `.git`、`node_modules`、构建产物和浏览器临时文件的隔离副本中执行 `npm ci` 和 `npm run check`，23 项测试与生产构建再次通过。
- `npm ci` 同时报告 1 项既有的中等级开发依赖告警；它不阻断本次批阅生产故障修复，本轮不扩大到依赖升级。
- PR #42 在 rebase 到最新 `main` 后通过 GitHub 构建门禁并 squash 合并，合并提交为 `c26d160`。
- 部署前已保存时间戳代码和环境文件备份；三个执行器文件通过 Node 语法检查后安装，执行器重启成功且健康接口返回 200。
- 生产无副作用 API 验证结果：配置中的正式来源已越过来源校验，随后因故意留空的修改要求被 400 拒绝；未知来源仍以 400 “站点来源不在白名单内”拒绝。
- Cloud Runner 使用同一正式来源执行无副作用验证，同样越过来源校验后在修改要求长度处终止；任务文件数前后均为 2，未创建 Cloud 任务。
- n8n 工作流内部 webhook 的无副作用请求返回预期 HTTP 400 脱敏验证错误，任务文件数仍为 2；这证明 n8n 已使用新执行器策略处理正式来源，且未产生 Cloud 副作用。
- 部署后三个执行器文件的 SHA-256 与仓库合并版完全一致；网关、执行器和发布器均为 `active`。
- 公开网关健康接口返回 HTTP 200，OAuth 起点返回 HTTP 302 到 GitHub；合并提交 `c26d160` 的 GitHub Pages 构建与部署运行成功。
- 本次不自动重放历史失败批阅；修复后需由维护者在网站批阅清单中重新提交。

## 2026-07-23：IEC 104设计初衷概要文章

- 目标读者需要先建立业务视角和协议视角，不从 TypeID、常量或位定义开始。
- 正文只保留三个业务问题：及时看见现场、断线后恢复可信状态、让远方控制结果可追踪。
- Modbus 对比限定为典型使用方式：Modbus 更接近主站轮询寄存器/线圈，IEC 104面向广域远动、主动事件、状态恢复和控制事务；避免写成“Modbus 永远不能主动”之类的绝对结论。
- 动画只承担一个教学任务：用同一个断路器变位场景对比轮询发现与主动上送，并补一段断线后总召恢复；不加入协议字段教学和装饰性动效。
- 发布遵循现有原版图形策略：独立 HTML 进入 `docs/public/demos/iec104/`，文章只通过 iframe 引用，并保留文字结论。

## 2026-07-23：能源控制器知识全景发布

- 当前研究仓库已经形成结构化理解的强项包括：多厂家 Modbus 点表与版本风险、IEC 61850 信息模型、OpenEMS 实时运行时、IEC 61131-3/FBD/SFC、状态机与安全联锁、柴发控制器、车桩协议、SPPC/MGCC/PMS/EMS 分层和边云协同。
- 评估采用证据等级而不是自评分数：“已了解”要求能够结构化解释、写成文章或解读实现；“正在建立”表示已有概念或资料但缺工程闭环；“需要补齐”表示尚缺系统产物或实作证据。
- 全景共 7 层、29 个模块，其中 8 个已了解、11 个正在建立、10 个需要补齐。模块颗粒度不同，计数只用于观察知识结构。
- 当前最大的能力断层不是资料数量，而是尚缺一个自己实现、可测试、可故障注入、可恢复的 Edge EMS Controller 垂直切片。
- 根据站点全局规则，Codex 当前生成的全景图应作为图形权威源直接版本化嵌入，不在 Vue 中重新绘制近似版。
- Linear 新事项因工作区免费版 issue 上限无法创建；仓库计划文件暂时承担该功能的范围、验收、回滚和状态记录。
- 站点现有大型可视化采用 `docs/public/demos/<topic>/` 独立 HTML + Markdown iframe，统一 `.demo-frame` 负责边框和站内布局；本次全景适合沿用这一模式。
- 文章必须在 Markdown 中重复承载关键结论，因为 iframe 不应成为核心知识的唯一载体。
- 新页面应放入“工业控制”导航，与柴发逻辑、FBD/SFC 和 IEC 61850 相邻；全景页作为这些专题的上位入口。
- 原版可视化由 Codex 内联片段渲染为自包含 HTML。渲染结果包含一层 `srcdoc` iframe，因此站点适配器需要递归同步主题、测量内层正文高度并把高度传回文章 iframe；适配器不改变图形节点、文字、筛选或交互逻辑。
- 文章采用“评估口径 → 原版全景 → 八个已了解模块 → 正在建立 → 需要补齐 → 五步路线”的结构，动画失效时仍保留全部主要结论。
- 实际浏览器测量表明自适应高度稳定：桌面全量视图约 1271 px，筛选“已了解”后缩至约 1062 px；375 px 视口下文章和内层全景均无横向溢出。
- 站点深浅主题能够递归同步到原版图的外层和 `srcdoc` 内层；模块点击会更新证据与下一步，状态筛选会同步隐藏非目标模块。
- PR #31 已通过 GitHub 构建门禁并合并；Pages 运行 `29990932666` 的 build 与 deploy 均成功。正式文章、原版全景和 sitemap 均返回 HTTP 200，sitemap 已包含新路由。
- Linear 状态同步仍受免费版 issue 上限阻止；这是项目管理工具限制，不影响版本化范围、测试证据和生产发布结果。

## 2026-07-15：项目初始状态

- 工作区为空，当前是尚无提交的 `main` 分支。
- 工作区内没有 `AGENTS.md` 或既有项目约束。
- 用户明确要求：GitHub 托管、GitHub Pages 展示、Markdown 存储文本、HTML 动画演示。

## 初步架构判断

- 不建议把大段 `<style>` 和 `<script>` 直接复制到 Markdown；应该把动画实现放在统一的 JavaScript/CSS 组件中，Markdown 仅保留语义化标签及降级说明。
- 与 iframe 相比，简单动画优先用 Web Component：可共享站点样式、响应式更好、文章标记更简洁。需要强隔离或独立构建的大型模拟再使用 iframe。
- 候选技术底座为 MkDocs Material：以 Markdown 为中心，导航、搜索和主题成熟；使用 GitHub Actions 构建可避免受 GitHub Pages 原生 Jekyll 插件限制。

## 2026-07-15：官方文档核对

### GitHub Pages

- GitHub 官方的自定义 Actions 流程是：检出代码→构建静态文件→`actions/upload-pages-artifact`→`actions/deploy-pages`。
- 部署 job 至少需要 `pages: write` 和 `id-token: write`，并使用 `github-pages` environment。
- 自定义域名必须在仓库 Pages 设置或 API 中配置；只提交 `CNAME` 不会自动完成设置。

### MkDocs Material 与 Zensical

- Material for MkDocs 官方已说明项目进入维护模式，底层 MkDocs 1.x 的未来也存在不确定性。
- 同一团队开发的 Zensical 是 MkDocs + Material for MkDocs 的继任方案，支持 `mkdocs.yml`、MkDocs 目录结构、Python Markdown 方言、YAML front matter、自定义 CSS/JavaScript 和 HTML 模板。
- Zensical 官方兼容表已将本项目所需的核心能力标为可用，并明确宣称现有自定义 CSS/JavaScript 可保持兼容。
- Zensical 仍是 `0.0.x` 版本，存在变化风险；因此首版使用兼容的 `mkdocs.yml` 而不使用专有 `zensical.toml`，并锁定依赖版本。如需回退，内容和配置可直接转回 Material for MkDocs。
- PyPI 在 2026-07-15 返回的当前最新版本为 Zensical 0.0.50；项目已锁定该版本并成功完成本地构建。

## 技术选型结论

- 首选：Zensical + 兼容格式 `mkdocs.yml` + GitHub Pages artifact deployment。
- 动画：原生 Web Components + CSS，不引入前端框架；首个组件作为可访问性和复用模式的参考实现。
- 配置中加载 `.mjs` 模块和统一 CSS，文章中仅使用如 `<energy-flow-demo>` 的声明式标记。
- 回退方案：如 Zensical 在实际验证中不稳定，保留相同 `docs/` 和 `mkdocs.yml`，仅替换构建依赖和命令。

## 实施验证发现

- Zensical 0.0.50 生产构建通过，配置、Markdown 和内部链接未报错。
- 自定义标签需包在一个已知的块级 `<div>` 中，否则 Python Markdown 可能用 `<p>` 包裹未知标签，产生不理想的 HTML 嵌套。项目统一使用 `.animation-embed` 容器。
- 静态降级文字保留在自定义标签的 light DOM 中；组件定义后，Shadow DOM 替代其显示，避免调参后仍显示初始静态值。
- 构建结果在首页与嵌套页面中均使用正确的相对资源路径，适用于 GitHub 项目 Pages 的子路径部署。

## 2026-07-15：架构更新为 VitePress

- 用户在评估 EnergyResearch 中的 FBD/SFC 长文和独立 HTML 演示后，确认采用 VitePress。
- FBD/SFC 文章是标准 Markdown，仅嵌入 3 个 iframe；配套 HTML 基本自包含、已使用 sandbox 和降级链接，适合放入 VitePress `public/demos/plc/` 后原样嵌入。
- 最终动画分层：和文章深度联动的小型组件使用 Vue + TypeScript + SVG/CSS；大型、自包含、需要样式隔离的演示使用 Markdown + iframe HTML。
- 选择稳定版 VitePress 1.6.4，不采用 2.0 alpha。项目使用 Node.js 22 构建。
- VitePress 1.6.4 默认拉取 Vite 5.4.21，包含已公开的开发服务器漏洞。`package.json` 使用 npm override 锁定 Vite 6.4.3，它与 `@vitejs/plugin-vue` 5.x 的 peer dependency 范围兼容；生产构建通过，`npm audit` 为 0。
- VitePress 配置会根据 `GITHUB_REPOSITORY` 自动推导 Pages `base`：`<owner>.github.io` 仓库使用 `/`，普通项目仓库使用 `/<repository>/`。

## VitePress 资料链接

- VitePress 中的 Vue 与原始 HTML：<https://vitepress.dev/guide/using-vue>
- VitePress 静态资源和 `public`：<https://vitepress.dev/guide/asset-handling>
- VitePress GitHub Pages 部署：<https://vitepress.dev/guide/deploy>

## 2026-07-15：GitHub 仓库

- 公开仓库：<https://github.com/syrangg813s7vi-web/energy-handbook>
- 默认分支：`main`
- 本地 `origin`：`git@github.com:syrangg813s7vi-web/energy-handbook.git`

## 2026-07-15：自定义域名

- 正式站点域名确定为 `energybook.foxtiny.com`。
- GitHub Pages 已通过 API 登记该域名；子域名 DNS 应使用 CNAME 指向 `syrangg813s7vi-web.github.io`，不要包含仓库路径。
- `foxtiny.com` 使用 Cloudflare 权威 DNS。为便于 GitHub 完成域名校验和证书签发，初始记录采用 DNS only，证书就绪后再决定是否开启代理。
- 当前 Wrangler OAuth 会话只有 Zone 读取权限，没有 DNS 写入权限；需要在 Cloudflare 控制台登录后创建记录。
- 2026-07-16 从 2026-06-02 的本地历史会话中确认：用户曾为 `foxtiny.com` 创建最小权限的 DNS Edit API Token，并用它配置过 `mcp.foxtiny.com`。该 Token 仍有效，现已用于创建 DNS-only CNAME：`energybook.foxtiny.com` → `syrangg813s7vi-web.github.io`。
- GitHub Pages 在 DNS 生效后立即接受自定义域名并可启用强制 HTTPS。正式地址 `https://energybook.foxtiny.com/` 已通过直连 GitHub Pages 节点验证返回 HTTP 200；本机解析器短暂保留了此前的 NXDOMAIN 缓存，不影响公共 DNS。

## 资料链接

- GitHub Pages 发布源：<https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
- GitHub Pages 自定义工作流：<https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>
- Zensical 兼容性：<https://zensical.org/compatibility/>
- Zensical 功能对齐：<https://zensical.org/compatibility/features/>
- Zensical 自定义 CSS/JavaScript：<https://zensical.org/docs/customization/>
- Material for MkDocs 维护模式说明：<https://squidfunk.github.io/mkdocs-material/blog/2025/11/11/insiders-now-free-for-everyone/>

## 2026-07-15：在线批阅与自动改稿架构

- 公开站点继续允许匿名阅读；登录只解锁划线批阅和任务状态，不影响搜索与动画。
- 登录入口采用 Cloudflare Access。Access 身份经过 n8n 验证后只签发一次性授权码；浏览器再换取短期批阅令牌，不保存 GitHub、ChatGPT 或长期服务密钥。
- 自托管 n8n 位于 `n8n.foxtiny.com`，实际主机为 SSH `molt`。该主机已安装 Codex CLI，并以 ChatGPT 账号登录；CLI 支持实验性的 `codex cloud exec/status/diff/apply`，因此可复用 Codex 套餐额度而无需 OpenAI API Key。
- n8n 现有 `Codex OAuth Chat` 自定义节点直接调用模型响应接口，不等价于云端 Codex 任务。本项目使用 Codex CLI 云端任务命令，保证任务可追踪且在绑定的 Cloud Environment 中执行。
- 默认自动修改白名单：`docs/**/*.md`、`docs/.vitepress/theme/components/**/*.{vue,ts,css}`、`docs/public/demos/**/*.{html,js,css,svg,json,csv}`。
- 默认拒绝 `.github/**`、依赖清单、VitePress 配置、服务器文件、符号链接、子模块和白名单外路径。动画代码还禁止外部脚本、动态执行、凭据读取和未经批准的网络请求。
- 自动合入采用临时分支与 PR；只有范围检查、安全检查和 VitePress 构建全部通过才启用自动合并，禁止执行器直接推送 `main`。
- `molt` 上的 Nginx 公开监听 80/443，n8n 本体只绑定 `127.0.0.1:5678`。由于源站仍可通过公网 IP + Host 访问，服务端必须验证 `Cf-Access-Jwt-Assertion` 的签名、受众和过期时间，不能只信任 Cloudflare 身份请求头。
- `molt` 已有 AI Workbench Codex Runner，绑定 Docker bridge `172.18.0.1:8787`，但它以 root、`danger-full-access` 和任意提示执行本地 Codex，不适合作为公开批阅执行器。能源批阅使用独立低权限用户、独立工作目录和严格参数接口。
- 用户要求由 Cloud Codex 提交代码。最终职责调整为：`molt` 只运行 `codex cloud exec/status`；Cloud Codex 通过绑定到 `energy-handbook` 的原生 GitHub 集成提交 `codex/review-*` 分支和 PR；仓库 Action 在 GitHub 内部重复策略与构建检查并启用 squash 自动合并。`molt` 不保存 GitHub 写入凭据，也不下载或应用任务差异。
- `energy-handbook` 的 Codex Cloud Environment 已创建并通过 `molt` 上的 Codex CLI 环境选择器核验。环境 ID 不进入公开仓库，部署时通过 `CODEX_CLOUD_ENV_ID` 注入独立执行器。
- `molt` 已部署 `energy-review-executor.service`：服务仅监听 n8n 所在 Docker 网桥 `172.18.0.1:8791`，只接受固定容器来源和 `x-review-executor-token`，进程使用无登录 shell 的 `energy-review` 系统账号。Codex 登录状态复制到该账号的 0700 私有目录，n8n 无法直接读取 ChatGPT 凭据或执行任意命令。
- n8n 2.19.5 已导入未发布工作流 `energy-handbook-review-api`，包含提交与状态查询两条 Webhook 路径、每个 HTTP 节点的错误输出和脱敏响应。两个 HTTP Request 节点已绑定 `x-review-executor-token` Header Auth 凭据。
- 通过 n8n 测试 Webhook 完成了不创建任务的穿透验证：请求到达隔离执行器，执行器的参数校验 400 被 n8n 脱敏并保持为 400；Codex Cloud 任务列表仍为空。
- n8n 2.19.5 的 HTTP Request 错误对象使用 `$json.error.status` 表示状态码，工作流表达式需要同时兼容 `error.status`、`error.httpCode` 和顶层 `httpCode`。
- 工作流发布仍需等待 Cloudflare Access 和公开会话网关完成；之后再经用户确认执行一次会真实创建 Codex Cloud 任务的端到端测试。
- Cloudflare 官方允许按路径保护自托管应用，但该账户所有 Cloudflare One 初始化路径都直接返回 `{}`。用户同意将身份层替换为 GitHub OAuth，n8n、Codex Cloud 和 GitHub 自动合并架构保持不变。
- 登录网关已改为 GitHub OAuth Web Flow：使用随机 `state` 防 CSRF、PKCE S256 保护授权码，不请求 OAuth scope；每次登录通过 `GET /user` 重新核验身份，并读取 `GET /repos/syrangg813s7vi-web/energy-handbook` 返回的当前用户权限，只有 `permissions.push=true`（含 maintain/admin）时放行。
- 一次性授权码使用后立即删除，批阅令牌用服务端 HMAC 签发并限制为 15 分钟；GitHub OAuth 临时访问令牌不写入浏览器、n8n 或磁盘。
- Cloudflare 账户当前尚未完成 Zero Trust 初始化：入口显示 “Welcome to Cloudflare Zero Trust / Get started”，进入 Cloudflare One 后持续 Loading。现有 Wrangler OAuth 仅有 account read、zone read 和 Workers 等权限，没有 Access 管理权限，无法用该令牌替代控制台初始化。
- GitHub OAuth App `Energy Handbook Review` 已创建，回调地址为 `https://n8n.foxtiny.com/energy-review/auth/callback`。客户端密钥只部署在 `molt:/etc/energy-review-gateway.env`，权限为 `root:energy-review 0640`，不进入仓库或 n8n 工作流。
- `energy-review-gateway.service` 已部署并绑定 `127.0.0.1:8790`；Nginx 将 `/energy-review/` 反向代理到该端口，同时对公网隐藏 `/webhook/energy-handbook/`。因此浏览器只能经过 GitHub OAuth、短期会话、来源限制和提交限流后的网关访问批阅链路。
- n8n 工作流已从 Cloudflare 身份头切换为网关写入的 `actorEmail`，并已发布激活。无效负载从 n8n 到隔离执行器的完整链路稳定返回脱敏 HTTP 400，不会创建 Cloud Codex 任务。
- 服务器上的 systemd `nginx.service` 存在既有 PrivateTmp mount namespace 故障，`systemctl reload nginx` 会返回 `226/NAMESPACE`；主进程本身正常，配置经 `nginx -t` 验证后可用 `nginx -s reload` 安全重载。
- Cloudflare 普通域名控制台与 Zero Trust 控制台出现相同异常：`foxtiny.com` 页面报刷新错误，直接访问 DNS 记录路由只返回 `{}`；本机也没有可用的 DNS 写权限 CLI 会话。正式 CNAME 继续保留为待办，Pages 构建暂时使用 `/energy-handbook/` 基路径，使 GitHub Pages 备用地址能够加载完整客户端资源。
- 首次真实批阅任务 `task_e_6a579b97fe608324ae2e1d4d2024b3a0` 已到 READY，包含 2 个文件的有效差异，但 GitHub 没有新分支或 PR；这证明 Cloud Codex 的原生 GitHub 集成不会在当前环境中替执行器完成提交。
- 仓库已有 `.github/workflows/auto-review.yml`：收到 `codex/review-*` push 后会重复执行文件白名单、动画安全策略和 `npm run check`，随后创建 PR 并启用 squash 自动合并。缺口只在 READY diff → 分支 push。
- GitHub 仓库已开启 `allow_auto_merge` 和合并后删除分支。采用写 Deploy Key 可将 molt 的 GitHub 写权限严格限制在 `syrangg813s7vi-web/energy-handbook`，比复用个人 OAuth/PAT 权限更窄；PR 创建和合并继续由仓库内置 `GITHUB_TOKEN` 完成。
- 真实任务已完成闭环：READY diff 经发布器推送为 `codex/review-6a579b97fe60`，GitHub Action 通过策略、测试与构建后创建并合并 PR #3。修复同一 job 内 `--auto` 自等待后，烟雾测试 PR #5 在 21 秒内自动创建、squash 合并并删除临时分支。
- 发布器任务记录持久化在 `/var/lib/energy-review/jobs`，systemd 服务重启后会继续扫描；Cloud 失败和发布失败都有明确状态，发布最多自动尝试 3 次，避免无限失败循环。

## 2026-07-16：批阅批量提交

- 当前前端每次划线填写要求后立即 POST，因此每条批注都会产生独立 Cloud 任务、分支和 PR；用户要求改为先汇总、后一次提交。
- n8n 当前仅透传请求体并覆盖服务端验证的 `actorEmail`，无需修改节点或连接；批量能力可以在前端与隔离执行器的负载协议中完成，现有 n8n 错误输出和凭据保持不变。
- 批量清单以 `sessionStorage` 暂存，可跨站内页面保留但在浏览器会话结束后自然清除；上限 20 条，避免提示词和请求体无界增长。服务端继续接受旧单条格式，便于前后端滚动部署。
- 批量实现不改变认证与自动合并边界：一批请求只经过一次网关限流、一次 n8n 转发、一个 Cloud 任务、一个服务端派生分支和一个 PR；Cloud 提示会逐条列出目标文章、选区、上下文和修改要求，并要求合并冲突修改且不得遗漏。

## 2026-07-17：失效链接巡检

- 自定义域名 `energybook.foxtiny.com` 已生效，GitHub Pages 项目地址会 301 到该域名；生产构建使用根路径 `/` 是正确的。首次按跳转前 GitHub 地址解析资源得到的 404 属于爬虫假阳性。
- 从 sitemap 抓取的 9 个页面和 33 个站内页面/资源直接请求均为 200，但真实点击仍复现失败：VitePress 客户端会接管 Markdown 中指向 `public/demos/*.html` 或演示目录的站内链接，并按文档路由处理，最终显示 VitePress 404；原始静态 HTML 直接请求为 200。
- 已确认受影响模式至少包含：车桩协议 2 条“单独打开”、IEC 61850 2 条“单独打开”、FBD/SFC 的 PLC 执行演示入口。建设指南示例还指向实际不存在的 `/demos/plc/fbd-scan.html`（HTTP 404；仓库只有 `fbd-scan-excerpt.html`）。
- 浏览器运行时把同一车桩演示链接临时设为 `target="_blank" rel="noopener"` 后，点击成功打开原始 `.html`，页面标题为 `Vehicle Charger Protocol Animation`；这验证了可靠修复方案是让静态演示链接走浏览器原生新标签页，而不是 VitePress 客户端路由。
- 外部资料抽查大多返回 200；国家标准全文公开系统对自动巡检返回 403，更像反爬限制，不能据此判定用户浏览器中的链接失效。

## 2026-07-20：专注阅读模式

- VitePress 1.6.4 在桌面端通过 `.VPContent.has-sidebar` 的左内边距为章节导航留位，文章正文在 `.VPDoc.has-aside .content-container` 中限制为 688 px；只隐藏元素而不同时覆盖这两处布局约束，正文不会真正获得更多空间。
- 右侧本页目录从 1280 px 开始显示，左侧章节导航从 960 px 开始常驻。因此专注阅读以 960 px 为桌面断点，并同时隐藏两侧目录、清除正文左侧留位、把可读正文上限扩展为 960 px。
- 阅读偏好只需要一个浏览器本地布尔值。状态、按钮和布局 CSS 可以保持单向依赖，不需要接入批阅层或任何服务端状态。

## 2026-07-20：常见组态文章

- 四个教学动画的领域状态和视觉结构不同，但“当前步骤、自动播放、单步、复位、卸载时清理定时器”完全相同；将这部分提取为无领域知识的状态层，可以减少重复而不耦合具体组态。
- 并网点数据选择必须区分“同一物理并网点的主备测量选择”和“多个物理并网点的拓扑求和”，否则功能块名称容易造成错误理解。
- 光伏均衡中的“均衡”不是相同 MW，而是根据当前可发能力和调节裕度合理分担；单元限幅后必须计算剩余量并再次分配。
- 标幺值的固定额定基准适合主控制尺度，动态可发能力更适合作为均衡权重和限幅；二者都叫百分比，但不能混用。
- 过调检测需要同时考虑调节方向、死区、持续时间、指令变化闭锁和复归滞环；仅凭偏差变号不能确认有害过调。
- VitePress Vue 组件可以在 SSR 首屏输出完整初态，并在客户端激活交互；正文同时保存教学结论，使动画失效时文章仍可理解。

## 2026-07-21：运行模式与数据管理组态

- 离网控制与黑启动都可能由构网型电源建立 V/f，但起点不同：离网切换通常从带电母线开始，黑启动从全站无压开始，二者不能合并成同一状态机讲解。
- 并网控制的场站指标位于并网点；设备指令应按可发能力、SOC 和调节裕度分配，而不是要求所有设备使用相同 MW 或固定能力百分比。
- `gridswitch_ctrl` 需要把联锁、同期窗口、稳定确认、开关动作时间、辅助触点和保护跳闸优先级作为完整状态机，不能简化成合闸命令透传。
- `fault_record` 保存组态选定通道的触发前后高分辨率波形、数字状态与元数据，并不默认保存全场所有器件的全部电流电压。
- `sample_data_manager` 持续处理日常时间序列，负责点表、时间戳、质量、对齐、缓存、分层存储和查询；它与事件触发的故障录波在时间尺度与用途上互补。
- 桌面图形使用绝对定位时，文本换行会让实际卡片高度超过最小高度。遮挡验收必须读取渲染后的边界矩形，而不能只凭 CSS 的 `top` 与 `min-height` 推断。
- SVG 会按 `viewBox` 缩放，而固定像素的卡片位置不会随正文宽度同比缩放；即使某一个视口看似对齐，普通正文与专注阅读切换后仍会错位。图上节点应以百分比中心点定位，并让 SVG 使用与容器一致的非等比坐标映射；移动端切换到网格布局时必须显式清除位移变换。

## 2026-07-22：十一张常见组态动画统一

- 线上图与本地演示不一致的根因不是背景或暗色模式，而是站点使用了重新实现的 Vue 图形；节点结构、路径、步骤数据和时序都已偏离本地原版。
- 十一张本地 HTML 原样进入版本库，并通过同一个 iframe 适配层嵌入，能够以 Git 中的原版文件作为唯一权威来源，同时保留文章组件名称和 Markdown 引用不变。
- 适配层只负责站点边界能力：基路径、主题同步、沙箱和自适应高度；动画内部的按钮、脚本、路径与播放时序不再二次实现。
- iframe 自适应高度不能用随视口变化的 `documentElement.scrollHeight` 或 `body` 高度作为反馈输入，否则“iframe 变高 → 根/正文高度变高 → iframe 再变高”会形成循环。应测量 `body` 内实际可见子元素的最下边界，并补齐正文内边距；观察 `body` 仍可捕获内部重排。
- 十一份站点静态文件除统一增加字符集、viewport 和公共样式入口外，主体均与本地原版逐字节一致；公共视觉样式也复制为版本化资源，恢复不依赖开发机缓存。

## 2026-07-22：Codex 原版图形全局规则

- “常见组态”专题已经采用原版 HTML，但全局《内容与动画》仍建议按需求重新选择 Mermaid、Vue 或独立 HTML，无法约束其他文章保持 Codex 本地原版。
- 全局规则需要同时约束权威来源、允许的站点职责和禁止的二次重绘；仅写“使用 iframe”不能保证节点、路径、步骤与时序一致。
- 原版必须进入 Git 管理的素材目录。Codex 临时可视化目录适合生成和确认，但不能成为灾难恢复时的唯一副本。
# 2026-07-28 — LightGBM负荷预测动画文章

- EnergyBook采用VitePress，知识文章位于`docs/knowledge/`，独立动画位于`docs/public/demos/<topic>/`，通过iframe嵌入。
- 正式站点由GitHub Actions在`main`分支推送后构建并发布到GitHub Pages。
- 当前工作区存在欧洲储能文章与主题组件的未提交改动；本功能必须只触碰新增LightGBM文件、`config.mts`和`docs/index.md`。
- 贯穿全文的六条负荷数据为：时刻6/7/12/14/18/20，温度18/20/26/32/30/24°C，节假日否/否/否/否/是/是，负荷420/460/700/900/820/620 MW。
- 四份原版动画覆盖：算法演进、回归树完整建树、GBDT完整训练、LightGBM完整训练；无需再重绘。
- 当前会话没有可调用的Linear工具；仓库历史也记录了工作区免费版issue上限，因此以版本化计划文件作为本轮可审计追踪。

# 2026-08-04 — 中国2021—2025年分电源发电量趋势文章

- EnergyBook正式内容仓库为`energy-handbook-site`，远端项目为`energy-handbook`，正式站点由GitHub Pages发布到`energybook.foxtiny.com`。
- 原工作区位于旧功能分支且包含欧洲储能文章、主题组件和计划文件的未提交改动；本功能使用独立工作树`energybook-tin-405`，基于最新`origin/main`实施。
- Linear已建立TIN-405，范围、依赖、验收、回滚和完成定义已同步。
- 文章统一采用国家统计局年度《国民经济和社会发展统计公报》中的年度发电量表；2022—2025年公报直接列出总量、火电、水电、核电、风电和太阳能发电量。
- 2021年公报表直接列出总量、火电、水电、核电；风电和太阳能采用国家能源局后续消纳责任权重完成通报中的年度完成值6556亿千瓦时和3259亿千瓦时。不同官方表的汇总存在3.6亿千瓦时、即总量约0.004%的口径尾差，文章需要明确标注而不能伪造精确闭合。
- 2021—2025年总发电量由8.534万亿度增至10.575万亿度；火电由5.806增至6.327万亿度、份额由约68.0%降至59.8%；风光合计由约0.978增至2.301万亿度、份额由约11.5%升至21.8%。
- 2021—2025年全国新增年发电量约2.041万亿度，其中风光增量约1.320万亿度，贡献约64.7%；光伏是最大增量来源。
- 七个官方参考链接在2026年8月4日均返回HTTP 200；没有用搜索结果页或二手媒体替代原始来源。
- 生产构建和20项自动化测试通过。`npm ci`报告1项现存的中等级开发依赖风险，本功能没有修改依赖或锁文件，不在内容发布中扩大修复范围。
- 真实浏览器验证确认文章渲染10张表格、13个二级目录项和完整正文；1280 px桌面与390×844移动端无页面级横向溢出、无错误覆盖层或控制台警告，首页路由正常。
- PR #38合并后，GitHub Pages运行30908833205成功；正式文章和首页均为HTTP 200，正式HTML已包含文章标题、路由和国家统计局来源。
- GitHub Actions显示Node.js 20 actions弃用提示，当前运行被强制切换到Node.js 24且部署成功；这是既有工作流维护事项，不影响本文章交付。

---

# 2026-09-05 — CIGRE 2026 厂商现场观察

- EnergyBook 是 VitePress/GitHub Pages 项目；推送并合并到 `main` 后由现有 Pages 工作流发布。
- 原始工作目录含用户未提交改动，因此本功能在基于最新 `origin/main` 的独立工作树和分支中实施。
- 已整理网站提供 162 张 Web 优化照片，共约 58 MB，可作为版本化静态资产直接进入 EnergyBook，不依赖临时站点。
- 固定分类：数字化转型 92 张；IEC 61850 13 张；华为电力军团 9 张；其他 48 张。
- “中国厂商”主题按用户最新口径改为“华为电力军团”，不再使用南瑞代表中国厂商的旧结论；南瑞继保归入“其他”。
- 页面采用原生 Markdown 分析正文与独立 Vue 图库组件的分层方案，照片清单从静态目录机械生成，避免手工维护 162 条路径。
- PR #61 已合并为 `9a1ae7c`；GitHub Pages 运行 `33956408906` 的构建与部署均成功。
- 正式文章、首页入口、sitemap 和华为照片抽样均返回 HTTP 200；正式 HTML 包含四个主题、图库资源路径与华为电力军团结论。
- CI 仅报告既有 GitHub Actions Node.js 20 运行时弃用提示，Actions 已强制使用 Node.js 24 并成功发布；本次未修改工作流。
- 后续更新采用全质量 v4 PPTX（27 页、162 张照片、60,614,441 bytes），SHA-256 为 `4fcfdfa79d8c9dfbaf6bb45233cf23d55596614f9b7600b88b066508235e7064`；GitHub 单文件上限允许该体积，因此无需沿用独立 Sites 仓库的压缩附件。
- 网页可见照片编号来自图库组件的卡片说明和灯箱图注，删除这两个展示节点即可；照片数据中的内部编号继续保留，用于稳定键值与素材追溯，但不再显示给读者。
- 后续 PR #63 合并为 `cd39b4d`；Pages 运行 `33965397781` 的构建与部署成功。生产文章包含扩写结论和附件入口，不再显示照片编号；线上 PPTX 为 60,614,441 bytes，SHA-256 与全质量 v4 原稿一致。

# 2026-08-31 MHS 问题与解决方案文章

- 内容只覆盖设备接口碎片化、物理语义缺失、多设备编排和实时安全控制四类问题，以及 MHS 的对应设计。
- MHS 状态需准确标为 2026-08-27 research preview，不能写成已经公开的开源标准。
- 文章归入 `docs/insights/`，使用原生 Markdown，不引入新组件或运行时依赖。
- PR #48 已通过构建门禁并 squash 合并到 `main`；Pages 工作流 `33353188828` 的 build 和 deploy 均成功。
- 正式文章、首页和 sitemap 均返回 HTTP 200；生产 canonical 和 sitemap 已包含新路由。
- CI 仅报告 GitHub Actions 所用 Node.js 20 runtime 已弃用的维护警告；本次不修改工作流，未影响构建或部署。

---
# 2026-08-31 MHS 文章案例增补

- 用户要求在已发布的“问题与解决方案”文章中补充现有案例。
- 案例应作为前文架构的证据：Genentech对应物理知识边界；UW对应多设备协调；CMU对应异构接口和安全阻断；Janelia对应确定性核心循环；QuEra对应Agent探索后固化脚本；Tetsuwan对应异常恢复和闭环参数优化。
- 六组结果均来自发布者或参与方自述，应统一标为早期 PoC/合作方结果，不作为独立安全认证或跨行业性能证明。
- 固定原始数据：Genentech 水约140 µL/s、BSA约10 µL/s且需专家纠正泡沫物理问题；UW六台仪器含driver在一周内接入；CMU约8小时完成集成、实验约快3倍、六种异常均在动作前阻断；Janelia统一七套厂商程序并保留确定性核心循环；QuEra盲测695/700次成功且最终重锁脚本无Agent在线控制；Tetsuwan记录9,143次dispense、300类transfer、1,508条件，Anthropic页为31/45、p≈0.001。
- Tetsuwan当前合作方页面写33/45、p≈0.003，与Anthropic 2026-08-27归档页存在版本差异；正文以Anthropic原始发布数字为主并显式注记。
- PR #50 已通过构建门禁并合并为 `773f360`；Pages 工作流 `33353955945` 的 build 和 deploy 均成功。
- 生产文章返回 HTTP 200，六组案例标题和共同结论均已出现在正式 HTML 中；文章 URL 和导航保持不变。

---
# 2026-08-31 MHS 文章标题润色

- 用户给出的方向为“Anthropic提出硬件连接标准：让AI Agent安全的控制设备”。
- 最终标题采用“Anthropic提出MHS：让AI Agent安全连接与控制真实设备”：点明专有名称，去掉不自然的“安全的控制”，并用“连接与控制”准确覆盖文章问题与方案。
- 文章URL、导航短标题和正文结构保持不变，避免破坏已有链接。
- 用户反馈MHS属于专有名词，单独放在标题中不易理解；标题进一步改为“Anthropic提出模型硬件标准：让AI Agent安全连接与控制真实设备”。
- 导语首次出现采用“模型硬件标准（Model Hardware Standard，MHS）”，并补充说明它不是电气接口或现场总线，而是Agent与设备之间的通用软件规范层；导航短标题同步展开中文名称。
- PR #53 合并为 `3c9cff4`，Pages 工作流 `33354235202` 构建和部署成功；生产标题、完整术语、简要定义和导航中文名称均已验证。

---
# 2026-08-31 MHS 文章演示视频

- Anthropic原始公告包含10段内容视频，均来自`cdn.sanity.io/files/4zrzovbb/website/`；本地归档约781 MB，最大Janelia视频约424 MB。
- 为避免仓库膨胀和页面自动消耗带宽，正式文章直接引用Anthropic原始CDN，并为每个播放器设置`preload="none"`、`playsinline`。
- 视频分组为：工作原理1段；UW孔板交接与CMU剂量响应2段；Janelia显微镜4段；QuEra激光1段；Tetsuwan移液与工作流2段。
- 用户进一步要求六组案例采用表格；正文已压缩为“案例、设备与任务、MHS作用与结果、限制与证据边界”四列，保留关键数字和Tetsuwan版本差异。
- 本地生产构建已验证Markdown表格正确渲染为六条数据行；10个视频标签和10个按需加载属性均完整进入生成HTML。
- 对10个原始媒体执行0号字节范围请求均得到HTTP 206；CDN正确标注9个MP4与1个QuickTime媒体，可供浏览器按需拉取。
- PR #55合并后，生产页验证六个案例名称全部存在，案例表头唯一，10个播放器完整；部署链路仅保留既有GitHub Actions Node.js 20弃用维护警告，不影响发布。

---
# 2026-09-04 — 软件定义 PAC 架构分析

- CIGRE WG B5.84 将虚拟 IED 的接口、服务器结构、IEC 61850 工程、测试和维护同时列入研究范围，说明虚拟化不是单一运行时问题。
- FIH（功能独立于硬件）是目标属性；虚拟机、容器和服务器集群只是候选实现手段，二者不能互换。
- Siemens Energy 的公开 Noedra Node 资料更强调参考架构、PAC 工程集成和生命周期；GE Vernova GridBeats APS 更强调产品化应用组合、独立固件和缩小再验证范围。
- GE 公开的硬件、运维和测试降幅属于厂商主张，正文必须保留归属，不外推为行业通用收益。
- SEAPATH 提供硬件和厂商中立的实时高可用宿主层，同时把兼容矩阵与多方集成责任推到更重要的位置。
- 公开文章不复制现场厂商照片；以文字结论和一份版本化原创 HTML/SVG 图替代，降低版权与仓库体积风险。
- PR #57 合并为 `915d0a0`；GitHub Pages 运行 `33880482629` 的构建和部署均成功。
- 生产文章、原创图、首页与 sitemap 均返回 HTTP 200；390 px 生产浏览器验证无页面级横向溢出，canonical 与正式路由一致。

# 章节规格（写作合同的单一事实源）

写作通用规则（每章都必须遵守）：
1. 读者=看过 SPOTLITE 视频但卡壳的开发者；概念从零讲起：直觉/类比 → 原理/公式 → 视频真实数字锚点
2. 锚点格式：`> **案例（视频出处：BV ID）**` 引用块；验证小节：`## 怎么验证`
3. 正文从 `##` 开始（`#` 大标题由站点清单渲染）；只用站点支持的 markdown 子集（含表格/引用块/列表）
4. 动画占位：`<div class="demo" data-demo="名字"></div>`，只用本规格"动画："字段列出的名字
5. 每章 900~1600 字；不重复其他章的定义——其他章已讲的概念用一句话+链接：`[KV 缓存](#/v1/05)`
6. 术语首次出现给英文原词；机器字幕错别字用校正后写法（FP16/稠密/Gemma 等）

---

## 卷一 · 大模型是怎么工作的

## v1/01 token、词表与 BPE
覆盖：token/分词/词表/tokenize-detokenize/token id/BPE/为什么 token 数决定计费·速度·显存
动画：tokenizer
源：BV1qU846JEpW（token id 部分）、BV1UMEv68E3C（序列长度即 token 数）
前章：无

## v1/02 生成 = 预测下一个 token
覆盖：自回归生成（一次吐一个）、logits、softmax、概率分布、采样、temperature、贪心采样
动画：softmax-temp
源：BV1qU846JEpW（softmax/temperature/贪心采样字幕）、BV1qGh56JEj2（自回归解码瓶颈）
前章：v1/01（token）

## v1/03 Transformer：按层堆叠的机器
覆盖：层堆叠（40/60/64 层）、hidden size/hidden state、每层=注意力+FFN、权重分布在各层、层数与显存/串行度的关系
动画：无
源：BV1YxjU6qEuw（40 层=40 次顺序前向）、BV1UMEv68E3C（层数/hidden size 公式参数）、BV1qU846JEpW
前章：v1/02

## v1/04 注意力：每个 token 都在看谁
覆盖：注意力直觉（看历史 token）、QKV 初步、注意力与序列长度的关系、KV 缓存为什么存在（引出下一章）
动画：attention
源：BV1UMEv68E3C、BV1i6Y86AEv3（"每生成一个 token 都要读全部历史"）
前章：v1/03

## v1/05 KV 缓存：用显存换算力
覆盖：KV 缓存机制、KV 显存公式（层数×KV头数×head_dim×2×序列长度×字节数）、GQA/KV头与注意力头、上下文与 KV 正比、三本账里的 KV 项
动画：kv-cache
源：BV1UMEv68E3C（整期）、BV1i6Y86AEv3（KV 量化预告）
前章：v1/03、v1/04

## v1/06 注意力的三个变体：全注意力、线性、滑窗
覆盖：Full attention（KV 线性增长）、Linear attention/GDN（递归状态+卷积状态=固定开销）、滑动窗口（1024 窗口）、混合架构（1/4+3/4）、模型卡 Layer type 字段查证
动画：无（用表格对比三种变体的 KV 增长曲线）
源：BV1UMEv68E3C（Layer type 翻案）
前章：v1/05

## v1/07 Prefill 与 Decode：吞字与吐字
覆盖：两阶段定义、速度差异的本质（并行算 vs 串行吐）、TTFT/首 token 延迟、"Prefill 快才是真的快"、输入形态（文本vs代码）对 Prefill 的影响、PP/TG 口径
动画：prefill-decode
源：BV1XrE26iEMG、BV1YxjU6qEuw（PP/TG）、BV1otY26LE8w（吞字吐字）、BV1qGh56JEj2
前章：v1/02、v1/05

## v1/08 上下文窗口与思考预算
覆盖：上下文窗口概念、256K 意味着什么、长文本的显存代价（回链 v1/05）、reasoning budget（思考 token 的成本）、多轮对话的一致性要求
动画：无
源：BV1UMEv68E3C、BV1xQtf6SEHR（reasoning budget）、BV1nVVr6QEFq（多轮迭代改代码）
前章：v1/05

## v1/09 MoE：总参数与激活参数
覆盖：稠密 vs MoE、路由器与专家、稀疏激活、激活参数 A3B 含义、为什么 MoE 对算力要求不高但吃显存/内存、n-gram 查询表外挂、FFN 层=专家层
动画：moe-router
源：BV1otY26LE8w、BV1xQtf6SEHR（Qwen3-30B-A3B、176B Flash）、BV14UEY6WEW7（总参/激活参）
前章：v1/03

## v1/10 模型生态与幻觉
覆盖：主流模型谱系（Qwen/Llama/DeepSeek/GLM/MiniMax/Step/Nemotron）、30B 甜点位逻辑、flash 档命名、版本时效性（Llama 3.3 为何过时）、前训练/后训练（同参数智力变强）、幻觉是什么、社区支持度选型
动画：无
源：BV14UEY6WEW7、BV1GtbL63Ekt、BV1kgN26SECZ
前章：v1/01~09 的概念可自由引用

## 卷二 · 数字怎么表示：精度与量化

## v2/01 浮点数从零讲起
覆盖：二进制与科学计数法、符号/指数/尾数、FP32/FP16/BF16 区别与用途、TF32（安培 19 位截断）、为什么半精度算力翻倍
动画：无
源：BV14yT46kE5T、BV17QN66tEKX
前章：无

## v2/02 FP8 与 NVFP4：更小的格子
覆盖：FP8（E4M3/E5M2）、FP4/NVFP4、动态范围与精度的取舍、哪些架构原生支持（Ada FP8/Blackwell NVFP4）、老卡用软件模拟的含义
动画：quant-grid
源：BV14yT46kE5T、BV1otY26LE8w
前章：v2/01

## v2/03 INT8/INT4 与 GGUF 档位
覆盖：整数量化路线、GGUF 档位 Q2~Q8/IQ 系列/Q4_K_M、AWQ、量化位宽与显存换算、llama.cpp 生态
动画：无
源：BV1XrE26iEMG（Q2~Q5）、BV1xQtf6SEHR（IQ1_S/IQ3/Q4）、BV1UMEv68E3C（AWQ INT4）
前章：v2/01

## v2/04 权重与激活：W8A16 命名的世界
覆盖：权重 vs 激活值、Y=A×W、W8A16/W8A8/W4A16 命名法、反量化/weight-only 推理、"支持权重格式≠以该格式运算"、训练精度vs部署精度
动画：无
源：BV14yT46kE5T、BV1GtbL63Ekt
前章：v2/01~03

## v2/05 量化粒度与异常值：Marlin 为什么快
覆盖：量化粒度（per-tensor/per-channel）、异常值问题、Marlin kernel 的角色、量化对速度的实际影响
动画：无
源：BV14yT46kE5T
前章：v2/03、v2/04

## v2/06 量化的代价：显存-速度-质量三角
覆盖：量化省显存提速度但损质量、幻觉与量化误差累积、KV 量化（INT8/Q4 KV）、什么时候不能省（KV 精度对长上下文的影响）
动画：无
源：BV1GtbL63Ekt、BV1i6Y86AEv3、BV1xQtf6SEHR（KV Q4）
前章：v2/03~05、v1/05

## 卷三 · 推理引擎在忙什么

## v3/01 先会看表：tok/s、吞吐与单并发
覆盖：tok/s 两种口径（吞吐vs输出速度）、单并发 batch=1 是个人最真实指标、PP/TG 指标读法、最高速度≠稳定复现速度
动画：无
源：BV1nVVr6QEFq、BV1YxjU6qEuw、BV1Y2LX61EjQ（波动）
前章：v1/07

## v3/02 推理框架两流派
覆盖：llama.cpp 系（GGUF/桌面GUI/端侧/基准确参）vs vLLM/SGLang/TensorRT-LLM（服务级/safetensors）、MLX、ComfyUI（AIGC）、什么时候用哪个
动画：无
源：BV1GtbL63Ekt、BV1qGh56JEj2（SGLang/llama.cpp）、BV1E5426eE5X
前章：v1/01

## v3/03 vLLM 与 PagedAttention
覆盖：为什么需要推理引擎、KV 空间浪费问题、PagedAttention 逻辑块物理块、vLLM 的调度排队
动画：paged-attention
源：BV1nVVr6QEFq、BV1qU846JEpW（vLLM/TP worker）
前章：v1/05、v3/02

## v3/04 并发与批处理
覆盖：并发/batch/micro-batch/ubatch、每个并发请求独立 KV 空间、连续批处理 vs 静态批次、batch 与显存的关系
动画：batching
源：BV1i6Y86AEv3、BV1qU846JEpW、BV1YxjU6qEuw（batch 切 2K 块）
前章：v3/03

## v3/05 CUDA Graph：消掉发射开销
覆盖：kernel 发射开销、CUDA Graph 整图回放、省时间但占显存、什么时候开
动画：cuda-graph
源：BV14yT46kE5T、BV1E5426eE5X（CUDA Graph 显存占用）
前章：v3/07 可后置引用（kernel 概念在本章先行给最小定义）

## v3/06 投机解码：猜对了就赚到
覆盖：draft-verify 框架、接受率、任务确定性（科学>代码>创意）、N值/gamma 与甜点区间、代价（prefill 变慢/显存/草稿模型）、MTP（内嵌层、PP 下不可用）、DFlash（扩散式）、DSpark（自回归校正）
动画：speculative
源：BV1qGh56JEj2（整期）、BV1XrE26iEMG（关 MTP 影响 decode 不影响 prefill）
前章：v1/07

## v3/07 内核与算子：快从哪里来
覆盖：GPU kernel 概念、Tensor Core 三代演进（V100/Turing/Ampere）、DP4A、cp.async 异步拷贝、Marlin、FlashAttention/FlashQLA/FlashInfer、INT8 TOPS=FP16×2
动画：无
源：BV14yT46kE5T、BV1E5426eE5X、BV1hLtG6ZE5M
前章：v2/01~04、v1/03

## v3/08 CPU 在干嘛：不止是个观众
覆盖：HTTP server/请求-响应、排队调度、tokenize/detokenize 在 CPU、单核性能/IPC/频率何时重要、毫秒级时延分解、TP worker 多进程
动画：无
源：BV1qU846JEpW（整期）、BV12ZEN6CEho（i3-9100T）
前章：v3/01~04

## v3/09 CUDA vs ROCm：软件生态的账
覆盖：CUDA 生态位、ROCm/HIP/SYCL、AMD 生态与中科海光、CUDA 版本生命周期（V100 停在12）、AMD Quark、选卡时生态权重
动画：无
源：BV1hLtG6ZE5M、BV1E5426eE5X、BV1XrE26iEMG（Quark）
前章：v3/02、v4/04（架构代际可前向引用一句话）

## 卷四 · 显卡与硬件选型

## v4/01 显存 vs 内存：模型为什么必须装进显存
覆盖：显存(VRAM)/内存(RAM)/硬盘三层级与带宽差距、模型装载、为什么 96G 跑不从容 200B、"显存大≠快"
动画：无
源：BV14UEY6WEW7、BV1YxjU6qEuw、BV1otY26LE8w（存储层级）
前章：v1/09（参数量概念在 v1/01 可先给）

## v4/02 显存三本账：权重+KV+缓冲
覆盖：权重账（参数量×每参数字节）、KV 账（回链 v1/05）、计算缓冲区、并发副本、OOM、44G=20G权重+16G KV+缓冲 案例前置
动画：vram-budget
源：BV1UMEv68E3C、BV1i6Y86AEv3（显存预算公式）
前章：v1/05、v2/03

## v4/03 带宽决定 Decode、算力决定 Prefill
覆盖：memory-bound/访存受限直觉（每 token 搬全部权重）、roofline 直觉、"力大砖飞"、为什么 decode 速度≈带宽/模型大小、prefill 是算力问题、batch 改变瓶颈
动画：roofline
源：BV1YxjU6qEuw、BV1hLtG6ZE5M、BV1i6Y86AEv3（性能=带宽+算力+架构）
前章：v1/07、v4/01

## v4/04 架构代际：从 Pascal 到 Blackwell
覆盖：Pascal(无TC/DP4A)→Volta(第一代TC)→Turing SM75(二代TC/INT8)→Ampere SM86/TF32→Ada(原生FP8)→Blackwell(NVFP4)、每代关键特性、2080Ti 在谱系中的位置、为什么老卡还能打
动画：无
源：BV14yT46kE5T、BV1hLtG6ZE5M、BV1E5426eE5X
前章：v2/02、v3/07

## v4/05 HBM vs GDDR：显存也分门派
覆盖：HBM 堆叠/超宽位宽/靠近核心、GDDR6/6X、ECC 占容量降带宽、显存容量屏蔽与解锁、HBM 卡（A100/MI50）的二手行情
动画：无
源：BV17QN66tEKX、BV1E5426eE5X、BV1YxjU6qEuw（MI50）
前章：v4/03

## v4/06 双卡怎么放模型：TP vs PP
覆盖：显存拼接、权重对半切、张量并行（单层切开+all-reduce）、流水线并行（按层接力+micro-batch 重叠）、两者区别、通信量公式 payload=hidden×token×字节、带宽敏感vs延迟敏感、decode 无法靠重叠提速
动画：tp-vs-pp
源：BV1Y2LX61EjQ（整期）、BV1YxjU6qEuw、BV1dx3Q6iEbZ
前章：v1/03、v4/03

## v4/07 NVLink 与 PCIe 全家桶
覆盖：PCIe lane/x1~x16、代际带宽表、CPU直连 vs 南桥PCH、bifurcation/riser/PLX switch、root complex/P2P、NVLink 桥接器与带宽、ConnectX-7/USB4 一句话、PCIe 1.0x4 实验案例
动画：pcie-bandwidth
源：BV1Y2LX61EjQ、BV12ZEN6CEho、BV1hLtG6ZE5M、BV1dx3Q6iEbZ
前章：v4/06

## v4/08 统一内存与 offloading
覆盖：统一内存架构（CPU/GPU 共享、零拷贝）、BIOS 固定划分 vs 动态热分配、Strix Halo/Mac M3 Ultra、为什么适合 MoE（激活小）、offloading 层级（显存→内存→硬盘→U盘）、n-gram 表/词表放慢介质、176B U盘案例
动画：unified-memory
源：BV1otY26LE8w（整期）、BV14UEY6WEW7（Strix Halo）、BV1xQtf6SEHR（U盘）、BV1GtbL63Ekt（Mac）
前章：v1/09、v4/01

## v4/09 平台与功耗：装机离不开的算术
覆盖：CPU 核心/线程/TDP≠实际功耗、EPYC 多 lane 平台 vs 消费级、迷你主机改装（M720Q）、整机功耗预算（500W双卡/600W整机→1100W冗余）、服务器拆机电源、24h 满载 token 产出与电费算术
动画：无
源：BV12ZEN6CEho（整期）、BV1KKE96CELt（电费）、BV1hLtG6ZE5M（EPYC）
前章：v4/07

## v4/10 显卡市场生存指南
覆盖：矿潮与矿卡风险、CMP 限制（170HX→PCIe 1.0x4 飞线）、魔改卡（22G/刷BIOS）、SXM2 模组转接、专业卡溢价（Pro6000 96G）、GA100 刀法/良率、显存比卡贵、能效比（每瓦性能）、大船到货与价格波动
动画：无
源：BV17QN66tEKX（整期）、BV1E5426eE5X、BV1hLtG6ZE5M、BV14UEY6WEW7、BV1YxjU6qEuw
前章：v4/04~05

## 卷五 · 案例通读

## v5/01 双 2080Ti 27B 100tok/s 全拆解
覆盖：用前四卷知识完整解读 3500~4500 元方案的每笔账：22G 魔改×2、AWQ INT4 权重 20G、KV FP16、vLLM 适配 SM75、实测 100tok/s 单并发、网页 FPS 游戏压测法
动画：无（可复用 vram-budget/kv-cache 提及）
源：BV1nVVr6QEFq、BV1QC7Q61E3T、BV12ZEN6CEho、BV1XrE26iEMG
前章：卷一~卷四

## v5/02 KV 缓存 100G 算账翻案
覆盖：naive 公式算出 64G/120G → 查模型卡 Layer type → 修正 16G/20G → 44G 总账成立；教训：公式的前提条件要核实
动画：无
源：BV1UMEv68E3C（整期）
前章：v1/05、v1/06

## v5/03 MTP/DFlash/DSpark 对比怎么读
覆盖：实测对比的读法：多场景（科学/代码/创意）× 多 N 值画曲线、接受率如何决定加速比、prefill 代价、显存代价、PP 兼容性
动画：无
源：BV1qGh56JEj2（整期）
前章：v3/06

## v5/04 显卡天梯：百元神卡到智商税区
覆盖：10 张百元卡（P40/M40/MI50/2080Ti 矿卡等）逻辑、1~3千八卡温饱线、3千~1万单卡为何不推荐（机会成本）、能效比维度、以终为始的选卡顺序
动画：无
源：BV1E5426eE5X、BV1hLtG6ZE5M、BV1i6Y86AEv3
前章：卷四

## v5/05 176B MoE + U盘：offload 的极致案例
覆盖：Qwen3.8Flash 176B 架构拆解（主模型+n-gram 大表）、为什么查询表能放 U 盘、30tk/s+160K 的来源、2 张 10 系卡的角色
动画：无
源：BV1xQtf6SEHR（整期）
前章：v1/09、v4/08

## v5/06 统一内存跑大型 MoE：两万元怎么花
覆盖：395 vs 495 平台对比、每 64G 内存边际价格、内存带宽 vs 显存带宽的取舍、CPU 调度角色、哪些负载值得
动画：无
源：BV1otY26LE8w（整期）
前章：v4/08

## v5/07 紧急刹车：本地 vs API 的 TCO
覆盖：24h 满载 token 产出算术、电费账、API 每百万 token 计费对比、矿卡风险折价、家用利用率真相（远低于满载）、"紧急刹车"的含义
动画：无
源：BV1KKE96CELt（整期）
前章：v4/09

## v5/08 口径批判："调用量世界第一"
覆盖：周榜调用量口径、除法反推数量级、刷榜成本、抽样偏差、用户量级vs调用量级、重度 Agent 用户日烧 20 亿 token 的解释
动画：无
源：BV1kgN26SECZ（整期）
前章：v1/01

## 卷六 · 方法论与术语表

## v6/01 七个方法论模式
覆盖：先算账再动手/信一手字段/控制变量实验/口径批判/成本工程/以终为始/开源复现，各配 1 个视频实例；读者如何把这套方法用到自己的学习
动画：无
源：notes/synthesis.md + 全部视频
前章：全卷

## v6/02 术语速查表 A→Z
覆盖：notes/videos/*.md 术语穷举节的合并去重表（约 200+ 词条），每条=一句话解释+所属章节链接；表格按拼音/字母排序
动画：无
源：全部 22 份笔记的术语节
前章：无（工具章）

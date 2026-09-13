# 知识点总表（合并去重 22 个视频）

格式：`知识点 ← 前置依赖`｜[出处视频]｜知识域｜动画标记
知识域：A=LLM基础 B=精度量化 C=推理引擎 D=硬件选型 E=方法论实操
动画标记：🎬=需要交互动画（16个已定稿，见 demos 清单）

## 卷一 · 大模型是怎么工作的（A 域）

- token / 分词 / 词表 / BPE / tokenize-detokenize / token id ← 无 [几乎全部视频] A 🎬tokenizer
- 自回归生成：一次前向只吐一个 token，输出成为下一步输入 ← token [全部视频] A
- 生成=预测下一个 token：logits → softmax → 概率分布 → 采样 ← 自回归 [BV1qU846JEpW] A 🎬softmax-temp
- temperature / 贪心采样 ← softmax [BV1qU846JEpW] A
- Transformer 按层堆叠：层数（如 40/60/64 层）、hidden size、每层=注意力+FFN ← 无 [BV1YxjU6qEuw, BV1UMEv68E3C] A
- 注意力机制：每个 token 看历史所有 token（QKV 直觉）← Transformer [BV1UMEv68E3C 等] A 🎬attention
- KV 缓存：为什么需要（避免每步重算历史）← 注意力、自回归 [多视频] A 🎬kv-cache
- KV 缓存显存公式：层数×KV头数×head_dim×2(K和V)×序列长度×每元素字节 ← KV缓存、GQA [BV1UMEv68E3C] A（并入 kv-cache 动画的实时计算）
- GQA/多头注意力：KV 头与注意力头的区别 ← 注意力 [BV1UMEv68E3C] A
- Full attention：KV 随上下文线性增长 ← 注意力 [BV1UMEv68E3C] A
- Linear attention / GDN（Gated DeltaNet）/ 递归状态+卷积状态：固定大小状态替代无限 KV ← 注意力 [BV1UMEv68E3C] A
- 滑动窗口注意力：窗口 1024，KV 只留窗内 ← 注意力 [BV1UMEv68E3C] A
- 混合注意力架构：如 64 层中 1/4 全注意力 + 3/4 线性；模型卡 Layer type 字段 ← 上述三类 [BV1UMEv68E3C] A
- Prefill（预填充/吞字）vs Decode（解码/吐字）两阶段：一次吃 prompt vs 逐 token 生成 ← 自回归 [几乎全部视频] A 🎬prefill-decode
- TTFT（首 token 延迟）："Prefill 快才是真的快"的体感 ← Prefill [BV1XrE26iEMG] A
- 输入形态（纯文本 vs 代码）对 Prefill 的影响 ← Prefill、分词 [BV1XrE26iEMG] A
- 上下文窗口 / 256K / 上下文长度与 KV 正比 ← KV缓存 [多视频] A
- reasoning budget（思考预算）：推理模型思考 token 的代价 ← token [BV1xQtf6SEHR] A
- 稠密模型 vs MoE：总参数 vs 激活参数 ← Transformer [多视频] A
- MoE 路由器与专家调度、稀疏激活 ← MoE [BV1otY26LE8w] A 🎬moe-router
- n-gram 查询表"外挂"（新 MoE 架构的大表，可放慢介质）← MoE、n-gram [BV1otY26LE8w, BV1xQtf6SEHR] A
- 幻觉（hallucination）：采样+量化误差累积的产物 ← 采样、量化 [BV1GtbL63Ekt, BV1i6Y86AEv3] A
- 模型卡 / config.json / Layer type 字段查证 ← HuggingFace [BV1UMEv68E3C] A
- 模型生态：Qwen/Llama/DeepSeek/GLM/MiniMax/Step/Nemotron、30B甜点位、flash档命名、版本时效性 ← 参数量 [BV14UEY6WEW7, BV1GtbL63Ekt, BV1kgN26SECZ] A
- 前训练/后训练与"同参数智力变强" ← 训练流程 [BV1GtbL63Ekt] A

## 卷二 · 数字怎么表示：精度与量化（B 域）

- 浮点数：符号/指数/尾数，科学计数法 ← 二进制 [BV14yT46kE5T, BV17QN66tEKX] B
- FP32 / FP16 / BF16 / TF32（安培19位截断） ← 浮点数 [BV14yT46kE5T, BV17QN66tEKX] B
- FP8（E4M3/E5M2）/ FP4 / NVFP4 ← 浮点数 [BV14yT46kE5T, BV1otY26LE8w] B 🎬quant-grid
- INT8 / INT4 整数量化、GGUF 档位 Q2~Q8 / IQ 系列 / Q4_K_M ← 量化 [多视频] B 🎬quant-grid
- AWQ（4bit 权重量化代表）← 量化 [BV1UMEv68E3C, BV1hLtG6ZE5M] B
- 权重 vs 激活值；W8A16/W8A8/W4A16 命名法 ← 矩阵乘 [BV14yT46kE5T, BV1GtbL63Ekt] B
- 反量化（dequantization）与 weight-only；"支持权重格式≠以该格式运算" ← 量化 [BV14yT46kE5T] B
- 量化粒度与异常值；Marlin kernel 为何快 ← 量化、kernel [BV14yT46kE5T] B
- KV 缓存量化：INT8/Q4 KV、TurboQuant ← KV缓存、量化 [BV1i6Y86AEv3, BV1xQtf6SEHR] B
- 量化代价三角：显存-速度-质量（幻觉风险）← 量化 [BV1GtbL63Ekt, BV1i6Y86AEv3] B
- 训练精度 vs 部署精度 ← FP16/BF16 [BV14yT46kE5T] B

## 卷三 · 推理引擎在忙什么（C 域）

- 推理指标：吞吐 tok/s vs 输出速度、单并发(batch=1)是最真实的个人指标、PP/TG 口径 ← decode [BV1nVVr6QEFq, BV1YxjU6qEuw] C
- 推理框架两流派：llama.cpp 系（GGUF/桌面GUI/端侧）vs vLLM/SGLang/TensorRT-LLM（服务级/safetensors）[BV1GtbL63Ekt, BV1qGh56JEj2] C
- vLLM：为什么需要、PagedAttention 显存页管理、调度排队 ← KV缓存 [多视频] C 🎬paged-attention
- 并发/batch/micro-batch/ubatch：每个并发请求独立的 KV 空间 ← KV缓存 [BV1i6Y86AEv3, BV1qU846JEpW] C 🎬batching
- 连续批处理 vs 静态批次 ← batch [BV1i6Y86AEv3] C（并入 batching）
- CUDA Graph：内核发射开销、显存占用代价 ← GPU kernel [BV14yT46kE5T, BV1E5426eE5X] C 🎬cuda-graph
- 投机解码框架：draft-verify、接受率、任务确定性（科学>代码>创意）、N值/gamma 甜点、代价（prefill变慢+显存+草稿模型）← decode [BV1qGh56JEj2] C 🎬speculative
- MTP：主模型内嵌多 token 预测层，PP 下不可用 ← 投机解码 [BV1qGh56JEj2, BV1XrE26iEMG] C
- DFlash（扩散式并行产 token）/ DSpark（自回归校正层）← 投机解码 [BV1qGh56JEj2] C
- GPU kernel 与算子：Marlin、FlashAttention/FlashQLA/FlashInfer、Tensor Core 三代演进、DP4A、cp.async ← 架构 [BV14yT46kE5T, BV1E5426eE5X] C
- CPU 在推理中的角色：HTTP server/排队调度/tokenize，单核性能与频率；毫秒级时延分解 [BV1qU846JEpW] C
- GPU 软件生态：CUDA vs ROCm/HIP/SYCL、CUDA 版本生命周期（V100 停在12）、AMD Quark [BV1hLtG6ZE5M, BV1E5426eE5X, BV1XrE26iEMG] C
- 读日志算速度：llama.cpp print_timings [BV1xQtf6SEHR] C（并入方法论）

## 卷四 · 显卡与硬件选型（D 域）

- 显存 vs 内存：模型为什么必须"装进"显存 ← 存储 [多视频] D
- 显存三本账：权重 + KV缓存 + 计算缓冲（+并发副本）；OOM ← 上述 [BV1UMEv68E3C, BV1i6Y86AEv3] D 🎬vram-budget
- 显存带宽决定 Decode（memory-bound/访存受限）、算力决定 Prefill（"力大砖飞"）← 两阶段 [多视频] D 🎬roofline
- HBM vs GDDR：堆叠/位宽/靠近核心；ECC 占容量降带宽 ← 显存类型 [BV17QN66tEKX, BV1E5426eE5X] D
- 架构代际：Pascal(无TC/DP4A)→Volta(第一代TC)→Turing SM75(二代TC/INT8×2)→Ampere SM86/TF32→Ada(原生FP8)→Blackwell(NVFP4) [BV14yT46kE5T, BV1hLtG6ZE5M, BV1E5426eE5X] D
- 算力单位：FLOPS/TFLOPS/TOPS、FP32/FP16/INT8 多口径、INT8 TOPS=FP16×2 [BV17QN66tEKX, BV1E5426eE5X] D
- 多卡放模型：显存拼接 44G=2×22G、权重 1:1 对半切 [多视频] D
- 张量并行 TP：单层切开多卡同算 + all-reduce 归并；通信量公式 payload=hidden×token×字节 [BV1Y2LX61EjQ, BV1dx3Q6iEbZ] D 🎬tp-vs-pp
- 流水线并行 PP：按层接力、micro-batch 流水重叠、"串行"；decode 无法靠重叠提速 [BV1YxjU6qEuw, BV1dx3Q6iEbZ] D（并入 tp-vs-pp）
- 带宽敏感 vs 延迟敏感：decode 通信量小(KB级)但每次都有固定延迟 [BV1Y2LX61EjQ] D
- NVLink：绕开 PCIe 的卡间互联、双向带宽、桥接器 [多视频] D 🎬pcie-bandwidth
- PCIe：lane/x1~x16、代际带宽(Gen1~5)、CPU直连 vs 南桥(PCH)、bifurcation/riser/PLX switch、root complex/P2P [BV12ZEN6CEho, BV1Y2LX61EjQ, BV1hLtG6ZE5M] D
- PCIe 1.0 x4 实验结论：双卡劣化链路下 prefill 仍快于单卡（流水重叠）[BV1dx3Q6iEbZ] D（案例）
- 统一内存：CPU/GPU 共享物理内存、零拷贝、BIOS 固定划分 vs 动态热分配；Strix Halo/Mac M3 Ultra 适合 MoE 的原因（激活小）[BV1otY26LE8w, BV14UEY6WEW7, BV1GtbL63Ekt] D 🎬unified-memory
- offloading：权重卸载 显存→内存→硬盘/U盘，层级带宽差；n-gram 表/词表适合放慢介质 [BV1xQtf6SEHR, BV1otY26LE8w] D
- CPU/平台：核心/线程/TDP(≠实际功耗)、IPC/频率、EPYC 多 lane 平台 vs 消费级、迷你主机 M720Q 改装 [BV12ZEN6CEho, BV1hLtG6ZE5M] D
- 功耗与电费：整机功耗预算、电源冗余(600W→1100W)、服务器拆机电源、24h 满载 token 产出算术 [BV12ZEN6CEho, BV1KKE96CELt] D
- 显卡市场：矿潮/矿卡风险、CMP 矿卡限制(170HX→PCIe 1.0x4 飞线)、魔改卡(22G/飞线/刷BIOS)、SXM2 模组转接、专业卡溢价(Pro6000 96G)、GA100 刀法/良率、显存比卡贵现象 [BV17QN66tEKX, BV1E5426eE5X, BV1hLtG6ZE5M, BV14UEY6WEW7, BV1YxjU6qEuw] D
- AIGC(文生图/视频 FLUX/Wan/LTX) vs LLM 负载的显存/算力差异 [BV14UEY6WEW7, BV1otY26LE8w] D
- 能效比：每瓦性能（T10 150W≈2080Ti 80%性能）[BV1E5426eE5X] D

## 卷五 · 案例通读（全部域回链）

- 案例1：双 2080Ti 27B FP8 100tok/s（3500~4500 元）[BV1nVVr6QEFq, BV1QC7Q61E3T, BV12ZEN6CEho]
- 案例2：KV 缓存算账——naive 公式 64G→修正 16G（Layer type 翻案）[BV1UMEv68E3C]
- 案例3：MTP/DFlash/DSpark 实测对比怎么读（接受率/N值曲线）[BV1qGh56JEj2]
- 案例4：显卡天梯逻辑（百元神卡/1~3千/3千~1万智商税区）[BV1E5426eE5X, BV1hLtG6ZE5M, BV1i6Y86AEv3]
- 案例5：176B MoE + U盘 offload（n-gram 表放慢介质、30tk/s）[BV1xQtf6SEHR]
- 案例6：统一内存跑大型 MoE（395 vs 495 两万元买什么）[BV1otY26LE8w]
- 案例7：紧急刹车/调用量世界第一的口径批判 [BV1KKE96CELt, BV1kgN26SECZ]
- 案例8：PCIe 1.0x4 双卡 vs 单卡 [BV1dx3Q6iEbZ]

## 卷六 · 方法论与生存指南（E 域）

- 以终为始：先定工作负载再定硬件 [BV14UEY6WEW7]
- "能不能 vs 好不好"决策顺序；机会成本/替代成本 [BV1i6Y86AEv3]
- TCO：购置+电费+精力+风险；API 按百万 token 计费 vs 本地电费 [BV1KKE96CELt]
- 价格锚点：每 TFLOPS/每 64G 内存边际价格 [BV1otY26LE8w]
- 实测纪律：baseline、控制变量（同模型/量化/prompt）、速度波动与置信区间、"最高速度≠稳定复现速度" [BV1Y2LX61EjQ, BV1dx3Q6iEbZ, BV1otY26LE8w]
- 评测口径批判：调用量榜单口径、抽样偏差、刷榜成本、用户量级 vs 调用量级 [BV1kgN26SECZ]
- 压测方法：生成可运行网页 FPS 游戏（长输出+代码约束）、多轮迭代改代码 [BV1nVVr6QEFq]
- 查证习惯：模型卡字段、开源仓库权重清单、社区支持度选型（小热门>大冷门）[BV1UMEv68E3C, BV1GtbL63Ekt]

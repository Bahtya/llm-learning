# 附录 B · 资料索引

## 案例视频清单（SPOTLITE，B 站 UID 192062329）

全部案例来自 UP 主 SPOTLITE 的本地大模型推理系列视频（2026-06 ~ 2026-09）。BV 号是 B 站视频的唯一编号，可直接在 B 站搜索查证。

| BV 号 | 视频标题 | 主要引用章 |
|---|---|---|
| BV1nVVr6QEFq | 立省5万！两张2080ti 27B稠密，单并发100tok/s | 1.2、1.4、3.1、3.4、5.3 |
| BV1QC7Q61E3T | 3500块！Qwen3.6 27B FP8权重 80tok/s | 2.3 |
| BV12ZEN6CEho | 花费高昂！27B稠密100Tk/s，装机全指南 | 4.4、5.2 |
| BV1XrE26iEMG | 2600tk/s! 8年老卡疯狗填充27B稠密INT8 | 1.2、3.1 |
| BV1KKE96CELt | 紧急刹车！不要购买任何显卡用于本地AI推理 | 4.4、5.3 |
| BV1UMEv68E3C | 大模型KV缓存要100G？我们一起来算算 | 1.3、2.1、2.2、2.4、2.5、5.4 |
| BV14UEY6WEW7 | Pro6000是本地AI的终极答案？我看未必 | 1.5、4.3、5.1 |
| BV1Y2LX61EjQ | NVLink在双卡张量并行推理下，到底有没有用 | 3.1、4.1、4.2 |
| BV1YxjU6qEuw | 本地AI最大怨种显卡已经出现！显存比显卡还贵 | 1.3、4.1、4.3、5.2 |
| BV14yT46kE5T | 什么！20系显卡竟然支持FP8甚至NVFP4 | 2.3、2.4、3.3、5.1 |
| BV1kgN26SECZ | "本周xx模型调用量世界第一？"别骗自己了 | 3.4、5.4 |
| BV17QN66tEKX | 一夜之间这张显卡身价暴涨20倍 | 2.3、5.1 |
| BV1dx3Q6iEbZ | PCIE1.0x4下，双卡跑大模型依然比单卡快 | 4.1、4.2 |
| BV1qU846JEpW | 本地AI推理，CPU性能重要吗 | 1.1、1.2、3.3 |
| BV1qGh56JEj2 | 投机解码还是投机倒把？MTP DFlash DSpark实测对比 | 3.5 |
| BV1E5426eE5X | 垃圾佬畅玩AI，10张百元级AI神卡推荐 | 3.3、5.1、5.2 |
| BV1hLtG6ZE5M | 本地AI温饱之道。1~3千的八张AI显卡推荐 | 2.5、5.2 |
| BV1xQtf6SEHR | 2张10系显卡+U盘，怒推176B Qwen3.8Flash | 1.4、1.5、4.3 |
| BV1GtbL63Ekt | 入坑本地AI之前的几个重要心法建议 | 1.1、1.5、2.5、5.4 |
| BV1i6Y86AEv3 | 本地AI智商税？3千-1万单卡方案我都不推荐 | 2.5、3.2、5.3 |
| BV1otY26LE8w | 统一内存为什么是本地部署200B级MoE模型的答案 | 4.3、5.3 |

## 工具与官方文档

| 资源 | 地址 | 说明 |
|---|---|---|
| Ollama | ollama.com（文档 ollama.com/docs） | 第 1 章部署路线；接口以所用版本为准 |
| llama.cpp | github.com/ggml-org/llama.cpp | GGUF 生态引擎本体；llama-bench/llama-server |
| vLLM | docs.vllm.ai | 服务级引擎；CUDA Graph/量化内核支持矩阵 |
| SGLang | github.com/sgl-project/sglang | 服务级引擎新贵 |
| Hugging Face | huggingface.co | 模型卡/config.json/量化配置的权威来源 |
| ModelScope | modelscope.cn | 国内模型镜像 |
| NVIDIA 规格页 | nvidia.com | 显卡三要素核对 |

## 口径声明（全库通用）

- 书中所有实测数字均为 UP 主口播或其开源仓库标注的口径，型号名为口播转写（以官方规格页/模型卡为准）；
- 性能数据默认附带：模型、量化档、硬件、框架、输入/输出长度、batch、并发——缺哪项书中标"原资料未说明"；
- "GP/TG""PP"等跑分缩写的定义见 3.1。

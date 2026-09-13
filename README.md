# llm-learning · 大模型入门

把 B 站 UP 主 [SPOTLITE](https://space.bilibili.com/192062329) 的 22 个本地大模型推理视频里出现的**每一个概念**从零讲懂的成套入门书（纯静态前端，无构建工具），配套 16 个交互动画。

## 阅读

```sh
python3 -m http.server 8000
# 打开 http://localhost:8000
```

按卷顺序读即可；卡壳的词查[术语速查表](content/v6/02.md)；[案例出处对照](content/v6/03.md)可按 BV 号回看原视频。

| 卷 | 内容 |
|---|---|
| 一 | 大模型怎么工作：token / 注意力 / KV 缓存 / Prefill-Decode / MoE（含 GDN、滑窗混合架构） |
| 二 | 精度与量化：浮点数 → FP8 / NVFP4 / INT4 / GGUF 档位 / Marlin |
| 三 | 推理引擎：vLLM / PagedAttention / 批处理 / CUDA Graph / 投机解码（MTP / DFlash / DSpark）/ 内核 |
| 四 | 显卡与选型：显存三本账 / 架构代际 / TP vs PP / NVLink 与 PCIe / 统一内存 / 矿卡市场 |
| 五 | 案例通读：双 2080Ti 27B 100tok/s、KV 算账翻案、显卡天梯等 8 个实测全拆解 |
| 六 | 方法论七模式 + 180 词条术语表 + 视频出处对照 |

每个概念都按「直觉类比 → 原理公式 → 视频实测数字锚点 → 怎么验证」展开；文中数字多为 UP 主口播口径，均就地标注。

## 动画

16 个 Canvas 交互动画（`assets/demos.js`）：KV 显存公式实时算账、温度采样、注意力热图、量化分箱、MoE 路由、PagedAttention 分页、投机解码竞速、显存三本账 vs 44G 红线、TP/PP 对比、PCIe/NVLink 传输耗时、roofline 工作点等。

## 目录结构

```
content/   六卷 46 章（markdown，运行时渲染）
assets/    站点代码：md 渲染器 / 路由 / 动画注册表
notes/     制作过程：知识点总表、章节规格、方法论综合、逐视频精读笔记、4 轮评审报告
videos/    字幕存档（ai-zh）与下载脚本；视频本体不入库
```

## 制作方法

Pipeline：yt-dlp 拉取字幕 → 22 个并行 agent 逐视频精读（术语穷举/论断/知识点）→ 汇总知识点总表 → 45 章并行写作 + 16 动画 → **4 轮评审迭代**（每轮 3 个初学者 agent 评可懂性 + 1 个专家 agent 评知识正确性，共修复约 300 处，终验 3 pass + 1 conditional）。

## 致谢

所有案例与实测数据出自 UP 主 SPOTLITE 的视频与其开源项目 [vLLM-2080Ti-Definitive](https://github.com/weicj/vLLM-2080Ti-Definitive)。

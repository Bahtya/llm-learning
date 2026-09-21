// v2 书籍清单：项目型教材，5 部分 23 章 + 附录。章节文件 = content-v2/{part}/{id}.md
const BOOKS = [
  { vol: "part1", title: "第一部分 · 跑起来：你的第一个推理服务", chapters: [
    { id: "1-1", title: "从零到第一次调用：最小推理服务" },
    { id: "1-2", title: "按下回车之后：一次请求的旅程" },
    { id: "1-3", title: "为什么第二个字便宜：注意力与 KV 缓存" },
    { id: "1-4", title: "聊着聊着就忘了：上下文窗口" },
    { id: "1-5", title: "第一次选型：我的机器该跑哪个模型" },
  ]},
  { vol: "part2", title: "第二部分 · 算清楚：显存、位宽与量化", chapters: [
    { id: "2-1", title: "显存三本账：装得下吗" },
    { id: "2-2", title: "为什么要量化：三笔账" },
    { id: "2-3", title: "位宽的世界：浮点、FP8 与整数格" },
    { id: "2-4", title: "打开 GGUF：文件、超级块与档位" },
    { id: "2-5", title: "量化的代价与甜点位" },
  ]},
  { vol: "part3", title: "第三部分 · 测明白：延迟、吞吐与瓶颈", chapters: [
    { id: "3-1", title: "会看表：TTFT、TPOT 与吞吐" },
    { id: "3-2", title: "并发与批处理：GPU 为什么不怕人多" },
    { id: "3-3", title: "引擎在忙什么：调度、CUDA Graph 与内核" },
    { id: "3-4", title: "找瓶颈：roofline 与对照实验" },
    { id: "3-5", title: "投机解码与 MTP：不换卡的提速" },
  ]},
  { vol: "part4", title: "第四部分 · 扩上去：多卡、并行与大模型", chapters: [
    { id: "4-1", title: "双卡怎么放：TP vs PP" },
    { id: "4-2", title: "卡间互联：NVLink、PCIe 与通信账" },
    { id: "4-3", title: "大模型的另两条路：统一内存与 offload" },
    { id: "4-4", title: "多用户上线：从玩具到服务" },
  ]},
  { vol: "part5", title: "第五部分 · 选硬件：选型、成本与判断力", chapters: [
    { id: "5-1", title: "三要素读穿一张卡" },
    { id: "5-2", title: "显卡市场生存指南" },
    { id: "5-3", title: "成本与决策：本地 vs API 的 TCO" },
    { id: "5-4", title: "方法论内化：像 UP 主一样\"知道\"" },
  ]},
  { vol: "appendix", title: "附录", chapters: [
    { id: "A", title: "术语速查表（待 v2 重写）" },
    { id: "B", title: "资料索引：视频清单与官方文档" },
    { id: "C", title: "全书数字口径总表" },
    { id: "D", title: "进阶篇入口" },
  ]},
];

// BV 号 → 视频标题（案例块与出处表的可点击链接用）
const VIDEOS = {
  BV1nVVr6QEFq: { t: "立省5万！两张2080ti 27B稠密，单并发100tok/s" },
  BV1QC7Q61E3T: { t: "3500块！Qwen3.6 27B FP8权重 80tok/s" },
  BV12ZEN6CEho: { t: "花费高昂！27B稠密100Tk/s，装机全指南" },
  BV1XrE26iEMG: { t: "2600tk/s! 8年老卡疯狗填充27B稠密INT8" },
  BV1KKE96CELt: { t: "紧急刹车！不要购买任何显卡用于本地AI推理" },
  BV1UMEv68E3C: { t: "大模型KV缓存要100G？我们一起来算算" },
  BV14UEY6WEW7: { t: "Pro6000是本地AI的终极答案？我看未必" },
  BV1Y2LX61EjQ: { t: "NVLink在双卡张量并行推理下，到底有没有用" },
  BV1YxjU6qEuw: { t: "本地AI最大怨种显卡已经出现！显存比显卡还贵" },
  BV14yT46kE5T: { t: "什么！20系显卡竟然支持FP8甚至NVFP4" },
  BV1kgN26SECZ: { t: "\"本周xx模型调用量世界第一？\"别骗自己了" },
  BV17QN66tEKX: { t: "一夜之间这张显卡身价暴涨20倍" },
  BV1dtgf6pEbW: { t: "268G显存的怒吼" },
  BV1dx3Q6iEbZ: { t: "PCIE1.0x4下，双卡跑大模型依然比单卡快" },
  BV1qU846JEpW: { t: "本地AI推理，CPU性能重要吗" },
  BV1qGh56JEj2: { t: "投机解码还是投机倒把？MTP DFlash DSpark实测对比" },
  BV1E5426eE5X: { t: "垃圾佬畅玩AI，10张百元级AI神卡推荐" },
  BV1hLtG6ZE5M: { t: "本地AI温饱之道。1~3千的八张AI显卡推荐" },
  BV1xQtf6SEHR: { t: "2张10系显卡+U盘，怒推176B Qwen3.8Flash" },
  BV1GtbL63Ekt: { t: "入坑本地AI之前的几个重要心法建议" },
  BV1i6Y86AEv3: { t: "本地AI智商税？3千-1万单卡方案我都不推荐" },
  BV1otY26LE8w: { t: "统一内存为什么是本地部署200B级MoE模型的答案" },
};

// 插画设计系统：SVG 帮助函数 + ILLS 注册表
// 章节 md 中写 <div class="ill" data-ill="名字"></div>，渲染时由 app.js 挂载
// 约定：viewBox 900 宽为标准；颜色读 CSS 变量（暗色模式自动适配）；中文标注；emoji 允许用于漫画拟人
(function () {
  var NS = "http://www.w3.org/2000/svg";

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }

  // 创建响应式 SVG 画布，返回一组绘图帮助函数
  function svgHost(el, vw, vh) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + vw + " " + vh);
    el.appendChild(svg);
    var ink, dim, accent, line, soft, paper;
    function colors() {
      ink = cssVar("--ink"); dim = cssVar("--dim"); accent = cssVar("--accent");
      line = cssVar("--line"); soft = cssVar("--accent-soft"); paper = cssVar("--paper");
    }
    colors();
    function mk(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function draw() { colors(); }
    return {
      svg: svg, mk: mk, redraw: draw,
      get c() { return { ink: ink, dim: dim, accent: accent, line: line, soft: soft, paper: paper }; },
      text: function (x, y, str, opts) {
        opts = opts || {};
        var t = mk("text", { x: x, y: y, fill: opts.fill || ink,
          "font-size": opts.size || 20, "font-family": "'Noto Sans SC Book',system-ui,sans-serif",
          "font-weight": opts.weight || "normal", "text-anchor": opts.anchor || "start" });
        if (opts.rotate) t.setAttribute("transform", "rotate(" + opts.rotate + " " + x + " " + y + ")");
        t.textContent = str;
        return t;
      },
      rect: function (x, y, w, h, opts) {
        opts = opts || {};
        var r = mk("rect", { x: x, y: y, width: w, height: h, rx: opts.rx == null ? 8 : opts.rx,
          fill: opts.fill || "none", stroke: opts.stroke || line, "stroke-width": opts.sw || 1.5 });
        if (opts.dash) r.setAttribute("stroke-dasharray", opts.dash);
        if (opts.opacity != null) r.setAttribute("opacity", opts.opacity);
        return r;
      },
      circle: function (cx, cy, r, opts) {
        opts = opts || {};
        return mk("circle", { cx: cx, cy: cy, r: r, fill: opts.fill || "none", stroke: opts.stroke || line, "stroke-width": opts.sw || 1.5 });
      },
      line: function (x1, y1, x2, y2, opts) {
        opts = opts || {};
        var l = mk("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: opts.stroke || line, "stroke-width": opts.sw || 1.5 });
        if (opts.dash) l.setAttribute("stroke-dasharray", opts.dash);
        return l;
      },
      path: function (d, opts) {
        opts = opts || {};
        var p = mk("path", { d: d, fill: opts.fill || "none", stroke: opts.stroke || ink, "stroke-width": opts.sw || 2 });
        if (opts.dash) p.setAttribute("stroke-dasharray", opts.dash);
        if (opts.marker) p.setAttribute("marker-end", "url(#" + opts.marker + ")");
        return p;
      },
      arrow: null, // 已由 connect() 覆盖
      // 带箭头的连线
      connect: function (x1, y1, x2, y2, opts) {
        opts = opts || {};
        var id = "ah" + Math.random().toString(36).slice(2, 7);
        var defs = mk("defs", {});
        var m = mk("marker", { id: id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" }, defs);
        mk("path", { d: "M0,0 L10,5 L0,10 z", fill: opts.stroke || dim }, m);
        return mk("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: opts.stroke || dim, "stroke-width": opts.sw || 2, "marker-end": "url(#" + id + ")" });
      },
      // 对话气泡
      bubble: function (x, y, w, h, str, opts) {
        opts = opts || {};
        this.rect(x, y, w, h, { fill: opts.fill || soft, stroke: opts.stroke || accent, rx: 12 });
        var lines = str.split("\n");
        var self = this;
        lines.forEach(function (s, i) {
          self.text(x + w / 2, y + 26 + i * 26, s, { anchor: "middle", fill: opts.tfill || ink, size: opts.size || 19, weight: opts.weight });
        });
      }
    };
  }

  // 漫画小人：圆头表情 + 身体方块 + 名牌
  function worker(H, x, y, w, h, face, name, opts) {
    opts = opts || {};
    H.rect(x, y, w, h, { fill: opts.fill || H.c.soft, stroke: opts.stroke || H.c.line, rx: 10 });
    H.text(x + w / 2, y + h / 2 + 8, face, { anchor: "middle", size: 30 });
    H.text(x + w / 2, y + h + 20, name, { anchor: "middle", size: 15, fill: opts.nfill || H.c.dim });
  }

  var ILLS = {};

  // ============ 1. 稠密 vs MoE：全员到岗 vs 按需叫号（漫画，v1/09）============
  ILLS["dense-vs-moe-comic"] = function (el) {
    var H = svgHost(el, 900, 420);
    // 左：稠密 = 全员到岗
    H.text(210, 30, "稠密模型：全员到岗", { anchor: "middle", size: 22, weight: "bold" });
    H.bubble(60, 50, 300, 34, "每个 token 来了，全班 8 个人都得动！", { size: 16, fill: H.c.paper, stroke: H.c.line, tfill: H.c.dim });
    for (var i = 0; i < 8; i++) {
      worker(H, 40 + i * 45, 120, 38, 46, "🥵", "专家" + (i + 1), { stroke: H.c.accent });
      H.connect(210, 105, 59 + i * 45, 118, { stroke: H.c.accent, sw: 1.2 });
    }
    H.text(210, 215, "8/8 全在算 · 质量稳 · 电费也稳", { anchor: "middle", size: 16, fill: H.c.dim });
    H.rect(40, 235, 340, 44, { fill: H.c.soft, stroke: H.c.accent });
    H.text(210, 263, "27B 稠密 = 27B 个参数每次全参与", { anchor: "middle", size: 17 });
    // 右：MoE = 按需叫号
    H.text(660, 30, "MoE：按需叫号", { anchor: "middle", size: 22, weight: "bold" });
    H.bubble(510, 50, 300, 34, "路由器看一眼 token：叫 2 号和 5 号！其余歇着", { size: 16, fill: H.c.paper, stroke: H.c.line, tfill: H.c.dim });
    var on = { 1: 1, 4: 1 };
    for (var j = 0; j < 8; j++) {
      var awake = !!on[j];
      worker(H, 490 + j * 45, 120, 38, 46, awake ? "💪" : "😴", "专家" + (j + 1),
        awake ? { stroke: H.c.accent } : { stroke: H.c.line, fill: H.c.paper });
      if (awake) H.connect(660, 105, 509 + j * 45, 118, { stroke: H.c.accent, sw: 1.2 });
    }
    H.text(660, 215, "只有被叫号的 2/8 在算 · 知识多 · 算得少", { anchor: "middle", size: 16, fill: H.c.dim });
    H.rect(490, 235, 340, 60, { fill: H.c.soft, stroke: H.c.accent });
    H.text(660, 262, "Qwen3-30B-A3B：30B 个参数（全班）", { anchor: "middle", size: 17 });
    H.text(660, 286, "每步只激活 3B（到岗 2 人）", { anchor: "middle", size: 17, fill: H.c.accent, weight: "bold" });
    H.text(450, 340, "所以 MoE：总参数大 → 懂得多；激活参数小 → 跑得快。代价：没被叫号的专家也得住在显存里待命（吃显存不吃算力）",
      { anchor: "middle", size: 16, fill: H.c.dim });
  };

  // ============ 2. 总参数 vs 激活参数（条形图，v1/09）============
  ILLS["params-total-vs-active"] = function (el) {
    var H = svgHost(el, 900, 330);
    H.text(20, 28, "同样一步推理，需要「算」的参数差了几倍到几十倍：", { size: 19, fill: H.c.dim });
    var rows = [
      ["Qwen3-30B-A3B（MoE）", 30, 3],
      ["千问 27B（稠密）", 27, 27],
      ["200B 级 MoE（如 V4 Flash）", 200, 10],
    ];
    var y = 60, maxV = 200, W = 560;
    rows.forEach(function (r) {
      H.text(20, y + 20, r[0], { size: 18 });
      var scale = function (v) { return v / maxV * W; };
      H.rect(300, y + 4, scale(r[1]), 16, { fill: H.c.soft, stroke: H.c.line });
      H.text(300 + scale(r[1]) + 8, y + 18, "总参 " + r[1] + "B", { size: 15, fill: H.c.dim });
      H.rect(300, y + 26, Math.max(3, scale(r[2])), 16, { fill: H.c.accent });
      H.text(300 + Math.max(3, scale(r[2])) + 8, y + 40, "每步激活 " + r[2] + "B", { size: 15, fill: H.c.accent, weight: "bold" });
      y += 62;
    });
    H.text(300, y + 18, "浅色 = 参数都得住进显存（容量账）　绿色 = 每步真正参与计算的（算力账）", { size: 15, fill: H.c.dim });
    H.text(20, y + 48, "稠密模型两根条一样长：全员到岗；MoE 两根条差距越大 → 越适合显存大、算力小的设备（如统一内存主机）", { size: 16 });
  };

  // ============ 3. 幻觉率 vs 量化档位（折线图，v2/06）============
  ILLS["hallucination-vs-quant"] = function (el) {
    var H = svgHost(el, 900, 360);
    var x0 = 90, y0 = 290, W = 700, Hh = 220;
    // 坐标轴
    H.connect(x0, y0, x0 + W + 20, y0, { stroke: H.c.dim });
    H.connect(x0, y0, x0, y0 - Hh - 20, { stroke: H.c.dim });
    H.text(x0 + W / 2, y0 + 40, "量化档位：越往右压得越狠（文件越小）", { anchor: "middle", size: 17, fill: H.c.dim });
    var labels = ["FP16", "Q8", "Q4_K_M", "IQ3", "IQ2", "IQ1"];
    labels.forEach(function (s, i) { H.text(x0 + 40 + i * (W - 80) / 5, y0 + 22, s, { anchor: "middle", size: 17 }); });
    H.text(28, y0 - Hh / 2, "幻觉 / 质量劣化", { size: 17, fill: H.c.dim, rotate: -90 });
    // 折线（示意趋势：低档位平坦，IQ 段陡增）
    var pts = [12, 16, 30, 62, 120, 190];
    var d = pts.map(function (p, i) {
      var px = x0 + 40 + i * (W - 80) / 5, py = y0 - p;
      return (i ? "L" : "M") + px + "," + py;
    }).join(" ");
    pts.forEach(function (p, i) {
      var px = x0 + 40 + i * (W - 80) / 5, py = y0 - p;
      H.circle(px, py, 5, { fill: i >= 3 ? "#c25b4e" : H.c.accent, stroke: "none" });
      H.text(px, py - 14, ["几乎无感", "略有", "可感知", "明显", "严重", "不可用"][i], { anchor: "middle", size: 14, fill: i >= 3 ? "#c25b4e" : H.c.dim });
    });
    H.path(d, { stroke: H.c.accent, sw: 3 });
    // ponytail: 曲线为趋势示意，非某模型实测；实际劣化因模型/任务而异
    H.text(20, 30, "定性趋势示意：Q4_K_M 之前几乎白拿的省显存，IQ 段开始用质量换体积（真实曲线因模型而异）", { size: 16, fill: H.c.dim });
    H.text(x0 + 40 + 3 * (W - 80) / 5, y0 - 200, "文档问答还行，", { size: 16, fill: "#c25b4e" });
    H.text(x0 + 40 + 3 * (W - 80) / 5, y0 - 178, "数学和代码先崩", { size: 16, fill: "#c25b4e" });
  };

  // ============ 4. Qwen 完整架构图（含 n-gram 外挂，v1/09 或 v5/05）============
  ILLS["qwen-arch-ngram"] = function (el) {
    var H = svgHost(el, 900, 560);
    H.text(450, 26, "一个现代 MoE 大模型的全貌（以 Qwen 系 176B Flash 为例）", { anchor: "middle", size: 20, weight: "bold" });
    // 自下而上的数据流
    var cx = 320;
    H.rect(cx - 130, 480, 260, 44, { fill: H.c.soft, stroke: H.c.accent });
    H.text(cx, 507, "输入 token（词表映射出向量）", { anchor: "middle", size: 17 });
    H.connect(cx, 478, cx, 452, { stroke: H.c.dim });
    // 64 层堆叠
    H.rect(cx - 170, 210, 340, 240, { fill: "none", stroke: H.c.accent, dash: "6 4" });
    H.text(cx, 236, "× 64 层（每层结构相同，逐层串行）", { anchor: "middle", size: 16, fill: H.c.dim });
    // 单层内部
    H.rect(cx - 140, 385, 280, 46, { fill: H.c.paper, stroke: H.c.line });
    H.text(cx, 413, "注意力层：每个 token 看历史（KV 缓存在这产生）", { anchor: "middle", size: 15 });
    H.connect(cx, 383, cx, 358, { stroke: H.c.dim });
    H.rect(cx - 140, 300, 280, 56, { fill: H.c.paper, stroke: H.c.accent });
    H.text(cx, 323, "MoE 层（FFN 拆成 N 个专家）：", { anchor: "middle", size: 15 });
    H.text(cx, 345, "路由器叫号 → 只算被选中的 2~8 个", { anchor: "middle", size: 15, fill: H.c.accent });
    H.connect(cx, 298, cx, 268, { stroke: H.c.dim });
    H.rect(cx - 140, 246, 280, 22, { fill: "none", stroke: H.c.line });
    H.text(cx, 262, "（残差与归一化：把每层结果稳妥地累加回去）", { anchor: "middle", size: 13, fill: H.c.dim });
    H.connect(cx, 208, cx, 182, { stroke: H.c.dim });
    H.rect(cx - 150, 138, 300, 44, { fill: H.c.soft, stroke: H.c.accent });
    H.text(cx, 165, "输出层：算出下一个 token 的概率", { anchor: "middle", size: 17 });
    // 右侧：n-gram 大表外挂
    H.rect(640, 240, 230, 120, { fill: H.c.paper, stroke: "#b8860b", dash: "6 4" });
    H.text(755, 270, "n-gram 查询表", { anchor: "middle", size: 18, weight: "bold", fill: "#b8860b" });
    H.text(755, 296, "「最近 n 个 token → 下一个」", { anchor: "middle", size: 14 });
    H.text(755, 318, "的统计大表（约 51G）", { anchor: "middle", size: 14 });
    H.text(755, 342, "查表代替计算 → 放慢介质也行", { anchor: "middle", size: 14, fill: H.c.dim });
    H.connect(640, 300, 472, 300, { stroke: "#b8860b", dash: "5 4" });
    H.text(556, 288, "外挂查表", { anchor: "middle", size: 14, fill: "#b8860b" });
    // 存放位置标注
    H.text(755, 385, "📦 主模型权重 → 显存", { size: 16 });
    H.text(755, 410, "💽 n-gram 表 → 内存/U盘 按需读", { size: 16 });
    H.text(755, 435, "（低频访问才扛得住慢介质）", { size: 14, fill: H.c.dim });
    H.text(20, 530, "读法：token 自下而上穿完 64 层得到概率；MoE 层是「省算力」的关键，n-gram 表是「省计算」的外挂——这就是 176B 能在几张老卡上跑的结构原因。",
      { size: 15, fill: H.c.dim });
  };

  // ============ 5. 一圈接龙：自回归生成循环（流程图，v1/02）============
  ILLS["autoregressive-loop"] = function (el) {
    var H = svgHost(el, 900, 470);
    function box(x, y, w, h, title, sub, stroke) {
      H.rect(x, y, w, h, { fill: H.c.paper, stroke: stroke || H.c.accent, sw: 2 });
      H.text(x + w / 2, y + 30, title, { anchor: "middle", size: 19, weight: "bold" });
      if (sub) H.text(x + w / 2, y + 58, sub, { anchor: "middle", size: 14, fill: H.c.dim });
    }
    box(20, 50, 250, 70, "① 当前句尾", "「中国的首都是」");
    box(330, 40, 250, 95, "② 整只模型跑一遍前向", "千问主模型 64 层逐层串行");
    // 64 层小格堆叠示意
    for (var i = 0; i < 8; i++) H.rect(360, 108 - i * 7, 190, 5, { fill: i < 3 ? H.c.accent : H.c.line, stroke: "none", rx: 2 });
    box(640, 40, 240, 95, "③ logits", "词表十几万条各打一个分");
    for (var k = 0; k < 14; k++) H.rect(662 + k * 15, 96, 12, k < 3 ? 28 : 8, { fill: k < 3 ? H.c.accent : H.c.line, stroke: "none", rx: 2 });
    H.connect(272, 85, 326, 85); H.connect(582, 85, 636, 85);
    // softmax 三柱
    box(640, 240, 240, 120, "④ softmax", "赢家多吃，总和 = 1");
    var bars = [["北京", 70, H.c.accent], ["上海", 20, "#b8860b"], ["天津", 3, H.c.line]];
    bars.forEach(function (b, i) {
      var bx = 665 + i * 72;
      H.rect(bx, 355 - b[1], 34, b[1], { fill: b[2], stroke: "none", rx: 3 });
      H.text(bx + 17, 372, b[0] + " " + b[1] + "%", { anchor: "middle", size: 13 });
    });
    // 采样
    box(330, 240, 250, 120, "⑤ 采样（抽签）", "按概率抽一个当赢家");
    H.circle(455, 330, 32, { stroke: H.c.accent, sw: 2 });
    H.line(455, 330, 476, 306, { stroke: "#c25b4e", sw: 3 });
    H.text(455, 345, "北京！", { anchor: "middle", size: 14, fill: H.c.accent, weight: "bold" });
    H.connect(636, 300, 584, 300);
    // 出局框
    H.rect(20, 240, 250, 120, { fill: H.c.paper, stroke: H.c.line, dash: "5 4" });
    H.text(145, 275, "上海、天津…出局", { anchor: "middle", size: 17, fill: H.c.dim });
    H.text(145, 300, "（这一圈没被抽中就永远错过）", { anchor: "middle", size: 13, fill: H.c.dim });
    H.text(145, 330, "早期抽歪一次，", { anchor: "middle", size: 14, fill: "#c25b4e" });
    H.text(145, 350, "整段都会被带偏", { anchor: "middle", size: 14, fill: "#c25b4e" });
    // 回环
    H.path("M455,362 L455,412 L145,412 L145,368", { stroke: H.c.accent, sw: 2.5 });
    H.path("M145,368 L141,378 L149,378 Z", { fill: H.c.accent, stroke: "none" });
    H.text(300, 405, "拼回句尾：「中国的首都是北京」→ 回到 ② 再来一圈，直到吐出结束符", { size: 15, fill: H.c.accent });
    H.text(450, 448, "一圈 = 完整跑 64 层一遍 → 天生串行；这就是 Decode 慢、KV 缓存和投机解码存在的根源", { anchor: "middle", size: 16, weight: "bold" });
  };

  // ============ 6. 三种注意力的 KV 增长曲线（折线图，v1/06）============
  ILLS["kv-growth-curves"] = function (el) {
    var H = svgHost(el, 900, 430);
    var x0 = 90, y0 = 350, W = 740, Hh = 280, maxY = 20; // G
    H.connect(x0, y0, x0 + W + 30, y0, { stroke: H.c.dim });
    H.connect(x0, y0, x0, y0 - Hh - 10, { stroke: H.c.dim });
    [0, 64, 128, 192, 256].forEach(function (t) {
      var px = x0 + t / 256 * W;
      H.text(px, y0 + 24, t ? t + "K" : "0", { anchor: "middle", size: 15, fill: H.c.dim });
    });
    [0, 5, 10, 15, 20].forEach(function (g) {
      H.text(x0 - 12, y0 - g / maxY * Hh + 5, g + "G", { anchor: "end", size: 15, fill: H.c.dim });
    });
    H.text(x0 + W / 2, y0 + 52, "序列长度（上下文 token 数）", { anchor: "middle", size: 16, fill: H.c.dim });
    function y(v) { return y0 - v / maxY * Hh; }
    function x(t) { return x0 + t / 256 * W; }
    // naive 虚线（出画）
    H.line(x(0), y(0), x(80), y0 - Hh, { stroke: H.c.dim, dash: "6 5", sw: 2 });
    H.text(x(96), y0 - Hh + 6, "naive 误算：64 层全算 = 64G", { size: 15, fill: H.c.dim });
    H.text(x(96), y0 - Hh + 26, "（超出本图 4 倍，v1/05 教的粗账）", { size: 13, fill: H.c.dim });
    // 全注意力
    H.line(x(0), y(0), x(256), y(16), { stroke: "#2b6cb0", sw: 3 });
    H.circle(x(256), y(16), 5, { fill: "#2b6cb0", stroke: "none" });
    H.text(x(256) - 10, y(16) - 14, "全注意力 16 层：线性涨到 16G", { size: 16, fill: "#2b6cb0", weight: "bold" });
    // 滑窗
    H.path("M" + x(0) + "," + y(0) + " L" + x(4) + "," + y(0.8) + " L" + x(256) + "," + y(0.8), { stroke: "#b8860b", sw: 3 });
    H.text(x(180), y(0.8) + 26, "滑动窗口 1024（Gemma 50 层）：封顶 ≈ 0.8G，不再涨", { size: 16, fill: "#b8860b" });
    // GDN
    H.line(x(0), y(0.1), x(256), y(0.1), { stroke: "#0f8a5f", sw: 3 });
    H.text(x(60), y(0.1) - 12, "线性 / GDN（千问 48 层）：≈ 0.1G 恒定，与长度无关", { size: 16, fill: "#0f8a5f" });
    H.text(20, 26, "同一句 256K 上下文，三种「记笔记」方式的 KV 账本（千问 27B / Gemma 数据，修正后口径）", { size: 16, fill: H.c.dim });
    H.text(450, 415, "长上下文的显存焦虑几乎全部来自全注意力层——后两种是「定长开销」，这就是 Layer type 字段值钱的原因", { anchor: "middle", size: 15 });
  };

  // ============ 7. 四种精度的位段解剖图（架构图，v2/01）============
  ILLS["fp-bit-layout"] = function (el) {
    var H = svgHost(el, 900, 470);
    var U = 24, X = 60;
    var SIGN = "#c25b4e", EXP = "#2b6cb0", MAN = "#0f8a5f";
    function bar(y, name, s, e, m, note, bytes) {
      var total = s + e + m;
      H.text(X, y - 12, name, { size: 18, weight: "bold" });
      var segs = [[s, SIGN, "符"], [e, EXP, "指"], [m, MAN, "尾"]];
      var cx = X;
      segs.forEach(function (g) {
        H.rect(cx, y, g[0] * U, 26, { fill: g[1], opacity: 0.8, stroke: H.c.paper, rx: 0 });
        if (g[0] >= 3) H.text(cx + g[0] * U / 2, y + 18, String(g[0]), { anchor: "middle", size: 14, fill: "#fff", weight: "bold" });
        cx += g[0] * U;
      });
      H.text(X + total * U + 14, y + 18, bytes + "字节", { size: 14, fill: H.c.dim });
      H.text(X, y + 46, note, { size: 14, fill: H.c.dim });
      return { expX: X + s * U, expW: e * U, totalW: total * U };
    }
    H.text(20, 26, "把一个浮点数的 32/16/19 个位摊开看：红=符号，蓝=指数（能多大），绿=尾数（多精细）", { size: 16, fill: H.c.dim });
    var f32 = bar(70, "FP32 单精度", 1, 8, 23, "偏置 127 · 范围 ±3.4e38 · 精度约 7 位十进制", 4);
    var f16 = bar(170, "FP16 半精度", 1, 5, 10, "范围 ±65504（再大溢出成 inf）· 精度约 3 位十进制", 2);
    var bf16 = bar(270, "BF16", 1, 8, 7, "训练专用：范围与 FP32 同款，精度换得更狠", 2);
    var tf32 = bar(370, "TF32（安培，Tensor Core 内部格式）", 1, 8, 10, "数据按 FP32 进出，内部把 23 位尾数截到 10 位再乘加", 4);
    // 指数对齐标注
    H.line(f32.expX, 100, f32.expX, 270, { stroke: EXP, dash: "4 4" });
    H.line(f32.expX + f32.expW, 100, f32.expX + f32.expW, 270, { stroke: EXP, dash: "4 4" });
    H.text(f32.expX + f32.expW / 2, 292, "↑ BF16 / TF32 的指数同为 8 位：动态范围一点不丢，砍的只是尾数", { size: 15, fill: EXP });
    H.text(f16.expX + 60, 145, "指数只剩 5 位 → 范围也砍了", { size: 14, fill: EXP });
    H.rect(20, 420, 860, 36, { fill: H.c.soft, stroke: H.c.accent });
    H.text(450, 444, "位宽预算有限：指数（能多大）与尾数（多精细）一对此消彼长——这是全章所有格式分歧的钥匙", { anchor: "middle", size: 16 });
  };

  // ============ 8. FP8 与 NVFP4 的格子账（架构图，v2/02）============
  ILLS["fp8-nvfp4-blocks"] = function (el) {
    var H = svgHost(el, 900, 470);
    var SIGN = "#c25b4e", EXP = "#2b6cb0", MAN = "#0f8a5f", U = 34;
    H.text(20, 26, "FP8 的 8 位怎么分：E4M3 与 E5M2 是同一预算的两种花法", { size: 17, weight: "bold" });
    function f8(y, s, e, m, label) {
      var cx = 40;
      [[s, SIGN], [e, EXP], [m, MAN]].forEach(function (g) {
        H.rect(cx, y, g[0] * U, 30, { fill: g[1], opacity: 0.8, stroke: H.c.paper });
        H.text(cx + g[0] * U / 2, y + 20, String(g[0]), { anchor: "middle", size: 15, fill: "#fff", weight: "bold" });
        cx += g[0] * U;
      });
      H.text(40 + 8 * U + 16, y + 21, label, { size: 15 });
    }
    f8(50, 1, 4, 3, "E4M3：最大约 ±448 · 格子密、范围窄 → 权重与前向默认用它");
    f8(100, 1, 5, 2, "E5M2：最大约 ±57344 · 范围宽、格子稀 → 数值波动大的场合");
    H.path("M" + (40 + 5 * U) + ",88 C" + (40 + 6 * U) + ",76 " + (40 + 5 * U) + ",76 " + (40 + 5 * U - 8) + ",76", { stroke: H.c.dim, sw: 1.5 });
    H.text(40 + 8 * U + 16, 88, "↔ 预算就 8 位：指数多一位，尾数就得少一位", { size: 14, fill: H.c.dim });
    // NVFP4
    H.text(20, 180, "NVFP4 更狠：只剩 16 个刻度，靠两层缩放找补动态范围", { size: 17, weight: "bold" });
    var vals = [12, 20, 15, 18, 90, 16, 14, 19, 13, 17, 15, 18, 12, 16, 20, 14];
    vals.forEach(function (v, i) {
      var isOut = i === 4;
      H.rect(40 + i * 34, 210 + (60 - v) / 2, 28, isOut ? v + 10 : v, { fill: isOut ? "#c25b4e" : H.c.accent, opacity: isOut ? 0.95 : 0.55, rx: 3 });
    });
    H.text(40 + 4 * 34 + 14, 200, "↑ 一个异常大的值", { anchor: "middle", size: 14, fill: "#c25b4e" });
    H.rect(34, 268, 16 * 34 + 12, 40, { stroke: "#b8860b", dash: "5 4" });
    H.text(40 + 8 * 34, 294, "block scale：每 16 个数共享 1 个 FP8 缩放值（托盘）", { anchor: "middle", size: 15, fill: "#b8860b" });
    H.rect(24, 258, 16 * 34 + 32, 62, { stroke: H.c.dim, dash: "3 4" });
    H.text(40 + 8 * 34, 348, "tensor scale：全部数组再共用 1 个（外框）", { size: 15, fill: H.c.dim });
    H.text(20, 392, "换来的账：同一个 27B 模型——FP16 ≈ 54G → FP8 ≈ 27G → FP4 ≈ 13.5G，装得下的模型翻倍再翻倍", { size: 16 });
    H.text(20, 424, "代价：FP4 只有 16 个刻度，格距粗；缩放只保证「数值大的地方刻度也大」，精度仍让步（见幻觉曲线）", { size: 15, fill: H.c.dim });
    H.text(20, 456, "硬件注：FP8 原生加速从 Ada（40 系）起，NVFP4 是 Blackwell（50 系）特性；老卡靠软件模拟（见架构代际）", { size: 14, fill: H.c.dim });
  };

  // ============ 9. 量化体积阶梯（条形图，v2/03）============
  ILLS["quant-size-ladder"] = function (el) {
    var H = svgHost(el, 900, 340);
    var rows = [["FP16 原精度", 54, "#2b6cb0"], ["Q8（约 8.5bit）", 29, H.c.accent], ["Q4_K_M（约 4.8bit）", 16.5, H.c.accent], ["IQ3（约 3.3bit）", 12, "#b8860b"], ["IQ1_S（约 1.6bit）", 8, "#c25b4e"]];
    var y = 46;
    rows.forEach(function (r) {
      H.text(20, y + 16, r[0], { size: 16 });
      H.rect(190, y, r[1] / 54 * 560, 24, { fill: r[2], opacity: 0.75, rx: 4 });
      H.text(190 + r[1] / 54 * 560 + 10, y + 18, r[1] + "G", { size: 15, weight: "bold" });
      y += 46;
    });
    H.text(190, y + 6, "27B 级模型的理论下限口径；Q4_K_M 是文件口径（16.5G），AWQ 实测 20 多 G（见显存三本账）", { size: 14, fill: H.c.dim });
    H.text(20, 26, "同一个 27B 的「体重」：每下一档省一截显存", { size: 17, weight: "bold" });
    H.text(190 + 12 / 54 * 560, y - 40 - 46 - 8, "⚠ 从这档起质量明显让步", { size: 14, fill: "#c25b4e" });
    H.text(20, 326, "绿=放心用；黄/红=开始用质量换体积（搭配幻觉曲线食用）", { size: 14, fill: H.c.dim });
  };

  // ============ 10. 存小格子算大格子（流程图，v2/04）============
  ILLS["weight-only-flow"] = function (el) {
    var H = svgHost(el, 900, 300);
    H.text(450, 28, "W8A16 / W4A16 的真相：存的是小格子，算的是大格子", { anchor: "middle", size: 18, weight: "bold" });
    // 权重仓
    H.rect(30, 70, 220, 110, { fill: H.c.soft, stroke: H.c.accent });
    H.text(140, 96, "显存里住着：INT4 小格子", { anchor: "middle", size: 16 });
    for (var i = 0; i < 10; i++) H.rect(50 + (i % 5) * 38, 112 + Math.floor(i / 5) * 30, 30, 22, { fill: H.c.accent, opacity: 0.45, rx: 3 }), H.text(65 + (i % 5) * 38, 128 + Math.floor(i / 5) * 30, "4", { anchor: "middle", size: 13 });
    H.connect(258, 125, 330, 125); H.text(294, 112, "读到寄存器时", { anchor: "middle", size: 14, fill: H.c.dim });
    H.rect(338, 70, 220, 110, { fill: H.c.paper, stroke: "#2b6cb0" });
    H.text(448, 96, "反量化：展开成 FP16", { anchor: "middle", size: 16 });
    H.rect(390, 112, 116, 52, { fill: "#2b6cb0", opacity: 0.35, rx: 4 });
    H.text(448, 144, "16bit 大格子", { anchor: "middle", size: 14 });
    H.connect(566, 125, 638, 125); H.text(602, 112, "再参与矩阵乘", { anchor: "middle", size: 14, fill: H.c.dim });
    H.rect(646, 70, 224, 110, { fill: H.c.paper, stroke: H.c.line });
    H.text(758, 100, "Y = A × W", { anchor: "middle", size: 20, weight: "bold" });
    H.text(758, 130, "乘加仍然是半精度（FP16）", { anchor: "middle", size: 14, fill: H.c.dim });
    H.text(758, 154, "——不是用 4bit 在算", { anchor: "middle", size: 14, fill: "#c25b4e" });
    H.text(450, 230, "所以叫 weight-only（仅权重量化）：省的是「存」和「搬」，不是「算」。", { anchor: "middle", size: 16 });
    H.text(450, 262, "推论：说某卡「支持 INT4 权重」≠「以 INT4 精度运算」——老图灵跑 FP8/INT4 靠的就是这套软件把戏", { anchor: "middle", size: 15, fill: H.c.dim });
  };

  // ============ 11. 异常值漫画（对比，v2/05）============
  ILLS["outlier-comic"] = function (el) {
    var H = svgHost(el, 900, 400);
    var vals = [12, 20, 15, 10, 95, 18, 12, 16]; // 95 为巨人
    function cells(x, y, scaleMax, title, note, color) {
      H.text(x, y - 14, title, { size: 17, weight: "bold" });
      vals.forEach(function (v, i) {
        var h = Math.max(3, v / scaleMax * 90);
        H.rect(x + i * 48, y + 100 - h, 38, h, { fill: i === 4 ? "#c25b4e" : color, opacity: i === 4 ? 0.95 : 0.6, rx: 3 });
        H.text(x + i * 48 + 19, y + 120, v, { anchor: "middle", size: 13, fill: i === 4 ? "#c25b4e" : H.c.dim });
      });
      H.line(x - 6, y + 100, x + 8 * 48, y + 100, { stroke: H.c.dim });
      H.text(x, y + 150, note, { size: 14, fill: H.c.dim });
    }
    H.text(450, 26, "量化粒度：全班共用一把尺子，还是每行自己的尺子？", { anchor: "middle", size: 18, weight: "bold" });
    cells(60, 80, 95, "per-tensor：全组一把尺", "巨人把最大值拉到 95 → 其他数全被挤成矮子（量化误差拉满）", H.c.accent);
    cells(490, 80, 25, "per-channel / per-group：每行一把尺", "巨人的行单独放大，其他人用自己的刻度 → 大家都保住精度", H.c.accent);
    H.line(450, 60, 450, 300, { stroke: H.c.line });
    H.rect(30, 310, 840, 60, { fill: H.c.soft, stroke: H.c.accent });
    H.text(450, 336, "粒度越细精度越好，但缩放因子本身也要占显存、也要搬——Marlin 内核的功夫就是把这套细粒度缩放的额外开销做到几乎免费", { anchor: "middle", size: 15 });
    H.text(450, 358, "（实测约 3% 的 scale 开销，换回的是整个 INT4/AWQ 路线可用）", { anchor: "middle", size: 14, fill: H.c.dim });
  };

  // ============ 12. 并发双曲线（折线图，v3/01）============
  ILLS["concurrency-curves"] = function (el) {
    var H = svgHost(el, 900, 400);
    var x0 = 90, y0 = 320, W = 720, Hh = 250;
    H.connect(x0, y0, x0 + W + 20, y0, { stroke: H.c.dim });
    H.connect(x0, y0, x0, 40, { stroke: H.c.dim });
    [1, 4, 8, 16, 32].forEach(function (c) {
      var px = x0 + Math.log2(c) / 5 * W;
      H.text(px, y0 + 24, c + "路", { anchor: "middle", size: 15, fill: H.c.dim });
    });
    H.text(x0 + W / 2, y0 + 52, "并发数（对数刻度）", { anchor: "middle", size: 16, fill: H.c.dim });
    H.text(30, 34, "tok/s", { size: 15, fill: H.c.dim });
    // 总吞吐：饱和上升
    var pts = [];
    for (var i = 0; i <= 5; i++) {
      var c = i, v = 100 * (c / (c + 1.2)) * 2.2; // ponytail: 示意饱和曲线
      pts.push([x0 + i / 5 * W, y0 - v / 220 * Hh]);
    }
    H.path("M" + pts.map(function (p) { return p[0] + "," + p[1]; }).join(" L"), { stroke: H.c.accent, sw: 3 });
    H.text(pts[5][0] - 90, pts[5][1] - 16, "总吞吐：涨但渐饱和", { size: 16, fill: H.c.accent, weight: "bold" });
    // 单路：下降
    var pts2 = [];
    for (var j = 0; j <= 5; j++) {
      var v2 = 100 / (j + 1) * 1.6 + 12;
      pts2.push([x0 + j / 5 * W, y0 - v2 / 220 * Hh]);
    }
    H.path("M" + pts2.map(function (p) { return p[0] + "," + p[1]; }).join(" L"), { stroke: "#c25b4e", sw: 3, dash: "7 4" });
    H.text(pts2[4][0] - 40, pts2[4][1] - 16, "你自己那一路的速度：越拼越慢", { size: 16, fill: "#c25b4e" });
    H.text(450, 380, "个人 batch=1 在最左端（速度最优）；服务器把右上角的饱和区卖给很多用户——两张图讲清楚「你是谁」决定看哪条线", { anchor: "middle", size: 15, fill: H.c.dim });
  };

  // ============ 13. 推理框架生态地图（谱系图，v3/02）============
  ILLS["framework-map"] = function (el) {
    var H = svgHost(el, 900, 440);
    H.text(450, 28, "推理框架两流派 + 三朵旁支", { anchor: "middle", size: 19, weight: "bold" });
    // 左：llama.cpp 系
    H.rect(30, 60, 390, 200, { stroke: H.c.accent, dash: "6 4" });
    H.text(225, 88, "端侧 / 桌面派（llama.cpp 系）", { anchor: "middle", size: 17, weight: "bold", fill: H.c.accent });
    [["llama.cpp", "引擎本体 · GGUF 格式 · 一把基准尺"], ["Ollama", "一键运行器"], ["LM Studio", "桌面图形界面"]].forEach(function (r, i) {
      H.rect(55, 105 + i * 50, 340, 40, { fill: H.c.soft, stroke: H.c.line });
      H.text(70, 130 + i * 50, r[0], { size: 16, weight: "bold" });
      H.text(230, 130 + i * 50, r[1], { size: 13, fill: H.c.dim });
    });
    // 右：服务级
    H.rect(480, 60, 390, 200, { stroke: "#2b6cb0", dash: "6 4" });
    H.text(675, 88, "服务级派（safetensors）", { anchor: "middle", size: 17, weight: "bold", fill: "#2b6cb0" });
    [["vLLM", "PagedAttention · 高并发标杆"], ["SGLang", "服务端新贵 · 投机解码友好"], ["TensorRT-LLM", "NVIDIA 官方极致优化"]].forEach(function (r, i) {
      H.rect(505, 105 + i * 50, 340, 40, { fill: "#2b6cb0", opacity: 0.12, stroke: H.c.line });
      H.text(520, 130 + i * 50, r[0], { size: 16, weight: "bold" });
      H.text(680, 130 + i * 50, r[1], { size: 13, fill: H.c.dim });
    });
    // 旁支
    [["Unsloth", "微调加速库（可导 GGUF）", 30], ["MLX", "Mac 芯片专属底座", 345], ["ComfyUI", "文生图工作流（AIGC 旁支）", 660]].forEach(function (r) {
      H.rect(r[2], 300, 210, 60, { fill: H.c.paper, stroke: H.c.line });
      H.text(r[2] + 105, 326, r[0], { anchor: "middle", size: 16, weight: "bold" });
      H.text(r[2] + 105, 348, r[1], { anchor: "middle", size: 12.5, fill: H.c.dim });
    });
    H.text(450, 400, "选法：个人自己玩 → 左边；要给多人提供服务 / 追求吞吐 → 右边；先跑起来再优化，别一开始就上重炮", { anchor: "middle", size: 15, fill: H.c.dim });
  };

  // ============ 14. 一次请求的旅程（泳道流程图，v1/01 + v3/08）============
  ILLS["request-journey"] = function (el) {
    var H = svgHost(el, 900, 380);
    H.text(450, 26, "一次请求的完整旅程：谁在干活", { anchor: "middle", size: 19, weight: "bold" });
    // 泳道
    H.rect(80, 50, 790, 70, { fill: "#2b6cb0", opacity: 0.08 });
    H.rect(80, 170, 790, 120, { fill: "#0f8a5f", opacity: 0.08 });
    H.text(20, 90, "CPU", { size: 18, weight: "bold", fill: "#2b6cb0" });
    H.text(20, 235, "GPU", { size: 18, weight: "bold", fill: "#0f8a5f" });
    function step(x, y, w, n, t, sub, color) {
      H.rect(x, y, w, 54, { fill: H.c.paper, stroke: color || H.c.line, sw: 2 });
      H.text(x + w / 2, y + 22, n + " " + t, { anchor: "middle", size: 15, weight: "bold" });
      if (sub) H.text(x + w / 2, y + 43, sub, { anchor: "middle", size: 12, fill: H.c.dim });
    }
    step(90, 58, 180, "①", "tokenize 查词表", "「你好」→[108386,…]", "#2b6cb0");
    step(300, 58, 150, "②", "排队调度", "等 GPU 空手", "#2b6cb0");
    step(480, 58, 170, "⑦", "detokenize 反查", "编号 → 文字流式给你", "#2b6cb0");
    step(680, 58, 180, "⑥", "采样：抽下一个词", "北京 70% → 抽中", "#2b6cb0");
    step(90, 185, 300, "③", "Prefill：整段并行过 64 层", "输入全部一次吞入，写 KV 缓存", "#0f8a5f");
    step(420, 185, 200, "④", "Decode：一次吐一个", "串行，每步跑全部层", "#0f8a5f");
    step(650, 185, 200, "⑤", "算 logits", "词表打分（回 CPU 采样）", "#0f8a5f");
    H.connect(272, 85, 298, 85); H.connect(452, 85, 478, 85);
    H.connect(240, 112, 240, 183); H.text(252, 152, "送进去", { size: 13, fill: H.c.dim });
    H.connect(392, 212, 418, 212); H.connect(592, 212, 618, 212);
    H.connect(650, 240, 770, 130); H.text(700, 168, "回 CPU 抽签", { size: 13, fill: H.c.dim });
    H.connect(770, 114, 520, 183); H.text(600, 150, "④↔⑤↔⑥ 循环到答完", { size: 13, fill: H.c.dim });
    H.connect(650, 100, 655, 100);
    H.text(450, 330, "CPU 干的全是轻活（个人场景合计几十毫秒）：真正的大头是 GPU 上的 ③④；", { anchor: "middle", size: 15, fill: H.c.dim });
    H.text(450, 356, "所以换一颗更强的 CPU，体感几乎不变——瓶颈永远在 token 数量和显存带宽上", { anchor: "middle", size: 15, fill: H.c.dim });
  };

  // ============ 15. 三层仓库与装载路线（层级图，v4/01）============
  ILLS["storage-3levels"] = function (el) {
    var H = svgHost(el, 900, 420);
    H.text(450, 26, "模型的三层仓库：快而小 → 大而慢", { anchor: "middle", size: 19, weight: "bold" });
    var rows = [
      ["显存 VRAM", "24~96G", "~1000 GB/s", "模型干活时必须常驻这里", H.c.accent, 120, 90],
      ["内存 RAM", "64~192G", "~100 GB/s", "放不下的权重、KV 溢出、CPU 的地盘", "#b8860b", 260, 200],
      ["硬盘 SSD/U盘", "1~2T", "1~3 GB/s", "模型仓库本体，启动时装载", H.c.dim, 400, 310],
    ];
    rows.forEach(function (r) {
      H.rect(120, r[5], 300, 74, { fill: r[4], opacity: 0.14, stroke: r[4], sw: 2 });
      H.text(140, r[5] + 28, r[0] + "（" + r[1] + "）", { size: 17, weight: "bold", fill: r[4] });
      H.text(140, r[5] + 52, "带宽 " + r[2], { size: 14, fill: H.c.dim });
      H.text(140, r[5] + 70, r[3], { size: 13, fill: H.c.dim });
    });
    H.connect(430, 135, 430, 235); H.text(444, 180, "装载 / 换入换出（慢 10 倍）", { size: 13, fill: H.c.dim });
    H.connect(430, 275, 430, 345); H.text(444, 312, "启动时装载（慢 100 倍）", { size: 13, fill: H.c.dim });
    // 右侧案例
    H.rect(580, 120, 290, 200, { fill: H.c.paper, stroke: H.c.line });
    H.text(725, 148, "为什么 96G 跑不从容 200B", { anchor: "middle", size: 16, weight: "bold" });
    H.text(600, 178, "· 200B FP16 权重 ≈ 400G → 装不进", { size: 14 });
    H.text(600, 202, "· 压到 IQ2 约 60G → 勉强塞进 96G，", { size: 14 });
    H.text(612, 224, "  但质量已经开始还债（见幻觉曲线）", { size: 14, fill: H.c.dim });
    H.text(600, 252, "· 「显存大 ≠ 快」：带宽决定吐字，", { size: 14 });
    H.text(612, 274, "  容量只决定装不装得下", { size: 14, fill: H.c.dim });
    H.text(600, 302, "· 真正的甜点：30B 档 × 24G 卡", { size: 14, fill: H.c.accent, weight: "bold" });
    H.text(450, 372, "判断口诀：先问「装得下吗」（容量账），再问「跑多快」（带宽账）——顺序反了就是智商税的开始", { anchor: "middle", size: 15, fill: H.c.dim });
    H.text(450, 400, "层级差约 10 倍带宽一档；这就是 offload 慢、统一内存省拷贝、U 盘只能放 n-gram 冷数据的同一根源", { anchor: "middle", size: 14, fill: H.c.dim });
  };

  // ============ 16. 吞字一车砖 vs 吐字一块砖（对比漫画，v4/03）============
  ILLS["prefill-decode-bricks"] = function (el) {
    var H = svgHost(el, 900, 350);
    H.text(450, 28, "为什么 Prefill 是算力的活、Decode 是带宽的活", { anchor: "middle", size: 18, weight: "bold" });
    // 左：prefill 卡车
    H.rect(30, 50, 400, 210, { fill: H.c.soft, stroke: H.c.accent });
    H.text(230, 80, "Prefill 吞字 = 一整车砖一次卸完", { anchor: "middle", size: 17, weight: "bold" });
    H.text(230, 112, "🚚📦📦📦📦📦📦📦", { anchor: "middle", size: 26 });
    H.text(230, 150, "几千个 token 并行一起算：", { anchor: "middle", size: 15 });
    H.text(230, 174, "每个权重读一次，几百个 token 摊", { anchor: "middle", size: 15 });
    H.text(230, 198, "→ 算得越快越好，卡算力（FLOPS）", { anchor: "middle", size: 15, fill: H.c.accent, weight: "bold" });
    H.rect(60, 215, 340, 30, { fill: H.c.paper, stroke: H.c.line });
    H.text(230, 236, "所以服务器宣传 Prefill 几千 tok/s", { anchor: "middle", size: 14, fill: H.c.dim });
    // 右：decode 搬运工
    H.rect(470, 50, 400, 210, { fill: H.c.paper, stroke: "#c25b4e" });
    H.text(670, 80, "Decode 吐字 = 一块一块搬", { anchor: "middle", size: 17, weight: "bold", fill: "#c25b4e" });
    H.text(670, 112, "👷🧱 … 👷🧱 … 👷🧱", { anchor: "middle", size: 26 });
    H.text(670, 150, "1 个 token 也要把全部权重读一遍：", { anchor: "middle", size: 15 });
    H.text(670, 174, "20G 权重 ÷ 1TB/s ≈ 50 tok/s 封顶", { anchor: "middle", size: 15 });
    H.text(670, 198, "→ 算力闲着，卡显存带宽（GB/s）", { anchor: "middle", size: 15, fill: "#c25b4e", weight: "bold" });
    H.rect(500, 215, 340, 30, { fill: H.c.paper, stroke: H.c.line });
    H.text(670, 236, "所以挑卡先看带宽——「力大砖飞」的砖就是权重", { anchor: "middle", size: 14, fill: H.c.dim });
    H.text(450, 300, "同一张卡两项指标：算力（TFLOPS）喂饱 Prefill，带宽（GB/s）决定 Decode——买卡看哪条，取决于你的请求是长是短", { anchor: "middle", size: 15, fill: H.c.dim });
    H.text(450, 328, "大并发能把 Decode 也推回算力受限区（权重读一次大家分）——roofline 工作点右移", { anchor: "middle", size: 14, fill: H.c.dim });
  };

  // ============ 17. 架构代际六个站牌（谱系图，v4/04）============
  ILLS["arch-generations"] = function (el) {
    var H = svgHost(el, 900, 300);
    H.text(450, 28, "六代站牌：每一代多算一种数（老卡靠软件模拟补课）", { anchor: "middle", size: 18, weight: "bold" });
    var gens = [
      ["Pascal", "2016", "无 Tensor Core\nDP4A（SM61 起）", H.c.dim],
      ["Volta", "2017", "第 1 代\nTensor Core", H.c.dim],
      ["Turing", "2018", "第 2 代 TC\nINT8 ×2", "#0f8a5f"],
      ["Ampere", "2020", "第 3 代 TC\nTF32", "#b8860b"],
      ["Ada", "2022", "原生 FP8\n（消费卡起点）", "#2b6cb0"],
      ["Blackwell", "2024", "NVFP4\n4bit 浮点", "#c25b4e"],
    ];
    var W = 840, x0 = 50, y = 150;
    H.line(x0, y, x0 + W, y, { stroke: H.c.dim, sw: 2 });
    gens.forEach(function (g, i) {
      var cx = x0 + 70 + i * (W - 140) / 5;
      H.circle(cx, y, 7, { fill: g[3], stroke: "none" });
      H.text(cx, y - 52, g[0], { anchor: "middle", size: 16, weight: "bold", fill: g[3] });
      H.text(cx, y - 32, g[1], { anchor: "middle", size: 13, fill: H.c.dim });
      var lines = g[2].split("\n");
      lines.forEach(function (s, j) { H.text(cx, y + 24 + j * 20, s, { anchor: "middle", size: 13.5, fill: g[3] }); });
    });
    // 2080Ti 旗
    H.rect(x0 + 70 + 2 * (W - 140) / 5 - 46, y + 78, 92, 26, { fill: H.c.soft, stroke: H.c.accent });
    H.text(x0 + 70 + 2 * (W - 140) / 5, y + 96, "2080Ti 在这（SM75）", { anchor: "middle", size: 13, fill: H.c.accent });
    H.text(450, 240, "FP8 原生加速：消费卡从 Ada 起（数据中心 Hopper 更早）；NVFP4 是 Blackwell 特性", { anchor: "middle", size: 14.5, fill: H.c.dim });
    H.text(450, 268, "老图灵的待遇：CUDA 13 仍支持（最低架构门槛），但 BF16/FP8/FP4 的硬件加速单元一样都没有——全靠软件补课还能打，这就是「垃圾佬神卡」的底气", { anchor: "middle", size: 14.5 });
  };

  // ============ 18. HBM 高楼 vs GDDR 平房（对比漫画，v4/05）============
  ILLS["hbm-vs-gddr"] = function (el) {
    var H = svgHost(el, 900, 380);
    H.text(450, 28, "显存也分门派：贴着厂房盖楼，还是修长途公路", { anchor: "middle", size: 18, weight: "bold" });
    // 左：HBM
    H.rect(30, 60, 400, 220, { fill: H.c.soft, stroke: H.c.accent });
    H.text(230, 90, "HBM：贴着核心的高楼", { anchor: "middle", size: 17, weight: "bold", fill: H.c.accent });
    for (var f = 0; f < 4; f++) H.rect(120 + f * 60, 120 + f * 18, 50, 130 - f * 18, { fill: H.c.accent, opacity: 0.25 + f * 0.12, stroke: H.c.accent });
    H.text(230, 175, "堆叠 + 超宽位宽（如 5120bit）", { anchor: "middle", size: 15 });
    H.text(230, 200, "距离核心只有几毫米", { anchor: "middle", size: 15 });
    H.text(230, 232, "A100：2TB/s　V100：900GB/s", { anchor: "middle", size: 15, weight: "bold" });
    H.text(230, 258, "贵、容量相对小、坏了整颗换", { anchor: "middle", size: 13, fill: H.c.dim });
    // 右：GDDR
    H.rect(470, 60, 400, 220, { fill: H.c.paper, stroke: "#c25b4e" });
    H.text(670, 90, "GDDR：平房 + 细长公路", { anchor: "middle", size: 17, weight: "bold", fill: "#c25b4e" });
    for (var c2 = 0; c2 < 6; c2++) H.rect(520 + c2 * 55, 170, 40, 60, { fill: "#c25b4e", opacity: 0.2, stroke: "#c25b4e" });
    H.text(670, 200, "颗粒绕一圈走线（32bit × 颗粒数）", { anchor: "middle", size: 15 });
    H.text(670, 232, "2080Ti：352bit / 14Gbps ≈ 616GB/s", { anchor: "middle", size: 15, weight: "bold" });
    H.text(670, 258, "便宜、容量好堆、带宽靠频率和位宽堆", { anchor: "middle", size: 13, fill: H.c.dim });
    H.text(450, 320, "位宽 × 等效频率 ÷ 8 = 带宽——HBM 靠位宽碾压，GDDR 靠频率追", { anchor: "middle", size: 15 });
    H.text(450, 350, "二手市场上 HBM 卡（MI50/V100）因此成了垃圾佬神卡：带宽便宜量又足，代价是生态与功耗", { anchor: "middle", size: 14, fill: H.c.dim });
  };

  // ============ 19. 卡间互联全家桶（架构图，v4/07）============
  ILLS["interconnect-map"] = function (el) {
    var H = svgHost(el, 900, 440);
    H.text(450, 26, "卡间互联全家桶：数据从哪条路走，带宽就是多少", { anchor: "middle", size: 18, weight: "bold" });
    // CPU
    H.rect(360, 60, 180, 54, { fill: H.c.soft, stroke: H.c.accent });
    H.text(450, 84, "CPU（root complex）", { anchor: "middle", size: 16, weight: "bold" });
    H.text(450, 104, "直连 lane 的总闸（EPYC 多达 128 条）", { anchor: "middle", size: 12.5, fill: H.c.dim });
    // PCIe 到两卡
    H.rect(150, 200, 220, 60, { fill: H.c.paper, stroke: H.c.line });
    H.text(260, 225, "GPU A（x16）", { anchor: "middle", size: 15, weight: "bold" });
    H.text(260, 245, "PCIe 3.0 x16 ≈ 16GB/s", { anchor: "middle", size: 13, fill: H.c.dim });
    H.rect(530, 200, 220, 60, { fill: H.c.paper, stroke: H.c.line });
    H.text(640, 225, "GPU B（x16）", { anchor: "middle", size: 15, weight: "bold" });
    H.text(640, 245, "PCIe 3.0 x16 ≈ 16GB/s", { anchor: "middle", size: 13, fill: H.c.dim });
    H.connect(400, 116, 280, 198); H.connect(500, 116, 620, 198);
    H.text(320, 150, "CPU 直连 lane", { size: 12.5, fill: H.c.dim });
    H.text(560, 150, "CPU 直连 lane", { size: 12.5, fill: H.c.dim });
    // NVLink 桥
    H.rect(345, 214, 180, 32, { fill: H.c.soft, stroke: H.c.accent });
    H.text(435, 235, "NVLink 桥接器 ≈ 100GB/s", { anchor: "middle", size: 14, weight: "bold", fill: H.c.accent });
    H.connect(372, 230, 372, 230);
    // 南桥
    H.rect(690, 300, 180, 54, { fill: H.c.paper, stroke: H.c.line });
    H.text(780, 322, "南桥 PCH（借道）", { anchor: "middle", size: 14, weight: "bold" });
    H.text(780, 342, "再分出来的 lane 更挤", { anchor: "middle", size: 12.5, fill: H.c.dim });
    H.connect(540, 116, 780, 298);
    H.text(690, 200, "绕南桥：多一级转发", { size: 12.5, fill: H.c.dim });
    // riser/switch
    H.rect(30, 300, 240, 54, { fill: H.c.paper, stroke: H.c.line });
    H.text(150, 322, "Riser / PLX switch 拆分卡", { anchor: "middle", size: 14, weight: "bold" });
    H.text(150, 342, "把 x16 拆成 x8+x8（bifurcation）", { anchor: "middle", size: 12.5, fill: H.c.dim });
    H.connect(180, 262, 150, 298);
    H.text(450, 390, "TP 每层要做 all-reduce：decode 一次只传几 KB（延迟敏感），prefill 一传几 MB（带宽敏感）", { anchor: "middle", size: 15 });
    H.text(450, 418, "矿卡飞线把 x16 锁成 1.0 x4（≈1GB/s）后单卡无感、双卡 TP 直接窒息——路多少钱才是关键", { anchor: "middle", size: 14, fill: "#c25b4e" });
  };

  // ============ 20. 64 层里只有 16 层在长账（层级图，v5/02）============
  ILLS["layer-type-bars"] = function (el) {
    var H = svgHost(el, 900, 360);
    H.text(450, 26, "翻案现场：模型卡 Layer type 字段里，64 层只有 16 层在长 KV", { anchor: "middle", size: 17, weight: "bold" });
    // 千问 64 层
    H.text(30, 60, "千问 27B（64 层）", { size: 15, weight: "bold" });
    for (var i = 0; i < 64; i++) {
      var full = i % 4 === 0; // 1/4 全注意力
      H.rect(30 + i * 13, 72, 11, 26, { fill: full ? "#c25b4e" : "#2b6cb0", opacity: 0.75, rx: 2 });
    }
    H.text(30, 122, "🟥 全注意力 ×16（KV 随上下文线性涨：256K → 16G）", { size: 14, fill: "#c25b4e" });
    H.text(30, 146, "🟦 线性/GDN ×48（定长缓冲 ≈ 100 多 MB，不随长度涨）", { size: 14, fill: "#2b6cb0" });
    // Gemma 60 层
    H.text(30, 190, "Gemma（60 层）", { size: 15, weight: "bold" });
    for (var j = 0; j < 60; j++) {
      var isFull = j % 6 === 0;
      H.rect(30 + j * 13.8, 202, 11, 26, { fill: isFull ? "#c25b4e" : "#b8860b", opacity: 0.75, rx: 2 });
    }
    H.text(30, 252, "🟥 全注意力 ×10 → 20G　　🟨 滑窗 1024 ×50 → 约 0.8G 封顶", { size: 14 });
    // 总账
    H.rect(30, 274, 840, 40, { fill: H.c.soft, stroke: H.c.accent });
    H.text(450, 300, "44G 显存 = 20G 权重（AWQ INT4）+ 16G KV + 计算缓冲 ——「塞不下 256K」的指控当庭撤销", { anchor: "middle", size: 16 });
    H.text(450, 340, "教训：公式没错，前提错了——「所有层都长 KV」这个假设只值 1/4 的真相。查一手字段，别背二手公式", { anchor: "middle", size: 14.5, fill: H.c.dim });
  };

  // ============ 21. N 值曲线的三种弯法（折线图，v5/03）============
  ILLS["n-value-curves"] = function (el) {
    var H = svgHost(el, 900, 400);
    var x0 = 90, y0 = 320, W = 720, Hh = 250;
    H.connect(x0, y0, x0 + W + 20, y0, { stroke: H.c.dim });
    H.connect(x0, y0, x0, 50, { stroke: H.c.dim });
    for (var n = 1; n <= 8; n++) H.text(x0 + (n - 1) / 7 * W, y0 + 24, "N=" + n, { anchor: "middle", size: 14, fill: H.c.dim });
    H.text(x0 + W / 2, y0 + 50, "一次草稿猜几个 token", { anchor: "middle", size: 15, fill: H.c.dim });
    H.text(26, 60, "加速比", { size: 15, fill: H.c.dim });
    function curve(p, color, label, labelDy) {
      var d = "";
      for (var i = 0; i <= 7; i++) {
        var N = i + 1, acc = 0, r = 1;
        for (var k = 0; k < N; k++) { r *= p; acc += r; }
        var speed = Math.min(4.5, 0.9 + acc); // ponytail: 严格式 1+Σp^k 加常数开销项
        var px = x0 + i / 7 * W, py = y0 - (speed - 0.8) / 3.7 * Hh;
        d += (i ? " L" : "M") + px + "," + py;
        if (i === 3) H.circle(px, py, 5, { fill: color, stroke: "none" });
        if (i === 3) H.text(px, py - 14, "甜点 " + speed.toFixed(1) + "×", { anchor: "middle", size: 13, fill: color, weight: "bold" });
      }
      H.path(d, { stroke: color, sw: 3 });
      H.text(x0 + W - 60, y0 - (0.9 + p * (1 - Math.pow(p, 4)) / (1 - p)) / 3.7 * Hh + labelDy, label, { size: 15, fill: color, weight: "bold" });
    }
    curve(0.85, "#2b6cb0", "科学计算（答案唯一）", -20);
    curve(0.65, H.c.accent, "代码工程（路径固定）", 6);
    curve(0.35, "#c25b4e", "创意写作（发散）", 30);
    H.text(450, 380, "接受率决定曲线高度，任务确定性决定甜点位置：代码能在 N=4~6 冲 3 倍，写作加到 N=8 也白猜——UP 主的多场景实测曲线就是这么弯的", { anchor: "middle", size: 15, fill: H.c.dim });
  };

  // ============ 22. 利用率一掉本地账就崩（折线图，v5/07）============
  ILLS["utilization-collapse"] = function (el) {
    var H = svgHost(el, 900, 400);
    var x0 = 100, y0 = 310, W = 700, Hh = 240, maxY = 50;
    H.connect(x0, y0, x0 + W + 20, y0, { stroke: H.c.dim });
    H.connect(x0, y0, x0, 50, { stroke: H.c.dim });
    var xs = [["100%", 0], ["20%", 0.4], ["5%", 0.75]];
    xs.forEach(function (s) {
      var px = x0 + s[1] * W;
      H.connect(px, y0, px, 60, { stroke: H.c.line, dash: "3 4" });
      H.text(px, y0 + 24, "利用率 " + s[0], { anchor: "middle", size: 15, fill: H.c.dim });
    });
    [0, 10, 20, 30, 40, 50].forEach(function (c) {
      H.text(x0 - 10, y0 - c / maxY * Hh + 5, c + "元", { anchor: "end", size: 14, fill: H.c.dim });
    });
    H.text(24, 60, "每百万 token 成本", { size: 14, fill: H.c.dim });
    // 本地成本折线（20/η 的反比曲线采样）
    var d = "";
    for (var i = 0; i <= 40; i++) {
      var eta = 1 - i / 40 * 0.97;
      var cost = 2.3 / eta;
      if (cost > maxY) break;
      var px = x0 + (1 - eta) / 0.97 * W, py = y0 - cost / maxY * Hh;
      d += (i ? " L" : "M") + px + "," + py;
    }
    H.path(d, { stroke: "#c25b4e", sw: 3 });
    [[0, 2.3], [0.4, 11.6], [0.75, 46]].forEach(function (p) {
      H.circle(x0 + p[0] * W, y0 - p[1] / maxY * Hh, 5, { fill: "#c25b4e", stroke: "none" });
      H.text(x0 + p[0] * W + 8, y0 - p[1] / maxY * Hh - 10, p[1] + " 元", { size: 14, fill: "#c25b4e", weight: "bold" });
    });
    // API 水平线
    H.line(x0, y0 - 2 / maxY * Hh, x0 + W, y0 - 2 / maxY * Hh, { stroke: H.c.accent, sw: 2.5 });
    H.text(x0 + W - 90, y0 - 2 / maxY * Hh - 10, "API：约 2 元（恒定）", { size: 15, fill: H.c.accent, weight: "bold" });
    H.text(450, 356, "满载（η=100%）勉强打平；真实家用 η 掉到 5% → 差 23 倍——「买车 vs 打车」的分界线就在利用率上", { anchor: "middle", size: 15, fill: H.c.dim });
    H.text(450, 384, "口径：双 2080Ti 电费 20 元/天 ÷ 864 万 token 满载产出；未计购置摊销与矿卡折价（那更崩）", { anchor: "middle", size: 13.5, fill: H.c.dim });
  };

  // ============ 23. 价格×显存选卡地图（数据图，v5/04）============
  ILLS["gpu-map"] = function (el) {
    var H = svgHost(el, 900, 430);
    H.text(450, 26, "二手选卡地图：价格（横）× 显存（纵），越左上越香", { anchor: "middle", size: 17, weight: "bold" });
    var x0 = 100, y0 = 340, W = 700, Hh = 280;
    function px(p) { return x0 + Math.min(1, Math.log10(p / 100) / Math.log10(600)) * W; } // 100→6万 对数
    function py(g) { return y0 - (g - 6) / (100 - 6) * Hh; }
    H.connect(x0, y0, x0 + W + 20, y0, { stroke: H.c.dim });
    H.connect(x0, y0, x0, 40, { stroke: H.c.dim });
    [[100, "100元"], [1000, "1千"], [5000, "5千"], [60000, "6万"]].forEach(function (t) {
      H.text(px(t[0]), y0 + 22, t[1], { anchor: "middle", size: 13, fill: H.c.dim });
    });
    [16, 24, 48, 80, 96].forEach(function (g) {
      H.text(x0 - 8, py(g) + 4, g + "G", { anchor: "end", size: 13, fill: H.c.dim });
    });
    var cards = [
      ["P40 24G", 400, 24, H.c.accent], ["MI50 16G", 300, 16, H.c.accent], ["2080Ti 22G", 1500, 22, H.c.accent],
      ["P100 16G", 230, 16, H.c.dim], ["V100 16G", 2200, 16, "#2b6cb0"], ["3090 24G", 3500, 24, "#b8860b"],
      ["5090 32G", 15000, 32, "#b8860b"], ["Pro6000 96G", 55000, 96, "#c25b4e"],
    ];
    cards.forEach(function (c) {
      H.circle(px(c[1]), py(c[2]), 6, { fill: c[3], stroke: "none" });
      H.text(px(c[1]) + 9, py(c[2]) - 6, c[0], { size: 13 });
    });
    // 分区
    H.text(px(400), py(24) + 26, "垃圾佬神卡区（百元级）", { anchor: "middle", size: 13, fill: H.c.accent });
    H.text(px(3500), py(24) - 30, "温饱线上限", { anchor: "middle", size: 13, fill: "#b8860b" });
    H.rect(px(3000), py(96), px(60000) - px(3000), py(24) - py(96), { fill: "#c25b4e", opacity: 0.07 });
    H.text(px(20000), py(56), "3千~1万+ 单卡区：\n显存不上不下，\nUP 主：都不推荐", { anchor: "middle", size: 13, fill: "#c25b4e" });
    H.text(450, 404, "两张 2080Ti 22G ≈ 3500 元凑 44G：单卡地图上「不划算」的组合，恰恰是个人跑 27B 的最优解——选卡看组合，不看单卡", { anchor: "middle", size: 14, fill: H.c.dim });
  };

  // ============ 24. 像debug一样查一个说法（流程图，v6/01）============
  ILLS["debug-loop"] = function (el) {
    var H = svgHost(el, 900, 330);
    H.text(450, 26, "SPOTLITE 的认知闭环：把每个说法当成一个待复现的 bug", { anchor: "middle", size: 17, weight: "bold" });
    var steps = [
      ["现象/质疑", "「44G 怎么可能装下 256K？」", H.c.dim],
      ["查一手资料", "模型卡 config.json\nLayer type 字段", "#2b6cb0"],
      ["列公式算账", "KV = 层×头×维×2\n×长度×字节", "#b8860b"],
      ["上机实测", "同 prompt 跑基准\n记波动与口径", H.c.accent],
      ["公开复现", "GitHub 验证矩阵\n🟢🟡🔴⚪", "#0f8a5f"],
    ];
    steps.forEach(function (s, i) {
      var x = 24 + i * 176;
      H.rect(x, 60, 160, 90, { fill: H.c.paper, stroke: s[2], sw: 2 });
      H.text(x + 80, 84, (i + 1) + " " + s[0], { anchor: "middle", size: 15, weight: "bold", fill: s[2] });
      s[1].split("\n").forEach(function (l, j) { H.text(x + 80, 110 + j * 19, l, { anchor: "middle", size: 12.5, fill: H.c.dim }); });
      if (i < 4) H.connect(x + 162, 105, x + 174, 105);
    });
    // 回环
    H.path("M872,150 L872,200 L104,200 L104,154", { stroke: H.c.dim, dash: "5 4" });
    H.text(470, 218, "新现象 → 再来一圈（复现产生的新账，就是下一条视频的素材）", { anchor: "middle", size: 14, fill: H.c.dim });
    H.rect(30, 240, 840, 64, { fill: H.c.soft, stroke: H.c.accent });
    H.text(450, 266, "真实案例：观众质疑 44G 装不下 → 查 Layer type（64 层仅 16 层全注意力）→ 重算 KV（64G→16G）→ 上机 256K 实测 → 写进仓库验证矩阵", { anchor: "middle", size: 14.5 });
    H.text(450, 292, "四步里没有一步是「相信别人说」——这就是全书反复出现的同一个动作", { anchor: "middle", size: 14, fill: H.c.dim });
  };

  // ============ 25. 模型货架：档位与空位（谱系图，v1/10）============
  ILLS["model-shelf"] = function (el) {
    var H = svgHost(el, 900, 400);
    H.text(450, 26, "模型货架：挑模型像挑档位，货架中间缺了一层", { anchor: "middle", size: 18, weight: "bold" });
    function shelf(y, label, items, note, color) {
      H.text(30, y - 10, label, { size: 15, weight: "bold", fill: color });
      H.line(30, y + 62, 870, y + 62, { stroke: H.c.dim, sw: 3 });
      var n = items.length;
      items.forEach(function (it, i) {
        var x = 60 + i * (840 / n);
        H.rect(x, y, 120, 58, { fill: it[2] || color, opacity: it[2] ? 0.85 : 0.2, stroke: it[1] ? color : H.c.line, dash: it[1] ? "5 4" : "" });
        H.text(x + 60, y + 26, it[0], { anchor: "middle", size: 14, weight: "bold", fill: it[2] ? "#fff" : H.c.dim });
        H.text(x + 60, y + 46, it[3] || "", { anchor: "middle", size: 11.5, fill: it[2] ? "#fff" : H.c.dim });
      });
      H.text(30, y + 84, note, { size: 13, fill: H.c.dim });
    }
    shelf(50, "200B 档：几乎全是 MoE（激活 ~10B）", [
      ["V4 Flash", 0, "#2b6cb0", "激活 10B"], ["MiniMax", 0, "#2b6cb0", ""], ["Step 3 Flash", 0, "#2b6cb0", ""], ["千问大杯 MoE", 0, "#2b6cb0", ""], ["176B Flash", 0, "#2b6cb0", "125B+51B 表"],
    ], "要 96G 级显存或统一内存——两头不靠的规格，本地玩家看戏为主", "#2b6cb0");
    shelf(160, "70B 档：空了", [
      ["Llama 3.3 70B", 0, H.c.dim, "已落灰"], ["— 空位 —", 1, 0, ""], ["— 空位 —", 1, 0, ""],
    ], "2024 年底的档位，新版一断代就没了继任者——别为它买卡", H.c.dim);
    shelf(270, "30B 档：甜点位，稠密为主", [
      ["千问 27B", 0, H.c.accent, "24G 卡能跑"], ["Gemma 31B", 0, H.c.accent, "（口播口径）"], ["GLM 稠密版", 0, H.c.accent, ""], ["Nemotron 30B", 0, H.c.accent, "存疑"],
    ], "两年没挪窝：同一张 24G 民用卡能跑，智力还在涨——社区变体也最活跃", H.c.accent);
    H.text(450, 384, "结论：先选档位再选型号；「版本是快消品，档位才是货架」——千问 3.8 半年后的智力 ≈ 一年前全球最强", { anchor: "middle", size: 14.5, fill: H.c.dim });
  };

  window.ILLS = ILLS;
  window.IllSys = { svgHost: svgHost, worker: worker, cssVar: cssVar };
})();

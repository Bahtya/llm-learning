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
          "font-size": opts.size || 20, "font-family": "system-ui,'PingFang SC','Noto Sans CJK SC',sans-serif",
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

  window.ILLS = ILLS;
  window.IllSys = { svgHost: svgHost, worker: worker, cssVar: cssVar };
})();

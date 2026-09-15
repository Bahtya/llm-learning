// 动画设计系统：canvasHost / controls / raf 管理 + DEMOS 注册表（16 个）
// 每个 demo = DEMOS[name] = function(host){...}，挂载到 md 里的 <div class="demo" data-demo="name">
// 约定：Canvas 2D；颜色读 CSS 变量；每个 demo 至少一个控件；全中文标签；示意数字加 ponytail: 注释
(function () {
  var LIVE = new Set(); // 所有 rAF 句柄

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }

  function canvasHost(el, h) {
    h = h || 240;
    var c = document.createElement("canvas");
    el.appendChild(c);
    var ctx = c.getContext("2d");
    function size() {
      var dpr = window.devicePixelRatio || 1;
      var w = el.clientWidth - 2;
      c.width = w * dpr; c.height = h * dpr;
      c.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      c._w = w; c._h = h;
    }
    size();
    window.addEventListener("resize", function () { size(); if (host.onresize) host.onresize(); });
    var host = { c: c, ctx: ctx, get w() { return c._w; }, get h() { return c._h; }, css: cssVar, onresize: null };
    return host;
  }

  function controls(el, defs, onchange) {
    var box = document.createElement("div");
    box.className = "demo-controls";
    var vals = {};
    defs.forEach(function (d) {
      var label = document.createElement("label");
      var input = document.createElement("input");
      var span = document.createElement("span");
      span.className = "demo-val";
      if (d.type === "text") {
        input.type = "text"; input.value = d.value || ""; input.placeholder = d.placeholder || "";
        label.appendChild(document.createTextNode(d.label + " "));
      } else {
        input.type = "range"; input.min = d.min; input.max = d.max; input.step = d.step || 1;
        input.value = d.value;
        span.textContent = d.value;
        label.appendChild(document.createTextNode(d.label + " "));
      }
      label.appendChild(input);
      if (d.type !== "text") label.appendChild(span);
      box.appendChild(label);
      vals[d.key] = d.type === "text" ? (d.value || "") : Number(d.value);
      input.addEventListener("input", function () {
        vals[d.key] = d.type === "text" ? input.value : Number(input.value);
        if (d.type !== "text") span.textContent = input.value;
        onchange && onchange(vals);
      });
    });
    el.appendChild(box);
    return vals;
  }

  function note(el, text) {
    var n = document.createElement("div");
    n.className = "demo-note";
    n.textContent = text;
    el.appendChild(n);
  }

  function raf(fn) {
    var handle = { id: 0 };
    function loop(t) {
      fn(t);
      if (!LIVE.has(handle)) return; // 已被 stopAll 停掉
      handle.id = requestAnimationFrame(loop);
    }
    handle.id = requestAnimationFrame(loop);
    LIVE.add(handle);
  }

  function inkFill(ctx, x, y, text, color) {
    ctx.fillStyle = color || cssVar("--ink");
    ctx.fillText(text, x, y);
  }

  var DEMOS = {};

  // ============ 1. tokenizer（卷一 01）============
  DEMOS["tokenizer"] = function (el) {
    var host = canvasHost(el, 150);
    var vals = controls(el, [{ key: "text", type: "text", value: "大模型推理为什么吃显存", placeholder: "输入任意中文/英文" }], draw);
    note(el, "示意词表：中文按 1~2 字、英文按词根切块。真实词表约 15 万条，这里仅演示「字块序列」概念。");
    // ponytail: 硬编码小词表示意，真实 BPE 需要词表文件
    var vocab = ["大", "模型", "模", "型", "推", "理", "为", "什么", "吃", "显", "存", "显存", "推理", "token", "ing", "the", "er", " ", "a", "i"];
    function tokenize(s) {
      var out = [], i = 0;
      var sorted = vocab.slice().sort(function (a, b) { return b.length - a.length; });
      while (i < s.length) {
        var hit = null;
        for (var k = 0; k < sorted.length; k++) {
          if (sorted[k] && s.startsWith(sorted[k], i)) { hit = sorted[k]; break; }
        }
        out.push(hit || s[i]);
        i += (hit || s[i]).length;
      }
      return out;
    }
    var colors = ["#0f6b5c", "#b8860b", "#7c5cbf", "#c25b4e", "#2b6cb0"];
    function draw() {
      var ctx = host.ctx, W = host.w, H = host.h;
      ctx.clearRect(0, 0, W, H);
      ctx.font = "15px \"Noto Sans SC Book\", system-ui";
      var toks = tokenize(vals.text);
      var x = 8, y = 30, maxW = W - 16;
      toks.forEach(function (t, i) {
        var w = ctx.measureText(t).width + 14;
        if (x + w > maxW) { x = 8; y += 34; }
        ctx.fillStyle = colors[i % colors.length] + "33";
        ctx.strokeStyle = colors[i % colors.length];
        ctx.beginPath(); ctx.roundRect(x, y, w, 26, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = host.css("--ink");
        ctx.fillText(t, x + 7, y + 18);
        x += w + 6;
      });
      ctx.fillStyle = host.css("--dim");
      ctx.fillText("「" + vals.text + "」→ " + toks.length + " 个 token（" + [...vals.text].length + " 个字符）", 8, y + 60);
    }
    host.onresize = draw;
    draw();
  };

  // ============ 2. attention（挂载：v1/04）============
  DEMOS["attention"] = function (el) {
    var host = canvasHost(el, 230);
    note(el, "点击矩阵中的任意一行，看该行 token 生成时对句中各 token 的注意力权重（因果注意力：每行只有自己和之前的 token 有值）。");
    // ponytail: 权重为示意值，真实权重来自模型每层的 softmax(QK^T/√d)
    var toks = ["小", "明", "把", "书", "放", "进", "书包"];
    // 因果下三角：每行只看自己及之前，行和=1
    var W = [
      [1.00],
      [0.35, 0.65],
      [0.10, 0.25, 0.65],
      [0.05, 0.10, 0.35, 0.50],
      [0.05, 0.05, 0.20, 0.35, 0.35],
      [0.05, 0.05, 0.10, 0.15, 0.25, 0.40],
      [0.05, 0.15, 0.05, 0.20, 0.10, 0.15, 0.30],
    ];
    var sel = 6;
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      var cell = Math.min(34, (w - 90) / toks.length);
      var x0 = 90, y0 = 16;
      for (var r = 0; r < toks.length; r++) {
        inkFill(ctx, 8, y0 + r * cell + cell / 2 + 4, "「" + toks[r] + "」在看 →", r === sel ? host.css("--accent") : host.css("--dim"));
        for (var c2 = 0; c2 <= r; c2++) {
          var v = W[r][c2];
          ctx.fillStyle = host.css("--accent");
          ctx.globalAlpha = (r === sel ? 0.15 : 0.05) + v * (r === sel ? 0.85 : 0.35);
          ctx.fillRect(x0 + c2 * cell, y0 + r * cell, cell - 2, cell - 2);
          ctx.globalAlpha = 1;
          if (r === sel) {
            ctx.fillStyle = v > 0.25 ? "#fff" : host.css("--ink");
            ctx.fillText(v.toFixed(2), x0 + c2 * cell + 1, y0 + r * cell + cell - 8);
          }
        }
        // 未来位置：留空表示不可见
        for (var f = r + 1; f < toks.length; f++) {
          ctx.strokeStyle = host.css("--line");
          ctx.strokeRect(x0 + f * cell, y0 + r * cell, cell - 2, cell - 2);
        }
      }
      ctx.strokeStyle = host.css("--accent");
      ctx.lineWidth = 2;
      ctx.strokeRect(x0 + sel * cell - 1, y0 + sel * cell - 1, cell + 1, cell + 1);
      ctx.lineWidth = 1;
      inkFill(ctx, x0, y0 + toks.length * cell + 12, "空格=未来的 token，因果注意力看不见（行内权重和为 1）", host.css("--dim"));
      host.c.onclick = function (e) {
        var rect = host.c.getBoundingClientRect();
        var y = e.clientY - rect.top;
        var r = Math.floor((y - y0) / cell);
        if (r >= 0 && r < toks.length) { sel = r; draw(); }
      };
    }
    host.onresize = draw;
    draw();
  };

  // ============ 3. softmax-temp（卷一 02）============
  DEMOS["softmax-temp"] = function (el) {
    var host = canvasHost(el, 220);
    var vals = controls(el, [{ key: "t", label: "温度", min: 0.1, max: 3, step: 0.1, value: 1 }], draw);
    note(el, "同一组 logits，不同温度下的下一个 token 概率分布：低温→保守重复，高温→发散有创意。");
    // ponytail: logits 为示意值
    var cands = [["显存", 4.0], ["内存", 3.2], ["硬盘", 2.5], ["缓存", 2.0], ["总线", 1.2], ["鼠标", 0.3]];
    function softmax(logits, t) {
      var exps = logits.map(function (l) { return Math.exp(l / t); });
      var s = exps.reduce(function (a, b) { return a + b; }, 0);
      return exps.map(function (e) { return e / s; });
    }
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      var ps = softmax(cands.map(function (c) { return c[1]; }), vals.t);
      var bw = (w - 40) / cands.length;
      cands.forEach(function (c, i) {
        var bh = ps[i] * (h - 70);
        ctx.fillStyle = host.css("--accent");
        ctx.fillRect(20 + i * bw + 6, h - 40 - bh, bw - 20, bh);
        ctx.font = "14px \"Noto Sans SC Book\", system-ui";
        inkFill(ctx, 20 + i * bw + 6, h - 24, c[0], host.css("--ink"));
        inkFill(ctx, 20 + i * bw + 6, h - 8, (ps[i] * 100).toFixed(0) + "%", host.css("--dim"));
      });
      inkFill(ctx, 20, 18, "温度 T=" + vals.t.toFixed(1) + "　低温：模型几乎总选「显存」；高温：长尾词也有机会", host.css("--dim"));
    }
    host.onresize = draw;
    draw();
  };

  // ============ 4. kv-cache（挂载：v1/05）============
  DEMOS["kv-cache"] = function (el) {
    var host = canvasHost(el, 190);
    var vals = controls(el, [
      { key: "layers", label: "全注意力层数", min: 1, max: 80, value: 16 },
      { key: "kvheads", label: "KV头数", min: 1, max: 16, value: 8 },
      { key: "dim", label: "头维度", min: 32, max: 256, step: 32, value: 128 },
      { key: "ctxk", label: "上下文(K)", min: 1, max: 256, value: 256 },
      { key: "bytes", label: "精度字节", min: 1, max: 2, value: 2 },
    ], draw);
    note(el, "KV 显存 = 全注意力层数 × KV头数 × 头维度 × 2(K和V) × token数 × 每元素字节。默认值即视频翻案后的真实账：16层×8头×128×2×256K×2B = 16G；把层数拖到 64（假装全是全注意力）就得 64G——这就是 v1/06 那次翻案。");
    var pos = 0;
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      var tokens = Math.min(vals.ctxk * 1000, 240);
      var mem = vals.layers * vals.kvheads * vals.dim * 2 * vals.ctxk * 1000 * vals.bytes;
      var gb = mem / 1024 / 1024 / 1024;
      // 缓存块增长示意
      var cols = 40, cell = Math.min(12, (w - 40) / cols);
      var filled = Math.floor((pos % tokens) / tokens * cols);
      for (var i = 0; i < cols; i++) {
        ctx.fillStyle = i < filled ? host.css("--accent") : host.css("--line");
        ctx.fillRect(20 + i * cell, 26, cell - 2, cell - 2);
      }
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, 20, 16, "KV 缓存随生成逐步增长（示意 " + Math.round(pos % tokens) + " / " + vals.ctxk + "K token）", host.css("--dim"));
      inkFill(ctx, 20, 70, "公式：全注意力层 " + vals.layers + " × KV头 " + vals.kvheads + " × 维度 " + vals.dim + " × 2 × " + vals.ctxk + "K × " + vals.bytes + "B", host.css("--ink"));
      ctx.font = "bold 22px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, 20, 104, "≈ " + gb.toFixed(1) + " GB", host.css("--accent"));
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, 150, 104, "← 这只是 KV；权重另算（GiB 口径，见 v2/01）", host.css("--dim"));
      inkFill(ctx, 20, 126, "把全注意力层拖到 64 = naive 算法 64G；千问 27B 实际只有 16 层全注意力（Layer type 翻案）", host.css("--dim"));
    }
    host.onresize = draw;
    raf(function (t) { pos = t / 40; draw(); });
  };

  // ============ 5. prefill-decode（卷一 07）============
  DEMOS["prefill-decode"] = function (el) {
    var host = canvasHost(el, 190);
    var vals = controls(el, [{ key: "plen", label: "输入长度(字符)", min: 10, max: 400, value: 120 }], null);
    note(el, "Prompt 一次性并行「吞入」（Prefill，快），然后一个字一个字「吐出」（Decode，慢）。TTFT=第一张嘴之前的等待。");
    var t0 = null;
    raf(function (t) {
      if (t0 === null) t0 = t;
      var el2 = t - t0;
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      var phaseDur = 1800;
      var p = (el2 % 5400);
      var plen = vals.plen;
      // prefill 阶段
      var pf = Math.min(1, p / phaseDur);
      ctx.fillStyle = host.css("--accent");
      ctx.fillRect(20, 30, (w - 40) * pf * 0.9, 26);
      inkFill(ctx, 20, 22, "① Prefill 吞入 prompt（并行，一次前向算完 " + plen + " 字）", host.css("--ink"));
      // decode 阶段
      var df = Math.max(0, Math.min(1, (p - phaseDur * 1.6) / (phaseDur * 3)));
      inkFill(ctx, 20, 84, "② Decode 逐 token 吐出（串行，每字都要完整过一遍模型）", host.css("--ink"));
      for (var i = 0; i < Math.floor(df * 24); i++) {
        ctx.fillStyle = host.css("--accent");
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(i);
        ctx.beginPath(); ctx.arc(24 + i * ((w - 48) / 24), 108, 6, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
      var ttftX = 20 + (w - 40) * (0.2 + 0.7 * Math.min(1, plen / 400)) + 6;
      ctx.strokeStyle = "#c25b4e";
      ctx.beginPath(); ctx.moveTo(ttftX, 26); ctx.lineTo(ttftX, 60); ctx.stroke();
      inkFill(ctx, ttftX + 4, 50, "← TTFT：吐出第一个 token 前的等待", "#c25b4e");
      inkFill(ctx, 20, 150, "体感：Prefill 决定「等多久开始回答」，Decode 决定「字蹦得多快」；输入越长 TTFT 越久", host.css("--dim"));
    });
  };

  // ============ 6. quant-grid（卷二 02/03）============
  DEMOS["quant-grid"] = function (el) {
    var host = canvasHost(el, 190);
    var vals = controls(el, [{ key: "bits", label: "位宽", min: 2, max: 8, step: 1, value: 4 }], draw);
    note(el, "把连续数值装进 2^bits 个格子（示意按均匀格点画；真实 FP8 的格子带指数、疏密不均）：位宽越小格子越少、误差越大。");
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      var levels = Math.pow(2, vals.bits);
      var x0 = 30, x1 = w - 30, y = 90;
      ctx.strokeStyle = host.css("--dim");
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (var i = 0; i < levels; i++) {
        var x = x0 + (x1 - x0) * (i + 0.5) / levels;
        ctx.fillStyle = host.css("--accent");
        ctx.fillRect(x - 2, y - 10, 4, 20);
      }
      // 真实值采样点（连续分布）与其量化误差
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      for (var k = 0; k < 24; k++) {
        var v = (Math.sin(k * 12.9898) + 1) / 2; // ponytail: 伪随机即可
        var q = Math.round(v * (levels - 1)) / (levels - 1);
        var xv = x0 + (x1 - x0) * v, xq = x0 + (x1 - x0) * q;
        ctx.strokeStyle = "#c25b4e";
        ctx.beginPath(); ctx.moveTo(xv, y - 26); ctx.lineTo(xq, y - 4); ctx.stroke();
        ctx.fillStyle = "#c25b4e";
        ctx.beginPath(); ctx.arc(xv, y - 28, 2.5, 0, 7); ctx.fill();
      }
      inkFill(ctx, x0, 24, levels + " 个量化格（" + vals.bits + " bit）　·　红点=真实值，红线=量化误差", host.css("--dim"));
      inkFill(ctx, x0, 150, "27B 模型：FP16≈54G → INT4≈14G（再含少量元数据）——省的是显存与带宽，赔的是精度", host.css("--dim"));
    }
    host.onresize = draw;
    draw();
  };

  // ============ 7. moe-router（卷一 09）============
  DEMOS["moe-router"] = function (el) {
    var host = canvasHost(el, 210);
    var vals = controls(el, [
      { key: "experts", label: "专家数", min: 4, max: 16, value: 8 },
      { key: "active", label: "每 token 激活专家", min: 1, max: 4, value: 2 },
    ], null);
    note(el, "MoE：路由器给每个 token 挑 N 个专家，其余专家不动。总参数大（知识多），激活参数小（算得少）——Qwen3-30B-A3B：30B 总参、3B 激活。");
    var tokenX = 0;
    raf(function (t) {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      var ne = vals.experts, na = Math.min(vals.active, ne);
      tokenX = (t / 25) % (w - 60);
      var tx = 20 + tokenX, ty = h / 2;
      var activeSet = [];
      var seed = Math.floor(t / 1400);
      for (var i = 0; i < na; i++) activeSet.push((seed * 7 + i * 3) % ne); // ponytail: 示意路由
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, 20, 20, "token → 路由器 → 只激活 " + na + "/" + ne + " 个专家", host.css("--ink"));
      ctx.fillStyle = host.css("--ink");
      ctx.beginPath(); ctx.arc(tx, ty, 8, 0, 7); ctx.fill();
      inkFill(ctx, tx - 14, ty - 16, "token", host.css("--dim"));
      for (var e = 0; e < ne; e++) {
        var ex = 40 + e * ((w - 80) / ne), ey = h - 60;
        var isActive = activeSet.indexOf(e) >= 0;
        ctx.strokeStyle = isActive ? host.css("--accent") : host.css("--line");
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(tx + 8, ty); ctx.lineTo(ex + 20, ey); ctx.stroke();
        ctx.fillStyle = isActive ? host.css("--accent") : host.css("--line");
        ctx.fillRect(ex, ey, 40, 26);
        ctx.fillStyle = isActive ? "#fff" : host.css("--dim");
        ctx.fillText("专家" + e, ex + 4, ey + 17);
      }
      inkFill(ctx, 20, 36, "专家激活占比 ≈ " + (na / ne * 100).toFixed(0) + "%（仅统计 MoE 的 FFN 部分；稠密模型=100% 参与）", host.css("--dim"));
    });
  };

  // ============ 8. paged-attention（卷三 03）============
  DEMOS["paged-attention"] = function (el) {
    var host = canvasHost(el, 200);
    note(el, "PagedAttention：把每个请求的 KV 切成固定小块（逻辑页），按需映射到物理页——像操作系统管内存一样管显存，几乎不留碎片。");
    var reqs = [[3, 5, 2], [6, 1], [0, 4, 7, 3]];
    var physUsed = {};
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      var colors = ["#0f6b5c", "#b8860b", "#7c5cbf"];
      var page = 34;
      // 物理页
      inkFill(ctx, 20, 20, "物理显存页（每页存固定数量 token 的 KV）", host.css("--dim"));
      for (var p = 0; p < 12; p++) {
        var owner = -1;
        for (var r = 0; r < reqs.length; r++) if (reqs[r].indexOf(p) >= 0) owner = r;
        ctx.fillStyle = owner >= 0 ? colors[owner] + "66" : host.css("--line");
        ctx.strokeStyle = owner >= 0 ? colors[owner] : host.css("--dim");
        ctx.fillRect(20 + (p % 6) * page, 30 + Math.floor(p / 6) * page, page - 4, page - 4);
        ctx.strokeRect(20 + (p % 6) * page, 30 + Math.floor(p / 6) * page, page - 4, page - 4);
      }
      // 逻辑页映射
      inkFill(ctx, 250, 20, "每个请求的逻辑页表（乱序存放，用页表找）", host.css("--dim"));
      reqs.forEach(function (r, ri) {
        inkFill(ctx, 250, 52 + ri * 44, "请求" + (ri + 1) + "：", colors[ri]);
        r.forEach(function (p, pi) {
          ctx.fillStyle = colors[ri] + "88";
          ctx.fillRect(310 + pi * page, 38 + ri * 44, page - 4, page - 4);
          inkFill(ctx, 316 + pi * page, 58 + ri * 44, "P" + p, "#fff");
        });
      });
      inkFill(ctx, 20, 130, "传统做法要给每个请求预留「最大长度」的连续空间 → 大量内部碎片；分页后按需分配 → 几乎无浪费", host.css("--dim"));
    }
    draw();
  };

  // ============ 9. batching（卷三 04）============
  DEMOS["batching"] = function (el) {
    var host = canvasHost(el, 190);
    var vals = controls(el, [{ key: "mode", label: "静态(0)/连续(1)", min: 0, max: 1, value: 1 }], null);
    note(el, "静态批次：等凑满一批、等最慢的做完才散伙，槽位空转；连续批处理：谁做完谁退出，新请求随时补位。");
    var t0 = null;
    var slots = [0, 0, 0, 0]; // 各槽进度 0~1
    var waits = [0.3, 0.9, 0.2, 0.6];
    raf(function (t) {
      if (t0 === null) t0 = t;
      var dt = 1 / 60;
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, 20, 20, vals.mode ? "连续批处理：做完即退、随时补位" : "静态批次：必须等整批完成", host.css("--ink"));
      slots.forEach(function (s, i) {
        slots[i] += dt * (0.25 + waits[i] * 0.2);
        if (slots[i] >= 1) {
          if (vals.mode) slots[i] = 0;           // 立即补位
          else slots[i] = 1;                      // 卡住等整批
        }
        var y = 40 + i * 30;
        ctx.fillStyle = host.css("--line");
        ctx.fillRect(20, y, w - 40, 20);
        ctx.fillStyle = slots[i] >= 1 ? "#c25b4e" : host.css("--accent");
        ctx.fillRect(20, y, (w - 40) * slots[i], 20);
        inkFill(ctx, 24, y + 15, slots[i] >= 1 ? "已做完，等待中…" : "生成中", slots[i] >= 1 ? "#c25b4e" : "#fff");
      });
      inkFill(ctx, 20, 175, vals.mode ? "GPU 几乎不空转 → 吞吐高" : "短请求陪长请求干等 → GPU 空转", host.css("--dim"));
    });
  };

  // ============ 10. cuda-graph（卷三 05）============
  DEMOS["cuda-graph"] = function (el) {
    var host = canvasHost(el, 170);
    var vals = controls(el, [{ key: "graph", label: "逐个发射(0)/整图回放(1)", min: 0, max: 1, value: 0 }], null);
    note(el, "每一步 decode 有几百个小 kernel；逐个发射时 CPU 指派一个 GPU 干一个（空隙是浪费）；CUDA Graph 把整张执行图录好，一次回放。代价：显存占用增加。");
    var t0 = null;
    raf(function (t) {
      if (t0 === null) t0 = t;
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      var x = 20, y = 50;
      var k = 0, tmod = (t / 3) % 600;
      inkFill(ctx, 20, 24, vals.mode ? "整图回放：CPU 一次指派，GPU 连续执行" : "逐个发射：CPU→GPU 一来一回，空隙=浪费", host.css("--ink"));
      while (x < w - 40) {
        var kw = 14 + (k % 3) * 8;
        var gap = vals.mode ? 2 : 14;
        var kx = 20 + k * (kw + gap);
        var done = tmod > k * (kw + gap);
        ctx.fillStyle = done ? host.css("--accent") : host.css("--line");
        ctx.fillRect(kx, y, kw, 22);
        if (!vals.mode && !done && tmod > k * (kw + gap) - 14 && tmod < k * (kw + gap)) {
          inkFill(ctx, kx - 10, y - 8, "CPU 指派中…", "#c25b4e");
        }
        x = kx; k++;
      }
      inkFill(ctx, 20, 110, "同样一步 decode，逐个发射模式的 CPU-GPU 来回空隙累计可达数十个百分点的时间", host.css("--dim"));
      inkFill(ctx, 20, 130, "代价：CUDA Graph 需要预分配固定形状 → 额外显存（v4/02 三本账里的一项）", host.css("--dim"));
    });
  };

  // ============ 11. speculative（挂载：v3/06）============
  DEMOS["speculative"] = function (el) {
    var host = canvasHost(el, 210);
    var vals = controls(el, [
      { key: "k", label: "草稿长度 N", min: 1, max: 8, value: 4 },
      { key: "acc", label: "接受率", min: 0.1, max: 1, step: 0.05, value: 0.7 },
    ], null);
    note(el, "上：普通 decode，一步 1 token；下：草稿模型一次猜 N 个、主模型一步验证。加速比 ≈ 1 + N×接受率（线性近似，见正文）——代码（接受率高）赚翻，诗歌（发散）亏本。");
    var t0 = null;
    raf(function (t) {
      if (t0 === null) t0 = t;
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      var y1 = 40, y2 = 120;
      // 主赛道：固定速度
      ctx.fillStyle = host.css("--dim");
      ctx.fillRect(20, y1, w - 40, 20);
      ctx.fillStyle = host.css("--accent");
      ctx.fillRect(20, y1, (t / 30) % (w - 40), 20);
      inkFill(ctx, 20, y1 - 8, "普通 decode：每步 1 token（匀速）", host.css("--ink"));
      // 投机赛道：加速比 = 1 + N × 接受率（线性近似）
      var speed = Math.max(0.5, 1 + vals.acc * vals.k); // ponytail: 线性近似，未减验证开销
      var xSpec = ((t / 30) * speed) % (w - 40);
      ctx.fillStyle = host.css("--dim");
      ctx.fillRect(20, y2, w - 40, 20);
      ctx.fillStyle = speed > 1.2 ? "#0f6b5c" : "#c25b4e";
      ctx.fillRect(20, y2, xSpec, 20);
      inkFill(ctx, 20, y2 - 8, "投机解码：验证一步最多收 N=" + vals.k + " 个（接受率 " + (vals.acc * 100).toFixed(0) + "%）", host.css("--ink"));
      inkFill(ctx, 20, 175, "加速比 ≈ 1 + " + vals.k + "×" + vals.acc.toFixed(2) + " = " + speed.toFixed(1) + "×　｜　代价：prefill 变慢 + 草稿/验证层占显存", speed > 1.2 ? host.css("--accent") : "#c25b4e");
    });
  };

  // ============ 12. tp-vs-pp（卷四 06）============
  DEMOS["tp-vs-pp"] = function (el) {
    var host = canvasHost(el, 220);
    var vals = controls(el, [{ key: "mode", label: "张量并行TP(0)/流水线PP(1)", min: 0, max: 1, value: 0 }], null);
    note(el, "TP：把一层权重切成两半，两卡同算一层、每层做一次 all-reduce 合并；PP：前半层放 A 卡、后半层放 B 卡接力。TP 通信频繁但延迟低，PP 通信少但要靠 micro-batch 填气泡。");
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      var layers = 6;
      if (!vals.mode) {
        inkFill(ctx, 20, 22, "TP=2：每层都切开，两卡同步算（每层一次 all-reduce ✱）", host.css("--ink"));
        for (var L = 0; L < layers; L++) {
          var y = 40 + L * 26;
          ctx.fillStyle = "#0f6b5c66"; ctx.fillRect(30, y, 110, 20);
          ctx.fillStyle = "#b8860b66"; ctx.fillRect(160, y, 110, 20);
          ctx.strokeStyle = "#c25b4e"; ctx.fillText("✱ all-reduce", 285, y + 14);
          ctx.beginPath(); ctx.arc(276, y + 10, 4, 0, 7); ctx.stroke();
        }
        inkFill(ctx, 30, 205, "通信：每层 2 次 × 层数 +1（如 64 层=129 次/前向）；payload=hidden×token×字节", host.css("--dim"));
      } else {
        inkFill(ctx, 20, 22, "PP：按层接力（A 卡算前半，B 卡算后半），micro-batch 流水重叠", host.css("--ink"));
        for (var L2 = 0; L2 < layers; L2++) {
          var y2 = 40 + L2 * 26;
          ctx.fillStyle = L2 < 3 ? "#0f6b5c66" : "#b8860b66";
          ctx.fillRect(30 + L2 * 42, y2, 36, 20);
        }
        inkFill(ctx, 30, 205, "decode 每步只有一个 token 在跑 → 接力空转（气泡）；prefill 切 micro-batch 才能填满", host.css("--dim"));
      }
    }
    host.onresize = draw;
    draw();
  };

  // ============ 13. pcie-bandwidth（卷四 07）============
  DEMOS["pcie-bandwidth"] = function (el) {
    var host = canvasHost(el, 190);
    var vals = controls(el, [
      { key: "tokens", label: "本步 token 数", min: 1, max: 2048, value: 1 },
      { key: "hidden", label: "hidden size", min: 1024, max: 8192, step: 1024, value: 4096 },
    ], draw);
    note(el, "TP 每步要传的 hidden state = token数 × hidden × 2字节（FP16）。decode 时 1 token 只有几 KB——瓶颈是每次通信的固定延迟；prefill 时几百 token 变几 MB——瓶颈才是带宽。");
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      var bytes = vals.tokens * vals.hidden * 2;
      var mb = bytes / 1048576, kb = bytes / 1024;
      // ponytail: 带宽为标称值，实际有效带宽约 80%
      var pcie = 4 * 1.0;   // PCIe 3.0 x4 ≈ 4 GB/s（旧矿卡飞线的惨案）
      var pcie16 = 16;      // PCIe 3.0 x16
      var nvlink = 100;     // NVLink 2 双向≈100 GB/s（与正文 v4/07 口径一致）
      function bar(label, gbps, y, color) {
        var time = bytes / (gbps * 1e9) * 1000; // ms
        ctx.font = "14px \"Noto Sans SC Book\", system-ui";
        ctx.fillStyle = color;
        ctx.fillRect(150, y, Math.min(w - 220, Math.log2(1 + time * 8) * 30), 20);
        ctx.fillStyle = host.css("--ink");
        ctx.fillText(label, 20, y + 15);
        ctx.fillStyle = host.css("--dim");
        ctx.fillText(time < 0.01 ? "<0.01 ms" : time.toFixed(2) + " ms", 158 + Math.min(w - 220, Math.log2(1 + time * 8) * 30), y + 15);
        return time;
      }
      inkFill(ctx, 20, 22, "本次要传：" + (mb >= 1 ? mb.toFixed(2) + " MB" : kb.toFixed(1) + " KB") + "（" + vals.tokens + " token × " + vals.hidden + " × 2B）", host.css("--ink"));
      var t1 = bar("PCIe 3.0 x4（矿卡飞线）", pcie, 50, "#c25b4e");
      var t2 = bar("PCIe 3.0 x16", pcie16, 85, "#b8860b");
      var t3 = bar("NVLink 2（桥接器，双向）", nvlink, 120, "#0f6b5c");
      inkFill(ctx, 20, 165, vals.tokens <= 8
        ? "token 很少 → 三者都 <1ms，但每次通信的固定延迟甩不掉 → 带宽敏感变延迟敏感"
        : "token 一多 → 差距拉开几十倍 → prefill 阶段卡间带宽决定速度", host.css("--dim"));
    }
    host.onresize = draw;
    draw();
  };

  // ============ 14. roofline（卷四 03）============
  DEMOS["roofline"] = function (el) {
    var host = canvasHost(el, 210);
    var vals = controls(el, [
      { key: "batch", label: "并发 batch", min: 1, max: 64, value: 1 },
      { key: "bits", label: "权重位宽", min: 2, max: 16, value: 4 },
    ], draw);
    note(el, "Roofline：算术强度（每字节权重搬动能算多少次）低于拐点=访存受限（decode 在这），高于=算力受限（大 batch prefill 在这）。量化/增大 batch 都会把工作点往右推。");
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      var x0 = 50, y0 = h - 40, pw = w - 90, ph = h - 80;
      ctx.strokeStyle = host.css("--dim");
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, 20); ctx.moveTo(x0, y0); ctx.lineTo(x0 + pw, y0); ctx.stroke();
      ctx.font = "13px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, x0 - 44, 30, "性能", host.css("--dim"));
      inkFill(ctx, x0 + pw - 60, y0 + 18, "算术强度(对数)", host.css("--dim"));
      // 屋顶线
      var peakX = pw * 0.55;
      ctx.strokeStyle = host.css("--accent");
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + peakX, 30); ctx.lineTo(x0 + pw, 30); ctx.stroke();
      inkFill(ctx, x0 + peakX + 4, 44, "算力上限", host.css("--accent"));
      inkFill(ctx, x0 + 4, y0 - 8, "带宽上限斜率", host.css("--accent"));
      // 工作点：decode=小 batch 访存受限；prefill/大batch 算力受限
      var bw = 3 - Math.log2(vals.bits) * 0.35;         // 量化越狠→每 token 越省字节→强度略升
      var ai = bw + Math.log2(vals.batch) * 0.5;         // batch 增大→复用权重→强度升
      var px = x0 + Math.min(pw - 10, ai / 6 * pw);
      var py = Math.max(30, y0 - Math.min(1, ai / 6) * ph);
      ctx.fillStyle = "#c25b4e";
      ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill();
      var region = ai < 4.2 ? "访存受限区（decode 在此：速度≈带宽/每token字节）" : "算力受限区（prefill/大并发 在此：速度≈算力）";
      inkFill(ctx, x0, 20, "工作点：" + region, "#c25b4e");
      ctx.lineWidth = 1;
    }
    draw();
  };

  // ============ 15. vram-budget（挂载：v4/02）============
  DEMOS["vram-budget"] = function (el) {
    var host = canvasHost(el, 220);
    var vals = controls(el, [
      { key: "pb", label: "参数量(B)", min: 1, max: 72, value: 27 },
      { key: "wbits", label: "权重位宽", min: 2, max: 16, value: 4 },
      { key: "ctxk", label: "上下文(K)", min: 1, max: 256, value: 256 },
      { key: "kvbits", label: "KV 位宽", min: 4, max: 16, value: 16 },
      { key: "conc", label: "并发数", min: 1, max: 8, value: 1 },
    ], draw);
    note(el, "显存三本账：权重=参数量×位宽/8（理论下限，AWQ 等格式实测会多几 G）；KV 按 v1/06 混合架构口径（27B≈16 层全注意力×8 头×128 维），默认值复现视频结论：权重约 14G + KV 16G + 缓冲 < 44G 双 2080Ti，绰绰有余。");
    function draw() {
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      var weights = vals.pb * vals.wbits / 8;
      // KV：按 27B 的混合架构（16 层全注意力×8KV头×128 维）随参数量缩放
      var layersFull = Math.max(2, Math.round(16 * vals.pb / 27));
      var kvBytes = layersFull * 8 * 128 * 2 * vals.ctxk * 1000 * (vals.kvbits / 8) * vals.conc;
      var kv = kvBytes / 1024 / 1024 / 1024;
      var buf = 2.5 * vals.conc;
      var total = weights + kv + buf;
      var vram = 44; // 双 2080Ti 22G，ponytail: 固定对比线
      var scale = (w - 120) / Math.max(vram * 1.15, total);
      var y = 60, x = 60;
      function seg(bytes, color, label) {
        var bw2 = bytes * scale;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, bw2, 34);
        ctx.fillStyle = "#fff"; ctx.font = "13px \"Noto Sans SC Book\", system-ui";
        if (bw2 > 55) ctx.fillText(label + " " + bytes.toFixed(1) + "G", x + 5, y + 21);
        x += bw2;
      }
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, 60, 30, "双 2080Ti 22G：装得下吗？", host.css("--ink"));
      seg(weights, "#0f6b5c", "权重");
      seg(kv, "#b8860b", "KV");
      seg(buf, "#7c5cbf", "缓冲");
      // 红线
      var vx = 60 + vram * scale;
      ctx.strokeStyle = "#c25b4e"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(vx, y - 10); ctx.lineTo(vx, y + 50); ctx.stroke();
      inkFill(ctx, vx - 40, y + 66, "44G 显存线", "#c25b4e");
      ctx.lineWidth = 1;
      var ok = total <= vram;
      ctx.font = "bold 16px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, 60, y + 100, "合计 " + total.toFixed(1) + "G / 44G —— " + (ok ? "装得下" + (vram - total > 2 ? "，还留得足计算缓冲" : "，勉强") : "装不下！OOM"), ok ? host.css("--accent") : "#c25b4e");
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      inkFill(ctx, 60, y + 122, "试试把 KV 位宽开到 16 并拉高并发/参数量 —— 看 44G 怎么被吃穿", host.css("--dim"));
    }
    host.onresize = draw;
    draw();
  };

  // ============ 16. unified-memory（卷四 08）============
  DEMOS["unified-memory"] = function (el) {
    var host = canvasHost(el, 200);
    var vals = controls(el, [{ key: "mode", label: "独显+拷贝(0)/统一内存(1)", min: 0, max: 1, value: 0 }], null);
    note(el, "独显跑大 MoE：权重大部分在内存/硬盘，用时要经 PCIe 搬进显存（窄桥）。统一内存：CPU/GPU 共享同一物理内存，零拷贝直接访问——MoE 激活参数小，慢介质也喂得动，U 盘放 n-gram 表同理。");
    var t0 = null;
    raf(function (t) {
      if (t0 === null) t0 = t;
      var ctx = host.ctx, w = host.w, h = host.h;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "14px \"Noto Sans SC Book\", system-ui";
      if (!vals.mode) {
        inkFill(ctx, 20, 22, "独显方案：显存 24G 装不下 → 每次激活专家都要经 PCIe 窄桥搬运", host.css("--ink"));
        ctx.fillStyle = host.css("--line"); ctx.fillRect(20, 40, 110, 120);
        ctx.fillStyle = host.css("--accent"); ctx.fillRect(20, 40, 110, 34);
        inkFill(ctx, 30, 60, "显存 24G", "#fff");
        inkFill(ctx, 30, 100, "内存 128G", host.css("--dim"));
        inkFill(ctx, 30, 125, "(大部分权重在这)", host.css("--dim"));
        // PCIe 窄桥 + 数据包动画
        var bx = 130, bw2 = 70;
        ctx.strokeStyle = host.css("--dim");
        ctx.strokeRect(bx, 85, bw2, 26);
        inkFill(ctx, bx + 6, 102, "PCIe 窄桥", host.css("--dim"));
        for (var i = 0; i < 3; i++) {
          var px = bx + ((t / 4 + i * 40) % bw2);
          ctx.fillStyle = "#c25b4e";
          ctx.fillRect(px, 92, 10, 12);
        }
        inkFill(ctx, 20, 185, "搬运慢 → 专家激活等不起 → 只适合激活参数极小的 MoE", host.css("--dim"));
      } else {
        inkFill(ctx, 20, 22, "统一内存：CPU/GPU 看同一块内存，零拷贝，不搬运", host.css("--ink"));
        ctx.fillStyle = host.css("--accent") + "44";
        ctx.fillRect(20, 40, w - 40, 120);
        ctx.fillStyle = host.css("--accent");
        ctx.fillRect(20, 40, 180, 30);
        inkFill(ctx, 30, 60, "GPU 直接访问", "#fff");
        inkFill(ctx, 30, 100, "同一块 128G 内存：权重原地放着，按需读取", host.css("--ink"));
        inkFill(ctx, 30, 125, "省掉：拷贝延迟 + 双份占位", host.css("--dim"));
        inkFill(ctx, 20, 185, "代价：内存带宽(~200GB/s)远低于显存(~1000GB/s) → 吞吐上限低，但总参大激活小的 MoE 刚好吃这套", host.css("--dim"));
      }
    });
  };

  window.DEMOS = DEMOS;
  window.DemoSys = { canvasHost: canvasHost, controls: controls, note: note, raf: raf, cssVar: cssVar, stopAll: function () { LIVE.forEach(function (h) { cancelAnimationFrame(h.id); }); LIVE.clear(); } };
})();

// hash 路由 + 目录 + 进度 + 主题。路由格式：#/（首页）、#/v1/03（卷一章三）
(function () {
  var content = document.getElementById("content");
  var pager = document.getElementById("pager");
  var crumb = document.getElementById("crumb");
  var toc = document.getElementById("toc");
  var tocMask = document.getElementById("toc-mask");

  if (location.protocol === "file:") document.getElementById("file-warn").hidden = false;

  // ---------- 主题 ----------
  var savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  document.getElementById("theme-btn").onclick = function () {
    var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  // ---------- 目录 ----------
  function readKey(v, id) { return "read:" + v + "/" + id; }
  function isRead(v, id) { return !!localStorage.getItem(readKey(v, id)); }

  function renderToc() {
    var html = '<h3 style="margin-top:0">目录</h3><a href="#/">首页</a>';
    BOOKS.forEach(function (b) {
      html += "<h3>" + b.title + "</h3>";
      b.chapters.forEach(function (c) {
        html += '<a class="' + (isRead(b.vol, c.id) ? "read" : "") + '" href="#/' + b.vol + "/" + c.id + '">' +
          c.id + " " + c.title + "</a>";
      });
    });
    toc.innerHTML = html;
  }
  document.getElementById("menu-btn").onclick = function () { toc.hidden = false; tocMask.hidden = false; };
  tocMask.onclick = function () { toc.hidden = true; tocMask.hidden = true; };
  toc.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { toc.hidden = true; tocMask.hidden = true; }
  });

  // ---------- BV 号 → 可点击的 B 站链接（案例块附标题） ----------
  function linkBvids(html) {
    return html.replace(/视频出处：(BV[0-9A-Za-z]{10})|(BV[0-9A-Za-z]{10})/g, function (m, cited, plain) {
      var id = cited || plain;
      var meta = typeof VIDEOS === "object" ? VIDEOS[id] : undefined; // books.js 顶层 const，裸用词法绑定（勿写 window.VIDEOS）
      if (!meta) return m;
      var href = "https://www.bilibili.com/video/" + id;
      if (cited) return '视频出处：<a class="bili" href="' + href + '" target="_blank" rel="noopener">' + id + "《" + meta.t + "》▶</a>";
      return '<a class="bili" href="' + href + '" target="_blank" rel="noopener">' + id + " ▶</a>";
    });
  }

  // ---------- 路由 ----------
  function parseRoute() {
    var m = location.hash.match(/^#\/(v\d+)\/(\d+)$/);
    return m ? { vol: m[1], id: m[2] } : null;
  }

  function findChapter(vol, id) {
    var b = BOOKS.find(function (x) { return x.vol === vol; });
    if (!b) return null;
    var idx = b.chapters.findIndex(function (c) { return c.id === id; });
    return idx < 0 ? null : { book: b, ch: b.chapters[idx], idx: idx };
  }

  function renderHome() {
    crumb.textContent = "";
    var html = "<h1>大模型入门</h1>" +
      '<p class="muted">本书把 B 站 UP 主（视频作者）<strong>SPOTLITE</strong> 的本地大模型推理视频里出现的每一个概念从零讲懂。' +
      'SPOTLITE 是一位在本地硬件上跑大模型的开发者兼 UP 主；书中 <code>BV 号</code> 都可直接点击跳到 B 站原视频（案例块会附视频标题），' +
      '「案例」引用块摘自他的视频原话（常引用后文章节的概念，括号里的链接可先跳过）；书中型号名均取自视频口播口径，以模型卡为准。' +
      '建议按卷顺序阅读；遇到忘了的词，回 <a href="#/v6/02">术语速查表</a> 查。</p>';
    BOOKS.forEach(function (b) {
      var done = b.chapters.filter(function (c) { return isRead(b.vol, c.id); }).length;
      html += '<section class="home-vol"><h2><a href="#/' + b.vol + '/01">' + b.title + "</a></h2>" +
        '<div class="vol-progress">' + done + "/" + b.chapters.length + " 已读</div><ol>";
      b.chapters.forEach(function (c) {
        html += '<li class="' + (isRead(b.vol, c.id) ? "read" : "") + '"><a href="#/' + b.vol + "/" + c.id + '">' + c.title + "</a></li>";
      });
      html += "</ol></section>";
    });
    content.innerHTML = linkBvids(html);
    pager.innerHTML = "";
    renderToc();
  }

  function renderPager(book, idx) {
    var prev = idx > 0 ? book.chapters[idx - 1] : null;
    var cur = book.chapters[idx];
    var next = idx + 1 < book.chapters.length ? book.chapters[idx + 1] : nextPageOf(book);
    var html = "";
    if (prev) html += '<a href="#/' + book.vol + "/" + prev.id + '"><span>上一篇</span>' + prev.title + "</a>";
    else html += "<a href='#/'><span>返回</span>首页</a>";
    if (next) html += '<a class="next" href="#/' + (next.vol || book.vol) + "/" + next.id + '"><span>下一篇（点击标记本章已读）</span>' + next.title + "</a>";
    pager.innerHTML = html;
    // 点击"下一篇"= 当前章已读
    pager.querySelectorAll("a").forEach(function (a) {
      if (!a.classList.contains("next")) return; // 只有点"下一篇"才标记已读
      a.addEventListener("click", function () { localStorage.setItem(readKey(book.vol, cur.id), "1"); renderToc(); });
    });
  }
  function nextPageOf(book) {
    var i = BOOKS.indexOf(book);
    if (i + 1 >= BOOKS.length) return null;
    var nb = BOOKS[i + 1];
    return { vol: nb.vol, id: nb.chapters[0].id, title: nb.chapters[0].title };
  }

  function renderChapter(vol, id) {
    var hit = findChapter(vol, id);
    if (!hit) { location.hash = "#/"; return; }
    if (window.DemoSys) window.DemoSys.stopAll(); // 离开本章时停掉仍在跑的动画
    crumb.textContent = hit.book.title + " · " + hit.ch.title;
    content.innerHTML = '<p class="muted">加载中…</p>';
    fetch("content/" + vol + "/" + id + ".md?v=" + (window.BUILD || "x"), { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (text) {
        content.innerHTML = linkBvids("<h1>" + hit.ch.title + "</h1>" + mdToHtml(text));
        content.querySelectorAll("[data-demo]").forEach(function (el) {
          var fn = window.DEMOS && window.DEMOS[el.dataset.demo];
          if (fn) { try { fn(el); } catch (e) { el.innerHTML = '<p class="muted">动画加载失败：' + e.message + "</p>"; } }
        });
        content.querySelectorAll("[data-ill]").forEach(function (el) {
          var fn = window.ILLS && window.ILLS[el.dataset.ill];
          if (fn) { try { fn(el); } catch (e) { el.innerHTML = '<p class="muted">插画加载失败：' + e.message + "</p>"; } }
        });
        renderPager(hit.book, hit.idx);
        renderToc();
        window.scrollTo(0, 0);
      })
      .catch(function () {
        content.innerHTML = '<h1>' + hit.ch.title + '</h1><p class="muted">本章还没写好（或服务未启动：python3 -m http.server 8000）。</p>';
      });
  }

  window.addEventListener("hashchange", function () {
    var r = parseRoute();
    if (r) renderChapter(r.vol, r.id); else renderHome();
  });
  var r0 = parseRoute();
  if (r0) renderChapter(r0.vol, r0.id); else renderHome();
})();

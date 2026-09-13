// 极简 markdown 子集渲染器：标题/段落/粗斜体/行内码/代码块/列表/引用/表格/动画占位div
// 约定：章节正文从 ## 开始（# 标题由清单提供）；动画行写 <div class="demo" data-demo="xxx"></div>
(function () {
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return s;
  }

  function renderTable(rows) {
    var cells = rows.map(function (r) {
      return r.replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); });
    });
    var out = '<div class="table-wrap"><table><thead><tr>';
    cells[0].forEach(function (c) { out += "<th>" + inline(c) + "</th>"; });
    out += "</tr></thead><tbody>";
    // cells[1] 是分隔行
    for (var i = 2; i < cells.length; i++) {
      out += "<tr>";
      cells[i].forEach(function (c) { out += "<td>" + inline(c) + "</td>"; });
      out += "</tr>";
    }
    return out + "</tbody></table></div>";
  }

  function isTableSep(line) {
    return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.indexOf("-") >= 0;
  }

  function mdToHtml(src) {
    var lines = src.replace(/\r\n/g, "\n").split("\n");
    var out = [], i = 0;
    while (i < lines.length) {
      var line = lines[i];

      // 动画占位：原样透传
      if (/^\s*<div class="demo"/.test(line)) { out.push(line.trim()); i++; continue; }

      // 代码块
      if (/^```/.test(line)) {
        var buf = [], lang = line.slice(3).trim();
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out.push('<pre><code>' + esc(buf.join("\n")) + "</code></pre>");
        continue;
      }

      // 标题
      var h = line.match(/^(#{1,4})\s+(.*)/);
      if (h) { out.push("<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">"); i++; continue; }

      // 表格
      if (line.indexOf("|") >= 0 && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        var rows = [];
        while (i < lines.length && lines[i].indexOf("|") >= 0) { rows.push(lines[i]); i++; }
        out.push(renderTable(rows));
        continue;
      }

      // 引用块（含「他怎么知道」「案例」变体）
      if (/^\s*>/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
        var text = q.join("\n");
        var cls = "heknow";
        if (!/他怎么知道|为什么可信/.test(text)) cls = /案例|实测|翻车/.test(text) ? "case" : "";
        out.push('<blockquote class="' + cls + '">' +
          q.map(function (p) { return p.trim() ? "<p>" + inline(p) + "</p>" : ""; }).join("") +
          "</blockquote>");
        continue;
      }

      // 列表（一层）
      if (/^\s*[-*]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items.push("<li>" + inline(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>"); i++;
        }
        out.push("<ul>" + items.join("") + "</ul>");
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var oitems = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          oitems.push("<li>" + inline(lines[i].replace(/^\s*\d+\.\s+/, "")) + "</li>"); i++;
        }
        out.push("<ol>" + oitems.join("") + "</ol>");
        continue;
      }

      // 空行
      if (!line.trim()) { i++; continue; }

      // 段落
      var para = [];
      while (i < lines.length && lines[i].trim() &&
             !/^(#{1,4}\s|```|\s*>|\s*[-*]\s|\s*\d+\.\s|<div class="demo")/.test(lines[i]) &&
             !(lines[i].indexOf("|") >= 0 && isTableSep(lines[i + 1] || ""))) {
        para.push(lines[i]); i++;
      }
      out.push("<p>" + inline(para.join(" ")) + "</p>");
    }
    return out.join("\n");
  }

  window.mdToHtml = mdToHtml;
})();

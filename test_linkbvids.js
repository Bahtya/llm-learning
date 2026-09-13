// linkBvids 单测：node test_linkbvids.js
const fs = require("fs");
const books = fs.readFileSync("assets/books.js", "utf8");
const app = fs.readFileSync("assets/app.js", "utf8");
const fn = app.match(/function linkBvids[\s\S]*?\n  \}/)[0];
const code = books + "\n" + fn + "\nreturn linkBvids;";
// 模拟浏览器真实环境：books.js 顶层 const 不挂 window，app.js 必须裸用词法绑定
const linkBvids = new Function(code)();

const html = '<p>视频出处：BV1UMEv68E3C</p><td>BV1nVVr6QEFq</td><p>BV1INVALID000</p>';
const out = linkBvids(html);

let ok = 0, total = 0;
function check(name, cond) { total++; if (cond) { ok++; console.log("OK  " + name); } else console.log("FAIL " + name); }

check("案例块附标题", out.includes("《大模型KV缓存要100G？我们一起来算算》▶"));
check("案例块链接指向b站", out.includes('href="https://www.bilibili.com/video/BV1UMEv68E3C"'));
check("表格裸BV加链接", /<a class="bili" href="https:\/\/www\.bilibili\.com\/video\/BV1nVVr6QEFq"[^>]*>BV1nVVr6QEFq ▶<\/a>/.test(out));
check("无效BV原样保留", out.includes("BV1INVALID000") && !out.includes("INVALID000 ▶"));
check("链接不二次嵌套", (out.match(/class="bili"/g) || []).length === 2);
process.exit(ok === total ? 0 : 1);

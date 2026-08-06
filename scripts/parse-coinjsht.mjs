import fs from "fs";

const s = fs.readFileSync("tmp-products.html", "utf8");
const idx = s.indexOf("initialRows");
console.log("initialRows at", idx);
if (idx > -1) console.log(s.slice(idx, idx + 8000));

const titles = [...s.matchAll(/\\"title\\":\\"([^\\]+)\\"/g)].map((m) => m[1]);
console.log("\ntitles count", titles.length);
titles.slice(0, 25).forEach((t) => console.log("-", t));

const covers = [...s.matchAll(/\\"cover\\":\\"([^\\]+)\\"/g)].map((m) => m[1]);
console.log("\ncovers", covers.length);

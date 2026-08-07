import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envPath = path.join(root, ".env.local");
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = createClient(url, key);

/** Correct category by lot_no / slug — based on title + cover image */
const byLot = {
  "CJ-41": { cn: "寿山石·田黄", zh: "壽山石·田黃", en: "Shoushan · Tianhuang" },
  "CJ-42": { cn: "寿山石·田黄", zh: "壽山石·田黃", en: "Shoushan · Tianhuang" },
  "CJ-47": { cn: "瓷器·古董", zh: "瓷器·古董", en: "Ceramics & Antiques" }, // 三彩釉花瓶 — was 佛像
  "CJ-49": { cn: "刀剑·兵器", zh: "刀劍·兵器", en: "Swords & Arms" }, // 武士刀 — was 珠串
  "CJ-74": { cn: "寿山石·鸡血石", zh: "壽山石·雞血石", en: "Shoushan · Chicken-Blood" }, // was 珠串/佛像
  "CJ-46": { cn: "铜器·香炉", zh: "銅器·香爐", en: "Bronze Ware" }, // 铜香炉 — was 田黄
  "CJ-48": { cn: "甲胄·武备", zh: "甲胄·武備", en: "Armor & Arms" }, // 甲胄 — was 田黄
  "CJ-55": { cn: "佛像·造像", zh: "佛像·造像", en: "Buddhist Statues" },
  "CJ-56": { cn: "珠串·雅玩", zh: "珠串·雅玩", en: "Beads & Scholar's Objects" },
  "CJ-58": { cn: "珠串·雅玩", zh: "珠串·雅玩", en: "Beads & Scholar's Objects" },
  "CJ-73": { cn: "刀剑·兵器", zh: "刀劍·兵器", en: "Swords & Arms" }, // 打刀拵 — was 田黄
  "CJ-51": { cn: "佛像·造像", zh: "佛像·造像", en: "Buddhist Statues" },
  "CJ-53": { cn: "佛像·造像", zh: "佛像·造像", en: "Buddhist Statues" },
  "CJ-54": { cn: "佛像·造像", zh: "佛像·造像", en: "Buddhist Statues" },
  "CJ-52": { cn: "佛像·造像", zh: "佛像·造像", en: "Buddhist Statues" },
  "CJ-57": { cn: "珠串·雅玩", zh: "珠串·雅玩", en: "Beads & Scholar's Objects" },
  "CJ-60": { cn: "珠串·雅玩", zh: "珠串·雅玩", en: "Beads & Scholar's Objects" },
  "CJ-59": { cn: "珠串·雅玩", zh: "珠串·雅玩", en: "Beads & Scholar's Objects" },
  "MY-2026-013": { cn: "娘惹瓷器", zh: "娘惹瓷器", en: "Nyonya Ware" },
  "MY-2026-014": { cn: "马来短剑", zh: "馬來短劍", en: "Keris" },
  "MY-2026-015": { cn: "海峡古董", zh: "海峽古董", en: "Straits Antiques" },
  "MY-2026-016": { cn: "锡镴器", zh: "錫鑞器", en: "Pewter" },
  "MY-2026-017": { cn: "纸钞钱币", zh: "紙鈔錢幣", en: "Banknotes & Coins" },
  "MY-2026-018": { cn: "峇峇家具", zh: "峇峇家具", en: "Baba Furniture" },
};

/** Homepage 精选：至少 6，田黄 + 马来本地为主 */
const featuredLots = new Set([
  "CJ-41", // 极品田黄
  "CJ-42", // 中品田黄
  "CJ-74", // 鸡血石（协会印石双绝）
  "MY-2026-013", // 娘惹大罐
  "MY-2026-014", // 克力士
  "MY-2026-018", // 峇峇螺钿柜
]);

const { data, error } = await sb
  .from("products")
  .select("id,lot_no,slug,category_cn,category_zh,category_en,featured,title_cn")
  .order("sort_order");
if (error) throw error;

let catFixed = 0;
let featFixed = 0;
for (const p of data) {
  const cat = byLot[p.lot_no];
  if (!cat) {
    console.warn("NO_MAP", p.lot_no, p.title_cn);
    continue;
  }
  const wantFeatured = featuredLots.has(p.lot_no);
  const catChanged =
    p.category_cn !== cat.cn ||
    p.category_zh !== cat.zh ||
    p.category_en !== cat.en;
  const featChanged = Boolean(p.featured) !== wantFeatured;
  if (!catChanged && !featChanged) {
    console.log("OK", p.lot_no, cat.cn, wantFeatured ? "F" : "-");
    continue;
  }
  const patch = {
    category_cn: cat.cn,
    category_zh: cat.zh,
    category_en: cat.en,
    featured: wantFeatured,
  };
  const { error: upErr } = await sb.from("products").update(patch).eq("id", p.id);
  if (upErr) {
    console.error("FAIL", p.lot_no, upErr);
    continue;
  }
  if (catChanged) {
    catFixed++;
    console.log(
      "CAT",
      p.lot_no,
      p.title_cn,
      "|",
      p.category_cn,
      "→",
      cat.cn
    );
  }
  if (featChanged) {
    featFixed++;
    console.log("FEAT", p.lot_no, wantFeatured ? "ON" : "OFF");
  }
}
console.log(JSON.stringify({ catFixed, featFixed, featuredCount: featuredLots.size }, null, 2));

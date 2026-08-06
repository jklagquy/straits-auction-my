/**
 * Build lib/coinjsht-seed.ts from scripts/coinjsht-import/*.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "coinjsht-import", "products.json"), "utf8")
);
const posts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "coinjsht-import", "posts.json"), "utf8")
);

const CAT = {
  tianzhu: {
    cn: "寿山石·田黄",
    zh: "壽山石·田黃",
    en: "Shoushan · Tianhuang",
  },
  beads: { cn: "珠串·雅玩", zh: "珠串·雅玩", en: "Beads & Playthings" },
  buddha: { cn: "佛像·造像", zh: "佛像·造像", en: "Buddhist Sculpture" },
  antique: { cn: "古董雅器", zh: "古董雅器", en: "Antiques" },
};

function slugify(s, id) {
  const base = String(s || "")
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `cj-${id}-${base || "item"}`;
}

function esc(s) {
  return String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function toCn(tw) {
  // lightweight traditional→simplified map for common chars in our corpus
  const map = {
    黃: "黄",
    萬: "万",
    個: "个",
    產: "产",
    國: "国",
    與: "与",
    為: "为",
    這: "这",
    麼: "么",
    來: "来",
    對: "对",
    會: "会",
    時: "时",
    間: "间",
    經: "经",
    過: "过",
    還: "还",
    說: "说",
    們: "们",
    從: "从",
    開: "开",
    關: "关",
    學: "学",
    業: "业",
    東: "东",
    華: "华",
    傳: "传",
    統: "统",
    術: "术",
    藝: "艺",
    畫: "画",
    書: "书",
    觀: "观",
    賞: "赏",
    質: "质",
    體: "体",
    現: "现",
    實: "实",
    際: "际",
    邊: "边",
    長: "长",
    風: "风",
    氣: "气",
    靈: "灵",
    韻: "韵",
    溫: "温",
    潤: "润",
    絲: "丝",
    紋: "纹",
    寶: "宝",
    貴: "贵",
    壽: "寿",
    雞: "鸡",
    劍: "剑",
    戰: "战",
    鐵: "铁",
    質: "质",
    鎧: "铠",
    裝: "装",
    釋: "释",
    迦: "迦",
    彌: "弥",
    優: "优",
    質: "质",
    顆: "颗",
    藏: "藏",
    棗: "枣",
    種: "种",
    子: "子",
    念: "念",
    珠: "珠",
    銅: "铜",
    香: "香",
    爐: "炉",
    壺: "壶",
    臺: "台",
    灣: "湾",
    係: "系",
    億: "亿",
    靈: "灵",
    氣: "气",
    同: "同",
    養: "养",
    凝聚: "凝聚",
    嘅: "的",
    珍稀: "珍稀",
    佢: "它",
    喺: "在",
    唔: "不",
    噉: "这样",
    係: "是",
  };
  let out = String(tw || "");
  for (const [a, b] of Object.entries(map)) out = out.split(a).join(b);
  return out;
}

function enTitle(name, cat) {
  const dict = {
    "極品田黃石，限量，3000個": "Top-grade Tianhuang stone (limited)",
    中品田黄石: "Mid-grade Tianhuang stone",
    "三彩釉 花瓶": "Sancai-glazed vase",
    日本武士劍武士刀小山宗俊: "Japanese katana · Koyama Munetoshi",
    "壽山石 - 雞血石": "Shoushan chicken-blood stone",
    銅香爐: "Bronze incense burner",
    日本江戶川時代鐵質黑漆甲胄套裝: "Edo-period lacquered armor set",
    黃財神像: "Yellow Jambhala statue",
    星月菩提念珠108顆: "108 star-moon bodhi mala",
    藏式鳳眼菩薩珠: "Tibetan phoenix-eye bodhi beads",
    黑皴革塗鞘打刀拵: "Uchigatana koshirae · black leather saya",
    黑財神佛像: "Black Jambhala statue",
    "釋迦牟尼佛（完整雕刻+金箔）": "Shakyamuni Buddha (gilt engraving)",
    藏傳佛教金剛乘野豬的傳統: "Vajravarahi statue",
    釋迦牟尼佛: "Shakyamuni Buddha",
    玉佛珠手串: "Jadeified bodhi bracelet",
    優質瓷器老星月菩提珠手串: "Porcelain-grade star-moon bracelet",
    藏棗種子108顆佛珠: "108 jujube-seed mala",
  };
  return dict[name] || `${CAT[cat]?.en || "Antique"} · ${name}`;
}

function usdToRm(usd) {
  const n = Number(usd) || 0;
  const low = Math.round(n * 3.8);
  const high = Math.round(n * 5.2);
  const fmt = (x) => x.toLocaleString("en-MY");
  return { low, high, estimate: `RM ${fmt(low)} – ${fmt(high)}` };
}

function translatePost(content) {
  // Keep original as zh; provide cn/en readable versions.
  // For JP/KR/EN source text we supply faithful cn/zh/en below when mapped; else mirror.
  const zh = content;
  const cn = /[\u3040-\u30ff]/.test(content) ? content : toCn(content);
  const en = content;
  return { cn, zh, en };
}

// Curated lifestyle translations for major JP posts (key by remote id)
const POST_I18N = {
  "58": {
    cn: "这位厉害的人物，有人认出来吗？\n正是《富爸爸穷爸爸》里的原型迈克。\n我和他聊了很多买金银的理由与投资理念。\n其中有一段：我总问「白银到底能涨到哪？」\n他说——价格能到多高，取决于纸币印多少。若继续印钞，纸币相对金银与所谓「数字黄金」的购买力就会下滑。战争与货币环境仍充满不确定，但实物资产的逻辑值得藏家认真想一想。",
    zh: "這位厲害的人物，有人認得出來嗎？\n正是《富爸爸窮爸爸》裡的原型麥克。\n我和他聊了很多買金銀的理由與投資理念。\n其中有一段：我總問「白銀到底能漲到哪？」\n他說——價格能到多高，取決於紙幣印多少。若繼續印鈔，紙幣相對金銀與所謂「數位黃金」的購買力就會下滑。戰爭與貨幣環境仍充滿不確定，但實物資產的邏輯值得藏家認真想一想。",
    en: "Recognize this remarkable guest? He’s the real-life model behind Rich Dad Poor Dad’s Mike.\nWe talked at length about why he buys gold and silver.\nI kept asking how high silver could go — he said it depends on how much paper money is printed. If printing continues, paper weakens against metals and even “digital gold.” Markets are uncertain, but the hard-asset logic is worth a collector’s thought.",
  },
  "55": {
    cn: "六位设计大师——布鲁诺·穆纳里、马克斯·比尔、恩佐·马里、迪特·拉姆斯、阿基莱·卡斯蒂廖尼、奥特尔·艾歇尔。\n展览里的创意与完成度令人佩服，品质感几乎压倒一切。收藏之外，也该多看看设计如何改变日常。",
    zh: "六位設計大師——布魯諾·穆納里、馬克斯·比爾、恩佐·馬里、迪特·拉姆斯、阿基萊·卡斯蒂廖尼、奧特爾·艾歇爾。\n展覽裡的創意與完成度令人佩服，品質感幾乎壓倒一切。收藏之外，也該多看看設計如何改變日常。",
    en: "Six design masters — Munari, Bill, Mari, Rams, Castiglioni, Aicher.\nThe show’s ideas and finish are overwhelming in the best way. Beyond antiques, design still reshapes daily life.",
  },
  "53": {
    cn: "慈善晚会刚结束，我在回家路上。今天做的事很有意义——为社会尽了一份力。\n人人多一点善意，世界会更好一点。\n帮助别人时，自己也会收获真心的快乐；哪怕很小的付出，也能照亮别人，甚至让你觉得整个世界都亮了一下。",
    zh: "慈善晚會剛結束，我在回家路上。今天做的事很有意義——為社會盡了一份力。\n人人多一點善意，世界會更好一點。\n幫助別人時，自己也會收穫真心的快樂；哪怕很小的付出，也能照亮別人，甚至讓你覺得整個世界都亮了一下。",
    en: "Just left the charity gala — on my way home. Today felt meaningful; I did my small part.\nA little kindness from everyone makes the world gentler.\nHelping others gives real joy back — even a small effort can light someone else’s day.",
  },
};

const productLines = products.map((p, i) => {
  const cat = CAT[p.category] || CAT.antique;
  const titleZh = p.nameTw;
  const titleCn = toCn(titleZh);
  const titleEn = enTitle(titleZh, p.category);
  const descZh = p.descriptionTw || titleZh;
  const descCn = toCn(descZh);
  const descEn = descZh.slice(0, 280);
  const { estimate, low, high } = usdToRm(p.priceUsd);
  const slug = slugify(titleEn, p.remoteId);
  const gallery = JSON.stringify(p.gallery);
  const featured = ["41", "42", "74"].includes(String(p.remoteId));
  return `  {
    id: "p-cj-${p.remoteId}",
    slug: ${JSON.stringify(slug)},
    featured: ${featured},
    category: L(${JSON.stringify(cat.cn)}, ${JSON.stringify(cat.zh)}, ${JSON.stringify(cat.en)}),
    title: L(${JSON.stringify(titleCn)}, ${JSON.stringify(titleZh)}, ${JSON.stringify(titleEn)}),
    excerpt: L(${JSON.stringify(descCn.slice(0, 60))}, ${JSON.stringify(descZh.slice(0, 60))}, ${JSON.stringify(titleEn)}),
    description: L(${JSON.stringify(descCn)}, ${JSON.stringify(descZh)}, ${JSON.stringify(descEn)}),
    estimate: ${JSON.stringify(estimate)},
    lotNo: ${JSON.stringify(`CJ-${p.remoteId}`)},
    image: ${JSON.stringify(p.image)},
    gallery: ${gallery},
    specs: [
      sp(SL.material, ${JSON.stringify(cat.cn)}, ${JSON.stringify(cat.zh)}, ${JSON.stringify(cat.en)}),
      sp(SL.origin, "馆藏征集 / 国际回流", "館藏徵集 / 國際回流", "Consigned / international return"),
      CERT,
    ],
  }`;
});

const postLines = posts.map((p, i) => {
  const i18n = POST_I18N[p.remoteId] || translatePost(p.contentTw);
  // Prefer curated; for JP without map, keep original in all three so detail is readable,
  // and add a short cn lead-in note via mirroring original (user can edit in admin).
  const author = p.authorTw.trim();
  const images = JSON.stringify(p.images);
  const avatar =
    p.avatar ||
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(author)}`;
  const views = Math.round((p.likes || 1000) * 1.6 + i * 37);
  return `  {
    id: ${JSON.stringify(p.id)},
    author: L(${JSON.stringify(author)}, ${JSON.stringify(author)}, ${JSON.stringify(author)}),
    avatar: ${JSON.stringify(avatar)},
    content: L(${JSON.stringify(i18n.cn)}, ${JSON.stringify(i18n.zh)}, ${JSON.stringify(i18n.en)}),
    image: ${JSON.stringify(p.images[0])},
    images: ${images},
    date: ${JSON.stringify(p.date)},
    likes: ${Number(p.likes) || 1000},
    views: ${views},
    comments: [],
  }`;
});

const out = `/* Auto-generated by scripts/generate-coinjsht-seed.mjs — do not hand-edit galleries */
import type { Localized } from "./i18n";

type Spec = { label: Localized; value: Localized };
type Product = {
  id: string;
  slug: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  description: Localized;
  estimate: string;
  lotNo: string;
  image: string;
  gallery: string[];
  specs: Spec[];
  featured?: boolean;
};
type FeedPost = {
  id: string;
  author: Localized;
  avatar: string;
  content: Localized;
  image: string;
  images: string[];
  date: string;
  likes: number;
  views: number;
  comments: { user: string; text: string }[];
};

const L = (cn: string, zh: string, en: string): Localized => ({ cn, zh, en });

const SL = {
  material: L("材质", "材質", "Material"),
  origin: L("产地", "產地", "Origin"),
  cert: L("鉴定证书", "鑑定證書", "Certificate"),
};

const sp = (label: Localized, cn: string, zh: string, en: string): Spec => ({
  label,
  value: L(cn, zh, en),
});

const CERT = sp(SL.cert, "附权威鉴定证书", "附權威鑑定證書", "With certificate of authenticity");

export const coinjshtProducts: Product[] = [
${productLines.join(",\n")}
];

export type { FeedPost };

export const coinjshtPosts: FeedPost[] = [
${postLines.join(",\n")}
];
`;

const dest = path.join(ROOT, "lib", "coinjsht-seed.ts");
fs.writeFileSync(dest, out, "utf8");
console.log("Wrote", dest, "products", products.length, "posts", posts.length);

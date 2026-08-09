import type { Localized, Locale } from "./i18n";
import { tr } from "./i18n";
import { coinjshtPosts, coinjshtProducts } from "./coinjsht-seed";

export type Spec = { label: Localized; value: Localized };

export type Product = {
  id: string;
  slug: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  description: Localized;
  /** Formatted current (uplifted) price */
  estimate: string;
  /** Original / starting price before daily uplift */
  originalPrice?: number;
  /** Current uplifted price (numeric) */
  currentPrice?: number;
  stockQuantity?: number;
  currency?: string;
  lotNo: string;
  image: string;
  gallery: string[];
  specs: Spec[];
  featured?: boolean;
  status?: string;
  displayPriceLow?: number;
  displayPriceHigh?: number;
};

export type Article = {
  id: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  cover: string;
  date: string;
  category: Localized;
};

export type Comment = { user: string; text: string };

export type Post = {
  id: string;
  author: Localized;
  avatar: string;
  content: Localized;
  image: string;
  /** Multi-photo lifestyle gallery (detail page). Falls back to [image]. */
  images?: string[];
  date: string;
  likes: number;
  views: number;
  comments: Comment[];
};

export type Banner = {
  id: string;
  image: string;
  headline: Localized;
  sub: Localized;
  linkSlug?: string;
};

const prod = (name: string) => `/products/${name}`;
const gl = (...names: string[]) => names.map((n) => prod(n));
const ava = (seed: string) =>
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`;

const L = (cn: string, zh: string, en: string): Localized => ({ cn, zh, en });

const SL = {
  material: L("材质", "材質", "Material"),
  size: L("规格", "規格", "Dimensions"),
  weight: L("重量", "重量", "Weight"),
  origin: L("产地", "產地", "Origin"),
  era: L("年代", "年代", "Period"),
  craft: L("工艺", "工藝", "Craft"),
  provenance: L("来源", "來源", "Provenance"),
  cert: L("鉴定证书", "鑑定證書", "Certificate"),
} satisfies Record<string, Localized>;

const sp = (label: Localized, cn: string, zh: string, en: string): Spec => ({
  label,
  value: L(cn, zh, en),
});

const CERT = sp(
  SL.cert,
  "附权威鉴定证书",
  "附權威鑑定證書",
  "With certificate of authenticity"
);
const FJ = ["福建 · 寿山", "福建 · 壽山", "Fujian · Shoushan"] as const;
const MY = ["马来西亚 · 海峡华人传承", "馬來西亞 · 海峽華人傳承", "Malaysia · Straits Chinese heritage"] as const;

const legacyProducts: Product[] = [
  {
    id: "p1", slug: "tianhuang-seal", featured: true,
    category: L("田黄石", "田黃石", "Tianhuang Stone"),
    title: L("田黄石方章 · 蜜蜡金黄", "田黃石方章 · 蜜蠟金黃", "Tianhuang Seal · Golden Wax Tone"),
    excerpt: L("色正而润 · 印面平整 · 寿山溪田出品", "色正而潤 · 印面平整 · 壽山溪田出品", "Warm golden tone, flat face, Shoushan stream origin."),
    description: L(
      "此章取材寿山溪田，色泽如蜜蜡，质地温润凝腻。印面开平方正，刀感含蓄，是篆刻与收藏兼宜的田黄小品。田黄石为寿山石之王，存世日稀，尤以上等金黄者为藏家追逐。",
      "此章取材壽山溪田，色澤如蜜蠟，質地溫潤凝膩。印面開平方正，刀感含蓄，是篆刻與收藏兼宜的田黃小品。田黃石為壽山石之王，存世日稀，尤以上等金黃者為藏家追逐。",
      "Cut from Shoushan stream Tianhuang, this seal glows with a wax-gold hue and a creamy, dense texture. The face is squared with restrained carving — ideal for both seal cutting and collecting. Tianhuang remains the king of Shoushan stones, ever scarcer on the market."
    ),
    estimate: "RM 680,000 – 980,000", lotNo: "SS-2026-001", image: prod("ss-03.jpg"),
    gallery: gl("ss-03.jpg", "ss-04.jpg", "ss-05.jpg"),
    specs: [
      sp(SL.material, "寿山田黄石", "壽山田黃石", "Shoushan Tianhuang"),
      sp(SL.size, "高约 3.2 × 2.8 × 4.6 cm", "高約 3.2 × 2.8 × 4.6 cm", "H≈3.2 × 2.8 × 4.6 cm"),
      sp(SL.weight, "约 86 克", "約 86 克", "≈86 g"),
      sp(SL.origin, ...FJ), sp(SL.era, "当代 · 名家旧藏", "當代 · 名家舊藏", "Contemporary · noted collection"),
      sp(SL.craft, "天然皮色 · 手工开方", "天然皮色 · 手工開方", "Natural skin · hand squared"), CERT,
    ],
  },
  {
    id: "p2", slug: "wulong-tianhuang-yuxi", featured: true,
    category: L("田黄石", "田黃石", "Tianhuang Stone"),
    title: L("五龙戏珠田黄大方印", "五龍戲珠田黃大方印", "Five-Dragon Tianhuang Imperial Seal"),
    excerpt: L("整料雕琢 · 五龙戏珠钮 · 殿堂级重器", "整料雕琢 · 五龍戲珠鈕 · 殿堂級重器", "Whole-stone carving, five-dragon knob, museum-grade."),
    description: L(
      "以整块田黄原石雕琢五龙戏珠钮大方印，形四方厚重，蜜蜡黄金色匀净，具备田黄「温、润、凝、腻」之典型特征。龙纹层次清晰，爪势有力，为难得一见的田黄重器。",
      "以整塊田黃原石雕琢五龍戲珠鈕大方印，形四方厚重，蜜蠟黃金色勻淨，具備田黃「溫、潤、凝、膩」之典型特徵。龍紋層次清晰，爪勢有力，為難得一見的田黃重器。",
      "Carved from a single Tianhuang block, this heavy square seal bears a five-dragon pearl-play knob. The wax-gold colour is even throughout, showing the classic Tianhuang qualities of warmth, lustre, density and fineness. A true heavyweight piece."
    ),
    estimate: "RM 2,800,000 – 4,200,000", lotNo: "SS-2026-002", image: prod("ss-17.png"),
    gallery: gl("ss-17.png", "ss-14.png", "ss-13.png"),
    specs: [
      sp(SL.material, "寿山田黄石", "壽山田黃石", "Shoushan Tianhuang"),
      sp(SL.size, "印面约 6.5 × 6.5 cm", "印面約 6.5 × 6.5 cm", "Face ≈6.5 × 6.5 cm"),
      sp(SL.weight, "约 420 克", "約 420 克", "≈420 g"),
      sp(SL.origin, ...FJ), sp(SL.craft, "五龙戏珠钮 · 薄意浮雕", "五龍戲珠鈕 · 薄意浮雕", "Five-dragon knob · low relief"), CERT,
    ],
  },
  {
    id: "p3", slug: "jiyouhuang-seal",
    category: L("田黄石", "田黃石", "Tianhuang Stone"),
    title: L("鸡油黄田黄薄意印", "雞油黃田黃薄意印", "Chicken-Oil Yellow Tianhuang Seal"),
    excerpt: L("色如鸡油 · 薄意山水 · 林派风格", "色如雞油 · 薄意山水 · 林派風格", "Chicken-oil yellow, low-relief landscape, Lin school style."),
    description: L(
      "鸡油黄为田黄名贵品种，此印薄意雕山水人物，刀法浅而意远，侧视如画卷展开。适合案头清玩，亦是东南亚藏家偏爱的入门重器。",
      "雞油黃為田黃名貴品種，此印薄意雕山水人物，刀法淺而意遠，側視如畫卷展開。適合案頭清玩，亦是東南亞藏家偏愛的入門重器。",
      "Chicken-oil yellow is among the finest Tianhuang varieties. Low-relief landscape and figures unfold like a scroll — a refined desk piece favoured by Southeast Asian collectors."
    ),
    estimate: "RM 520,000 – 780,000", lotNo: "SS-2026-003", image: prod("ss-14.png"),
    gallery: gl("ss-14.png", "ss-03.jpg", "ss-05.jpg"),
    specs: [
      sp(SL.material, "鸡油黄田黄石", "雞油黃田黃石", "Chicken-oil Tianhuang"),
      sp(SL.weight, "约 124 克", "約 124 克", "≈124 g"),
      sp(SL.origin, ...FJ), sp(SL.craft, "薄意雕 · 山水人物", "薄意雕 · 山水人物", "Low relief · landscape"), CERT,
    ],
  },
  {
    id: "p4", slug: "chicken-blood-pair",
    category: L("鸡血石", "雞血石", "Chicken-Blood Stone"),
    title: L("昌化鸡血石对章", "昌化雞血石對章", "Changhua Chicken-Blood Seal Pair"),
    excerpt: L("血色鲜凝 · 对章相称 · 印材完整", "血色鮮凝 · 對章相稱 · 印材完整", "Vivid cinnabar red, matched pair, intact material."),
    description: L(
      "昌化鸡血石以血色鲜活动人著称。此对章血色分布自然，地子温润，成对难得，常用于婚庆、开业赠礼或成对收藏。",
      "昌化雞血石以血色鮮活動人著稱。此對章血色分布自然，地子溫潤，成對難得，常用於婚慶、開業贈禮或成對收藏。",
      "Changhua chicken-blood stone is prized for its vivid cinnabar red. This matched pair shows natural colour distribution on a warm ground — popular for weddings, openings or paired collections."
    ),
    estimate: "RM 180,000 – 260,000", lotNo: "SS-2026-004", image: prod("ss-06.jpg"),
    gallery: gl("ss-06.jpg", "ss-07.jpg", "ss-04.jpg"),
    specs: [
      sp(SL.material, "昌化鸡血石", "昌化雞血石", "Changhua chicken-blood"),
      sp(SL.size, "各高约 4.0 cm", "各高約 4.0 cm", "Each H≈4.0 cm"),
      sp(SL.origin, "浙江 · 昌化", "浙江 · 昌化", "Zhejiang · Changhua"), CERT,
    ],
  },
  {
    id: "p5", slug: "furong-stone",
    category: L("寿山石", "壽山石", "Shoushan Stone"),
    title: L("寿山芙蓉石观音摆件", "壽山芙蓉石觀音擺件", "Furong Stone Guanyin Figure"),
    excerpt: L("芙蓉温润 · 观音立像 · 刀工细腻", "芙蓉溫潤 · 觀音立像 · 刀工細膩", "Warm furong stone, standing Guanyin, fine carving."),
    description: L(
      "芙蓉石色白而微透，雕观音立像，神态安详，衣纹流转。适合供奉或陈设，价位较田黄亲民，是华人藏家常见入门品类。",
      "芙蓉石色白而微透，雕觀音立像，神態安詳，衣紋流轉。適合供奉或陳設，價位較田黃親民，是華人藏家常見入門品類。",
      "Furong stone, pale and slightly translucent, is carved as a serene standing Guanyin. A accessible entry point for Chinese collectors compared with Tianhuang."
    ),
    estimate: "RM 68,000 – 98,000", lotNo: "SS-2026-005", image: prod("ss-16.jpg"),
    gallery: gl("ss-16.jpg", "ss-07.jpg", "ss-01.png"),
    specs: [
      sp(SL.material, "寿山芙蓉石", "壽山芙蓉石", "Shoushan furong"),
      sp(SL.craft, "圆雕观音", "圓雕觀音", "Round carving · Guanyin"),
      sp(SL.origin, ...FJ), CERT,
    ],
  },
  {
    id: "p6", slug: "duling-landscape",
    category: L("寿山石", "壽山石", "Shoushan Stone"),
    title: L("杜陵石薄意山水摆件", "杜陵石薄意山水擺件", "Duling Stone Landscape Carving"),
    excerpt: L("杜陵质坚 · 薄意层叠 · 可玩可藏", "杜陵質堅 · 薄意層疊 · 可玩可藏", "Dense duling stone, layered low relief."),
    description: L(
      "杜陵石质地坚润，宜做薄意。此件以远近山水为题，亭台隐现，刀层分明，置于案头颇有意境。",
      "杜陵石質地堅潤，宜做薄意。此件以遠近山水為題，亭台隱現，刀層分明，置於案頭頗有意境。",
      "Dense and lustrous, duling stone suits low-relief work. Distant mountains and pavilions emerge in layered carving — a contemplative desk piece."
    ),
    estimate: "RM 45,000 – 72,000", lotNo: "SS-2026-006", image: prod("ss-02.png"),
    gallery: gl("ss-02.png", "ss-01.png", "ss-07.jpg"),
    specs: [sp(SL.material, "杜陵石", "杜陵石", "Duling stone"), sp(SL.craft, "薄意山水", "薄意山水", "Low-relief landscape"), sp(SL.origin, ...FJ), CERT],
  },
  {
    id: "p7", slug: "lizhi-cave-carving",
    category: L("寿山石", "壽山石", "Shoushan Stone"),
    title: L("荔枝洞石雕罗汉", "荔枝洞石雕羅漢", "Lizhi Cave Arhat Carving"),
    excerpt: L("洞石通灵 · 罗汉神态生动", "洞石通靈 · 羅漢神態生動", "Lizhi cave stone, lively arhat expression."),
    description: L(
      "荔枝洞石质细腻，历史上为寿山名洞之一。此罗汉像神态生动，衣褶自然，具典型福州石雕趣味。",
      "荔枝洞石質細膩，歷史上為壽山名洞之一。此羅漢像神態生動，衣褶自然，具典型福州石雕趣味。",
      "Fine-grained Lizhi cave stone, historically one of Shoushan's famed pits. This arhat shows lively expression and natural drapery — classic Fuzhou carving charm."
    ),
    estimate: "RM 88,000 – 128,000", lotNo: "SS-2026-007", image: prod("ss-07.jpg"),
    gallery: gl("ss-07.jpg", "ss-16.jpg", "ss-05.jpg"),
    specs: [sp(SL.material, "荔枝洞石", "荔枝洞石", "Lizhi cave stone"), sp(SL.origin, ...FJ), CERT],
  },
  {
    id: "p8", slug: "japan-return-qijiang-seal",
    category: L("东洋回流", "東洋回流", "Japan-Return Stone"),
    title: L("东洋回流旗降石兽钮章", "東洋回流旗降石獸鈕章", "Japan-Return Qijiang Beast-Knob Seal"),
    excerpt: L("协会唯一东洋回流件 · 寿山旗降 · 日本旧藏", "協會唯一東洋回流件 · 壽山旗降 · 日本舊藏", "Sole Japan-return piece · qijiang · Japanese provenance."),
    description: L(
      "此章为寿山旗降石兽钮印，石料与钮式属福州印石传统；来源标注为日本关西私人旧藏回流。马来西亚藏家圈常见「东洋回流」寿山印石，本协会仅保留这一件作为国际对照，其余藏品以福建寿山与马来西亚本土文物为主。",
      "此章為壽山旗降石獸鈕印，石料與鈕式屬福州印石傳統；來源標註為日本關西私人舊藏回流。馬來西亞藏家圈常見「東洋回流」壽山印石，本協會僅保留這一件作為國際對照，其餘藏品以福建壽山與馬來西亞本土文物為主。",
      "A Shoushan qijiang beast-knob seal in the Fuzhou tradition, with documented return from a Kansai private collection. 'Japan-return' Shoushan seals are familiar to Malaysian collectors; WACA keeps only this one international-return piece, with the rest of the catalogue focused on Fujian stone and Malaysian heritage."
    ),
    estimate: "RM 32,000 – 48,000", lotNo: "JP-2026-008", image: prod("ss-08.png"),
    gallery: gl("ss-08.png", "ss-03.jpg", "ss-01.png"),
    specs: [
      sp(SL.material, "旗降石", "旗降石", "Qijiang stone"),
      sp(SL.origin, "福建寿山 · 日本回流", "福建壽山 · 日本回流", "Shoushan · Japan return"),
      sp(SL.provenance, "关西私人旧藏", "關西私人舊藏", "Kansai private collection"), CERT,
    ],
  },
  {
    id: "p9", slug: "dzi-nine-eye",
    category: L("天珠", "天珠", "Dzi Beads"),
    title: L("九眼天珠 · 吉隆坡华人旧藏", "九眼天珠 · 吉隆坡華人舊藏", "Nine-Eye Dzi · KL Chinese Provenance"),
    excerpt: L("马来西亚华人圈热门 · 眼纹清晰 · 包浆自然", "馬來西亞華人圈熱門 · 眼紋清晰 · 包漿自然", "Popular among MY Chinese collectors · clear eyes · natural patina."),
    description: L(
      "天珠在马来西亚华人佛教与风水收藏圈流通已久，吉隆坡、槟城藏家常作为护身与陈设。此九眼珠眼纹分布清楚，表面包浆自然，附旧藏盒，符合本地市场常见品相标准，非臆造新仿。",
      "天珠在馬來西亞華人佛教與風水收藏圈流通已久，吉隆坡、檳城藏家常作為護身與陳設。此九眼珠眼紋分佈清楚，表面包漿自然，附舊藏盒，符合本地市場常見品相標準，非臆造新仿。",
      "Dzi beads have long circulated among Malaysian Chinese Buddhist and feng-shui collectors in KL and Penang. This nine-eye bead shows clear eye patterning and natural surface wear, with an old case — consistent with local market standards rather than fresh replicas."
    ),
    estimate: "RM 48,000 – 78,000", lotNo: "MY-2026-009", image: prod("dzi-9eye.jpg"),
    gallery: gl("dzi-9eye.jpg", "dzi-12eye.jpg", "dzi-tiger.jpg"),
    specs: [
      sp(SL.material, "天珠（蚀花玛瑙类）", "天珠（蝕花瑪瑙類）", "Dzi · etched agate type"),
      sp(SL.provenance, "吉隆坡华人旧藏", "吉隆坡華人舊藏", "KL Chinese private collection"),
      sp(SL.era, "传世旧珠", "傳世舊珠", "Heirloom bead"), CERT,
    ],
  },
  {
    id: "p10", slug: "tianhuang-beads",
    category: L("田黄石", "田黃石", "Tianhuang Stone"),
    title: L("田黄手串 · 十八子", "田黃手串 · 十八子", "Tianhuang Bead Bracelet · 18 Beads"),
    excerpt: L("粒粒金黄 · 佩戴盘玩皆宜", "粒粒金黃 · 佩戴盤玩皆宜", "Golden beads for wear or handling."),
    description: L(
      "十八粒田黄圆珠串成，色泽统一，油润感强。相较单件重器，手串更易入门，亦受马来西亚华人藏家欢迎。",
      "十八粒田黃圓珠串成，色澤統一，油潤感強。相較單件重器，手串更易入門，亦受馬來西亞華人藏家歡迎。",
      "Eighteen matched Tianhuang beads with unified golden tone and strong oily lustre — a popular entry format among Malaysian Chinese collectors."
    ),
    estimate: "RM 360,000 – 520,000", lotNo: "SS-2026-010", image: prod("ss-12.jpg"),
    gallery: gl("ss-12.jpg", "ss-03.jpg", "ss-13.png"),
    specs: [sp(SL.material, "田黄石", "田黃石", "Tianhuang"), sp(SL.size, "18 粒 · 径约 10 mm", "18 粒 · 徑約 10 mm", "18 beads · Ø≈10 mm"), CERT],
  },
  {
    id: "p11", slug: "yinbaojin-tianhuang",
    category: L("田黄石", "田黃石", "Tianhuang Stone"),
    title: L("银包金田黄章", "銀包金田黃章", "Silver-Wrapped Gold Tianhuang Seal"),
    excerpt: L("外白内黄 · 稀有品种", "外白內黃 · 稀有品種", "White exterior, golden core — rare variety."),
    description: L(
      "银包金为田黄特殊品类，外圈色白似银，内里金黄。此章皮色自然过渡，识别度高，深受资深藏家青睐。",
      "銀包金為田黃特殊品類，外圈色白似銀，內裡金黃。此章皮色自然過渡，識別度高，深受資深藏家青睞。",
      "Silver-wrapped gold Tianhuang shows a pale outer skin over a golden core. Natural colour transition makes it instantly recognisable to seasoned collectors."
    ),
    estimate: "RM 420,000 – 620,000", lotNo: "SS-2026-011", image: prod("ss-13.png"),
    gallery: gl("ss-13.png", "ss-14.png", "ss-03.jpg"),
    specs: [sp(SL.material, "银包金田黄", "銀包金田黃", "Silver-wrapped gold Tianhuang"), sp(SL.origin, ...FJ), CERT],
  },
  {
    id: "p12", slug: "shoushan-figure",
    category: L("寿山石", "壽山石", "Shoushan Stone"),
    title: L("寿山石达摩摆件", "壽山石達摩擺件", "Shoushan Bodhidharma Figure"),
    excerpt: L("达摩面壁 · 神态内敛", "達摩面壁 · 神態內斂", "Bodhidharma in meditation, restrained expression."),
    description: L(
      "寿山石圆雕达摩，眉须分明，衣纹简练。体量适中，适合书斋陈设，与印石、田黄可成系列收藏。",
      "壽山石圓雕達摩，眉須分明，衣紋簡練。體量適中，適合書齋陳設，與印石、田黃可成系列收藏。",
      "A round-carved Bodhidharma in Shoushan stone — defined brows and beard, concise robes. Pairs well with seals and Tianhuang in a scholar's collection."
    ),
    estimate: "RM 38,000 – 58,000", lotNo: "SS-2026-012", image: prod("ss-16.jpg"),
    gallery: gl("ss-16.jpg", "ss-07.jpg", "ss-04.jpg"),
    specs: [sp(SL.material, "寿山石", "壽山石", "Shoushan stone"), sp(SL.craft, "圆雕", "圓雕", "Round carving"), sp(SL.origin, ...FJ), CERT],
  },
  {
    id: "p13", slug: "nyonya-ware", featured: true,
    category: L("娘惹瓷器", "娘惹瓷器", "Nyonya Ware"),
    title: L("娘惹彩绘大罐 · 槟城旧藏", "娘惹彩繪大罐 · 檳城舊藏", "Nyonya Enamel Jar · Penang Provenance"),
    excerpt: L("粉彩花卉 · 海峡风格 · 品相完整", "粉彩花卉 · 海峽風格 · 品相完整", "Famille rose florals, Straits style, intact condition."),
    description: L(
      "娘惹（Nyonya）彩瓷为峇峇娘惹社群特有收藏品类，器型承中国外销瓷传统，釉色与纹样则迎合马来半岛口味：牡丹、凤凰、瓜果常见。槟城乔治市与马六甲老宅拆出件在本地藏家圈流通最广；此罐口沿描金保存尚可，底款与胎质符合 19 世纪末至 20 世纪初海峡制品特征。",
      "娘惹（Nyonya）彩瓷為峇峇娘惹社群特有收藏品類，器型承中國外銷瓷傳統，釉色與紋樣則迎合馬來半島口味：牡丹、鳳凰、瓜果常見。檳城喬治市與馬六甲老宅拆出件在本地藏家圈流通最廣；此罐口沿描金保存尚可，底款與胎質符合 19 世紀末至 20 世紀初海峽製品特徵。",
      "Nyonya enamelled porcelain is a hallmark of Peranakan households: Chinese export forms with Malayan colour taste — peonies, phoenixes, gourds. Pieces from George Town and Malacca shophouses dominate the local market; this jar retains usable gilt rims and body traits typical of late-19th to early-20th-century Straits ware."
    ),
    estimate: "RM 28,000 – 45,000", lotNo: "MY-2026-013", image: prod("my-nyonya.jpg"),
    gallery: gl("my-nyonya.jpg", "my-strait-porcelain.jpg", "my-baba-cabinet.jpg"),
    specs: [
      sp(SL.material, "瓷 · 粉彩 enamel", "瓷 · 粉彩 enamel", "Porcelain · famille rose"),
      sp(SL.era, "19–20 世纪", "19–20 世紀", "19th–20th century"),
      sp(SL.provenance, ...MY), CERT,
    ],
  },
  {
    id: "p14", slug: "malay-keris",
    category: L("马来短剑", "馬來短劍", "Keris"),
    title: L("马来克力士 · 波浪纹剑刃", "馬來克力士 · 波浪紋劍刃", "Malay Keris · Pamor Blade"),
    excerpt: L("Pamor 纹 · 木雕剑柄 · 传承完整", "Pamor 紋 · 木雕劍柄 · 傳承完整", "Pamor pattern, carved hilt, documented heritage."),
    description: L(
      "克力士（Keris）是马来半岛、印尼群岛重要的礼仪与身份兵器，刃身 pamor 由多层铁料锻焊形成，纹样各异。马来西亚博物与私人收藏中，完整带鞘、柄雕清晰者更受重视。此件波浪刃（luk）可辨，木鞘与金属箍保存相对完整，属半岛常见传世类型，非旅游纪念品级新做。",
      "克力士（Keris）是馬來半島、印尼群島重要的禮儀與身份兵器，刃身 pamor 由多層鐵料鍛焊形成，紋樣各異。馬來西亞博物與私人收藏中，完整帶鞘、柄雕清晰者更受重視。此件波浪刃（luk）可辨，木鞘與金屬箍保存相對完整，屬半島常見傳世類型，非旅遊紀念品級新做。",
      "The keris is a ceremonial and status blade across the Malay Peninsula and archipelago. Pamor patterns form from forge-welded layers; Malaysian museums and private collectors prefer complete sheaths and clear hilts. This example shows readable luk waves and a relatively intact wood sheath — a peninsula heirloom type rather than tourist-grade new make."
    ),
    estimate: "RM 35,000 – 55,000", lotNo: "MY-2026-014", image: prod("my-keris.jpg"),
    gallery: gl("my-keris.jpg", "my-pewter.jpg", "my-banknote.jpg"),
    specs: [
      sp(SL.material, "铁 · 木 · 黄铜", "鐵 · 木 · 黃銅", "Iron · wood · brass"),
      sp(SL.era, "19 世纪", "19 世紀", "19th century"),
      sp(SL.origin, "马来半岛", "馬來半島", "Malay Peninsula"), CERT,
    ],
  },
  {
    id: "p15", slug: "strait-porcelain",
    category: L("海峡古董", "海峽古董", "Straits Antiques"),
    title: L("海峡华人青花碗 · 金边", "海峽華人青花碗 · 金邊", "Straits Chinese Blue-White Bowl · Gilt Rim"),
    excerpt: L("外销瓷风格 · 马六甲回流", "外銷瓷風格 · 馬六甲回流", "Export-ware style, Malacca return."),
    description: L(
      "海峡华人家庭常用瓷器兼具中国与南洋审美。此碗青花发色沉稳，口沿描金，为本地拍卖常出现的实用型古董。",
      "海峽華人家庭常用瓷器兼具中國與南洋審美。此碗青花發色沉穩，口沿描金，為本地拍賣常出現的實用型古董。",
      "Straits Chinese household porcelain balances Chinese and Nanyang taste. Stable blue tones and gilt rim — a practical antique category familiar in local sales."
    ),
    estimate: "RM 12,000 – 22,000", lotNo: "MY-2026-015", image: prod("my-strait-porcelain.jpg"),
    gallery: gl("my-strait-porcelain.jpg", "my-nyonya.jpg", "my-pewter.jpg"),
    specs: [sp(SL.material, "瓷", "瓷", "Porcelain"), sp(SL.provenance, ...MY), CERT],
  },
  {
    id: "p16", slug: "malay-pewter",
    category: L("锡镴器", "錫鑞器", "Pewter"),
    title: L("马来锡镴茶具套装", "馬來錫鑞茶具套裝", "Malay Pewter Tea Set"),
    excerpt: L("锤纹工艺 · 南洋日常器物", "錘紋工藝 · 南洋日常器物", "Hammered finish, Nanyang daily ware."),
    description: L(
      "锡镴器在马来西亚华人及马来社群中广泛使用。此套装锤纹均匀，壶嘴流畅，兼具实用与装饰，是本土拍卖温和溢价品类。",
      "錫鑞器在馬來西亞華人及馬來社群中廣泛使用。此套裝錘紋均勻，壺嘴流暢，兼具實用與裝飾，是本土拍賣溫和溢價品類。",
      "Pewter was widely used across Malaysian Chinese and Malay communities. Even hammer marks and a graceful spout — steady performers at local auctions."
    ),
    estimate: "RM 8,500 – 14,000", lotNo: "MY-2026-016", image: prod("my-pewter.jpg"),
    gallery: gl("my-pewter.jpg", "my-strait-porcelain.jpg", "my-banknote.jpg"),
    specs: [sp(SL.material, "锡镴", "錫鑞", "Pewter"), sp(SL.era, "20 世纪中叶", "20 世紀中葉", "Mid-20th century"), sp(SL.origin, "马来西亚", "馬來西亞", "Malaysia"), CERT],
  },
  {
    id: "p17", slug: "malaya-banknotes",
    category: L("纸钞钱币", "紙鈔錢幣", "Banknotes & Coins"),
    title: L("海峡殖民地纸钞一组", "海峽殖民地紙鈔一組", "Straits Settlements Banknote Group"),
    excerpt: L("马六甲 · 槟城藏家旧藏", "馬六甲 · 檳城藏家舊藏", "Malacca & Penang collector provenance."),
    description: L(
      "英属海峡殖民地及早期马来亚纸钞在本地收藏圈热度上升。此组品相整齐，含不同面额与签名版，适合钱币专题拍卖。",
      "英屬海峽殖民地及早期馬來亞紙鈔在本地收藏圈熱度上升。此組品相整齊，含不同面額與簽名版，適合錢幣專題拍賣。",
      "British Straits Settlements and early Malaya notes are trending locally. This neat group spans denominations and signature types — ideal for a numismatic session."
    ),
    estimate: "RM 18,000 – 32,000", lotNo: "MY-2026-017", image: prod("my-banknote.jpg"),
    gallery: gl("my-banknote.jpg", "my-pewter.jpg", "my-keris.jpg"),
    specs: [sp(SL.material, "纸钞", "紙鈔", "Banknotes"), sp(SL.era, "1930–1950 年代", "1930–1950 年代", "1930s–1950s"), sp(SL.provenance, ...MY), CERT],
  },
  {
    id: "p18", slug: "baba-cabinet",
    category: L("峇峇家具", "峇峇家具", "Baba Furniture"),
    title: L("峇峇娘惹螺钿柜 · 乔治市", "峇峇娘惹螺鈿櫃 · 喬治市", "Peranakan Mother-of-Pearl Cabinet · George Town"),
    excerpt: L("漆螺钿 · 老宅拆卸 · 结构完整", "漆螺鿿 · 老宅拆卸 · 結構完整", "Lacquer and inlay from a heritage shophouse."),
    description: L(
      "乔治市世界遗产区老宅常出娘惹家具。此柜螺钿排列细密，漆色沉稳，抽屉完整，是马来西亚高端本土收藏代表性拍品。",
      "喬治市世界遺產區老宅常出娘惹家具。此櫃螺鈿排列細密，漆色沉穩，抽屜完整，是馬來西亞高端本土收藏代表性拍品。",
      "Heritage shophouses in George Town often yield Peranakan furniture. Tight mother-of-pearl inlay and intact drawers — a flagship local collecting category."
    ),
    estimate: "RM 85,000 – 140,000", lotNo: "MY-2026-018", image: prod("my-baba-cabinet.jpg"),
    gallery: gl("my-baba-cabinet.jpg", "my-nyonya.jpg", "my-strait-porcelain.jpg"),
    specs: [sp(SL.material, "木 · 漆 · 螺钿", "木 · 漆 · 螺鈿", "Wood · lacquer · mother-of-pearl"), sp(SL.provenance, "槟城乔治市", "檳城喬治市", "George Town, Penang"), CERT],
  },
  {
    id: "p19", slug: "tianhuang-jipin-limited", featured: true,
    category: L("田黄石", "田黃石", "Tianhuang Stone"),
    title: L("极品田黄石素章 · 限量", "極品田黃石素章 · 限量", "Top-grade Tianhuang Plain Seal · Limited"),
    excerpt: L("溪田极品 · 萝卜丝纹 · 石帝灵韵", "溪田極品 · 蘿蔔絲紋 · 石帝靈韻", "Stream-field grade · radish-silk grain · stone emperor."),
    description: L(
      "万年溪田淬炼而成的文房至宝，独产于寿山溪田沃土。此方极品田黄素章石质温润绵密，肌理莹透，自然光下细密萝卜丝纹舒展如云烟，石色金黄含蓄而不俗。古有「一两田黄三两金」之誉；现优质溪田料日稀，形制端正、色纹兼备者尤难得。适合篆刻、盘玩与陈设，亦为协会自老站迁入的核心田黄藏品。",
      "萬年溪田淬煉而成的文房至寶，獨產於壽山溪田沃土。此方極品田黃素章石質溫潤綿密，肌理瑩透，自然光下細密蘿蔔絲紋舒展如雲煙，石色金黃含蓄而不俗。古有「一兩田黃三兩金」之譽；現優質溪田料日稀，形制端正、色紋兼備者尤難得。適合篆刻、盤玩與陳設，亦為協會自老站遷入的核心田黃藏品。",
      "A top-grade plain Tianhuang seal from Shoushan stream-field deposits — creamy, dense, translucent, with fine radish-silk veining under light and restrained golden tone. Classic lore prized Tianhuang above gold by weight; well-formed pieces with colour and grain are scarce today. Suited to seal cutting, handling and display — a core Tianhuang lot migrated from the prior catalogue."
    ),
    estimate: "RM 220,000 – 380,000", lotNo: "TIANHUANGSHI-090001-JIPIN",
    image: prod("ss-41-cover.jpg"),
    gallery: gl("ss-41-cover.jpg", "ss-41a.jpg", "ss-41b.jpg", "ss-41c.jpg"),
    specs: [
      sp(SL.material, "寿山田黄石 · 极品", "壽山田黃石 · 極品", "Shoushan Tianhuang · top grade"),
      sp(SL.craft, "素章 · 无钮雕", "素章 · 無鈕雕", "Plain seal · no knob carving"),
      sp(SL.origin, ...FJ),
      sp(SL.provenance, "协会迁入藏品", "協會遷入藏品", "Association migrated lot"), CERT,
    ],
  },
  {
    id: "p20", slug: "tianhuang-mid-grade",
    category: L("田黄石", "田黃石", "Tianhuang Stone"),
    title: L("中品田黄石", "中品田黃石", "Medium-grade Tianhuang Stone"),
    excerpt: L("石中之王 · 萝卜丝纹 · 温润如脂", "石中之王 · 蘿蔔絲紋 · 溫潤如脂", "King of stones · radish grain · creamy touch."),
    description: L(
      "田黄石产于寿山溪旁田垄，自古视为「石中之王」。中品料以温润石肌与天然萝卜丝纹见长，色多见黄金黄、鸡油黄，含蓄不张扬；抚之如凝脂，观之如蜜蜡。适合入门收藏与案头清玩，亦是马来西亚华人圈常见的田黄起点品类。",
      "田黃石產於壽山溪旁田壟，自古視為「石中之王」。中品料以溫潤石肌與天然蘿蔔絲紋見長，色多見黃金黃、雞油黃，含蓄不張揚；撫之如凝脂，觀之如蜜蠟。適合入門收藏與案頭清玩，亦是馬來西亞華人圈常見的田黃起點品類。",
      "Tianhuang from the paddies beside Shoushan streams has long been called the 'king of stones'. Mid-grade pieces favour a creamy body and natural radish-silk grain in golden or chicken-oil yellow — a familiar starting point for Malaysian Chinese collectors and desk enjoyment."
    ),
    estimate: "RM 48,000 – 72,000", lotNo: "ZPTHS09252616161",
    image: prod("ss-42-cover.jpg"),
    gallery: gl("ss-42-cover.jpg", "ss-42a.jpg", "ss-03.jpg"),
    specs: [
      sp(SL.material, "田黄石 · 中品", "田黃石 · 中品", "Tianhuang · medium grade"),
      sp(SL.origin, ...FJ), CERT,
    ],
  },
  {
    id: "p21", slug: "shoushan-chicken-blood", featured: true,
    category: L("鸡血石", "雞血石", "Chicken-Blood Stone"),
    title: L("寿山石系 · 鸡血石重器", "壽山石系 · 雞血石重器", "Shoushan Circle · Chicken-Blood Masterpiece"),
    excerpt: L("石中红玉 · 辰砂血色 · 印石双绝", "石中紅玉 · 辰砂血色 · 印石雙絕", "Red jade among stones · cinnabar red · seal-stone twin."),
    description: L(
      "鸡血石与田黄并称印石双绝，为中国四大国石之一，素有「石中红玉」「活血之宝」之称。主产浙江昌化与内蒙古巴林；以体内鲜红辰砂「血」为魂。此件血色凝活、地子稳净，适合重器收藏与开业、节庆陈设，亦为老站迁入的核心鸡血藏品。",
      "雞血石與田黃並稱印石雙絕，為中國四大國石之一，素有「石中紅玉」「活血之寶」之稱。主產浙江昌化與內蒙古巴林；以體內鮮紅辰砂「血」為魂。此件血色凝活、地子穩淨，適合重器收藏與開業、節慶陳設，亦為老站遷入的核心雞血藏品。",
      "With Tianhuang, chicken-blood stone forms the twin peaks of seal stones and is one of China's four national stones — the 'red jade' prized for vivid cinnabar 'blood'. Main sources are Changhua (Zhejiang) and Balin (Inner Mongolia). This piece shows lively red on a stable ground — a centrepiece lot migrated from the prior catalogue."
    ),
    estimate: "RM 680,000 – 980,000", lotNo: "ZPTHS09253588777",
    image: prod("ss-21.png"),
    gallery: gl("ss-21.png", "ss-06.jpg", "ss-03.jpg"),
    specs: [
      sp(SL.material, "鸡血石", "雞血石", "Chicken-blood stone"),
      sp(SL.origin, "浙江昌化 / 巴林系", "浙江昌化 / 巴林系", "Changhua / Balin type"), CERT,
    ],
  },
];

/**
 * Hero slides: prefer full-silhouette studio shots (Hero uses object-contain).
 * No Japanese baked into art — headline/sub switch with site locale.
 */
export const banners: Banner[] = [
  {
    id: "b1",
    image: prod("cj-41-g1.jpg"),
    linkSlug: "cj-41-top-grade-tianhuang-stone-limited",
    headline: L("极品田黄石 · 限量典藏", "極品田黃石 · 限量典藏", "Top-grade Tianhuang · Limited"),
    sub: L("溪田石帝 · 完整器形与原配锦盒", "溪田石帝 · 完整器形與原配錦盒", "Full form with original presentation box"),
  },
  {
    id: "b2",
    image: prod("cj-41-g2.jpg"),
    linkSlug: "cj-41-top-grade-tianhuang-stone-limited",
    headline: L("稀有与独一无二的光泽", "稀有與獨一無二的光澤", "Rarity and one-of-a-kind lustre"),
    sub: L("一期一会的收藏邂逅，请勿错过", "一期一會的收藏邂逅，請勿錯過", "A once-in-a-lifetime encounter — don’t miss it"),
  },
  {
    id: "b3",
    image: prod("cj-74-cover.png"),
    linkSlug: "cj-74-shoushan-chicken-blood-stone",
    headline: L("鸡血石 · 石中红玉", "雞血石 · 石中紅玉", "Chicken-Blood · Red Jade of Stones"),
    sub: L("印石双绝之一 · 协会精选", "印石雙絕之一 · 協會精選", "One of the twin seal-stone legends"),
  },
  {
    id: "b4",
    image: prod("cj-42-g1.jpg"),
    linkSlug: "cj-42-mid-grade-tianhuang-stone",
    headline: L("中品田黄 · 温润如脂", "中品田黃 · 溫潤如脂", "Mid-grade Tianhuang · Creamy touch"),
    sub: L("天然纹理 · 入门优选", "天然紋理 · 入門優選", "Natural grain — ideal entry piece"),
  },
  {
    id: "b5",
    image: prod("cj-41-cover.jpg"),
    linkSlug: "cj-41-top-grade-tianhuang-stone-limited",
    headline: L("寿山石与南洋珍藏", "壽山石與南洋珍藏", "Shoushan & Nanyang Collections"),
    sub: L("浏览协会全部藏品", "瀏覽協會全部藏品", "Browse the full association catalogue"),
  },
  {
    id: "b6",
    image: prod("my-nyonya.jpg"),
    linkSlug: "nyonya-ware",
    headline: L("娘惹彩绘大罐 · 槟城旧藏", "娘惹彩繪大罐 · 檳城舊藏", "Nyonya Enamel Jar · Penang"),
    sub: L("马来西亚热门本土藏品", "馬來西亞熱門本土藏品", "A Malaysian collecting favourite"),
  },
  {
    id: "b7",
    image: prod("my-keris.jpg"),
    linkSlug: "malay-keris",
    headline: L("马来克力士 · 波浪纹剑刃", "馬來克力士 · 波浪紋劍刃", "Malay Keris · Pamor Blade"),
    sub: L("半岛传世礼仪兵器", "半島傳世禮儀兵器", "Peninsula ceremonial heirloom"),
  },
];

export const newsBanners: Banner[] = [
  {
    id: "nb1", image: prod("news-1782909343523-xnfjx.png"),
    headline: L("田黄石市场洞察", "田黃石市場洞察", "Tianhuang Market Insight"),
    sub: L("东南亚藏家关注焦点", "東南亞藏家關注焦點", "What SEA collectors watch"),
  },
  {
    id: "nb2", image: prod("news-1782908516876-d7z27gx.png"),
    headline: L("吉隆坡秋季专场", "吉隆坡秋季專場", "KL Autumn Sale"),
    sub: L("寿山石与南洋珍品", "壽山石與南洋珍品", "Shoushan & Nanyang treasures"),
  },
  {
    id: "nb3", image: prod("news-1782905977869-xvjbnk.png"),
    headline: L("香港夜场成交回顾", "香港夜場成交回顧", "Hong Kong Evening Results"),
    sub: L("区域买家活跃", "區域買家活躍", "Strong regional bidding"),
  },
  {
    id: "nb4", image: prod("news-1782907781369-ag4ux.png"),
    headline: L("五龙戏珠田黄印", "五龍戲珠田黃印", "Five-Dragon Tianhuang Seal"),
    sub: L("殿堂级重器赏析", "殿堂級重器賞析", "Museum-grade highlight"),
  },
];

const AC = {
  market: L("市场分析", "市場分析", "Market"),
  preview: L("专场预告", "專場預告", "Preview"),
  result: L("成交纪录", "成交紀錄", "Results"),
  knowledge: L("鉴藏知识", "鑑藏知識", "Guide"),
  local: L("本土收藏", "本土收藏", "Local"),
};

export const articles: Article[] = [
  {
    id: "n1", date: "2026-06-12", category: AC.market, cover: prod("news-1782909343523-xnfjx.png"),
    title: L("全球田黄石市场综合分析", "全球田黃石市場綜合分析", "Global Tianhuang Market Outlook"),
    excerpt: L("寿山溪田矿脉资源递减，100 克以上极品田黄溢价率持续走高。", "壽山溪田礦脈資源遞減，100 克以上極品田黃溢價率持續走高。", "Shoushan stream deposits dwindle; top pieces over 100g keep commanding premiums."),
    body: L(
      "行业数据显示，福建寿溪田黄完整大料库存逐年减少，国际拍卖协会统计近五年百克以上中极品田黄全球平均溢价率稳定超过 30%。\n\n马来西亚与新加坡买家近年在吉隆坡、槟城预展中表现活跃，尤其偏好鸡油黄、银包金等可识别品种。香港夜场仍是大料成交风向标，但东南亚私人洽购增长明显。\n\n鉴藏要点在于皮色、萝卜纹、红格与手感油润度，建议结合权威证书与流传记录。",
      "行業數據顯示，福建壽溪田黃完整大料庫存逐年減少，國際拍賣協會統計近五年百克以上中極品田黃全球平均溢價率穩定超過 30%。\n\n馬來西亞與新加坡買家近年在吉隆坡、檳城預展中表現活躍，尤其偏好雞油黃、銀包金等可識別品種。香港夜場仍是大料成交風向標，但東南亞私人洽購增長明顯。\n\n鑑藏要點在於皮色、蘿蔔紋、紅格與手感油潤度，建議結合權威證書與流傳記錄。",
      "Industry data shows Shoushan Tianhuang stocks falling year on year, with 100g+ gems averaging over 30% premium globally in five years.\n\nMalaysian and Singapore buyers have been active at KL and Penang previews, favouring chicken-oil yellow and silver-wrapped gold varieties. Hong Kong evenings still set benchmarks, but private SEA deals are rising.\n\nLook for skin tone, radish veins, red grids and oily hand-feel — always pair with certificates and provenance."
    ),
  },
  {
    id: "n2", date: "2026-05-28", category: AC.preview, cover: prod("news-1782908516876-d7z27gx.png"),
    title: L("吉隆坡寿山石秋季专场预告", "吉隆坡壽山石秋季專場預告", "KL Autumn Shoushan Stone Sale Preview"),
    excerpt: L("汇集田黄、鸡血、芙蓉等 18 件拍品，11 月吉隆坡展厅开放预展。", "匯集田黃、雞血、芙蓉等 18 件拍品，11 月吉隆坡展廳開放預展。", "18 lots including Tianhuang, chicken-blood and furong — KL preview in November."),
    body: L(
      "本季海峡金石拍卖设寿山石专题，田黄薄意印、五龙戏珠大方印领衔，辅以昌化鸡血对章与芙蓉、杜陵摆件。所有拍品均附鉴定证书，支持电话与线上竞投。\n\n预展时间 11 月 8–14 日，武吉免登展厅。同时呈现娘惹瓷器与克力士等马来西亚本土板块，方便藏家一次看全。",
      "本季海峽金石拍賣設壽山石專題，田黃薄意印、五龍戲珠大方印領銜，輔以昌化雞血對章與芙蓉、杜陵擺件。所有拍品均附鑑定證書，支持電話與線上競投。\n\n預展時間 11 月 8–14 日，武吉免登展廳。同時呈現娘惹瓷器與克力士等馬來西亞本土板塊，方便藏家一次看全。",
      "Our autumn sale features a Shoushan session led by Tianhuang seals and the five-dragon imperial piece, plus chicken-blood pairs and furong carvings — all certified, with phone and online bidding.\n\nPreview 8–14 Nov at Bukit Bintang, alongside Nyonya ware and keris from our Malaysian section."
    ),
  },
  {
    id: "n3", date: "2026-04-15", category: AC.result, cover: prod("news-1782905977869-xvjbnk.png"),
    title: L("香港秋拍：那兰兴德作田黄印高价成交", "香港秋拍：那蘭興德作田黃印高價成交", "HK Autumn: Tianhuang Seal Realises Strong Price"),
    excerpt: L("起拍 HKD 1500 万，经多轮电话竞投，由东南亚资深藏家落槌。", "起拍 HKD 1500 萬，經多輪電話競投，由東南亞資深藏家落槌。", "Opened HKD 15M; hammered to a veteran Southeast Asian collector."),
    body: L(
      "清代那兰兴德田黄瑞兽对章在香港秋季拍卖中成为焦点。东南亚买家电话竞投积极，最终成交总额含佣金逾 HKD 2688 万，显示高端田黄在区域市场仍有强劲需求。\n\n业内观察，马来西亚与新加坡藏家对来源清晰、重量可观的田黄重器持续加价，预展期间的上手体验对成交帮助明显。",
      "清代那蘭興德田黃瑞獸對章在香港秋季拍賣中成為焦點。東南亞買家電話競投積極，最終成交總額含佣金逾 HKD 2688 萬，顯示高端田黃在區域市場仍有強勁需求。\n\n業內觀察，馬來西亞與新加坡藏家對來源清晰、重量可觀的田黃重器持續加價，預展期間的上手體驗對成交幫助明顯。",
      "A Qing-period Tianhuang twin seal by Nalan Xingde starred at the Hong Kong autumn sale. Strong phone bidding from Southeast Asia pushed the total past HKD 26.88M with fees — proof that top Tianhuang still moves in the region.\n\nMalaysian and Singapore collectors keep paying up for heavy pieces with clear provenance; handling at preview clearly helps close deals."
    ),
  },
  {
    id: "n4", date: "2026-03-20", category: AC.local, cover: prod("my-nyonya.jpg"),
    title: L("娘惹文物：马来西亚收藏新热点", "娘惹文物：馬來西亞收藏新熱點", "Nyonya Heirlooms: Malaysia's New Collecting Wave"),
    excerpt: L("槟城、马六甲老宅释出家具与瓷器，本地拍卖溢价稳步上升。", "檳城、馬六甲老宅釋出家具與瓷器，本地拍賣溢價穩步上升。", "Penang and Malacca shophouse pieces seeing steady premium growth."),
    body: L(
      "随着乔治市与马六甲世界遗产热度提升，娘惹瓷器、螺钿家具与海峡银器成为 MNP、Younie 等本地拍卖行的常客。年轻藏家开始从「能装饰、有故事」的品类切入。\n\n建议优先看品相完整度、原配组件与老照片来源，避免过度翻新件。",
      "隨著喬治市與馬六甲世界遺產熱度提升，娘惹瓷器、螺鈿家具與海峽銀器成為 MNP、Younie 等本地拍賣行的常客。年輕藏家開始從「能裝飾、有故事」的品類切入。\n\n建議優先看品相完整度、原配組件與老照片來源，避免過度翻新件。",
      "With George Town and Malacca heritage trending, Nyonya porcelain, inlaid furniture and Straits silver are staples at MNP, Younie and peers. Younger collectors want pieces that display well and tell a story.\n\nPrioritise completeness, original fittings and photo provenance — steer clear of over-restored items."
    ),
  },
  {
    id: "n5", date: "2026-02-08", category: AC.knowledge, cover: prod("news-1782907781369-ag4ux.png"),
    title: L("五龙戏珠田黄大方印赏析", "五龍戲珠田黃大方印賞析", "Appreciating the Five-Dragon Tianhuang Seal"),
    excerpt: L("从选料、开料、雕钮到印面，解读殿堂级田黄重器。", "從選料、開料、雕鈕到印面，解讀殿堂級田黃重器。", "From stone selection to knob carving — reading a masterpiece."),
    body: L(
      "五龙戏珠钮要求整块田黄无明显裂隙，且色匀质腻。雕工需兼顾龙身转折与钮座稳定，是寿山石雕中的高难题材。\n\n收藏者宜关注龙爪、鳞片刻画层次及原皮保留面积，这些细节直接影响拍卖估价区间。",
      "五龍戲珠鈕要求整塊田黃無明顯裂隙，且色勻質膩。雕工需兼顧龍身轉折與鈕座穩定，是壽山石雕中的高難題材。\n\n收藏者宜關注龍爪、鱗片刻畫層次及原皮保留面積，這些細節直接影響拍賣估價區間。",
      "The five-dragon knob demands a flawless Tianhuang block with even colour. Carvers must balance dynamic dragons with a stable finial — among the hardest Shoushan themes.\n\nCollectors should study claws, scale layers and retained original skin — these details move estimates sharply."
    ),
  },
  {
    id: "n6", date: "2026-01-18", category: AC.preview, cover: prod("news-1782891242640-eu8c0e.jpg"),
    title: L("十五周年：鸿禧旧藏田黄专题", "十五週年：鴻禧舊藏田黃專題", "15th Anniversary: Hongxi Tianhuang Collection"),
    excerpt: L("14 件东洋回流田黄印石同台呈现。", "14 件東洋回流田黃印石同台呈現。", "14 Tianhuang seals from a noted East Asian collection."),
    body: L(
      "周年专场汇集鸡油黄、银包金等品种，部分附早期拍卖图录与流传记录。马来西亚藏家可通过 KL 预展预约上手。\n\n专题旨在呈现「可学习、可比较」的田黄样本，帮助新藏家建立品类认知。",
      "週年專場匯集雞油黃、銀包金等品種，部分附早期拍賣圖錄與流傳記錄。馬來西亞藏家可透過 KL 預展預約上手。\n\n專題旨在呈現「可學習、可比較」的田黃樣本，幫助新藏家建立品類認知。",
      "Anniversary session gathers chicken-oil yellow and silver-wrapped gold pieces, some with early catalogue history. Malaysian buyers may handle them at our KL preview.\n\nThe aim is teachable, comparable Tianhuang examples for newer collectors."
    ),
  },
  {
    id: "n7", date: "2025-12-05", category: AC.local, cover: prod("my-keris.jpg"),
    title: L("马来西亚拍卖行与收藏生态概览", "馬來西亞拍賣行與收藏生態概覽", "Malaysia's Auction Scene: A Quick Guide"),
    excerpt: L("从 MNP 到本土画廊，东南亚买家如何参与竞投。", "從 MNP 到本土畫廊，東南亞買家如何參與競投。", "From MNP to local galleries — how to bid in the region."),
    body: L(
      "马来西亚拍卖市场以海峡华人古董、娘惹文物、钱币与部分中国艺术品为主。吉隆坡、槟城定期有预展，电话与线上竞投已普及。\n\n新买家建议先从中小价位本土品类入手，再逐步接触田黄等高端石料。",
      "馬來西亞拍賣市場以海峽華人古董、娘惹文物、錢幣與部分中國藝術品為主。吉隆坡、檳城定期有預展，電話與線上競投已普及。\n\n新買家建議先從中小價位本土品類入手，再逐步接觸田黃等高端石料。",
      "Malaysia's market focuses on Straits antiques, Nyonya pieces, numismatics and select Chinese art. KL and Penang host regular previews; phone and online bidding are standard.\n\nNew buyers often start with mid-range local categories before moving into Tianhuang and other high-end stones."
    ),
  },
  {
    id: "n8", date: "2025-11-20", category: AC.knowledge, cover: prod("ss-03.jpg"),
    title: L("艺术品拍卖入门：如何读懂图录", "藝術品拍賣入門：如何讀懂圖錄", "Auction Basics: Reading a Catalogue"),
    excerpt: L("估价、品相描述、来源与佣金，一文搞懂。", "估價、品相描述、來源與佣金，一文搞懂。", "Estimates, condition, provenance and fees explained."),
    body: L(
      "图录中的「估价」是参考区间而非底价；品相描述需对照预展实物。来源（provenance）在本土拍卖中越来越受重视，尤其是娘惹家具与钱币。\n\n马来西亚买家另需留意 GST/SST 与跨境运输保险，我们提供一站式顾问服务。",
      "圖錄中的「估價」是參考區間而非底價；品相描述需對照預展實物。來源（provenance）在本土拍賣中越來越受重視，尤其是娘惹家具與錢幣。\n\n馬來西亞買家另需留意 GST/SST 與跨境運輸保險，我們提供一站式顧問服務。",
      "Catalogue estimates are guides, not reserves — always compare with preview inspection. Provenance matters more each year, especially for Nyonya furniture and notes.\n\nMalaysian buyers should also factor SST and insured cross-border shipping — our advisors can handle both."
    ),
  },
];

type Seed = {
  a: [string, string, string];
  av: string;
  img: string;
  d: string;
  c: [string, string, string];
  likes: number;
  views: number;
  cm: [string, string][];
};

const seeds: Seed[] = [
  { a: ["槟城藏家·慧玲", "檳城藏家·慧玲", "Penang · Hui Ling"], av: ava("huiling"), img: prod("ss-03.jpg"), d: "2026-06-18", c: ["今天到 KL 预展上手这枚田黄章，油润感真的不一样，马来西亚能直接看实物太方便了 👍 #田黄石 #寿山石", "今天到 KL 預展上手這枚田黃章，油潤感真的不一樣，馬來西亞能直接看實物太方便了 👍", "Handled this Tianhuang seal at our KL preview — the oily lustre has to be felt in person 👍 #Tianhuang"], likes: 892, views: 14230, cm: [["Jason·马六甲", "几时还有预展？"], ["Mei", "好美！"]] },
  { a: ["吉隆坡展厅", "吉隆坡展廳", "KL Gallery"], av: ava("klgallery"), img: prod("ss-17.png"), d: "2026-06-02", c: ["五龙戏珠大方印已布置好，欢迎预约参观。本土藏家别错过和寿山重器近距离接触的机会 ✨", "五龍戲珠大方印已佈置好，歡迎預約參觀。本土藏家別錯過和壽山重器近距離接觸的機會 ✨", "Five-dragon seal is on display — book a visit, local collectors welcome ✨"], likes: 654, views: 9870, cm: [["阿明", "已预约周六"]] },
  { a: ["收藏新手·Ken", "收藏新手·Ken", "Ken · New Collector"], av: ava("kenmy"), img: prod("my-nyonya.jpg"), d: "2026-05-20", c: ["第一只娘惹罐入手！放在槟城老家餐厅，阿嬷说颜色跟她年轻时用的很像 🥹", "第一隻娘惹罐入手！放在檳城老家餐廳，阿嬷說顏色跟她年輕時用的很像 🥹", "My first Nyonya jar — granny says the colours match her youth in Penang 🥹"], likes: 1203, views: 18940, cm: [["Nyonya Auntie", "有品味 lah"]] },
  { a: ["石友·国栋", "石友·國棟", "Stone Friend · Guodong"], av: ava("guodong"), img: prod("ss-06.jpg"), d: "2026-05-06", c: ["鸡血对章成对很难得，放在办公室讨个吉利。线上看图还不确定，预展看了才下单。", "雞血對章成對很難得，放在辦公室討個吉利。線上看圖還不確定，預展看了才下單。", "Matched chicken-blood pair — lucky desk piece. Only bought after seeing them at preview."], likes: 445, views: 7120, cm: [["Lee", "血色好鲜"]] },
  { a: ["娘惹文化·Yasmin", "娘惹文化·Yasmin", "Yasmin · Peranakan"], av: ava("yasmin"), img: prod("my-baba-cabinet.jpg"), d: "2026-04-22", c: ["乔治市老宅拆下来的螺钿柜，花纹跟家里以前那套好像，果断收藏了 🇲🇾", "喬治市老宅拆下來的螺鈿櫃，花紋跟家裡以前那套好像，果斷收藏了 🇲🇾", "Mother-of-pearl cabinet from a George Town shophouse — patterns like my family's old set 🇲🇾"], likes: 1567, views: 24100, cm: [["Penang Heritage", "赞 preservation"]] },
  { a: ["篆刻·志伟", "篆刻·志偉", "Seal Carver · Zhiwei"], av: ava("zhiwei"), img: prod("ss-08.png"), d: "2026-04-08", c: ["旗降章印面开了，刻了「海峡金石」四字，配寿山收藏刚好。", "旗降章印面開了，刻了「海峽金石」四字，配壽山收藏剛好。", "Had my qijiang seal face carved with four characters — fits my Shoushan shelf nicely."], likes: 378, views: 5890, cm: [["篆刻社", "刀法不错"]] },
  { a: ["短剑爱好者·Hafiz", "短劍愛好者·Hafiz", "Hafiz · Keris Fan"], av: ava("hafiz"), img: prod("my-keris.jpg"), d: "2026-03-25", c: ["这把 pamor 纹好特别，跟马来朋友一起去看预展，大家都讲 worth it。", "這把 pamor 紋好特別，跟馬來朋友一起去看預展，大家都講 worth it。", "Unique pamor on this keris — went with Malay mates to preview, all said worth it."], likes: 723, views: 11240, cm: [["Amir", "pamor 漂亮"]] },
  { a: ["芙蓉石迷", "芙蓉石迷", "Furong Fan"], av: ava("furong"), img: prod("ss-04.jpg"), d: "2026-03-10", c: ["芙蓉观音摆书桌，每天看着心很静。价位比田黄友好，入门推荐。", "芙蓉觀音擺書桌，每天看著心很靜。價位比田黃友好，入門推薦。", "Furong Guanyin on my desk — peaceful, and easier on the wallet than Tianhuang."], likes: 534, views: 8340, cm: [["Chen", "同意入门首选"]] },
  { a: ["钱币·David", "錢幣·David", "David · Numismatics"], av: ava("davidmy"), img: prod("my-banknote.jpg"), d: "2026-02-28", c: ["海峡殖民地纸钞这组品相整齐，本地拍卖越来越常看到了，收藏记录也做好啦 📒", "海峽殖民地紙鈔這組品相整齊，本地拍賣越來越常看到了，收藏記錄也做好啦 📒", "Neat Straits Settlements note group — seeing more at local sales, records filed 📒"], likes: 612, views: 9560, cm: [["NumisMY", "签名版不错"]] },
  { a: ["锡镴·Ah Chai", "錫鑞·Ah Chai", "Ah Chai · Pewter"], av: ava("ahchai"), img: prod("my-pewter.jpg"), d: "2026-02-14", c: ["阿公年代锡茶具，锤纹摸起来有温度。本土拍卖这种价位最亲民，适合新手练手。", "阿公年代錫茶具，錘紋摸起來有溫度。本土拍賣這種價位最親民，適合新手練手。", "Grandpa-era pewter set — hammer marks you can feel. Great beginner lot locally."], likes: 489, views: 7680, cm: [["Susan", "有温度"]] },
  { a: ["田黄手串控", "田黃手串控", "Tianhuang Bracelet Fan"], av: ava("bracelet"), img: prod("ss-12.jpg"), d: "2026-01-30", c: ["十八子手串上手，粒粒金黄，华人圈朋友都说好看。马来西亚天气戴久了更有包浆感。", "十八子手串上手，粒粒金黃，華人圈朋友都說好看。馬來西亞天氣戴久了更有包漿感。", "Eighteen-bead bracelet — friends love the golden tone. Our weather adds patina fast."], likes: 934, views: 14890, cm: [["Wong", "包浆更快 haha"]] },
  { a: ["鸡油黄·Lisa", "雞油黃·Lisa", "Lisa · Chicken-Oil Fan"], av: ava("lisa"), img: prod("ss-14.png"), d: "2026-01-16", c: ["鸡油黄薄意印终于入手，侧看像一幅小画。感谢海峡团队帮忙安排 KL 上手。", "雞油黃薄意印終於入手，側看像一幅小畫。感謝海峽團隊幫忙安排 KL 上手。", "Finally got my chicken-oil seal — side view like a miniature painting. Thanks for the KL viewing."], likes: 1102, views: 17230, cm: [["Team Straits", "恭喜恭喜"]] },
  { a: ["杜陵石·Jay", "杜陵石·Jay", "Jay · Duling"], av: ava("jay"), img: prod("ss-05.jpg"), d: "2025-12-28", c: ["杜陵山水薄意，刀层好分明。放在 PJ 办公室，客户来了都会问。", "杜陵山水薄意，刀層好分明。放在 PJ 辦公室，客戶來了都會問。", "Duling landscape — layered carving pops. Clients always ask about it in my PJ office."], likes: 401, views: 6340, cm: [["Client K", "哪里有卖？"]] },
  { a: ["荔枝洞·May", "荔枝洞·May", "May · Lizhi"], av: ava("may"), img: prod("ss-07.jpg"), d: "2025-12-14", c: ["罗汉神态好生动，福州石雕味道足。跟田黄摆一起，书斋气氛马上上来。", "羅漢神態好生動，福州石雕味道足。跟田黃擺一起，書齋氣氛馬上上來。", "Lively arhat — classic Fuzhou vibe. Pairs well with Tianhuang on the shelf."], likes: 556, views: 8790, cm: [["Stone Lover", "福州味"]] },
  { a: ["银包金·Robert", "銀包金·Robert", "Robert · Silver-Wrap"], av: ava("robert"), img: prod("ss-13.png"), d: "2025-11-30", c: ["外白内黄的对比好明显，资深石友一看就懂。预展记得带放大镜 🔍", "外白內黃的對比好明顯，資深石友一看就懂。預展記得帶放大鏡 🔍", "Silver-wrap contrast is obvious — veterans get it instantly. Bring a loupe to preview 🔍"], likes: 678, views: 10560, cm: [["Loupe Man", "放大镜必须"]] },
  { a: ["坑头晶·Angela", "坑頭晶·Angela", "Angela · Crystal"], av: ava("angela"), img: prod("ss-01.png"), d: "2025-11-16", c: ["晶石水盂透光好漂亮，文房小精品。女儿也说像冰块哈哈。", "晶石水盂透光好漂亮，文房小精品。女兒也說像冰塊哈哈。", "Crystal water pot glows in light — desk gem. Daughter says it looks like ice haha."], likes: 423, views: 6670, cm: [["Kid", "像冰块！"]] },
  { a: ["海峡瓷·Pauline", "海峽瓷·Pauline", "Pauline · Straits Ware"], av: ava("pauline"), img: prod("my-strait-porcelain.jpg"), d: "2025-11-02", c: ["青花碗金边保存好，马六甲 table 用刚好，本土拍卖这种最实用。", "青花碗金邊保存好，馬六甲 table 用剛好，本土拍賣這種最實用。", "Blue-white bowl with gilt rim — perfect for Malacca dining table, practical local lot."], likes: 367, views: 5780, cm: [["Table Host", "实用派"]] },
  { a: ["达摩·静修", "達摩·靜修", "Meditation · Jingxiu"], av: ava("jingxiu"), img: prod("ss-16.jpg"), d: "2025-10-19", c: ["达摩摆件跟寿山系列放一起，每天打坐前看一眼，心会定下来 🧘", "達摩擺件跟壽山系列放一起，每天打坐前看一眼，心會定下來 🧘", "Bodhidharma with my Shoushan pieces — glance before meditation, mind settles 🧘"], likes: 512, views: 8010, cm: [["Zen MY", "随喜"]] },
  { a: ["收藏顾问·Vincent", "收藏顧問·Vincent", "Advisor · Vincent"], av: ava("vincent"), img: prod("hero-main.jpg"), d: "2025-10-05", c: ["建议新藏家：先本土娘惹、钱币练手，再进田黄。马来西亚市场资料越来越透明了 📊", "建議新藏家：先本土娘惹、錢幣練手，再進田黃。馬來西亞市場資料越來越透明了 📊", "Tip for newcomers: start with local Nyonya or notes, then Tianhuang — market data here is opening up 📊"], likes: 845, views: 13220, cm: [["Newbie", "笔记了"]] },
  { a: ["五龙迷·KC", "五龍迷·KC", "KC · Dragon Fan"], av: ava("kc"), img: prod("ss-17.png"), d: "2025-09-21", c: ["为了这五龙印等了半年，KL 预展第一眼就认定了。重器值得。", "為了這五龍印等了半年，KL 預展第一眼就認定了。重器值得。", "Waited half a year for the five-dragon seal — knew at first sight in KL. Worth it."], likes: 1890, views: 29670, cm: [["Collector Pro", "重器"]] },
  { a: ["鸡血石·Lily", "雞血石·Lily", "Lily · Chicken-Blood"], av: ava("lily"), img: prod("ss-06.jpg"), d: "2025-09-07", c: ["对章送朋友开业，血色喜气。海峡拍卖顾问还帮忙写了来源说明，贴心。", "對章送朋友開業，血色喜氣。海峽拍賣顧問還幫忙寫了來源說明，貼心。", "Pair for a friend's shop opening — festive red. Advisors even drafted provenance notes."], likes: 634, views: 9940, cm: [["Shop Owner", "谢谢 Lily"]] },
  { a: ["乔治市·Walk", "喬治市·Walk", "George Town Walk"], av: ava("gtwalk"), img: prod("my-baba-cabinet.jpg"), d: "2025-08-24", c: ["周末带朋友走乔治市，顺便看螺钿柜预展，文化+收藏一次满足 🇲🇾", "週末帶朋友走喬治市，順便看螺鈿櫃預展，文化+收藏一次滿足 🇲🇾", "George Town weekend walk plus inlay-cabinet preview — culture and collecting in one 🇲🇾"], likes: 978, views: 15340, cm: [["Tour Guide", "好路线"]] },
  { a: ["芙蓉·Grace", "芙蓉·Grace", "Grace · Furong"], av: ava("grace"), img: prod("ss-04.jpg"), d: "2025-08-10", c: ["观音摆在家里的 altar，妈妈好喜欢。价位合理，本地华人家庭都懂这种审美。", "觀音擺在家裡的 altar，媽媽好喜歡。價位合理，本地華人家庭都懂這種審美。", "Guanyin on our family altar — mum loves it. Fair price, familiar taste for local Chinese homes."], likes: 723, views: 11450, cm: [["Mum", "心诚则灵"]] },
  { a: ["克力士·Razak", "克力士·Razak", "Razak · Keris"], av: ava("razak"), img: prod("my-keris.jpg"), d: "2025-07-27", c: ["马来朋友教我看 pamor，每把剑故事不同。拍卖图录写清楚，买得放心。", "馬來朋友教我看 pamor，每把劍故事不同。拍賣圖錄寫清楚，買得放心。", "Malay mates taught me pamor — every blade tells a story. Clear catalogue, confident buy."], likes: 567, views: 8920, cm: [["Hafiz", "bro 懂行"]] },
  { a: ["田黄·Investment", "田黃·Investment", "Tianhuang · Long View"], av: ava("invest"), img: prod("ss-03.jpg"), d: "2025-07-13", c: ["长线还是看田黄大料，马来西亚买家现在也会飞香港比价比来源了。", "長線還是看田黃大料，馬來西亞買家現在也會飛香港比比價比來源了。", "Long term, still Tianhuang heavy pieces — Malaysian buyers now fly to HK to compare provenance."], likes: 812, views: 12780, cm: [["Fly High", "香港见"]] },
  { a: ["Nyonya·Chef", "Nyonya·Chef", "Nyonya Chef"], av: ava("chef"), img: prod("my-nyonya.jpg"), d: "2025-06-29", c: ["餐厅摆娘惹罐，客人拍照打卡多。本土藏品也能很有 lifestyle ✨", "餐廳擺娘惹罐，客人拍照打卡多。本土藏品也能很有 lifestyle ✨", "Nyonya jar in the restaurant — guests love photos. Local pieces can be lifestyle too ✨"], likes: 1345, views: 21090, cm: [["Foodie", "哪里用餐？"]] },
  { a: ["坑头晶·Student", "坑頭晶·Student", "Student Collector"], av: ava("student"), img: prod("ss-01.png"), d: "2025-06-15", c: ["学生党入门文房小件，晶石水盂价格还能接受，慢慢建立自己的系列。", "學生黨入門文房小件，晶石水盂價格還能接受，慢慢建立自己的系列。", "Student budget entry — crystal water pot affordable, building a series slowly."], likes: 289, views: 4560, cm: [["Senior", "加油"]] },
  { a: ["PeWter·Uncle", "PeWter·Uncle", "Pewter Uncle"], av: ava("uncle"), img: prod("my-pewter.jpg"), d: "2025-06-01", c: ["老锡器有味道，拍卖买到比 tourist shop 划算多了 lah。", "老錫器有味道，拍賣買到比 tourist shop 划算多了 lah。", "Old pewter has soul — auction beats tourist shops any day lah."], likes: 445, views: 7010, cm: [["Tourist No", "true lah"]] },
  { a: ["Banknote·Ali", "Banknote·Ali", "Ali · Notes"], av: ava("ali"), img: prod("my-banknote.jpg"), d: "2025-05-18", c: ["跟爸爸一起收藏海峡纸钞，每张背后都是历史课 📚", "跟爸爸一起收藏海峽紙鈔，每張背後都是歷史課 📚", "Collecting Straits notes with dad — every note is a history lesson 📚"], likes: 598, views: 9380, cm: [["Dad", "好儿子"]] },
  { a: ["Seal·Art", "Seal·Art", "Seal Art"], av: ava("sealart"), img: prod("ss-08.png"), d: "2025-05-04", c: ["兽钮旗降章，自己刻了姓名印。马来西亚也有篆刻圈子，欢迎交流。", "獸鈕旗降章，自己刻了姓名印。馬來西亞也有篆刻圈子，歡迎交流。", "Beast-knob qijiang — carved my name seal. Malaysia has a seal-carving circle too."], likes: 334, views: 5240, cm: [["Carver KL", "交流"]] },
  { a: ["Straits·Home", "Straits·Home", "Straits Home"], av: ava("home"), img: prod("my-strait-porcelain.jpg"), d: "2025-04-20", c: ["把海峡瓷跟寿山石放同一柜，东西马两边审美都照顾到了 😄", "把海峽瓷跟壽山石放同一櫃，東西馬兩邊審美都照顧到了 😄", "Straits porcelain beside Shoushan in one cabinet — East and West Malaysia tastes covered 😄"], likes: 712, views: 11180, cm: [["Both sides", "平衡"]] },
  { a: ["Gallery·Night", "Gallery·Night", "Gallery Night"], av: ava("night"), img: prod("ss-17.png"), d: "2025-04-06", c: ["昨晚 KL 预展酒会，田黄重器跟娘惹罐同框，来宾都说南洋味道足了 🍷", "昨晚 KL 預展酒會，田黃重器跟娘惹罐同框，來賓都說南洋味道足了 🍷", "Last night's KL preview — Tianhuang beside Nyonya jars. Guests said full Nanyang flavour 🍷"], likes: 923, views: 14560, cm: [["Guest", "氛围好"]] },
  { a: ["Beginner·2025", "Beginner·2025", "2025 Beginner"], av: ava("begin2025"), img: prod("ss-05.jpg"), d: "2025-03-22", c: ["2025 开始玩寿山石，从杜陵小件入门。海峡网站三语看起方便，英文也懂 lah。", "2025 開始玩壽山石，從杜陵小件入門。海峽網站三語看起方便，英文也懂 lah。", "Started Shoushan in 2025 with a small duling piece. Trilingual site helps — English also can lah."], likes: 401, views: 6320, cm: [["Welcome", "欢迎入坑"]] },
];

/** Malaysia-local lots kept alongside full coinjsht catalogue (correct per-SKU galleries). */
const localMyProducts = legacyProducts.filter((p) =>
  String(p.image).includes("/my-")
);

export const products: Product[] = [...coinjshtProducts, ...localMyProducts];

/** Lifestyle collector feed migrated from coinjsht.com/tw (multi-image posts). */
export const posts: Post[] = coinjshtPosts.map((p) => ({
  id: p.id,
  author: p.author,
  avatar: p.avatar,
  content: p.content,
  image: p.image,
  images: p.images,
  date: p.date,
  likes: p.likes,
  views: p.views,
  comments: p.comments,
}));

export const marqueeMessages: Localized[] = [
  L("吉隆坡寿山石秋季专场 2026 年 11 月 15 日举槌", "吉隆坡壽山石秋季專場 2026 年 11 月 15 日舉槌", "KL Autumn Shoushan Sale — 15 Nov 2026"),
  L("现正征集田黄、鸡血石、寿山雕件，欢迎委托", "現正徵集田黃、雞血石、壽山雕件，歡迎委託", "Consign Tianhuang, chicken-blood & Shoushan carvings"),
  L("免费线上鉴定 · 附权威证书", "免費線上鑑定 · 附權威證書", "Free online appraisal · certificate included"),
  L("槟城乔治市预展：娘惹瓷器与螺钿家具", "檳城喬治市預展：娘惹瓷器與螺鈿家具", "Penang preview: Nyonya ware & inlaid furniture"),
  L("五龙戏珠田黄大方印亮相 KL 展厅", "五龍戲珠田黃大方印亮相 KL 展廳", "Five-dragon Tianhuang seal now in KL gallery"),
  L("马来克力士专题：pamor 纹藏品开放预约", "馬來克力士專題：pamor 紋藏品開放預約", "Keris session — book to view pamor blades"),
  L("海峡殖民地纸钞组即将上拍", "海峽殖民地紙鈔組即將上拍", "Straits Settlements notes coming to sale"),
  L("武吉免登展厅长期展示寿山石精品", "武吉免登展廳長期展示壽山石精品", "Bukit Bintang gallery — Shoushan highlights on view"),
  L("电话与线上竞投服务，东西马同步支持", "電話與線上競投服務，東西馬同步支持", "Phone & online bidding across East & West Malaysia"),
  L("新会员享优先预展与顾问服务", "新會員享優先預展與顧問服務", "New members get priority previews & advisory"),
  L("鸡油黄、银包金田黄新品入库", "雞油黃、銀包金田黃新品入庫", "New chicken-oil & silver-wrap Tianhuang arrivals"),
  L("本土收藏指南：从娘惹文物入门", "本土收藏指南：從娘惹文物入門", "Local collecting guide — start with Nyonya pieces"),
  L("所有拍品提供来源说明与保险运输", "所有拍品提供來源說明與保險運輸", "Provenance notes & insured shipping on all lots"),
  L("简体中文 / 繁体中文 / English 三语服务", "簡體中文 / 繁體中文 / English 三語服務", "Simplified · Traditional Chinese · English"),
  L("诚邀藏家委托，佣金优惠洽谈中", "誠邀藏家委託，佣金優惠洽談中", "Consignments welcome — favourable terms available"),
  L("秋拍图录电子版已开放预览", "秋拍圖錄電子版已開放預覽", "Autumn e-catalogue now online"),
  L("藏家动态每日更新 · 真实上手分享", "藏家動態每日更新 · 真實上手分享", "Collector feed updated daily — real handling stories"),
  L("真品承诺 · 赝品全额退款保障", "真品承諾 · 贗品全額退款保障", "Authenticity guaranteed — full refund if not genuine"),
  L("预约私洽鉴赏 · 一对一 VIP 服务", "預約私洽鑑賞 · 一對一 VIP 服務", "Private viewing — one-to-one VIP service"),
  L("连接福建石文化与马来西亚本土收藏", "連接福建石文化與馬來西亞本土收藏", "Bridging Fujian stones & Malaysian collecting"),
];

export const stats = [
  { value: "3,200+", key: "lots" as const },
  { value: "15", key: "years" as const },
  { value: "28", key: "countries" as const },
  { value: "35%", key: "rate" as const },
];

export const getFeaturedProducts = () => products.filter((p) => p.featured);
export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getArticle = (id: string) => articles.find((a) => a.id === id);
export const label = (v: Localized, lang: Locale) => tr(v, lang);

/** Deterministic comment generator for collector posts (藏家动态). */

export type GeneratedComment = {
  id: string;
  user: string;
  text: string;
  langTag: string;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function shuffleInPlace<T>(rng: () => number, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Unique counts in [min,max] for each post — no two posts share the same count. */
export function uniqueCommentCounts(
  postIds: string[],
  min = 2000,
  max = 8000
): Record<string, number> {
  const n = postIds.length;
  const span = max - min + 1;
  if (n > span) throw new Error(`Need at most ${span} unique counts`);
  const rng = mulberry32(hashSeed(postIds.join("|") + ":counts"));
  const pool = Array.from({ length: span }, (_, i) => min + i);
  shuffleInPlace(rng, pool);
  const out: Record<string, number> = {};
  postIds.forEach((id, i) => {
    out[id] = pool[i]!;
  });
  return out;
}

const MY_SURNAMES = [
  "陈", "李", "黄", "林", "张", "王", "刘", "蔡", "杨", "吴", "郑", "谢", "许", "郭", "何",
  "Tan", "Lim", "Lee", "Ng", "Wong", "Ong", "Goh", "Teo", "Chong", "Low", "Yap", "Koh",
];

const MY_GIVEN = [
  "慧玲", "美玲", "雅婷", "淑芬", "国栋", "志伟", "家豪", "伟杰", "晓雯", "思婷",
  "Wei", "Ming", "Hui", "Jing", "Kai", "Yi", "Xin", "Jun", "Mei", "Li",
  "Ah Seng", "Ah Mei", "Siew", "Beng", "Hong", "Choon", "Keat", "Ping",
];

const MY_HANDLES = [
  "槟城藏家", "KL石友", "马六甲阿明", "PJ 新手", "柔佛石迷", "怡保老饕", "沙巴收藏",
  "砂拉越买家", "娘惹迷", "田黄控", "鸡血粉", "芙蓉石友", "预展常客", "拍卖小白",
  "George Town Walk", "Bukit Bintang", "Ipoh Uncle", "JB Collector", "Penang Auntie",
  "海峡粉", "寿山入门", "钱币David", "Keris Fan", "Nyonya Chef", "展厅路过",
];

const MY_TEXTS = [
  "这组生活照很有感觉，藏家日常比单晒藏品更真实 👍",
  "展览拍得很有氛围，下一场也想跟团去看",
  "慈善活动感动到，收藏圈也能回馈社会 🇲🇾",
  "旅行打卡＋雅集，这种动态最耐刷",
  "照片清晰能看清整体轮廓，比模糊特写舒服多了",
  "同好分享活动现场，比硬广有说服力",
  "设计展那组九宫格好好看，想去打卡",
  "金银投资那篇有启发，实物资产逻辑讲得清楚",
  "欢迎韩国藏家来访，东洋交流越来越多了",
  "夜访神社那组光影太美，氛围感拉满",
  "建筑模型展有趣，收藏之外也要看设计",
  "非洲支教照片很有力量，点赞这份心意",
  "大阪万博相关分享长见识了",
  "协会活动报名链接在哪里？想参加下一场",
  "生活感动态会让新人更敢入圈",
  "多图网格比单张置顶好看太多了",
  "这种分享式动态东南亚很吃香 lah",
  "朋友圈风格刚刚好，不硬推商品",
  "看完想约同好一起去展览 ✨",
  "文案和照片对得上，不是乱配图",
  "收藏是生活方式，不只是买卖",
  "KL / 槟城有没有类似线下局？",
  "点赞过千不奇怪，内容扎实",
  "评论区好热闹，像真实社区",
  "这种动态适合慢慢看，不赶时间",
  "摄影构图稳，整体轮廓都在",
  "参加活动比闷在家盘玩更开心",
  "国际藏家视角很开阔",
  "希望多更生活向，少一点硬广",
  "已收藏这篇，以后给朋友看",
  "协会社群有温度，赞",
  "下一场慈善/雅集记得通知大家",
  "照片里的展陈灯光好专业",
  "这种真实分享比水军有用",
  "三语都能看懂，照顾东西马朋友",
  "动态详情多图浏览体验终于对了",
  "像小红书那种信息流，熟悉感满满",
  "同好在现场的笑容最加分",
  "看完心情变好，谢谢分享",
  "活动花絮比图录更有代入感",
  "收藏圈也需要公益与温度",
  "旅行＋博物，生活方式拉满",
  "期待更多东南亚本地活动分享",
  "构图完整，放大也不糊，舒服",
  "这种内容会吸引年轻藏家入圈",
  "已转给家里长辈看 😄",
  "协会动态越来越像真实社区了",
  "线下见面局多多益善",
  "文案真诚，不像营销号",
  "多图连看像在现场走一圈",
  "收藏日常记录得很用心",
  "展览讲解如果有回放就好了",
  "慈善晚会那篇看哭了差一点",
  "投资理念那段值得反复读",
  "设计大师展名单我截图了",
  "韩国友人欢迎帖很暖",
  "夜里的朱雀鸟居好出片",
  "万博模型细节控狂喜",
  "支教照片提醒我们还有更大的世界",
  "希望评论区一直保持友善",
  "同好们周末有空一起刷展吗",
  "这种内容我会天天刷",
  "已关注，等下一则生活动态",
];

type IntlPack = { tag: string; users: string[]; texts: string[] };

const INTL: IntlPack[] = [
  {
    tag: "en",
    users: ["James·NY", "Emma·London", "Ryan·SG", "Olivia·AU", "Noah·CA", "Sophie·UK", "Ethan·US"],
    texts: [
      "Love this lifestyle share — feels like a real collector community.",
      "The multi-photo grid is so much better than a single cropped cover.",
      "Would join a similar exhibition meetup in KL if you host one.",
      "Charity post hit hard — collecting with heart matters.",
      "Clear photos, full silhouette — great viewing experience.",
      "Design exhibition notes are inspiring beyond antiques.",
      "Travel + culture posts keep the feed alive.",
      "This reads like friends sharing, not hard selling. Respect.",
    ],
  },
  {
    tag: "ja",
    users: ["佐藤·東京", "鈴木·大阪", "高橋·横浜", "伊藤·京都", "渡辺·名古屋"],
    texts: [
      "生活感のある投稿、とても良いですね。共感しました。",
      "写真が鮮明で全体の姿がよく分かります。",
      "展覧会の雰囲気が伝わってきて行きたくなりました。",
      "チャリティー活動、素敵な取り組みです。",
      "コレクションだけでなく日常の共有も楽しみです。",
    ],
  },
  {
    tag: "ko",
    users: ["민수·서울", "지은·부산", "현우·인천", "서연·대구", "준호·대전"],
    texts: [
      "석질이 정말 좋네요. 카탈로그 설명이 친절합니다.",
      "쿠알라룸푸르 프리뷰 일정이 궁금해요.",
      "배송이 한국까지 가능한가요?",
      "인장 조각이 섬세해서 마음에 듭니다.",
      "가격대가 합리적이에요. 관심 갖고 볼게요.",
    ],
  },
  {
    tag: "th",
    users: ["สมชาย·BKK", "นภา·CNX", "อรุณ·Phuket", "มาลี·Pattaya"],
    texts: [
      "สวยมาก อยากไปดูพรีวิวที่กัวลาลัมเปอร์",
      "ส่งถึงไทยได้ไหมครับ สนใจประมูล",
      "หินเงางามจริง แคตตาล็อกเขียนละเอียดดี",
      "ราคาสมเหตุสมผลสำหรับคุณภาพนี้",
    ],
  },
  {
    tag: "id",
    users: ["Budi·JKT", "Siti·SBY", "Andi·MDN", "Rina·BDG"],
    texts: [
      "Bagusnya bagus banget, katalognya informatif.",
      "Bisa kirim ke Jakarta? Saya minat lelang jarak jauh.",
      "Preview di KL kapan ya? Mau datang kalau sempat.",
      "Kualitas batu terlihat premium, worth it.",
    ],
  },
  {
    tag: "ms",
    users: ["Ahmad·KL", "Siti·Penang", "Razak·JB", "Nurul·Ipoh", "Hafiz·Melaka"],
    texts: [
      "Cantik sangat, nak tengok preview dekat KL.",
      "Boleh hantar ke Johor ke? Saya minat bid.",
      "Keris pamor ni unik, catalogue clear.",
      "Harga reasonable untuk kualiti macam ni.",
      "Terima kasih team, penjelasan sangat helpful.",
    ],
  },
  {
    tag: "vi",
    users: ["Minh·HN", "Lan·HCM", "Hùng·ĐN", "Trang·HP"],
    texts: [
      "Đá đẹp quá, muốn xem trước tại KL nếu được.",
      "Có ship về Việt Nam không ạ?",
      "Mô tả catalogue rất rõ ràng, tin tưởng.",
      "Mức giá hợp lý so với chất lượng.",
    ],
  },
  {
    tag: "fr",
    users: ["Claire·Paris", "Luc·Lyon", "Camille·Nice", "Antoine·Bordeaux"],
    texts: [
      "Pièce magnifique — le lustre est exceptionnel.",
      "Livraison vers la France possible ?",
      "Catalogue très professionnel, bravo.",
      "Estimation attractive par rapport à Hong Kong.",
    ],
  },
  {
    tag: "de",
    users: ["Anna·Berlin", "Felix·München", "Laura·Hamburg", "Jonas·Köln"],
    texts: [
      "Wunderschönes Stück — Katalog sehr informativ.",
      "Ist Versand nach Deutschland möglich?",
      "Die Schnitzerei ist äußerst fein gearbeitet.",
      "Preislich interessant im Vergleich zu HK.",
    ],
  },
  {
    tag: "ar",
    users: ["Omar·Dubai", "Layla·Riyadh", "Hassan·Doha", "Nora·Abu Dhabi"],
    texts: [
      "قطعة رائعة، أود الحضور لمعاينة كوالالمبور.",
      "هل الشحن إلى الخليج متاح؟",
      "الكتالوج واضح واحترافي جداً.",
      "التقدير مناسب مقارنة بجودة الحجر.",
    ],
  },
];

function myUser(rng: () => number): string {
  if (rng() < 0.45) return pick(rng, MY_HANDLES);
  const sur = pick(rng, MY_SURNAMES);
  const given = pick(rng, MY_GIVEN);
  if (rng() < 0.35) return `${sur}${given}`;
  if (rng() < 0.5) return `${sur}·${given}`;
  return `${given}·${sur}`;
}

function intlComment(rng: () => number): { user: string; text: string; langTag: string } {
  const pack = pick(rng, INTL);
  return {
    user: pick(rng, pack.users),
    text: pick(rng, pack.texts),
    langTag: pack.tag,
  };
}

function myComment(rng: () => number): { user: string; text: string; langTag: string } {
  return {
    user: myUser(rng),
    text: pick(rng, MY_TEXTS),
    langTag: "my",
  };
}

export function generateCommentsForPost(
  postId: string,
  count: number,
  intlRatio = 0.3
): GeneratedComment[] {
  const rng = mulberry32(hashSeed(postId + ":comments:v1"));
  const intlTarget = Math.round(count * intlRatio);
  const flags = [
    ...Array(intlTarget).fill(true),
    ...Array(count - intlTarget).fill(false),
  ] as boolean[];
  shuffleInPlace(rng, flags);

  return flags.map((isIntl, i) => {
    const c = isIntl ? intlComment(rng) : myComment(rng);
    return {
      id: `${postId}-c${String(i + 1).padStart(5, "0")}`,
      user: c.user,
      text: c.text,
      langTag: c.langTag,
    };
  });
}

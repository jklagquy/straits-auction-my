export const locales = ["cn", "zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "cn";

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export type Localized = Record<Locale, string>;

/** Pick a localized string with graceful fallback. */
export function tr(value: Localized | undefined, lang: Locale): string {
  if (!value) return "";
  return value[lang] || value.zh || value.cn || value.en || "";
}

export const localeNames: Record<Locale, string> = {
  cn: "简体中文",
  zh: "繁體中文",
  en: "English",
};

type Dict = {
  brand: string;
  brandSub: string;
  heroTag: string;
  nav: {
    home: string;
    products: string;
    news: string;
    posts: string;
    about: string;
    contact: string;
  };
  hero: { enter: string; scroll: string };
  common: {
    viewAll: string;
    readMore: string;
    viewDetail: string;
    back: string;
    published: string;
    category: string;
    estimate: string;
    lotNo: string;
    contactUs: string;
    inquire: string;
  };
  sections: {
    featuredKicker: string;
    featuredTitle: string;
    featuredDesc: string;
    newsKicker: string;
    newsTitle: string;
    newsDesc: string;
    aboutKicker: string;
    aboutTitle: string;
    aboutDesc: string;
    postsKicker: string;
    postsTitle: string;
    statsTitle: string;
  };
  stats: { lots: string; years: string; countries: string; rate: string };
  contact: {
    title: string;
    desc: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    send: string;
    address: string;
    hours: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    contact: string;
    follow: string;
    rights: string;
    addr: string;
    company: string;
  };
  pages: {
    productsTitle: string;
    productsDesc: string;
    newsTitle: string;
    newsDesc: string;
    postsTitle: string;
    postsDesc: string;
    aboutTitle: string;
    contactTitle: string;
  };
};

export const dict: Record<Locale, Dict> = {
  cn: {
    brand: "海峡金石拍卖",
    brandSub: "Straits Scholar's Auction",
    heroTag: "吉隆坡 · 槟城 · 福建寿山石",
    nav: {
      home: "首页",
      products: "拍品",
      news: "新闻中心",
      posts: "藏家动态",
      about: "关于我们",
      contact: "联系我们",
    },
    hero: { enter: "浏览拍品", scroll: "向下滚动" },
    common: {
      viewAll: "查看全部",
      readMore: "阅读更多",
      viewDetail: "查看详情",
      back: "返回",
      published: "发布于",
      category: "类别",
      estimate: "估价",
      lotNo: "拍品编号",
      contactUs: "联系我们",
      inquire: "咨询此拍品",
    },
    sections: {
      featuredKicker: "精选拍品",
      featuredTitle: "寿山石与南洋珍藏",
      featuredDesc:
        "福建寿山田黄、鸡血石与娘惹瓷器、峇峇古董等马来西亚热门收藏品类，经专家鉴定，来源清晰。",
      newsKicker: "新闻中心",
      newsTitle: "拍卖资讯与市场洞察",
      newsDesc: "聚焦东南亚藏家关注的寿山石与本土珍品市场动态。",
      aboutKicker: "关于我们",
      aboutTitle: "连接福建石文化与南洋收藏",
      aboutDesc:
        "海峡金石拍卖立足吉隆坡与槟城，专精福建寿山石、田黄石、鸡血石，并深耕娘惹文物、海峡华人古董与本土珍稀收藏，为藏家与买家搭建可信赖的拍卖平台。",
      postsKicker: "藏家动态",
      postsTitle: "展厅与藏家实录",
      statsTitle: "我们的成绩",
    },
    stats: { lots: "累计拍品", years: "年经验", countries: "个买家国家", rate: "平均溢价率" },
    contact: {
      title: "与我们联络",
      desc: "无论委托拍卖、参与竞投或藏品鉴定，我们的顾问团队随时为您服务。",
      name: "姓名",
      email: "电子邮箱",
      phone: "联系电话",
      message: "留言内容",
      send: "送出咨询",
      address: "地址",
      hours: "营业时间",
    },
    footer: {
      tagline: "寿山石 · 南洋古董 · 国际拍卖",
      quickLinks: "快速链接",
      contact: "联系方式",
      follow: "关注我们",
      rights: "版权所有",
      addr: "马来西亚吉隆坡武吉免登区 · 槟城乔治市展厅",
      company: "Straits Heritage Auction Sdn Bhd",
    },
    pages: {
      productsTitle: "拍品目录",
      productsDesc: "寿山石 · 田黄石 · 鸡血石 · 娘惹珍品 · 海峡古董",
      newsTitle: "新闻中心",
      newsDesc: "拍卖资讯 · 市场分析 · 专场预告",
      postsTitle: "藏家动态",
      postsDesc: "展厅实录与藏家分享",
      aboutTitle: "关于我们",
      contactTitle: "联系我们",
    },
  },
  zh: {
    brand: "海峽金石拍賣",
    brandSub: "Straits Scholar's Auction",
    heroTag: "吉隆坡 · 檳城 · 福建壽山石",
    nav: {
      home: "首頁",
      products: "拍品",
      news: "新聞中心",
      posts: "藏家動態",
      about: "關於我們",
      contact: "聯絡我們",
    },
    hero: { enter: "探索拍品", scroll: "向下滾動" },
    common: {
      viewAll: "查看全部",
      readMore: "閱讀更多",
      viewDetail: "查看詳情",
      back: "返回",
      published: "發佈於",
      category: "類別",
      estimate: "估價",
      lotNo: "拍品編號",
      contactUs: "聯絡我們",
      inquire: "諮詢此拍品",
    },
    sections: {
      featuredKicker: "精選拍品",
      featuredTitle: "壽山石與南洋珍藏",
      featuredDesc:
        "福建壽山田黃、雞血石與娘惹瓷器、峇峇古董等馬來西亞熱門收藏品類，經專家鑑定，來源清晰。",
      newsKicker: "新聞中心",
      newsTitle: "拍賣資訊與市場洞察",
      newsDesc: "聚焦東南亞藏家關注的壽山石與本土珍品市場動態。",
      aboutKicker: "關於我們",
      aboutTitle: "連接福建石文化與南洋收藏",
      aboutDesc:
        "海峽金石拍賣立足吉隆坡與檳城，專精福建壽山石、田黃石、雞血石，並深耕娘惹文物、海峽華人古董與本土珍稀收藏，為藏家與買家搭建可信賴的拍賣平台。",
      postsKicker: "藏家動態",
      postsTitle: "展廳與藏家實錄",
      statsTitle: "我們的成就",
    },
    stats: { lots: "累計拍品", years: "年經驗", countries: "個買家國家", rate: "平均溢價率" },
    contact: {
      title: "與我們聯絡",
      desc: "無論是委託拍賣、參與競投或藏品鑑定，我們的顧問團隊隨時為您服務。",
      name: "姓名",
      email: "電子郵箱",
      phone: "聯絡電話",
      message: "留言內容",
      send: "送出諮詢",
      address: "地址",
      hours: "營業時間",
    },
    footer: {
      tagline: "壽山石 · 南洋古董 · 國際拍賣",
      quickLinks: "快速連結",
      contact: "聯絡方式",
      follow: "關注我們",
      rights: "版權所有",
      addr: "馬來西亞吉隆坡武吉免登區 · 檳城喬治市展廳",
      company: "Straits Heritage Auction Sdn Bhd",
    },
    pages: {
      productsTitle: "拍品目錄",
      productsDesc: "壽山石 · 田黃石 · 雞血石 · 娘惹珍品 · 海峽古董",
      newsTitle: "新聞中心",
      newsDesc: "拍賣資訊 · 市場分析 · 專場預告",
      postsTitle: "藏家動態",
      postsDesc: "展廳實錄與藏家分享",
      aboutTitle: "關於我們",
      contactTitle: "聯絡我們",
    },
  },
  en: {
    brand: "Straits Scholar's Auction",
    brandSub: "Kuala Lumpur · Penang · Fujian Stones",
    heroTag: "Kuala Lumpur · Penang · Shoushan Heritage",
    nav: {
      home: "Home",
      products: "Auction",
      news: "News",
      posts: "Collectors",
      about: "About",
      contact: "Contact",
    },
    hero: { enter: "Browse Lots", scroll: "Scroll" },
    common: {
      viewAll: "View All",
      readMore: "Read More",
      viewDetail: "View Detail",
      back: "Back",
      published: "Published",
      category: "Category",
      estimate: "Estimate",
      lotNo: "Lot No.",
      contactUs: "Contact Us",
      inquire: "Enquire About This Lot",
    },
    sections: {
      featuredKicker: "Featured Lots",
      featuredTitle: "Shoushan Stones & Straits Treasures",
      featuredDesc:
        "From Fujian Tianhuang and chicken-blood stone to Peranakan porcelain and Straits antiques — authenticated pieces with clear provenance.",
      newsKicker: "News Centre",
      newsTitle: "Auction News & Market Insight",
      newsDesc: "Updates for collectors across Malaysia and Southeast Asia.",
      aboutKicker: "About Us",
      aboutTitle: "Bridging Fujian Stone Culture & Nanyang Collecting",
      aboutDesc:
        "Based in KL and Penang, we specialise in Shoushan seal stones, Tianhuang and chicken-blood stone, alongside Peranakan heirlooms, Straits Chinese antiques and prized local collectibles.",
      postsKicker: "Collectors' Feed",
      postsTitle: "From the Gallery Floor",
      statsTitle: "Our Track Record",
    },
    stats: { lots: "Lots Sold", years: "Years", countries: "Buyer Countries", rate: "Avg. Premium" },
    contact: {
      title: "Get in Touch",
      desc: "Whether you're consigning, bidding or seeking an appraisal, our team is ready to assist.",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      send: "Send Enquiry",
      address: "Address",
      hours: "Hours",
    },
    footer: {
      tagline: "Shoushan Stones · Nanyang Antiques · International Auctions",
      quickLinks: "Quick Links",
      contact: "Contact",
      follow: "Follow Us",
      rights: "All rights reserved",
      addr: "Bukit Bintang, Kuala Lumpur · George Town, Penang",
      company: "Straits Heritage Auction Sdn Bhd",
    },
    pages: {
      productsTitle: "Auction Catalogue",
      productsDesc: "Shoushan · Tianhuang · Chicken-Blood · Peranakan · Straits Antiques",
      newsTitle: "News Centre",
      newsDesc: "Auction news · Market insight · Sale previews",
      postsTitle: "Collectors' Feed",
      postsDesc: "Gallery moments & collector stories",
      aboutTitle: "About Us",
      contactTitle: "Contact Us",
    },
  },
};

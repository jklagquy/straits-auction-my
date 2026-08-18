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
    originalPrice: string;
    currentPrice: string;
    stock: string;
    comingSoon: string;
    priceHistory: string;
    date: string;
    change: string;
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
  feed: {
    memberComment: string;
    memberLike: string;
    memberOk: string;
    loadMoreComments: string;
    loadingComments: string;
    noComments: string;
    viewAllComments: string;
    openThread: string;
    threadTitle: string;
  };
};

export const dict: Record<Locale, Dict> = {
  cn: {
    brand: "万国古董文博协会",
    brandSub: "WACA",
    heroTag: "私人收藏 · 文博交流 · 国际藏家",
    nav: {
      home: "首页",
      products: "珍藏",
      news: "资讯",
      posts: "藏家动态",
      about: "关于协会",
      contact: "联络协会",
    },
    hero: { enter: "浏览珍藏", scroll: "向下滚动" },
    common: {
      viewAll: "查看全部",
      readMore: "阅读更多",
      viewDetail: "查看详情",
      back: "返回",
      published: "发布于",
      category: "类别",
      estimate: "当前价格",
      originalPrice: "原价",
      currentPrice: "当前价格",
      stock: "库存",
      comingSoon: "即将推出",
      priceHistory: "价格走势",
      date: "日期",
      change: "涨幅",
      lotNo: "藏品编号",
      contactUs: "联络协会",
      inquire: "咨询此藏品",
    },
    sections: {
      featuredKicker: "协会精选",
      featuredTitle: "私人珍藏与文博典范",
      featuredDesc:
        "寿山石、田黄、鸡血石与南洋古董等私人藏品，由协会顾问审鉴，强调来源清晰与学术脉络。",
      newsKicker: "协会资讯",
      newsTitle: "文博动态与收藏视野",
      newsDesc: "面向国际藏家的展览、交流与市场观察。",
      aboutKicker: "关于协会",
      aboutTitle: "万国文博协会",
      aboutDesc:
        "万国古董文博协会（WACA）是面向国际藏家的私人收藏与文博交流平台。我们连接马来西亚与亚洲石文化、南洋文物脉络，以严谨审鉴与开放分享，服务会员与公众。",
      postsKicker: "藏家动态",
      postsTitle: "会员与藏家实录",
      statsTitle: "协会足迹",
    },
    stats: { lots: "收录藏品", years: "年积淀", countries: "藏家国家", rate: "会员满意度" },
    contact: {
      title: "联络协会",
      desc: "藏品咨询、会员申请或学术交流，欢迎致函协会秘书处。",
      name: "姓名",
      email: "电子邮箱",
      phone: "联系电话",
      message: "留言内容",
      send: "送出咨询",
      address: "地址",
      hours: "服务时间",
    },
    footer: {
      tagline: "私人收藏 · 文博交流 · 国际视野",
      quickLinks: "快速链接",
      contact: "联系方式",
      follow: "关注我们",
      rights: "版权所有",
      addr: "马来西亚吉隆坡 · 槟城",
      company: "万国古董文博协会",
    },
    pages: {
      productsTitle: "珍藏目录",
      productsDesc: "寿山石 · 田黄石 · 鸡血石 · 娘惹珍品 · 南洋古董",
      newsTitle: "协会资讯",
      newsDesc: "文博动态 · 收藏视野 · 活动预告",
      postsTitle: "藏家动态",
      postsDesc: "会员分享与国际藏家评论",
      aboutTitle: "关于协会",
      contactTitle: "联络协会",
    },
    feed: {
      memberComment: "会员操作",
      memberLike: "会员操作",
      memberOk: "知道了",
      loadMoreComments: "加载更多评论",
      loadingComments: "加载中…",
      noComments: "暂无评论",
      viewAllComments: "全部 {n} 条评论",
      openThread: "进入评论区",
      threadTitle: "藏家评论",
    },
  },
  zh: {
    brand: "萬國古董文博協會",
    brandSub: "WACA",
    heroTag: "私人收藏 · 文博交流 · 國際藏家",
    nav: {
      home: "首頁",
      products: "珍藏",
      news: "資訊",
      posts: "藏家動態",
      about: "關於協會",
      contact: "聯絡協會",
    },
    hero: { enter: "瀏覽珍藏", scroll: "向下滾動" },
    common: {
      viewAll: "查看全部",
      readMore: "閱讀更多",
      viewDetail: "查看詳情",
      back: "返回",
      published: "發佈於",
      category: "類別",
      estimate: "當前價格",
      originalPrice: "原價",
      currentPrice: "當前價格",
      stock: "庫存",
      comingSoon: "即將推出",
      priceHistory: "價格走勢",
      date: "日期",
      change: "漲幅",
      lotNo: "藏品編號",
      contactUs: "聯絡協會",
      inquire: "諮詢此藏品",
    },
    sections: {
      featuredKicker: "協會精選",
      featuredTitle: "私人珍藏與文博典範",
      featuredDesc:
        "壽山石、田黃、雞血石與南洋古董等私人藏品，由協會顧問審鑑，強調來源清晰與學術脈絡。",
      newsKicker: "協會資訊",
      newsTitle: "文博動態與收藏視野",
      newsDesc: "面向國際藏家的展覽、交流與市場觀察。",
      aboutKicker: "關於協會",
      aboutTitle: "萬國文博協會",
      aboutDesc:
        "萬國古董文博協會（WACA）是面向國際藏家的私人收藏與文博交流平台。我們連接馬來西亞與亞洲石文化、南洋文物脈絡，以嚴謹審鑑與開放分享，服務會員與公眾。",
      postsKicker: "藏家動態",
      postsTitle: "會員與藏家實錄",
      statsTitle: "協會足跡",
    },
    stats: { lots: "收錄藏品", years: "年積澱", countries: "藏家國家", rate: "會員滿意度" },
    contact: {
      title: "聯絡協會",
      desc: "藏品諮詢、會員申請或學術交流，歡迎致函協會秘書處。",
      name: "姓名",
      email: "電子郵箱",
      phone: "聯絡電話",
      message: "留言內容",
      send: "送出諮詢",
      address: "地址",
      hours: "服務時間",
    },
    footer: {
      tagline: "私人收藏 · 文博交流 · 國際視野",
      quickLinks: "快速連結",
      contact: "聯絡方式",
      follow: "關注我們",
      rights: "版權所有",
      addr: "馬來西亞吉隆坡 · 檳城",
      company: "萬國古董文博協會",
    },
    pages: {
      productsTitle: "珍藏目錄",
      productsDesc: "壽山石 · 田黃石 · 雞血石 · 娘惹珍品 · 南洋古董",
      newsTitle: "協會資訊",
      newsDesc: "文博動態 · 收藏視野 · 活動預告",
      postsTitle: "藏家動態",
      postsDesc: "會員分享與國際藏家評論",
      aboutTitle: "關於協會",
      contactTitle: "聯絡協會",
    },
    feed: {
      memberComment: "會員操作",
      memberLike: "會員操作",
      memberOk: "知道了",
      loadMoreComments: "載入更多評論",
      loadingComments: "載入中…",
      noComments: "暫無評論",
      viewAllComments: "全部 {n} 條評論",
      openThread: "進入評論區",
      threadTitle: "藏家評論",
    },
  },
  en: {
    brand: "WACA",
    brandSub: "World Antique Cultural-Heritage Association",
    heroTag: "Private Collections · Cultural Exchange · Global Collectors",
    nav: {
      home: "Home",
      products: "Collections",
      news: "Journal",
      posts: "Collectors",
      about: "About",
      contact: "Contact",
    },
    hero: { enter: "Explore Collections", scroll: "Scroll" },
    common: {
      viewAll: "View All",
      readMore: "Read More",
      viewDetail: "View Detail",
      back: "Back",
      published: "Published",
      category: "Category",
      estimate: "Current Price",
      originalPrice: "Original",
      currentPrice: "Current Price",
      stock: "Stock",
      comingSoon: "Coming soon",
      priceHistory: "Price History",
      date: "Date",
      change: "Change",
      lotNo: "Ref. No.",
      contactUs: "Contact the Association",
      inquire: "Enquire About This Piece",
    },
    sections: {
      featuredKicker: "Association Highlights",
      featuredTitle: "Private Collections & Cultural Heritage",
      featuredDesc:
        "Shoushan stones, Tianhuang, chicken-blood stone and Nanyang antiques — curated for members with clear provenance and scholarly context.",
      newsKicker: "Journal",
      newsTitle: "Heritage Notes & Collector Insight",
      newsDesc: "Exhibitions, exchange and market notes for an international membership.",
      aboutKicker: "About WACA",
      aboutTitle: "World Antique Cultural-Heritage Association",
      aboutDesc:
        "WACA is a private collecting and cultural-heritage association for international collectors. We bridge Malaysian and Asian stone culture with Nanyang antiquities through careful appraisal and open scholarly exchange.",
      postsKicker: "Collectors' Feed",
      postsTitle: "From Members & Guests",
      statsTitle: "Our Footprint",
    },
    stats: { lots: "Pieces Catalogued", years: "Years", countries: "Collector Countries", rate: "Member Satisfaction" },
    contact: {
      title: "Contact the Association",
      desc: "For collection enquiries, membership or scholarly exchange, write to the association secretariat.",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      send: "Send Enquiry",
      address: "Address",
      hours: "Hours",
    },
    footer: {
      tagline: "Private Collections · Cultural Exchange · Global Perspective",
      quickLinks: "Quick Links",
      contact: "Contact",
      follow: "Follow Us",
      rights: "All rights reserved",
      addr: "Kuala Lumpur · Penang, Malaysia",
      company: "World Antique Cultural-Heritage Association",
    },
    pages: {
      productsTitle: "Collections",
      productsDesc: "Shoushan · Tianhuang · Chicken-Blood · Peranakan · Nanyang Antiques",
      newsTitle: "Journal",
      newsDesc: "Heritage notes · Collector insight · Events",
      postsTitle: "Collectors' Feed",
      postsDesc: "Member stories & international commentary",
      aboutTitle: "About the Association",
      contactTitle: "Contact",
    },
    feed: {
      memberComment: "Members only",
      memberLike: "Members only",
      memberOk: "OK",
      loadMoreComments: "Load more comments",
      loadingComments: "Loading…",
      noComments: "No comments yet",
      viewAllComments: "All {n} comments",
      openThread: "Open comments",
      threadTitle: "Collector Comments",
    },
  },
};

import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { getDashboardStatsAction } from "./actions";

export default async function AdminDashboard() {
  await requireAdminPage();
  const stats = await getDashboardStatsAction();

  const cards = [
    { label: "\u62CD\u54C1", value: stats.products, href: "/admin/products" },
    { label: "\u65B0\u95FB", value: stats.news, href: "/admin/news" },
    { label: "\u85CF\u5BB6\u52A8\u6001", value: stats.posts, href: "/admin/posts" },
    { label: "\u6EDA\u52A8\u516C\u544A", value: stats.marquee, href: "/admin/marquee" },
    { label: "\u65B0\u8BE2\u76D8", value: stats.inquiriesNew, href: "/admin/inquiries" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{"\u63A7\u5236\u53F0"}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          全局每日上浮：{stats.uplift}% · 前台每 5 分钟刷新一次估价 · 数据源：
          {stats.backend === "supabase" ? "Supabase" : "本地文件"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow"
          >
            <div className="text-sm text-zinc-500">{c.label}</div>
            <div className="text-3xl font-bold mt-2">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold mb-3">{"\u5FEB\u6377\u5165\u53E3"}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/admin/price-rules" className="text-blue-700">
                {"\u914D\u7F6E\u6BCF\u65E5\u4EF7\u683C\u4E0A\u6D6E\u89C4\u5219"}
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="text-blue-700">
                {"WhatsApp \u4E0E\u5728\u7EBF\u5BA2\u670D\u8BBE\u7F6E"}
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="text-blue-700">
                {"\u7F16\u8F91\u62CD\u54C1\u57FA\u7840\u4EF7\u683C"}
              </Link>
            </li>
            <li>
              <Link href="/cn" target="_blank" className="text-blue-700">
                {"\u9884\u89C8\u524D\u53F0 /cn"}
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-6 text-sm text-zinc-600">
          <h2 className="font-semibold text-zinc-900 mb-3">数据存储</h2>
          <p>
            {stats.backend === "supabase"
              ? "已连接 Supabase：后台读写以云端为准；图片上传至 Storage media 桶。"
              : "当前为本地 .data/cms-store.json。部署前请配置 Supabase 并执行 migrations/001 + 002。"}
          </p>
          <p className="mt-2">
            <Link href="/admin/settings" className="text-blue-700">
              上传 Logo / 修改公司信息 →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

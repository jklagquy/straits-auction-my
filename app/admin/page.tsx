import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { getDashboardStatsAction } from "./actions";

export default async function AdminDashboard() {
  await requireAdminPage();
  const stats = await getDashboardStatsAction();

  const cards = [
    { label: "拍品", value: stats.products, href: "/admin/products" },
    { label: "资讯", value: stats.news, href: "/admin/news" },
    { label: "藏家动态", value: stats.posts, href: "/admin/posts" },
    { label: "滚动公告", value: stats.marquee, href: "/admin/marquee" },
    { label: "新询盘", value: stats.inquiriesNew, href: "/admin/inquiries" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">控制台</h1>
        <p className="mt-1 text-sm text-zinc-500">
          欢迎回来！全局每日上浮：{stats.uplift}% · 前台约 5 分钟刷新估价 · 数据源：
          {stats.backend === "supabase" ? "Supabase" : "本地文件"}
        </p>
        {stats.sitePublicEnabled === false && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            主站前台已关闭，访客打开本域名看不到任何内容。
            <Link href="/admin/settings" className="ml-2 font-medium underline">
              去站点设置
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="text-sm text-zinc-500">{c.label}</div>
            <div className="mt-2 text-3xl font-bold">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-semibold">快速操作</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/news/new"
              className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm font-medium text-blue-800 hover:bg-blue-100"
            >
              + 新增资讯
            </Link>
            <Link
              href="/admin/posts/new"
              className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-4 text-sm font-medium text-violet-800 hover:bg-violet-100"
            >
              + 新增藏家动态
            </Link>
            <Link
              href="/admin/products"
              className="rounded-xl border px-4 py-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              管理拍品
            </Link>
            <Link
              href="/admin/banners"
              className="rounded-xl border px-4 py-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              管理轮播图
            </Link>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 text-sm text-zinc-600">
          <h2 className="mb-3 font-semibold text-zinc-900">系统与数据</h2>
          <p>
            {stats.backend === "supabase"
              ? "已连接 Supabase：后台读写以云端为准；图片上传至 Storage media 桶。"
              : "当前为本地 .data/cms-store.json。部署前请配置 Supabase。"}
          </p>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/admin/price-rules" className="text-blue-700">
                配置每日价格上浮规则
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="text-blue-700">
                WhatsApp / Logo / 主站前台开关 / 会员互动权限
              </Link>
            </li>
            <li>
              <Link href="/cn" target="_blank" className="text-blue-700">
                预览前台 /cn
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

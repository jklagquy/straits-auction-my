import Link from "next/link";
import { logoutAction } from "./actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const nav = [
  { href: "/admin", label: "控制台" },
  { href: "/admin/products", label: "拍品管理" },
  { href: "/admin/price-rules", label: "价格规则" },
  { href: "/admin/news", label: "资讯" },
  { href: "/admin/posts", label: "藏家动态" },
  { href: "/admin/marquee", label: "滚动公告" },
  { href: "/admin/banners", label: "轮播图" },
  { href: "/admin/sessions", label: "专场" },
  { href: "/admin/inquiries", label: "询盘" },
  { href: "/admin/settings", label: "站点设置" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900" lang="zh-CN">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
          <div className="flex items-center gap-2.5 border-b px-4 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/waca-mark.png"
              alt="WACA"
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-zinc-200"
            />
            <div>
              <div className="text-sm font-semibold tracking-wide">万国文博协会 · 后台</div>
              <div className="mt-0.5 text-xs text-zinc-400">WACA Admin</div>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 p-3 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="block rounded-lg px-3 py-2 text-zinc-700 hover:bg-blue-50 hover:text-blue-700"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="border-t p-3">
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              退出登录
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b bg-white lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/waca-mark.png" alt="" className="h-7 w-7 rounded-full object-cover" />
                <div className="text-sm font-semibold">WACA 后台</div>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="text-sm text-red-600">
                  退出
                </button>
              </form>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-xs">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-zinc-700"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

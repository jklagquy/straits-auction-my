import Link from "next/link";
import { logoutAction } from "./actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const nav = [
  { href: "/admin", label: "\u63A7\u5236\u53F0" },
  { href: "/admin/products", label: "\u62CD\u54C1\u7BA1\u7406" },
  { href: "/admin/price-rules", label: "\u4EF7\u683C\u89C4\u5219" },
  { href: "/admin/news", label: "\u65B0\u95FB" },
  { href: "/admin/posts", label: "\u85CF\u5BB6\u52A8\u6001" },
  { href: "/admin/marquee", label: "\u6EDA\u52A8\u516C\u544A" },
  { href: "/admin/banners", label: "\u6A2A\u5E45" },
  { href: "/admin/sessions", label: "\u4E13\u573A" },
  { href: "/admin/inquiries", label: "\u8BE2\u76D8" },
  { href: "/admin/settings", label: "\u7AD9\u70B9\u8BBE\u7F6E" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900" lang="zh-CN">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="font-semibold tracking-wide">
            {"\u6D77\u5CE1\u91D1\u77F3 \u00B7 \u7BA1\u7406\u540E\u53F0"}
          </div>
          <nav className="hidden lg:flex flex-wrap gap-3 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-zinc-600 hover:text-zinc-900">
                {n.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-red-700">
              {"\u9000\u51FA\u767B\u5F55"}
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

import { requireAdminPage } from "@/lib/admin-guard";
import { saveSiteSettingsAction } from "../actions";
import { loadAdminStore } from "@/lib/cms/repository";
import MediaUploader from "@/components/admin/MediaUploader";
import { isSupabaseConfigured } from "@/lib/cms/supabase";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const s = (await loadAdminStore()).siteSettings;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">站点与客服设置</h1>
        <p className="text-sm text-zinc-500 mt-1">
          品牌 / Logo / 公司信息可随时更换；前台 Header、Footer 会读取这里。
          {isSupabaseConfigured()
            ? " · 当前写入 Supabase"
            : " · 当前为本地文件模式（部署前请配置 Supabase）"}
        </p>
      </div>

      <form action={saveSiteSettingsAction} className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">互动权限</h2>
        <p className="text-xs text-zinc-500 -mt-2">
          关闭后，主站点击「评论」或「点赞」会弹出「会员操作」提示（随前台语言切换）。
        </p>
        <label className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm">
          <span>
            <span className="font-medium">评论权限</span>
            <span className="block text-xs text-zinc-500 mt-0.5">开启后访客可展开查看评论；关闭则点击提示会员操作</span>
          </span>
          <input
            type="checkbox"
            name="comments_enabled"
            defaultChecked={s.commentsEnabled !== false}
            className="h-5 w-5"
          />
        </label>
        <label className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm">
          <span>
            <span className="font-medium">点赞权限</span>
            <span className="block text-xs text-zinc-500 mt-0.5">开启后可点赞；关闭则点击提示会员操作</span>
          </span>
          <input
            type="checkbox"
            name="likes_enabled"
            defaultChecked={s.likesEnabled !== false}
            className="h-5 w-5"
          />
        </label>

        <h2 className="font-semibold pt-4">Logo</h2>
        <MediaUploader
          name="logo_url"
          defaultValue={s.logoUrl || "/brand/waca-mark.png"}
          folder="logo"
          label="上传或粘贴 Logo URL（默认 /brand/waca-mark.png）"
        />

        <h2 className="font-semibold pt-4">品牌名称</h2>
        <label className="text-xs text-zinc-500 block">简体</label>
        <input name="brand_cn" defaultValue={s.brand.cn} className="w-full border rounded px-3 py-2 text-sm" />
        <label className="text-xs text-zinc-500 block">繁體</label>
        <input name="brand_zh" defaultValue={s.brand.zh} className="w-full border rounded px-3 py-2 text-sm" />
        <label className="text-xs text-zinc-500 block">English</label>
        <input name="brand_en" defaultValue={s.brand.en} className="w-full border rounded px-3 py-2 text-sm" />

        <h2 className="font-semibold pt-4">品牌副标题</h2>
        <input name="brand_sub_cn" defaultValue={s.brandSub.cn} className="w-full border rounded px-3 py-2 text-sm" placeholder="简体副标题" />
        <input name="brand_sub_zh" defaultValue={s.brandSub.zh} className="w-full border rounded px-3 py-2 text-sm" placeholder="繁體副標題" />
        <input name="brand_sub_en" defaultValue={s.brandSub.en} className="w-full border rounded px-3 py-2 text-sm" placeholder="English subtitle" />

        <h2 className="font-semibold pt-4">公司法定名称</h2>
        <input name="company_cn" defaultValue={s.company.cn} className="w-full border rounded px-3 py-2 text-sm" />
        <input name="company_zh" defaultValue={s.company.zh} className="w-full border rounded px-3 py-2 text-sm" />
        <input name="company_en" defaultValue={s.company.en} className="w-full border rounded px-3 py-2 text-sm" />

        <h2 className="font-semibold pt-4">WhatsApp</h2>
        <input
          name="whatsapp"
          defaultValue={s.whatsappNumber}
          placeholder="60321488800（国际格式，不含 + 号）"
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <h2 className="font-semibold pt-4">Tawk.to 在线客服（可选）</h2>
        <input name="tawk_property" defaultValue={s.tawkPropertyId} placeholder="Property ID" className="w-full border rounded px-3 py-2 text-sm" />
        <input name="tawk_widget" defaultValue={s.tawkWidgetId} placeholder="Widget ID" className="w-full border rounded px-3 py-2 text-sm" />

        <h2 className="font-semibold pt-4">联系方式</h2>
        <input name="email" defaultValue={s.contactEmail} placeholder="邮箱" className="w-full border rounded px-3 py-2 text-sm" />
        <input name="phone" defaultValue={s.contactPhone} placeholder="电话" className="w-full border rounded px-3 py-2 text-sm" />
        <textarea name="addr_cn" defaultValue={s.address.cn} rows={2} placeholder="地址（简体）" className="w-full border rounded px-3 py-2 text-sm" />
        <textarea name="addr_zh" defaultValue={s.address.zh} rows={2} placeholder="地址（繁體）" className="w-full border rounded px-3 py-2 text-sm" />
        <textarea name="addr_en" defaultValue={s.address.en} rows={2} placeholder="Address (EN)" className="w-full border rounded px-3 py-2 text-sm" />

        <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm">
          保存
        </button>
      </form>
    </div>
  );
}

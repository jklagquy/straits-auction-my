import { requireAdminPage } from "@/lib/admin-guard";
import { updateInquiryAction } from "../actions";
import { getAdminInquiries } from "@/lib/cms/repository";

export default async function InquiriesPage() {
  await requireAdminPage();
  const inquiries = await getAdminInquiries();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{"\u8BE2\u76D8\u7BA1\u7406"}</h1>
      {inquiries.length === 0 ? (
        <p className="text-sm text-zinc-500">{"\u6682\u65E0\u8BE2\u76D8\u3002"}</p>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="rounded-xl border bg-white p-5 text-sm">
              <div className="flex flex-wrap gap-3 justify-between">
                <div>
                  <strong>{inq.name}</strong>
                  {" \u00B7 "}
                  {inq.email}
                  {" \u00B7 "}
                  {inq.phone}
                </div>
                <div className="text-zinc-500">{new Date(inq.createdAt).toLocaleString("zh-CN")}</div>
              </div>
              <p className="mt-2 text-zinc-700 whitespace-pre-wrap">{inq.message}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {"\u6765\u6E90\uFF1A"}
                {inq.source}
                {inq.lotSlug ? ` \u00B7 \u62CD\u54C1 ${inq.lotSlug}` : ""}
                {" \u00B7 \u8BED\u8A00 "}
                {inq.locale}
              </p>
              <form action={updateInquiryAction} className="mt-4 grid sm:grid-cols-3 gap-3 items-end">
                <input type="hidden" name="id" value={inq.id} />
                <div>
                  <label className="text-xs text-zinc-500">{"\u72B6\u6001"}</label>
                  <select name="status" defaultValue={inq.status} className="w-full border rounded px-2 py-1">
                    <option value="new">{"\u65B0\u8BE2\u76D8"}</option>
                    <option value="following">{"\u8DDF\u8FDB\u4E2D"}</option>
                    <option value="closed">{"\u5DF2\u5173\u95ED"}</option>
                    <option value="won">{"\u5DF2\u6210\u4EA4"}</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-500">{"\u5907\u6CE8"}</label>
                  <input name="notes" defaultValue={inq.adminNotes} className="w-full border rounded px-2 py-1" />
                </div>
                <button type="submit" className="bg-zinc-900 text-white px-3 py-1.5 rounded text-xs">
                  {"\u66F4\u65B0"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

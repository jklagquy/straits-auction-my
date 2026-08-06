import { requireAdminPage } from "@/lib/admin-guard";
import { savePriceRulesAction } from "../actions";
import { loadAdminStore } from "@/lib/cms/repository";

export default async function PriceRulesPage() {
  await requireAdminPage();
  const rules = (await loadAdminStore()).priceRules;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">{"\u6BCF\u65E5\u4EF7\u683C\u4E0A\u6D6E"}</h1>
      <p className="text-sm text-zinc-600">
        {
          "\u524D\u53F0\u4F30\u4EF7 = \u57FA\u7840\u4EF7 + \u6BCF\u65E5\u4E0A\u6D6E \u00D7 \u5929\u6570\u3002\u767E\u5206\u6BD4\u6A21\u5F0F\u4E3A\u6BCF\u5929\u6309\u57FA\u7840\u4EF7\u589E\u52A0 X%\u3002"
        }
      </p>

      <form action={savePriceRulesAction} className="space-y-4 rounded-xl border bg-white p-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enabled" defaultChecked={rules.defaultUpliftEnabled} />
          {"\u542F\u7528\u5168\u5C40\u6BCF\u65E5\u4E0A\u6D6E"}
        </label>

        <div>
          <label className="text-xs text-zinc-500">{"\u4E0A\u6D6E\u6A21\u5F0F"}</label>
          <select name="mode" defaultValue={rules.defaultUpliftMode} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
            <option value="percent_daily">{"\u6BCF\u65E5\u767E\u5206\u6BD4 (%)"}</option>
            <option value="fixed_daily">{"\u6BCF\u65E5\u56FA\u5B9A\u91D1\u989D (RM)"}</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-500">{"\u4E0A\u6D6E\u6570\u503C"}</label>
          <input
            name="value"
            type="number"
            step="0.01"
            defaultValue={rules.defaultUpliftValue}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          />
          <p className="text-xs text-zinc-400 mt-1">{"\u793A\u4F8B\uFF1A0.3 \u8868\u793A\u6BCF\u5929 +0.3%"}</p>
        </div>

        <div>
          <label className="text-xs text-zinc-500">{"\u8D27\u5E01"}</label>
          <input name="currency" defaultValue={rules.currency} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </div>

        <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm">
          {"\u4FDD\u5B58"}
        </button>
      </form>
    </div>
  );
}

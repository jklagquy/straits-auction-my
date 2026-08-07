"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  { id: "cn", label: "简体中文" },
  { id: "zh", label: "繁體中文" },
  { id: "en", label: "English" },
] as const;

type LangTab = (typeof TABS)[number]["id"];

/**
 * Accept pre-rendered panels from the Server Component.
 * Do NOT use render-prop children — functions are not serializable across RSC → client.
 */
export default function LanguageTabs({
  cn,
  zh,
  en,
}: {
  cn: ReactNode;
  zh: ReactNode;
  en: ReactNode;
}) {
  const [lang, setLang] = useState<LangTab>("cn");
  const panels: Record<LangTab, ReactNode> = { cn, zh, en };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setLang(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              lang === t.id
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Keep all locale fields mounted so form submit includes every language */}
      <div className="space-y-4">
        {TABS.map((t) => (
          <div key={t.id} className={lang === t.id ? "block" : "hidden"}>
            {panels[t.id]}
          </div>
        ))}
      </div>
    </div>
  );
}

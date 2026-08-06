import type { Localized } from "@/lib/i18n";
import { tr, type Locale } from "@/lib/i18n";

export default function Marquee({
  lang,
  messages,
}: {
  lang: Locale;
  messages: Localized[];
}) {
  const items = messages.map((m) => tr(m, lang));  const loop = [...items, ...items];
  return (
    <div className="bg-bordeaux text-ivory/90 overflow-hidden border-y border-bordeaux-deep">
      <div className="flex whitespace-nowrap animate-marquee py-2.5">
        {loop.map((msg, i) => (
          <span key={i} className="mx-8 text-[12.5px] tracking-wide-2 flex items-center gap-8">
            <span className="text-gold-soft">◆</span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}

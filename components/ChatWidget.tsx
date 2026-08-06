"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/cms/types";

/** WhatsApp-first floating CTA — standard pattern on Malaysian business sites. */
export default function ChatWidget({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const wa = settings.whatsappNumber.replace(/\D/g, "");
  const waUrl = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        "Hello, I would like to enquire about your auction lots. / 你好，想咨询拍品。"
      )}`
    : "";

  return (
    <>
      {settings.tawkPropertyId && settings.tawkWidgetId && (
        // eslint-disable-next-line @next/next/no-sync-scripts
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/${settings.tawkPropertyId}/${settings.tawkWidgetId}';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      )}

      <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-[60] flex flex-col items-end gap-3">
        {open && (
          <div className="w-72 rounded-xl border border-line bg-paper shadow-2xl p-4 text-sm animate-fade-up">
            <p className="font-display text-lg text-bordeaux">在线顾问 / Consultant</p>
            <p className="mt-2 text-ink-soft text-xs leading-relaxed">
              WhatsApp 即时回复 · 中英 / 华语服务（马来西亚）
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center !py-2.5 text-xs rounded-lg text-white font-medium"
                  style={{ background: "#25D366" }}
                >
                  WhatsApp 咨询
                </a>
              )}
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="btn-solid text-center !py-2.5 text-xs"
                >
                  邮件联系
                </a>
              )}
            </div>
          </div>
        )}
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white"
            style={{ background: "#25D366" }}
            onClick={(e) => {
              // long-press style: also allow panel via secondary button if needed
              if (!open && e.detail === 0) return;
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 3.5A11 11 0 0 0 3.2 17.9L2 22l4.2-1.1A11 11 0 1 0 20.5 3.5zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.7.7.7-2.6-.2-.3a9 9 0 1 1 7.1 3.7zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.4-.5.2-.4c.1-.2 0-.3 0-.4s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3a2.3 2.3 0 0 0-.7 1.7 4 4 0 0 0 .8 2.1c.1.2 1.5 2.3 3.6 3.2a12 12 0 0 0 1.2.4 2.9 2.9 0 0 0 1.3.1c.4-.1 1.6-.7 1.8-1.3s.2-1.2.2-1.3-.2-.2-.4-.3z" />
            </svg>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open chat"
            className="h-14 w-14 rounded-full bg-bordeaux text-paper shadow-lg flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { dict, type Locale } from "@/lib/i18n";

export default function ContactForm({
  lang,
  lotSlug,
}: {
  lang: Locale;
  lotSlug?: string;
}) {
  const t = dict[lang].contact;
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const fd = new FormData(e.currentTarget);
        try {
          const res = await fetch("/api/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: fd.get("name"),
              email: fd.get("email"),
              phone: fd.get("phone"),
              message: fd.get("message"),
              lotSlug: lotSlug || undefined,
              locale: lang,
              source: lotSlug ? "product" : "contact",
            }),
          });
          if (!res.ok) throw new Error("failed");
          setSent(true);
        } catch {
          setError("提交失败，请稍后重试");
        } finally {
          setLoading(false);
        }
      }}
      className="space-y-5"
    >
      {lotSlug && (
        <p className="text-xs text-gold-deep bg-ivory px-3 py-2 border border-line">
          咨询拍品：{lotSlug}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={t.name} name="name" required />
        <Field label={t.email} name="email" type="email" required />
      </div>
      <Field label={t.phone} name="phone" />
      <div>
        <label className="block text-[12px] tracking-wide-2 text-ink-soft mb-2">
          {t.message}
        </label>
        <textarea
          name="message"
          rows={5}
          required
          className="w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-solid disabled:opacity-50">
        {loading ? "…" : t.send}
      </button>
      {sent && (
        <p className="text-sm text-gold-deep mt-2">
          ✓ {t.send} — {dict[lang].common.contactUs}
        </p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[12px] tracking-wide-2 text-ink-soft mb-2">
        {label}
        {required && <span className="text-bordeaux"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}

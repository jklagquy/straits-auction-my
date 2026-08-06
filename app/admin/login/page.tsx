"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError("");
          const password = new FormData(e.currentTarget).get("password");
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          if (res.ok) window.location.href = "/admin";
          else setError("\u5BC6\u7801\u9519\u8BEF");
          setPending(false);
        }}
        className="w-full max-w-sm bg-white border rounded-xl p-8 shadow-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">{"\u7BA1\u7406\u540E\u53F0\u767B\u5F55"}</h1>
        <p className="text-xs text-zinc-500 text-center">
          {"\u5BC6\u7801\u89C1 .env.local \u4E2D\u7684 ADMIN_PASSWORD"}
        </p>
        <input
          name="password"
          type="password"
          placeholder={"\u8BF7\u8F93\u5165\u5BC6\u7801"}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-zinc-900 text-white rounded-lg py-2 text-sm disabled:opacity-50"
        >
          {pending ? "\u767B\u5F55\u4E2D\u2026" : "\u767B\u5F55"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function MediaUploader({
  name,
  defaultValue = "",
  folder = "uploads",
  label = "图片",
}: {
  name: string;
  defaultValue?: string;
  folder?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-zinc-500 block">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => onFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="或粘贴图片 URL"
          className="flex-1 min-w-[220px] border rounded px-3 py-2 text-sm"
        />
      </div>
      {busy && <p className="text-xs text-zinc-500">上传中…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-2 h-20 w-auto rounded border object-contain bg-zinc-50" />
      ) : null}
    </div>
  );
}

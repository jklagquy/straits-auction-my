"use client";

import { useState } from "react";

export default function MultiImageUploader({
  name,
  defaultUrls = [],
  folder = "posts",
  label = "图片（可多选）",
}: {
  name: string;
  defaultUrls?: string[];
  folder?: string;
  label?: string;
}) {
  const [urls, setUrls] = useState<string[]>(defaultUrls.filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paste, setPaste] = useState("");

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const next = [...urls];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", folder);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "上传失败");
        if (data.url) next.push(data.url);
      }
      setUrls(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }

  function removeAt(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addPaste() {
    const parts = paste
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setUrls((prev) => [...prev, ...parts]);
    setPaste("");
  }

  return (
    <div className="space-y-3">
      <label className="text-xs text-zinc-500 block">{label}</label>
      <input type="hidden" name={name} value={urls.join("\n")} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
          {busy ? "上传中…" : "选择图片（可多选）"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            className="hidden"
            onChange={(e) => {
              void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <span className="text-xs text-zinc-400">已选 {urls.length} 张</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="或粘贴图片 URL 后点添加"
          className="min-w-[220px] flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addPaste}
          className="rounded border px-3 py-2 text-sm hover:bg-zinc-50"
        >
          添加 URL
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {urls.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((u, i) => (
            <div key={`${u}-${i}`} className="relative rounded border bg-zinc-50 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-24 w-full object-contain" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded bg-white/90 px-1.5 text-xs text-red-600 shadow"
              >
                删
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-400">
          暂无图片，点击上方按钮上传
        </div>
      )}
    </div>
  );
}

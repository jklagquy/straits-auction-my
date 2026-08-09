"use client";

import { useFormStatus } from "react-dom";

export default function SaveButton({
  children = "保存",
  className = "bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "保存中…" : children}
    </button>
  );
}

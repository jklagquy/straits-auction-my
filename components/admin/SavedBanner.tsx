export default function SavedBanner({
  saved,
  message = "已保存成功",
}: {
  saved?: string | string[];
  message?: string;
}) {
  const flag = Array.isArray(saved) ? saved[0] : saved;
  if (flag !== "1") return null;
  return (
    <div
      role="status"
      className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
    >
      ✓ {message}
    </div>
  );
}

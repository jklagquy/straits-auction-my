export function AdminListPage({
  title,
  items,
}: {
  title: string;
  items: { id: string; title: string; meta?: string }[];
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-zinc-500">列表只读 · 完整编辑器可在后续版本扩展</p>
      <ul className="rounded-xl border bg-white divide-y">
        {items.map((i) => (
          <li key={i.id} className="p-4 flex justify-between gap-4 text-sm">
            <span>{i.title}</span>
            <span className="text-zinc-400">{i.meta}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function ProductGallery({
  title,
  image,
  gallery,
}: {
  title: string;
  image: string;
  gallery: string[];
}) {
  const photos = [...new Set([image, ...(gallery || [])].filter(Boolean))];
  const [active, setActive] = useState(0);
  const current = photos[active] || image;

  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden bg-ink-soft/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={title}
          className="h-full w-full object-contain bg-ink"
        />
      </div>
      {photos.length > 1 && (
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
          {photos.map((g, i) => (
            <button
              key={`${g}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden bg-ink-soft/30 border ${
                i === active ? "border-gold-soft" : "border-transparent opacity-80 hover:opacity-100"
              }`}
              aria-label={`photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

function gridClass(n: number) {
  if (n === 1) return "grid-cols-1";
  if (n === 2) return "grid-cols-2";
  if (n === 3) return "grid-cols-3";
  if (n === 4) return "grid-cols-2";
  return "grid-cols-3";
}

export default function PostMediaGrid({ images }: { images: string[] }) {
  const photos = (images || []).filter(Boolean).slice(0, 9);
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!photos.length) return null;

  return (
    <>
      <div className={`grid ${gridClass(photos.length)} gap-1.5 sm:gap-2`}>
        {photos.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setLightbox(i)}
            className={`relative overflow-hidden bg-ivory-deep ${
              photos.length === 1 ? "aspect-[4/3]" : "aspect-square"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightbox != null && (
        <div
          className="fixed inset-0 z-[80] bg-ink/92 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-ivory/80 text-sm tracking-wide-2"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[lightbox]}
            alt=""
            className="max-h-[88vh] max-w-[96vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-3">
              <button
                type="button"
                className="px-3 py-1.5 text-ivory/90 border border-white/20 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) =>
                    i == null ? 0 : (i + photos.length - 1) % photos.length
                  );
                }}
              >
                ←
              </button>
              <span className="text-ivory/70 text-sm self-center">
                {lightbox + 1} / {photos.length}
              </span>
              <button
                type="button"
                className="px-3 py-1.5 text-ivory/90 border border-white/20 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i == null ? 0 : (i + 1) % photos.length));
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

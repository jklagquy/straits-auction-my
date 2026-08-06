"use client";

import { useEffect, useState } from "react";

export default function NewsBannerCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className="relative h-[220px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-ink">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-gold" : "w-1.5 bg-ivory/50"
              }`}
              aria-label={`slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { previewProductPriceAction } from "../../actions";

export default function PricePreview({ productId }: { productId: string }) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    previewProductPriceAction(productId).then((r) => {
      if (r) setText(`7日后约 RM ${Math.round(r.low).toLocaleString()} – ${Math.round(r.high).toLocaleString()}`);
    });
  }, [productId]);

  return text ? <div className="mt-1 text-zinc-600">{text}</div> : null;
}

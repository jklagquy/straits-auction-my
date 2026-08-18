"use client";

import { useEffect, useState } from "react";
import { previewProductPriceAction } from "../../actions";
import { formatMoney } from "@/lib/cms/pricing";

export default function PricePreview({ productId }: { productId: string }) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    previewProductPriceAction(productId).then((r) => {
      if (r) {
        const n = Number(r.in7 ?? r.low) || 0;
        setText(`7 日后约 ${formatMoney(n, "MYR", "cn")}`);
      }
    });
  }, [productId]);

  return text ? <div className="mt-1 text-zinc-600">{text}</div> : null;
}

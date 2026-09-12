import { notFound } from "next/navigation";
import { PageBanner, ProductCard } from "@/components/ui";
import { getProducts } from "@/lib/cms/repository";
import { dict, isLocale, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];
  const products = await getProducts();

  return (
    <>
      <PageBanner
        title={t.pages.productsTitle}
        desc={t.pages.productsDesc}
        image="/products/ss-03.jpg"
      />
      <section className="py-20 bg-ivory">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

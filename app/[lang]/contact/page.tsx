import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

/** Contact page hidden from public site — keep route for old links. */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) redirect("/cn/about");
  redirect(`/${raw}/about`);
}

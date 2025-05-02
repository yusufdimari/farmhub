import { getCartFromCookiesAction } from "@/actions/cart-actions";
import { getLocale, getTranslations } from "@/i18n/server";
import { CartEmpty } from "@/ui/checkout/cart-empty";
import { CartSummaryTable } from "@/ui/checkout/cart-summary-table";
import { StripeElementsWrapper } from "@/ui/checkout/stripe-elements-wrapper"; // new client component
import { ReactNode } from "react";

export default async function CartLayout({ children }: { children: ReactNode }) {
  const cart = await getCartFromCookiesAction();
  if (cart?.line_items?.data.length == 0) {
    return <CartEmpty />;
  }

  const t = await getTranslations("/cart.page");
  const locale = await getLocale();

  return (
    <StripeElementsWrapper
      clientSecret={cart?.client_secret || ""}
      locale={locale}
    >
      <div className="min-h-[calc(100dvh-7rem)] xl:grid xl:grid-cols-12 xl:gap-x-8">
        <div className="my-8 xl:col-span-7">
          <div className="sticky top-1">
            <h1 className="mb-4 text-3xl font-bold leading-none tracking-tight">{t("title")}</h1>
            <CartSummaryTable cart={structuredClone(cart) as any} locale={locale} />
          </div>
        </div>
        <div className="my-8 max-w-[65ch] xl:col-span-5">{children}</div>
      </div>
    </StripeElementsWrapper>
  );
}

import { getCartFromCookiesAction } from "@/actions/cart-actions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatMoney } from "@/lib/utils";
import { calculateCartTotalNetWithoutShipping } from "commerce-kit";
import { ShoppingBagIcon } from "lucide-react";
import { Suspense } from "react";
import { CartLink } from "./cart-link";
import Stripe from "stripe";

const CartFallback = () => (
	<div className="h-6 w-6 opacity-30">
		<ShoppingBagIcon />
	</div>
);

export const CartSummaryNav = () => {
	return (
		<Suspense fallback={<CartFallback />}>
			<CartSummaryNavInner />
		</Suspense>
	);
};

export const calculateCartTotal = (session:Stripe.Checkout.Session) => {
	if (!session.line_items?.data) return 0;

	return session.line_items.data.reduce((total, line) => {
		const price = line.price?.unit_amount || 0;
		const quantity = line.quantity || 1;
		return total + price * quantity;
	}, 0);
};

const CartSummaryNavInner = async () => {

	const cart = await getCartFromCookiesAction();
	if (!cart) {
		return <CartFallback />;
	}
    
	// Ensure cart.line_items?.data is always an array
	const data = Array.isArray(cart.line_items?.data) ? cart.line_items.data : [];

	// If cart has no items, show fallback
	if (data.length === 0) {
		return <CartFallback />;
	}

	const total = calculateCartTotal(cart);
	const totalItems = data.reduce((acc, line) => acc + (line.quantity ?? 1), 0);
	const t = await getTranslations("Global.nav.cartSummary");
	const locale = await getLocale();

	return (
		<TooltipProvider>
			<Tooltip delayDuration={100}>
				<TooltipTrigger asChild>
					<div>
						<CartLink>
							<ShoppingBagIcon />
							<span className="absolute bottom-0 right-0 inline-flex h-5 w-5 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 bg-white text-center text-xs">
								<span className="sr-only">{t("itemsInCart")}: </span>
								{totalItems}
							</span>
							<span className="sr-only">
								{t("total")}:{" "}
								{formatMoney({
									amount: total,
									currency: cart.currency || "usd",
									locale,
								})}
							</span>
						</CartLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="left" sideOffset={25}>
					<p>{t("totalItems", { count: totalItems })}</p>
					<p>
						{t("total")}: {formatMoney({ amount: total, currency: cart.currency || "usd", locale })}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/i18n/client";
import { getTranslations } from "@/i18n/server";
import { calculateCartTotalPossiblyWithTax, formatMoney, formatProductName } from "@/lib/utils";
import { CartAmountWithSpinner, CartItemLineTotal, CartItemQuantity } from "@/ui/checkout/cart-items.client";
import { FormatDeliveryEstimate } from "@/ui/checkout/shipping-rates-section";
import { calculateCartTotal } from "@/ui/nav/cart-summary-nav";
import { YnsLink } from "@/ui/yns-link";
import Image from "next/image";
import { useOptimistic } from "react";
import Stripe from "stripe";

export const CartSummaryTable = ({ cart, locale }: { cart: Stripe.Checkout.Session; locale: string }) => {
	const t = getTranslations("/cart.page.summaryTable");

	const total = calculateCartTotal(cart);
	const currency = cart.currency || "usd";

	return (
		<form>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="hidden w-24 sm:table-cell">
							<span className="sr-only">{t("imageCol")}</span>
						</TableHead>
						<TableHead className="">{t("productCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32">{t("priceCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32">{t("quantityCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32 text-right">{t("totalCol")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{cart.line_items?.data.map((line) => (
						<TableRow key={line.id}>
							<TableCell className="hidden sm:table-cell sm:w-24">
								{line.price?.product?.images[0] && (
									<Image
										className="aspect-square rounded-md object-cover"
										src={line.price.product.images[0]}
										width={96}
										height={96}
										alt=""
									/>
								)}
							</TableCell>
							<TableCell className="font-medium">
								<YnsLink className="transition-colors hover:text-muted-foreground" href={`/product/${line.price?.product.id}`}>
									{formatProductName(line.price?.product.name||'')}
								</YnsLink>
							</TableCell>
							<TableCell>
								{formatMoney({ amount: line.price?.unit_amount||0, currency, locale })}
							</TableCell>
							<TableCell>
								<CartItemQuantity quantity={line.quantity||1} productId={line.price?.product?.id||''} cartId={cart.id} />
							</TableCell>
							<TableCell className="text-right">
								<CartItemLineTotal currency={currency} quantity={line.quantity||1} unitAmount={line.price?.unit_amount||0} locale={locale} productId={line.id} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
				<TableFooter>
					<TableRow className="text-lg font-bold">
						<TableCell colSpan={3} className="text-right">{t("totalSummary")}</TableCell>
						<TableCell className="text-right">
							<CartAmountWithSpinner total={total} currency={currency} locale={locale} />
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</form>
	);
};

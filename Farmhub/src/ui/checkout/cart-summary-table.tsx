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
import {
	formatMoney,
	formatProductName,
} from "@/lib/utils";
import {
	CartAmountWithSpinner,
	CartItemLineTotal,
	CartItemQuantity,
} from "@/ui/checkout/cart-items.client";
import { calculateCartTotal } from "@/ui/nav/cart-summary-nav";
import { YnsLink } from "@/ui/yns-link";
import Image from "next/image";
import Stripe from "stripe";

type Props = {
	cart: Stripe.Checkout.Session & {
		line_items?: {
			data: Stripe.LineItem[];
		};
	};
	locale: string;
};

export const CartSummaryTable = ({ cart, locale }: Props) => {
	const t = useTranslations("/cart.page.summaryTable");
	const total = calculateCartTotal(cart);
	const currency = cart.currency || "gbp";

	return (
		<form>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="hidden w-24 sm:table-cell">
							<span className="sr-only">{t("imageCol")}</span>
						</TableHead>
						<TableHead>{t("productCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32">{t("priceCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32">{t("quantityCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32 text-right">{t("totalCol")}</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{cart.line_items?.data.map((line) => {
						// Ensure we treat the expanded product as a Stripe.Product
						const product = line.price?.product as Stripe.Product;

						return (
							<TableRow key={line.id}>
								<TableCell className="hidden sm:table-cell sm:w-24">
									{product.images?.[0] && (
										<Image
											className="aspect-square rounded-md object-cover"
											src={product.images[0]}
											width={96}
											height={96}
											alt={product.name}
										/>
									)}
								</TableCell>
								<TableCell className="font-medium">
									<YnsLink
										className="transition-colors hover:text-muted-foreground"
										href={`/product/${product.id}`}
									>
										{formatProductName(product.name)}
									</YnsLink>
								</TableCell>
								<TableCell>
									{formatMoney({
										amount: line.price?.unit_amount ?? 0,
										currency,
										locale,
									})}
								</TableCell>
								<TableCell>
									<CartItemQuantity
										onChange={()=>{}}
										quantity={line.quantity ?? 1}
										productId={product.id}
										cartId={cart.id}
									/>
								</TableCell>
								<TableCell className="text-right">
									<CartItemLineTotal
										currency={currency}
										quantity={line.quantity ?? 1}
										unitAmount={line.price?.unit_amount ?? 0}
										locale={locale}
										productId={line.id}
									/>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>

				<TableFooter>
					<TableRow className="text-lg font-bold">
						<TableCell colSpan={3} className="text-right">
							{t("totalSummary")}
						</TableCell>
						<TableCell className="text-right">
							<CartAmountWithSpinner
								total={total}
								currency={currency}
								locale={locale}
							/>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</form>
	);
};

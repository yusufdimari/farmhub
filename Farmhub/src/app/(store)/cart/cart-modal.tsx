import { getCartFromCookiesAction } from "@/actions/cart-actions";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatMoney, formatProductName } from "@/lib/utils";
import { YnsLink } from "@/ui/yns-link";
import Image from "next/image";
import { CartAsideContainer } from "./cart-aside";
import { calculateCartTotal } from "@/ui/nav/cart-summary-nav";

export async function CartModalPage() {
	// const searchParams = await props.searchParams;
	const originalCart = await getCartFromCookiesAction();
	// TODO fix type
	// const cart = await Commerce.cartAddOptimistic({ add: searchParams.add, cart: originalCart! });
	const cart = originalCart;

	if (!cart || cart.line_items?.data?.length === 0) {
		return null;
	}

	const currency = cart.line_items?.data[0]?.currency||'usd'
	const total = calculateCartTotal(cart);
	const t = await getTranslations("/cart.modal");
	const locale = await getLocale();

	return (
		<CartAsideContainer>
			<div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-neutral-700">{t("title")}</h2>
					<YnsLink replace href="/cart" className="text-sm text-muted-foreground underline">
						{t("openFullView")}
					</YnsLink>
				</div>

				<div className="mt-8">
					<ul role="list" className="-my-6 divide-y divide-neutral-200">
						{cart.line_items?.data?.map((item) => {
							const product = item.price?.product;
							// Check if product is an object and not deleted
								const isValidProduct = typeof product === "object" && "name" in product;
								const productName = isValidProduct ? product.name : "Unknown Product";
								const productImages = isValidProduct && "images" in product ? product.images : [];
							return (
							<li
								key={item.id}
								className="grid grid-cols-[4rem_1fr_max-content] grid-rows-[auto_auto] gap-x-4 gap-y-2 py-6"
							>
								{productImages[0] ? (
									<div className="col-span-1 row-span-2 bg-neutral-100">
										<Image
											className="aspect-square rounded-md object-cover"
											src={productImages[0]}
											width={80}
											height={80}
											alt=""
										/>
									</div>
								) : (
									<div className="col-span-1 row-span-2" />
								)}

								<h3 className="-mt-1 font-semibold leading-tight">
									{formatProductName(productName??'')}
								</h3>
								<p className="text-sm font-medium leading-none">
									{formatMoney({
										amount: item.price?.unit_amount ?? 0,
										currency: item.currency,
										locale,
									})}
								</p>
								<p className="self-end text-sm font-medium text-muted-foreground">
									{t("quantity", { quantity: item.quantity??1 })}
								</p>
							</li>
)})}
					</ul>
				</div>
			</div>

			<div className="border-t border-neutral-200 px-4 py-6 sm:px-6">
				<div
					id="cart-overlay-description"
					className="flex justify-between text-base font-medium text-neutral-900"
				>
					<p>{t("total")}</p>
					<p>
						{formatMoney({
							amount: total,
							currency,
							locale,
						})}
					</p>
				</div>
				<p className="mt-0.5 text-sm text-neutral-500">{t("shippingAndTaxesInfo")}</p>
				<Button asChild={true} size={"lg"} className="mt-6 w-full rounded-full text-lg">
					<YnsLink href="/cart">{t("goToPaymentButton")}</YnsLink>
				</Button>
			</div>
			{/* {searchParams.add && <CartModalAddSideEffect productId={searchParams.add} />} } */}
		</CartAsideContainer>
	);
}

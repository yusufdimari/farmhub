"use server";

import Stripe from "stripe";
import { clearCartCookie, getCartCookieJson, setCartCookieJson } from "@/lib/cart";
import { revalidateTag } from "next/cache";
import { loadStripe } from "@stripe/stripe-js";

const stripe = new Stripe('sk_test_51R4TYx2NX5KAvJfd60lzUskVmJfU2LEQTMpT8MmpIUtyOLhbuPcWX7uFXZY9PcN2VIbAGe3zoYZENTrDX1F2W5Ys00DRj3ZLC8');
const stripePromise= loadStripe('pk_test_51R4TYx2NX5KAvJfdIerQFsMVXcuL8lObfQ5DStHV1MJKEdWJlvoFSGXnSXXQ0tu0bl2LgXQBc1c68fvsQBczdFyN00MQh9KmHY')

export async function getCartFromCookiesAction() {
	const cartJson = await getCartCookieJson();
	if (!cartJson) {
		return null;
	}

	// Retrieve Checkout Session and ensure PaymentIntent is expanded
	const cart = await stripe.checkout.sessions.retrieve(cartJson.id, {
		expand: ["line_items", "payment_intent"],
	});

	// Ensure `payment_intent` is an object before accessing `client_secret`
	const clientSecret =
		typeof cart.payment_intent === "object" && cart.payment_intent?.client_secret
			? cart.payment_intent.client_secret
			: null;

	return structuredClone({
		...cart,
		client_secret: clientSecret, // Attach client_secret safely
	});
}



export async function setInitialCartCookiesAction(cartId: string, linesCount: number) {
	await setCartCookieJson({
		id: cartId,
		linesCount,
	});
	revalidateTag(`cart-${cartId}`);
}

export async function findOrCreateCartIdFromCookiesAction() {
	const cart = await getCartFromCookiesAction();
	if (cart) {
		return structuredClone(cart);
	}

	const newCart = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: "payment",
		line_items: [],
		success_url: "https://yourdomain.com/success",
		cancel_url: "https://yourdomain.com/cancel",
	});

	await setCartCookieJson({
		id: newCart.id,
		linesCount: 0,
	});
	revalidateTag(`cart-${newCart.id}`);

	return newCart.id;
}

export async function clearCartCookieAction() {
	const cookie = await getCartCookieJson();
	if (!cookie) {
		return;
	}

	await clearCartCookie();
	revalidateTag(`cart-${cookie.id}`);
	revalidateTag(`admin-orders`);
}

export async function addToCartAction(formData: FormData) {
	const productId = formData.get("productId");
	if (!productId || typeof productId !== "string") {
		throw new Error("Invalid product ID");
	}

	const price = await stripe.prices.list({ product: productId, limit: 1 });
	if (!price.data.length) {
		throw new Error("No price found for the product");
	}

	const existingCart = await getCartFromCookiesAction();
	const lineItems = existingCart?.line_items?.data.map((line) => ({
		price: line.price?.id,
		quantity: line.quantity,
	})) || [];

	lineItems.push({
		price: price.data[0]?.id,
		quantity: 1,
	});

	//@ts-ignore
	const updatedCart = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: "payment",
		line_items: lineItems,
		success_url: `${window.location.origin}/success`,
		cancel_url: `${window.location.origin}/cancel`,
		payment_intent_data: {
		setup_future_usage: "on_session", // Enables saving cards for future payments
	},
	});

	await setCartCookieJson({
		id: updatedCart.id,
		linesCount: lineItems.length,
	});
	revalidateTag(`cart-${updatedCart.id}`);
	return structuredClone(updatedCart);
}

export async function makePayment() {
	console.log("Initializing payment...");

	// Fetch cart details
	const cart = await getCartFromCookiesAction();
	if (!cart || !cart.id) {
		console.error("No cart found!");
		return;
	}

	// Ensure Stripe is initialized
	const stripeClient = await stripePromise;
	if (!stripeClient) {
		console.error("Stripe.js failed to load!");
		return;
	}

	// Redirect to Stripe Checkout
	const { error } = await stripeClient.redirectToCheckout({
		sessionId: cart.id,
	});

	if (error) {
		console.error("Stripe Checkout error:", error);
	}
}


export async function increaseQuantity(productId: string) {
	// Stripe does not allow modifying checkout sessions directly,
	// you'd need to create a new session with updated quantity.
	throw new Error("Increase quantity is not directly supported in Stripe");
}

export async function decreaseQuantity(productId: string) {
	throw new Error("Decrease quantity is not directly supported in Stripe");
}

export async function setQuantity({ productId, cartId, quantity }: { productId: string; cartId: string; quantity: number }) {
	throw new Error("Setting quantity is not directly supported in Stripe");
}

export async function commerceGPTRevalidateAction() {
	const cart = await getCartCookieJson();
	if (cart) {
		revalidateTag(`cart-${cart.id}`);
	}
}

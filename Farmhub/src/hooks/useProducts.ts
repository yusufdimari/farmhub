import Stripe from 'stripe';

export const useProducts = () => {
const stripe = new Stripe('sk_test_51R4TYx2NX5KAvJfd60lzUskVmJfU2LEQTMpT8MmpIUtyOLhbuPcWX7uFXZY9PcN2VIbAGe3zoYZENTrDX1F2W5Ys00DRj3ZLC8');
const publishableKey = 'pk_test_51R4TYx2NX5KAvJfdIerQFsMVXcuL8lObfQ5DStHV1MJKEdWJlvoFSGXnSXXQ0tu0bl2LgXQBc1c68fvsQBczdFyN00MQh9KmHY'

async function fetchProducts() {
  const products = await stripe.products.list({
    // limit: 6,
    active: true,
  });
  return products.data
}
async function searchProducts(q:string){
const res= await stripe.products.search({query:q})
return res.data
}

 async function getSingleProduct(productId: string) {
	try {
		const product = await stripe.products.retrieve(productId);
		const price = await stripe.prices.list({
			product: productId,
			limit: 1,
		});
		return {
			id: product.id,
			name: product.name,
			description: product.description,
			images: product.images,
			price: price.data[0]?.unit_amount || 0,
			currency: price.data[0]?.currency || "usd",
		};
	} catch (error) {
		console.error("Error fetching product:", error);
		return null;
	}
}

// async function addToCart(){
// 	const {}= await stripe.checkout.sessions.
// }



  return {fetchProducts,getSingleProduct,searchProducts,stripe,publishableKey}
}

import { ProductImageModal } from "@/app/(store)/product/[slug]/product-image-modal";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { publicUrl } from "@/env.mjs";
import { useProducts } from "@/hooks/useProducts";
import { getLocale, getTranslations } from "@/i18n/server";
import {formatMoney } from "@/lib/utils";
import { AddToCartButton } from "@/ui/add-to-cart-button";
import { Markdown } from "@/ui/markdown";
import { StickyBottom } from "@/ui/sticky-bottom";
import { YnsLink } from "@/ui/yns-link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";

export const generateMetadata = async (props: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
	const params = await props.params;
	const { getSingleProduct } = useProducts();
	const product = await getSingleProduct(params.slug);

	if (!product) {
		return notFound();
	}
	const t = await getTranslations("/product.metadata");

	const canonical = new URL(`${publicUrl}/product/${product.id}`);

	return {
		title: t("title", { productName: product.name }),
		description: product.description,
		alternates: { canonical },
	} satisfies Metadata;
};

export default async function SingleProductPage(props: { params: Promise<{ slug: string }> }) {
	const params = await props.params;
	const { getSingleProduct } = useProducts();
	const product = await getSingleProduct(params.slug);

	if (!product) {
		return notFound();
	}

	const t = await getTranslations("/product.page");
	const locale = await getLocale();
	// const category = product.metadata.category;
	const images = product.images;

	return (
		<article className="pb-12">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<YnsLink href="/products">{t("allProducts")}</YnsLink>
						</BreadcrumbLink>
					</BreadcrumbItem>
					{/* {category && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<YnsLink href={`/category/${category}`}>{deslugify(category)}</YnsLink>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</>
					)} */}
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{product.name}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<StickyBottom product={product} locale={locale}>
				<div className="mt-4 grid gap-4 lg:grid-cols-12">
					<div className="lg:col-span-5 lg:col-start-8">
						<h1 className="text-3xl font-bold">{product.name}</h1>
						<p className="mt-2 text-2xl font-medium">
							{formatMoney({
								amount: product.price,
								currency: product.currency,
								locale,
							})}
						</p>
					</div>

					<div className="lg:col-span-7">
						<div className="grid gap-4">
							{images.map((image, idx) => (
								<Image key={idx} src={image} width={700} height={700} alt="" className="w-full rounded-lg" />
							))}
						</div>
					</div>

					<div className="grid gap-8 lg:col-span-5">
						<section>
							<h2>{t("descriptionTitle")}</h2>
							<div className="prose text-secondary-foreground">
								<Markdown source={product.description || ""} />
							</div>
						</section>
						<AddToCartButton productId={product.id} />
					</div>
				</div>
			</StickyBottom>

			{/* <Suspense>
				<SimilarProducts id={product.id} />
			</Suspense> */}

			<Suspense>
				<ProductImageModal images={images} />
			</Suspense>

			{/* <JsonLd jsonLd={mappedProductToJsonLd(product)} /> */}
		</article>
	);
}

// async function SimilarProducts({ id }: { id: string }) {
// 	const products = await getRecommendedProducts({ productId: id, limit: 4 });

// 	if (!products) {
// 		return null;
// 	}

// 	return (
// 		<section className="py-12">
// 			<h2>You May Also Like</h2>
// 			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
// 				{products.map((product) => (
// 					<div key={product.tracking_id} className="bg-card rounded shadow-sm">
// 						<Image src={product.metadata.image_url} width={300} height={300} alt="" className="w-full" />
// 						<h3>{product.metadata.name}</h3>
// 					</div>
// 				))}
// 			</div>
// 		</section>
// 	);
// }
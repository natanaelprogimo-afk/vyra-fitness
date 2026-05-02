export interface OpenFoodProduct {
	code: string;
	product_name?: string;
	brands?: string;
	nutriments?: Record<string, unknown>;
	image_url?: string;
	[k: string]: unknown;
}

interface OpenFoodFactsResponse {
	status?: number;
	product?: OpenFoodProduct;
}

export async function fetchProductByBarcode(barcode: string): Promise<OpenFoodProduct | null> {
	if (!barcode) return null;
	try {
		const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`);
		if (!res.ok) return null;
		const data = (await res.json()) as OpenFoodFactsResponse;
		if (data.status === 1) return data.product as OpenFoodProduct;
		return null;
	} catch (err) {
		console.warn('[OpenFoodFacts] Fetch error', err);
		return null;
	}
}

export default { fetchProductByBarcode };

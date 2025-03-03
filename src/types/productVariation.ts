export type ProductVariation = {
	id: number;
	type: string;
	date_created: string;
	date_created_gmt: string;
	date_modified: string;
	date_modified_gmt: string;
	description: string;
	permalink: string;
	sku: string;
	global_unique_id: string;
	price: string;
	regular_price: string;
	sale_price: string;
	date_on_sale_from: string | null;
	date_on_sale_from_gmt: string | null;
	date_on_sale_to: string | null;
	date_on_sale_to_gmt: string | null;
	on_sale: boolean;
	status: string;
	purchasable: boolean;
	virtual: boolean;
	downloadable: boolean;
	downloads: any[];
	download_limit: number;
	download_expiry: number;
	tax_status: string;
	tax_class: string;
	manage_stock: boolean;
	stock_quantity: number | null;
	stock_status: string;
	backorders: string;
	backorders_allowed: boolean;
	backordered: boolean;
	low_stock_amount: number | null;
	weight: string;
	dimensions: {
		length: string;
		width: string;
		height: string;
	};
	shipping_class: string;
	shipping_class_id: number;
	image: {
		id: number;
		date_created: string;
		date_created_gmt: string;
		date_modified: string;
		date_modified_gmt: string;
		src: string;
		name: string;
		alt: string;
	};
	attributes: {
		id: number;
		name: string;
		slug: string;
		option: string;
	}[];
	menu_order: number;
	meta_data: any[];
	name: string;
	parent_id: number;
	_links: {
		self: { href: string; targetHints: { allow: string[] } }[];
		collection: { href: string }[];
		up: { href: string }[];
	};
};

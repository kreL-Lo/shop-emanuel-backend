export type Product = {
	id: number;
	name: string;
	slug: string;
	permalink: string;
	date_created: string;
	date_created_gmt: string;
	date_modified: string;
	date_modified_gmt: string;
	type: 'simple' | 'variable' | 'grouped'; // assuming 'simple', 'variable', or 'grouped' product types
	status: 'publish' | 'draft' | 'pending'; // assuming common status options
	featured: boolean;
	catalog_visibility: 'visible' | 'hidden' | 'search'; // assuming common catalog visibility options
	description: string;
	short_description: string;
	sku: string;
	price: string;
	regular_price: string;
	sale_price: string | null;
	date_on_sale_from: string | null;
	date_on_sale_from_gmt: string | null;
	date_on_sale_to: string | null;
	date_on_sale_to_gmt: string | null;
	on_sale: boolean;
	purchasable: boolean;
	total_sales: number;
	virtual: boolean;
	downloadable: boolean;
	downloads: any[]; // assuming the download array could have more information
	download_limit: number;
	download_expiry: number;
	external_url: string;
	button_text: string;
	tax_status: 'taxable' | 'shipping' | 'none'; // assuming typical tax statuses
	tax_class: string;
	manage_stock: boolean;
	stock_quantity: number | null;
	backorders: 'no' | 'notify' | 'yes'; // assuming common backorder options
	backorders_allowed: boolean;
	backordered: boolean;
	low_stock_amount: number | null;
	sold_individually: boolean;
	weight: string;
	dimensions: {
		length: string;
		width: string;
		height: string;
	};
	shipping_required: boolean;
	shipping_taxable: boolean;
	shipping_class: string;
	shipping_class_id: number;
	reviews_allowed: boolean;
	average_rating: string;
	rating_count: number;
	upsell_ids: number[];
	cross_sell_ids: number[];
	parent_id: number;
	purchase_note: string;
	categories: Array<{
		id: number;
		name: string;
		slug: string;
	}>;
	tags: string[];
	images: Array<{
		id: number;
		date_created: string;
		date_created_gmt: string;
		date_modified: string;
		date_modified_gmt: string;
		src: string;
		name: string;
		alt: string;
	}>;
	attributes: any[]; // assuming there are attributes or custom fields
	default_attributes: any[];
	variations: any[]; // assuming variations array
	grouped_products: any[]; // assuming this could be an array of grouped products
	menu_order: number;
	price_html: string;
	related_ids: number[];
	meta_data: any[]; // assuming this could hold metadata for product
	stock_status: 'instock' | 'outofstock' | 'onbackorder'; // assuming typical stock statuses
	has_options: boolean;
	post_password: string;
	global_unique_id: string;
	_links: {
		self: Array<{
			href: string;
			targetHints: {
				allow: string[];
			};
		}>;
		collection: Array<{
			href: string;
		}>;
	};
	similarProducts?: Product[];
};

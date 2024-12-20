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
};

// Example product object
const product: Product = {
	id: 17,
	name: 'Bms',
	slug: 'bs',
	permalink: 'https://cms.atelieruldebaterii.ro/product/bs/',
	date_created: '2024-11-14T03:01:29',
	date_created_gmt: '2024-11-14T03:01:29',
	date_modified: '2024-11-14T03:03:36',
	date_modified_gmt: '2024-11-14T03:03:36',
	type: 'simple',
	status: 'publish',
	featured: false,
	catalog_visibility: 'visible',
	description: '',
	short_description: '',
	sku: '',
	price: '100',
	regular_price: '100',
	sale_price: '',
	date_on_sale_from: null,
	date_on_sale_from_gmt: null,
	date_on_sale_to: null,
	date_on_sale_to_gmt: null,
	on_sale: false,
	purchasable: true,
	total_sales: 2,
	virtual: false,
	downloadable: false,
	downloads: [],
	download_limit: -1,
	download_expiry: -1,
	external_url: '',
	button_text: '',
	tax_status: 'taxable',
	tax_class: '',
	manage_stock: false,
	stock_quantity: null,
	backorders: 'no',
	backorders_allowed: false,
	backordered: false,
	low_stock_amount: null,
	sold_individually: false,
	weight: '',
	dimensions: {
		length: '',
		width: '',
		height: '',
	},
	shipping_required: true,
	shipping_taxable: true,
	shipping_class: '',
	shipping_class_id: 0,
	reviews_allowed: true,
	average_rating: '0.00',
	rating_count: 0,
	upsell_ids: [],
	cross_sell_ids: [],
	parent_id: 0,
	purchase_note: '',
	categories: [
		{
			id: 15,
			name: 'Category test',
			slug: 'nu-ne-interseaza',
		},
	],
	tags: [],
	images: [
		{
			id: 18,
			date_created: '2024-11-14T03:00:54',
			date_created_gmt: '2024-11-14T03:00:54',
			date_modified: '2024-11-14T03:01:03',
			date_modified_gmt: '2024-11-14T03:01:03',
			src: 'https://cms.atelieruldebaterii.ro/wp-content/uploads/2024/11/bms.png',
			name: 'Bms',
			alt: '',
		},
	],
	attributes: [],
	default_attributes: [],
	variations: [],
	grouped_products: [],
	menu_order: 0,
	price_html:
		'<span class="woocommerce-Price-amount amount"><bdi>100,00&nbsp;<span class="woocommerce-Price-currencySymbol">lei</span></bdi></span>',
	related_ids: [21, 15, 13],
	meta_data: [],
	stock_status: 'instock',
	has_options: false,
	post_password: '',
	global_unique_id: '',
	_links: {
		self: [
			{
				href: 'https://cms.atelieruldebaterii.ro/wp-json/wc/v3/products/17',
				targetHints: {
					allow: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
				},
			},
		],
		collection: [
			{
				href: 'https://cms.atelieruldebaterii.ro/wp-json/wc/v3/products',
			},
		],
	},
};

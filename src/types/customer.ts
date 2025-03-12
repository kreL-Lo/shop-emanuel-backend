export interface Customer {
	id: number;
	date_created: string;
	date_created_gmt: string;
	date_modified: string;
	date_modified_gmt: string;
	email: string;
	first_name: string;
	last_name: string;
	role: string;
	username: string;
	billing: Address;
	shipping: Address;
	is_paying_customer: boolean;
	avatar_url: string;
	meta_data: MetaData[];
	_links: Links;
}

export interface Address {
	first_name: string;
	last_name: string;
	company: string;
	address_1: string;
	address_2: string;
	city: string;
	postcode: string;
	country: string;
	state: string;
	email?: string;
	phone?: string;
}

export interface MetaData {
	id: number;
	key: string;
	value: any;
}

export interface Links {
	self: Link[];
	collection: Link[];
}

export interface Link {
	href: string;
	targetHints?: TargetHints;
}

export interface TargetHints {
	allow: string[];
}

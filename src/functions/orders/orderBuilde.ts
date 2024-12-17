type Address = {
	firstName: '';
	lastName: '';
	address: '';
	apartment: '';
	postalCode: '';
	city: '';
	county: '';
	phone: '';
};

type MetodaPlata = 'card' | 'ramburs';

export type OrderData = {
	deliveryAddress: Address;
	billingAddress: Address;
	paymentMethod: MetodaPlata;
	deliveryMethod: 'livrare';
	email: string;
};

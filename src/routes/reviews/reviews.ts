import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';
import { Product } from '../../types/product';
import { paramsProduct } from '../prodRoutes/prodUtils';
import { isValidToken, validateToken } from '../auth/auth';
import { Customer } from '../../types/customer';
import { Order } from '../../types/order';

const router = Router();

router.get('/:productId', async (req, res) => {
	try {
		const { productId } = req.params;
		const {
			page = 1,
			per_page = 10,
			order = 'desc',
			orderby = 'date',
			rating,
		} = req.query;
		const params: any = {
			product: productId,
			page,
			per_page,
			order,
			orderby: 'date_gmt',
		};
		if (rating) {
			params.rating = rating;
		}

		const response = await wooCommerceApi.get('/products/reviews', {
			...params,
		});

		let sortedReviews = response.data;

		if (orderby !== 'date_gmt') {
			// @ts-ignore

			sortedReviews = sortedReviews = response.data.sort((a, b) => {
				return orderby === 'rating'
					? b.rating - a.rating // Highest rating first
					: a.rating - b.rating; // Lowest rating first
			});

			// @ts-ignore
			sortedReviews = sortedReviews.sort((a, b) => {
				//asc
				if (order !== 'asc') {
					return (
						new Date(a.date_created).getTime() -
						new Date(b.date_created).getTime()
					);
				}
				//desc
				return (
					new Date(b.date_created).getTime() -
					new Date(a.date_created).getTime()
				);
			});
		}
		res.json(sortedReviews);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// @ts-ignore
router.get('/starsCount/:productId', async (req, res) => {
	// for a review get me the stars count of [1,2,3,4,5]
	try {
		const { productId } = req.params;
		//get product

		const data = await wooCommerceApi.get(`/products/${productId}`, {
			...paramsProduct,
		});
		const product: Product = data.data;
		if (!data.data) {
			return res.status(404).json({ message: 'Product not found' });
		}

		const response = await wooCommerceApi.get('/products/reviews', {
			product: productId,
			per_page: 100,
		});
		const starsCount = response.data.reduce(
			(acc: any, review: any) => {
				const rating = review.rating;
				if (rating <= 1) {
					acc[1] += 1;
				} else if (rating <= 2) {
					acc[2] += 1;
				} else if (rating <= 3) {
					acc[3] += 1;
				} else if (rating <= 4) {
					acc[4] += 1;
				} else if (rating <= 5) {
					acc[5] += 1;
				}
				return acc;
			},
			{
				1: 0,
				2: 0,
				3: 0,
				4: 0,
				5: 0,
			}
		);
		const numReview =
			product.rating_count + (response.data.length === 0 ? 0 : 1);
		const object = {
			count: starsCount,
			nrOfReviews: numReview,
			totalRating:
				response.data.length === 1
					? parseFloat(response.data[0].rating)
					: parseFloat(product.average_rating),
		};
		res.json(object);
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
});

// ✅ Create a New Review
// @ts-ignore
router.post('/', validateToken, async (req, res) => {
	try {
		// check if the user has ordered the product
		// @ts-ignore
		const user = req.user as Customer;

		const { product_id } = req.body;
		const orders = await wooCommerceApi.get('/orders', {
			customer_id: user.id,
		});
		const order = orders.data.find((order: Order) => {
			if (!order.line_items) {
				return false;
			}
			return order.line_items.some(
				(item: any) => item.product_id.toString() === product_id.toString()
			);
		});
		if (!order) {
			return res.status(403).json({ message: 'You can not review' });
		}

		// count how many review have been made by reviewer
		const { review, reviewer, reviewer_email, rating } = req.body;
		const reviews = await wooCommerceApi.get(`/products/reviews/`, {
			product: req.body.product_id,
			reviewer_email: req.body.reviewer_email,
		});
		if (reviews.data.length < 3) {
			const response = await wooCommerceApi.post('/products/reviews', {
				product_id,
				review,
				reviewer,
				reviewer_email,
				rating,
			});
			res.status(201).json({ message: 'Review created', data: response.data });
		} else {
			res
				.status(403)
				.json({ message: 'You have reached the maximum number of reviews' });
		}
		// if(reviews.data.length <=){
	} catch (error: any) {
		if (error.status === '409') {
			return res
				.status(409)
				.json({ message: 'You have reached the maximum number of reviews' });
		}
		res.status(500).json({ error: error.message });
	}
});

// @ts-ignore
router.get('/allow/:productId', validateToken, async (req, res) => {
	try {
		// allow to review if there is a order with the product
		// @ts-ignore
		const user: Customer = req.user;
		const { productId } = req.params;

		//get user orders and check if the product is in the order
		const orders = await wooCommerceApi.get('/orders', {
			customer_id: user.id,
		});

		const order = orders.data.find((order: Order) => {
			if (!order.line_items) {
				return false;
			}
			return order.line_items.some(
				(item: any) => item.product_id.toString() === productId
			);
		});
		if (!order) {
			return res.status(403).json({ message: 'You can not review' });
		}

		res.json({ message: 'You can review' });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

export default router;

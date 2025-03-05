import { Router } from 'express';
import wooCommerceApi from '../../apiSetup/wooCommerceApi';

const router = Router();

router.get('/', async (req, res) => {
	try {
		const response = await wooCommerceApi.get('/products/reviews');
		res.json(response.data);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});
// ✅ Get Reviews for a Specific Product with Pagination
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
		console.log('here', req.query);
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

		const response = await wooCommerceApi.get('/products/reviews', { params });

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
		console.log('here', error);
		res.status(500).json({ error: error.message });
	}
});

router.get('/starsCount/:productId', async (req, res) => {
	// for a review get me the stars count of [1,2,3,4,5]
	try {
		const { productId } = req.params;
		const response = await wooCommerceApi.get('/products/reviews', {
			params: { product: productId },
		});
		let sumRating = 0;
		const starsCount = response.data.reduce(
			(acc: any, review: any) => {
				const rating = review.rating;
				sumRating += rating;
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
		const object = {
			count: starsCount,
			nrOfReviews: response.data.length,
			totalRating: sumRating / response.data.length,
		};
		res.json(object);
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
});

// ✅ Create a New Review
// @ts-ignore
router.post('/', async (req, res) => {
	try {
		// count how many review have been made by reviewer
		const { product_id, review, reviewer, reviewer_email, rating } = req.body;

		const reviews = await wooCommerceApi.get(`/products/reviews/`, {
			params: {
				product: req.body.product_id,
				reviewer_email: req.body.reviewer_email,
			},
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
		console.log('here', error);
		if (error.status === '409') {
			return res
				.status(409)
				.json({ message: 'You have reached the maximum number of reviews' });
		}
		res.status(500).json({ error: error.message });
	}
});

// ✅ Delete a Review
router.delete('/:reviewId', async (req, res) => {
	try {
		const { reviewId } = req.params;
		const response = await wooCommerceApi.delete(
			`/products/reviews/${reviewId}?force=true`
		);
		res.json({ message: 'Review deleted', data: response.data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

export default router;

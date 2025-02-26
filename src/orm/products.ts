import Posts from './posts';
import { Model } from 'objection';

// proucts are posts with post_type = 'product'
class Products extends Posts {
	static get tableName() {
		return 'wp_posts';
	}
	static get modifiers() {
		return {
			// @ts-ignore
			products(query) {
				query.where('post_type', 'product');
			},
		};
	}
}

export default Products;

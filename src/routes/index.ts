import { Router } from 'express';
import catgories from './categories/categories';
import productRoutes from './productRoutes';
import searchProducts from './search-products';

const router = Router();

router.use('/categories', catgories);
router.use('/products', productRoutes);
router.use('/search-products', searchProducts);

export default router;

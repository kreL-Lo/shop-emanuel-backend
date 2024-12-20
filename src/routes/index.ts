import { Router } from 'express';
import catgories from './categories/categories';
import productRoutes from './productRoutes';
import searchProducts from './search-products';
import cartRoutes from './cart/cart';
import paymentRoutes from './payment/payment';
import orderRoutes from './orders/orders';
const router = Router();

router.use('/categories', catgories);
router.use('/products', productRoutes);
router.use('/search-products', searchProducts);
router.use('/cart', cartRoutes);
// use express.raw
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
export default router;

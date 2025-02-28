import { Router } from 'express';
import catgories from './categories/categories';
import productRoutes from './productRoutes';
import searchProducts from './search-products';
import cartRoutes from './cart/cart';
import paymentRoutes from './payment/payment';
import orderRoutes from './orders/orders';
import authRoutes from './auth/auth';
import addressRoute from './address/address';
import userRoute from './user/user';
const router = Router();

router.use('/categories', catgories);
router.use('/products', productRoutes);
router.use('/search-products', searchProducts);
router.use('/cart', cartRoutes);
// use express.raw
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/address', addressRoute);
router.use('/user', userRoute);
export default router;

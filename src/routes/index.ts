import { Router } from 'express';
import catgories from './categories/categories';
import productRoutes from './prodRoutes/productRoutes';
import cartRoutes from './cart/cart';
import paymentRoutes from './payment/payment';
import orderRoutes from './orders/orders';
import authRoutes from './auth/auth';
import addressRoute from './address/address';
import userRoute from './user/user';
import reviews from './reviews/reviews';
import dBattery from './dBattery/dBattery';
import filter from './filter/filter';
import newsletter from './newsletters/newsletters';

const router = Router();

router.use('/categories', catgories);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/address', addressRoute);
router.use('/user', userRoute);
router.use('/reviews', reviews);
router.use('/designBattery', dBattery);
router.use('/filter', filter);
router.use('/newsletter', newsletter);

export default router;

import { Router } from 'express';
import passport from 'passport';
import { authorize } from '../middleware/authMiddleware.js';
import { getCarts, createCart, getCartById, addProductToCart, updateCart, updateProductQuantity, removeProductFromCart, emptyCart, purchaseCart } from '../controllers/cart.controller.js';

const router = Router();

router.get('/', passport.authenticate('current', { session: false }), authorize('admin'), getCarts);

router.post('/', passport.authenticate('current', { session: false }), createCart);

router.get('/:cid', passport.authenticate('current', { session: false }), authorize(['user', 'admin']), getCartById);

router.post('/:cid/products/:pid', passport.authenticate('current', { session: false }), authorize('user'), addProductToCart);

router.put('/:cid', passport.authenticate('current', { session: false }), authorize('user'), updateCart);

router.put('/:cid/products/:pid', passport.authenticate('current', { session: false }), authorize('user'), updateProductQuantity);

router.delete('/:cid/products/:pid', passport.authenticate('current', { session: false }), authorize('user'), removeProductFromCart);

router.delete('/:cid', passport.authenticate('current', { session: false }), authorize('user'), emptyCart);

router.post('/:cid/purchase', passport.authenticate('current', { session: false }), authorize('user'), purchaseCart);

export default router;
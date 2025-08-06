import { Router } from 'express';
import passport from 'passport';
import { authorize } from '../middleware/authMiddleware.js';
import { uploader } from "../utils/multerUtil.js";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);

router.get('/:pid', getProductById);

router.post(
    '/',
    passport.authenticate('current', { session: false }),
    authorize('admin'),
    uploader.array('thumbnails', 3),
    createProduct
);

router.put(
    '/:pid',
    passport.authenticate('current', { session: false }),
    authorize('admin'),
    uploader.array('thumbnails', 3),
    updateProduct
);

router.delete(
    '/:pid',
    passport.authenticate('current', { session: false }),
    authorize('admin'),
    deleteProduct
);

export default router;
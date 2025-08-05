import { Router } from 'express';
import passport from 'passport';
import { authorize } from '../middleware/authMiddleware.js'; 
import ProductRepository from '../repositories/ProductRepository.js';
import {uploader} from "../utils/multerUtil.js";

const router = Router();
const productRepository = ProductRepository;


router.get('/', async (req, res) => {
    try {
        const products = await productRepository.getAllProducts(req.query);
        res.status(200).json({ status: 'success', payload: products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.get('/:pid', async (req, res) => {
    try {
        const result = await productRepository.getProductById(req.params.pid);
        res.status(200).json({ status: 'success', payload: result });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});


router.post(
    '/',
    passport.authenticate('current', { session: false }),
    authorize('admin'),
    uploader.array('thumbnails', 3), 
    async (req, res) => {
        if (req.files && req.files.length > 0) {
            req.body.thumbnails = req.files.map(file => file.path); 
        }
        try {
            const newProduct = await productRepository.createProduct(req.body);
            res.status(201).json({ status: 'success', payload: newProduct });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
);


router.put('/:pid',
    passport.authenticate('current', { session: false }),
    authorize('admin'),
    uploader.array('thumbnails', 3), 
    async (req, res) => {
        if (req.files && req.files.length > 0) {
            req.body.thumbnails = req.files.map(file => file.path);
        }
        try {
            const updatedProduct = await productRepository.updateProduct(req.params.pid, req.body);
            res.status(200).json({ status: 'success', payload: updatedProduct });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
);


router.delete('/:pid',
    passport.authenticate('current', { session: false }),
    authorize('admin'),
    async (req, res) => {
        try {
            const result = await productRepository.deleteProduct(req.params.pid);
            res.status(200).json({ status: 'success', payload: result });
        } catch (error) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }
);

export default router;
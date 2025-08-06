import ProductRepository from '../repositories/ProductRepository.js';

export const getProducts = async (req, res) => {
    try {
        const products = await ProductRepository.getAllProducts(req.query);
        res.status(200).json({ status: 'success', payload: products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const result = await ProductRepository.getProductById(req.params.pid);
        res.status(200).json({ status: 'success', payload: result });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};

export const createProduct = async (req, res) => {
    if (req.files && req.files.length > 0) {
        req.body.thumbnails = req.files.map(file => file.path);
    }
    try {
        const newProduct = await ProductRepository.createProduct(req.body);
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    if (req.files && req.files.length > 0) {
        req.body.thumbnails = req.files.map(file => file.path);
    }
    try {
        const updatedProduct = await ProductRepository.updateProduct(req.params.pid, req.body);
        res.status(200).json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const result = await ProductRepository.deleteProduct(req.params.pid);
        res.status(200).json({ status: 'success', message: 'Producto eliminado con éxito.', payload: result });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};
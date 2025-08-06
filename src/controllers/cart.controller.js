import CartRepository from "../repositories/CartRepository.js";

export const getCarts = async (req, res) => {
    try {
        const carts = await CartRepository.getAllCarts();
        res.status(200).json({ status: 'success', payload: carts });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const createCart = async (req, res) => {
    try {
        const newCart = await CartRepository.createCart();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getCartById = async (req, res) => {
    try {
        const { cid } = req.params;
        if (req.user.role === 'user' && req.user.cart !== cid) {
            return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes acceder a este carrito.' });
        }
        const result = await CartRepository.getProductsFromCartById(cid);
        res.status(200).json({ status: 'success', payload: result });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};

export const addProductToCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        if (req.user.role === 'user' && req.user.cart !== cid) {
            return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
        }
        const result = await CartRepository.addProductToCart(cid, pid);
        res.status(200).json({ status: 'success', message: 'Producto agregado al carrito.', payload: result });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateCart = async (req, res) => {
    try {
        const { cid } = req.params;
        if (req.user.role === 'user' && req.user.cart !== cid) {
            return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
        }
        const { products } = req.body;
        const result = await CartRepository.updateCart(cid, products);
        res.status(200).json({ status: 'success', message: 'Carrito actualizado.', payload: result });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateProductQuantity = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        if (req.user.role === 'user' && req.user.cart !== cid) {
            return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
        }
        const { quantity } = req.body;
        if (quantity < 1) {
            return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número positivo.' });
        }
        const result = await CartRepository.updateProductQuantity(cid, pid, quantity);
        res.status(200).json({ status: 'success', message: 'Cantidad de producto actualizada.', payload: result });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const removeProductFromCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        if (req.user.role === 'user' && req.user.cart !== cid) {
            return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
        }
        const result = await CartRepository.removeProductFromCart(cid, pid);
        res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito.', payload: result });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const emptyCart = async (req, res) => {
    try {
        const { cid } = req.params;
        if (req.user.cart !== cid) {
            return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
        }
        const result = await CartRepository.emptyCart(cid);
        res.status(200).json({ status: 'success', message: 'Todos los productos eliminados del carrito.', payload: result });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const purchaseCart = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const purchaserEmail = req.user.email;
        const result = await CartRepository.purchaseCart(cartId, purchaserEmail);
        res.status(200).json({ status: 'success', message: 'Compra finalizada con éxito.', payload: result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `Error al procesar la compra: ${error.message}` });
    }
};
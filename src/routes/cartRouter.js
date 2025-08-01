import { Router } from 'express';
import CartRepository from '../repositories/CartRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import TicketRepository from '../repositories/TicketRepository.js'; 
import passport from 'passport';
import { authorize } from '../middleware/authMiddleware.js'; 

const router = Router();
const CartService = CartRepository;
const ProductService = ProductRepository;
const TicketService = TicketRepository; 


router.get('/', passport.authenticate('current', { session: false }), authorize('admin'), async (req, res) => {
    try {
        const carts = await CartService.getAllCarts();
        res.status(200).json({ status: 'success', payload: carts });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.get('/:cid',
    passport.authenticate('current', { session: false }),
    authorize(['user', 'admin']), 
    async (req, res) => {
        try {
            const { cid } = req.params;
            
            if (req.user.role === 'user' && req.user.cart !== cid) {
                return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes acceder a este carrito.' });
            }
            const result = await CartService.getProductsFromCartById(cid);
            res.status(200).json({ status: 'success', payload: result });
        } catch (error) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }
);


router.post('/', async (req, res) => { 
    try {
        const newCart = await CartService.createCart();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.post('/:cid/products/:pid',
    passport.authenticate('current', { session: false }),
    authorize('user'), 
    async (req, res) => {
        try {
            const { cid, pid } = req.params;
           
            if (req.user.cart !== cid) {
                return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
            }
            const updatedCart = await CartService.addProductToCart(cid, pid);
            res.status(200).json({ status: 'success', payload: updatedCart });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
);


router.put('/:cid/products/:pid',
    passport.authenticate('current', { session: false }),
    authorize('user'),
    async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;
            if (req.user.cart !== cid) {
                return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
            }
            if (typeof quantity !== 'number' || quantity < 0) {
                return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número positivo.' });
            }
            const updatedCart = await CartService.updateProductQuantityInCart(cid, pid, quantity);
            res.status(200).json({ status: 'success', payload: updatedCart });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
);


router.put('/:cid',
    passport.authenticate('current', { session: false }),
    authorize('user'),
    async (req, res) => {
        try {
            const { cid } = req.params;
            const { products } = req.body;
            if (req.user.cart !== cid) {
                return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
            }
            if (!Array.isArray(products)) {
                return res.status(400).json({ status: 'error', message: 'El cuerpo de la solicitud debe ser un array de productos.' });
            }
            const updatedCart = await CartService.updateAllProductsInCart(cid, products);
            res.status(200).json({ status: 'success', payload: updatedCart });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
);


router.delete('/:cid/products/:pid',
    passport.authenticate('current', { session: false }),
    authorize('user'),
    async (req, res) => {
        try {
            const { cid, pid } = req.params;
            if (req.user.cart !== cid) {
                return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
            }
            const updatedCart = await CartService.deleteProductFromCart(cid, pid);
            res.status(200).json({ status: 'success', payload: updatedCart });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
);



router.delete('/:cid',
    passport.authenticate('current', { session: false }),
    authorize('user'),
    async (req, res) => {
        try {
            const { cid } = req.params;
            if (req.user.cart !== cid) {
                return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes modificar este carrito.' });
            }
            const result = await CartService.deleteAllProductsFromCart(cid);
            res.status(200).json({ status: 'success', message: 'Todos los productos eliminados del carrito.', payload: result });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
);



router.post('/:cid/purchase',
    passport.authenticate('current', { session: false }),
    authorize('user'), 
    async (req, res) => {
        const { cid } = req.params;
        const purchaserEmail = req.user.email; 

        try {
            
            if (req.user.cart !== cid) {
                return res.status(403).json({ status: 'error', message: 'Prohibido: No puedes comprar este carrito.' });
            }

            const cart = await CartService.getProductsFromCartById(cid);

            if (!cart || cart.products.length === 0) {
                return res.status(400).json({ status: 'error', message: 'El carrito está vacío o no existe.' });
            }

            const productsToPurchase = [];
            const productsFailed = [];
            let totalAmount = 0;

            for (const item of cart.products) {
                const productDB = await ProductService.getProductById(item.product._id);

                if (productDB && productDB.stock >= item.quantity) {
                    productsToPurchase.push({
                        product: item.product._id,
                        quantity: item.quantity,
                        price: productDB.price
                    });
                    totalAmount += productDB.price * item.quantity;
                   
                    await ProductService.updateProductStock(item.product._id, productDB.stock - item.quantity);
                } else {
                    productsFailed.push({
                        product: item.product._id,
                        quantity: item.quantity,
                        availableStock: productDB ? productDB.stock : 0
                    });
                }
            }

            let ticket = null;
            if (productsToPurchase.length > 0) {
                ticket = await TicketService.createTicket({
                    code: 'TICKET-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    purchase_datetime: new Date(),
                    amount: totalAmount,
                    purchaser: purchaserEmail,
                    products: productsToPurchase 
                });

                
                const updatedCartProducts = cart.products.filter(item =>
                    !productsToPurchase.some(p => p.product.toString() === item.product._id.toString())
                );
                await CartService.updateAllProductsInCart(cid, updatedCartProducts);
            }

            res.status(200).json({
                status: 'success',
                message: 'Proceso de compra completado.',
                ticket: ticket,
                productsFailed: productsFailed,
                cartUpdated: await CartService.getProductsFromCartById(cid) 
            });

        } catch (error) {
            console.error("Error en la ruta de compra:", error);
            res.status(500).json({ status: 'error', message: `Error al procesar la compra: ${error.message}` });
        }
    }
);

export default router;
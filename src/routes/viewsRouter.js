import { Router } from 'express';
import ProductRepository from '../repositories/ProductRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import UserRepository from '../repositories/UserRepository.js'; 
import passport from 'passport';
import { authorize } from '../middleware/authMiddleware.js';

const router = Router();
const ProductService = ProductRepository;
const CartService = CartRepository;
const UserService = UserRepository;


router.get('/', (req, res) => {
    res.render('home', { title: 'Bienvenido', style: 'index.css' }); 
});


router.get('/products',
    passport.authenticate('current', { session: false, failureRedirect: '/login' }), 
   
    async (req, res) => {
        try {
            const products = await ProductService.getAllProducts(req.query);
            res.render(
                'index', 
                {
                    title: 'Productos',
                    style: 'index.css',
                    products: JSON.parse(JSON.stringify(products.docs)),
                    prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}&limit=${products.limit}${req.query.sort ? `&sort=${req.query.sort}` : ''}${req.query.query ? `&query=${req.query.query}` : ''}` : null,
                    nextLink: products.hasNextPage ? `/products?page=${products.nextPage}&limit=${products.limit}${req.query.sort ? `&sort=${req.query.sort}` : ''}${req.query.query ? `&query=${req.query.query}` : ''}` : null,
                    page: products.page,
                    totalPages: products.totalPages,
                    hasPrevPage: products.hasPrevPage,
                    hasNextPage: products.hasNextPage,
                    
                    user: req.user ? JSON.parse(JSON.stringify(req.user)) : null
                }
            );
        } catch (error) {
            console.error("Error al cargar productos:", error);
            res.status(500).render('errorPage', { title: 'Error', message: 'No se pudieron cargar los productos.', style: 'error.css' });
        }
    }
);


router.get('/realtimeproducts',
    passport.authenticate('current', { session: false, failureRedirect: '/login' }),
    authorize('admin'), 
    async (req, res) => {
        try {
            const products = await ProductService.getAllProducts({}); 
            res.render(
                'realTimeProducts',
                {
                    title: 'Productos en Tiempo Real',
                    style: 'index.css',
                    products: JSON.parse(JSON.stringify(products.docs)),
                    user: req.user ? JSON.parse(JSON.stringify(req.user)) : null 
                }
            );
        } catch (error) {
            console.error("Error al cargar productos en tiempo real:", error);
            res.status(500).render('errorPage', { title: 'Error', message: 'No se pudieron cargar los productos en tiempo real.', style: 'error.css' });
        }
    }
);


router.get('/cart/:cid',
    passport.authenticate('current', { session: false, failureRedirect: '/login' }),
    authorize('user'), 
    async (req, res) => {
        try {
            const { cid } = req.params;
            
            if (req.user.cart !== cid) {
                return res.status(403).render('errorPage', { title: 'Acceso Denegado', message: 'No tienes permiso para ver este carrito.', style: 'error.css' });
            }

            const cart = await CartService.getProductsFromCartById(cid);
            if (!cart) {
                return res.status(404).render('notFound', { title: 'Carrito no encontrado', style: 'notFound.css' });
            }

            res.render(
                'cart',
                {
                    title: 'Tu Carrito',
                    style: 'cart.css', 
                    cart: JSON.parse(JSON.stringify(cart)),
                    user: req.user ? JSON.parse(JSON.stringify(req.user)) : null
                }
            );
        } catch (error) {
            console.error("Error al cargar el carrito:", error);
            res.status(500).render('errorPage', { title: 'Error', message: 'No se pudo cargar el carrito.', style: 'error.css' });
        }
    }
);

router.get('/login', (req, res) => {
    res.render('login', { title: 'Iniciar Sesión', style: 'login.css' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Registrarse', style: 'register.css' });
});


router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword', { title: 'Recuperar Contraseña', style: 'reset.css' });
});

router.get('/reset-password', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).render('errorPage', { title: 'Error', message: 'Token de restablecimiento no proporcionado.', style: 'error.css' });
    }
    try {
        const user = await UserService.findUserByResetToken(token); 
        if (!user) {
            return res.status(400).render('errorPage', { title: 'Error', message: 'Token de restablecimiento inválido o expirado.', style: 'error.css' });
        }
        res.render('resetPassword', { title: 'Restablecer Contraseña', style: 'reset.css', token });
    } catch (error) {
        console.error("Error al cargar vista de reset:", error);
        res.status(500).render('errorPage', { title: 'Error', message: 'Error al cargar la página de restablecimiento.', style: 'error.css' });
    }
});


router.get('*', (req, res) => {
    res.status(404).render('notFound', { title: 'Página No Encontrada', style: 'notFound.css' });
});

export default router;
import { cartModel } from './models/cartModel.js';
import ProductDAO from './ProductDAO.js'; 

class CartDAO {
    constructor(productDAOInstance) { 
        if (!productDAOInstance) {
            throw new Error("ProductDAO instance is required for CartDAO.");
        }
        this.productDAO = productDAOInstance;
    }

    async getAllCarts() {
        return await cartModel.find().lean();
    }

    async getProductsFromCartByID(cid) {
        const cart = await cartModel.findById(cid).populate('products.product').lean();
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }
        return cart;
    }

    async createCart() {
        const newCart = await cartModel.create({});
        return newCart.toObject();
    }

    async addProductByID(cid, pid) {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }

        const product = await this.productDAO.getProductByID(pid); 
        if (!product) {
            throw new Error("Producto no encontrado.");
        }

        const existingProductInCart = cart.products.find(p => p.product.toString() === pid);

        if (existingProductInCart) {
            existingProductInCart.quantity++;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        return cart.populate('products.product'); 
    }

    async updateProductQuantity(cid, pid, quantity) {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }
        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            throw new Error("Producto no encontrado en el carrito.");
        }

        if (quantity <= 0) {
            cart.products.splice(productIndex, 1); 
        } else {
            cart.products[productIndex].quantity = quantity;
        }

        await cart.save();
        return cart.populate('products.product');
    }

    async deleteAllProducts(cid) {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }
        cart.products = [];
        await cart.save();
        return cart.toObject();
    }

    async updateAllProducts(cid, products) {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }
        cart.products = products; 
        await cart.save();
        return cart.populate('products.product');
    }

   
    async deleteProductFromCart(cid, pid) {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }

        const initialLength = cart.products.length;
        cart.products = cart.products.filter(item => item.product.toString() !== pid);

        if (cart.products.length === initialLength) {
            throw new Error("Producto no encontrado en el carrito para eliminar.");
        }

        await cart.save();
        return cart.populate('products.product');
    }
}

export default CartDAO;
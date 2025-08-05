import CartDAO from "../dao/CartDAO.js";
import ProductDAO from "../dao/ProductDAO.js";
import ProductRepository from "./ProductRepository.js";
import TicketRepository from "./TicketRepository.js";
import { v4 as uuidv4 } from "uuid";

class CartRepository {
    constructor() {
        this.productDAO = new ProductDAO();
        this.cartDAO = new CartDAO(this.productDAO);
    }

    async getCartById(cid) {
        return await this.cartDAO.getProductsFromCartByID(cid);
    }

    async createCart() {
        return await this.cartDAO.createCart();
    }

    async addProductToCart(cid, pid) {
        return await this.cartDAO.addProductByID(cid, pid);
    }

    async updateProductQuantity(cid, pid, quantity) {
        return await this.cartDAO.updateProductQuantity(cid, pid, quantity);
    }

    async removeProductFromCart(cid, pid) {
        return await this.cartDAO.deleteProductFromCart(cid, pid);
    }

    async emptyCart(cid) {
        return await this.cartDAO.deleteAllProducts(cid);
    }

    async updateCart(cid, newCart) {
        return await this.cartDAO.updateAllProducts(cid, newCart);
    }
    
    async purchaseCart(cartId, purchaserEmail) {
        const cart = await this.getCartById(cartId);

        if (!cart || cart.products.length === 0) {
            throw new Error('El carrito está vacío o no existe.');
        }

        const purchasedProducts = [];
        const unpurchasedProducts = [];
        let totalAmount = 0;

        for (const item of cart.products) {
            const product = await ProductRepository.getProductById(item.product._id);

            if (product && product.stock >= item.quantity) {
                purchasedProducts.push(item);
                totalAmount += product.price * item.quantity;
                await ProductRepository.updateProductStock(product._id, product.stock - item.quantity);
            } else {
                unpurchasedProducts.push(item);
            }
        }

        if (purchasedProducts.length === 0) {
            throw new Error('No se pudo comprar ningún producto por falta de stock.');
        }

        const ticketData = {
            code: uuidv4(),
            purchase_datetime: new Date(),
            amount: totalAmount,
            purchaser: purchaserEmail,
            products: purchasedProducts.map(p => ({
                product: p.product._id,
                quantity: p.quantity
            }))
        };
        const ticket = await TicketRepository.createTicket(ticketData);

        await this.updateCart(cartId, { products: unpurchasedProducts });

        return {
            ticket,
            unpurchasedProducts: unpurchasedProducts.map(p => p.product._id)
        };
    }
}

export default new CartRepository();
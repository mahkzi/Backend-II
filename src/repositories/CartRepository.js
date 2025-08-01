import CartDAO from '../dao/CartDAO.js';
import ProductDAO from '../dao/ProductDAO.js'; 

class CartRepository {
   
    static #productDAOInstance = new ProductDAO();
    static #cartDAO = new CartDAO(CartRepository.#productDAOInstance); 

    static async getAllCarts() { return await this.#cartDAO.getAllCarts(); }
    static async getProductsFromCartById(cid) { return await this.#cartDAO.getProductsFromCartByID(cid); }
    static async createCart() { return await this.#cartDAO.createCart(); }
    static async addProductToCart(cid, pid) { return await this.#cartDAO.addProductByID(cid, pid); }
    static async deleteProductFromCart(cid, pid) { return await this.#cartDAO.deleteProductFromCart(cid, pid); } 
    static async updateAllProductsInCart(cid, products) { return await this.#cartDAO.updateAllProducts(cid, products); }
    static async updateProductQuantityInCart(cid, pid, quantity) { return await this.#cartDAO.updateProductQuantity(cid, pid, quantity); }
    static async deleteAllProductsFromCart(cid) { return await this.#cartDAO.deleteAllProducts(cid); }
}

export default CartRepository;
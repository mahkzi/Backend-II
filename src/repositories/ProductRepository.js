import ProductDAO from '../dao/ProductDAO.js';

class ProductRepository {
    static #productDAO = new ProductDAO();

    static async getAllProducts(params) {
        return await this.#productDAO.getAllProducts(params);
    }

    static async getProductById(pid) { 
        return await this.#productDAO.getProductByID(pid);
    }

    static async createProduct(product) {
        return await this.#productDAO.createProduct(product);
    }

    static async updateProduct(pid, productUpdate) {
        return await this.#productDAO.updateProduct(pid, productUpdate);
    }

    static async deleteProduct(pid) {
        return await this.#productDAO.deleteProduct(pid);
    }

    static async updateProductStock(pid, newStock) {
        return await this.#productDAO.updateProductStock(pid, newStock);
    }
}

export default ProductRepository;
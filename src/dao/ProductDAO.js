import productModel from './models/productModel.js'; 

class ProductDAO {
    async getAllProducts(params) {
        const { limit = 10, page = 1, sort, query } = params;
        const filter = query ? JSON.parse(query) : {};
        const options = {
            limit,
            page,
            lean: true
        };
        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }
        return await productModel.paginate(filter, options); 
    }

    async getProductByID(pid) {
        const product = await productModel.findById(pid).lean(); 
        if (!product) {
            throw new Error(`Producto con ID ${pid} no encontrado.`);
        }
        return product;
    }

    async createProduct(productData) {
        const newProduct = await productModel.create(productData); 
        return newProduct.toObject();
    }

    async updateProduct(pid, productUpdate) {
        const updatedProduct = await productModel.findByIdAndUpdate(pid, productUpdate, { new: true }).lean(); 
        if (!updatedProduct) {
            throw new Error(`Producto con ID ${pid} no encontrado para actualizar.`);
        }
        return updatedProduct;
    }

    async deleteProduct(pid) {
        const deletedProduct = await productModel.findByIdAndDelete(pid).lean(); 
        if (!deletedProduct) {
            throw new Error(`Producto con ID ${pid} no encontrado para eliminar.`);
        }
        return deletedProduct;
    }

    async updateProductStock(pid, newStock) {
        if (newStock < 0) {
            throw new Error("El stock no puede ser negativo.");
        }
        const updatedProduct = await productModel.findByIdAndUpdate(pid, { stock: newStock }, { new: true }).lean(); 
        if (!updatedProduct) {
            throw new Error(`Producto con ID ${pid} no encontrado para actualizar stock.`);
        }
        return updatedProduct;
    }
}

export default ProductDAO;
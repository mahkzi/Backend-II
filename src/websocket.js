import ProductRepository from './repositories/ProductRepository.js'; 

const ProductService = ProductRepository;

export default (io) => {
    io.on("connection", async (socket) => {
        console.log("Nuevo cliente conectado a WebSocket:", socket.id);


        try {
            const products = await ProductService.getAllProducts({}); 
            socket.emit("publishProducts", products.docs);
        } catch (error) {
            console.error("Error al emitir productos iniciales por WS:", error);
            socket.emit("statusError", "No se pudieron cargar los productos iniciales.");
        }

        socket.on("createProduct", async (productData) => { 
            try {
                
                await ProductService.createProduct(productData);
                const products = await ProductService.getAllProducts({});
                io.emit("publishProducts", products.docs); 
            } catch (error) {
                console.error("Error en createProduct (WebSocket):", error);
                socket.emit("statusError", error.message);
            }
        });

        socket.on("deleteProduct", async (pid) => { 
            try {
               
                await ProductService.deleteProduct(pid);
                const products = await ProductService.getAllProducts({});
                io.emit("publishProducts", products.docs); 
            } catch (error) {
                console.error("Error en deleteProduct (WebSocket):", error);
                socket.emit("statusError", error.message);
            }
        });

        socket.on("disconnect", () => {
            console.log("Cliente desconectado de WebSocket:", socket.id);
        });
    });
};
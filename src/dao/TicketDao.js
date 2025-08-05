import ticketModel from './models/ticketModel.js';

class TicketDAO {
    async createTicket(ticketData) {
        try {
            const newTicket = await ticketModel.create(ticketData);
            return newTicket.toObject(); 
        } catch (error) {
            console.error("Error al crear el ticket en DAO:", error);
            throw new Error("No se pudo crear el ticket. " + error.message);
        }
    }
    async getTicketById(tid) {
        try {
            const ticket = await ticketModel.findById(tid).populate('products.product').lean();
            if (!ticket) {
                throw new Error("Ticket no encontrado.");
            }
            return ticket;
        } catch (error) {
            console.error("Error al obtener el ticket por ID en DAO:", error);
            throw new Error("No se pudo obtener el ticket. " + error.message);
        }
    }

   
}

export default TicketDAO;
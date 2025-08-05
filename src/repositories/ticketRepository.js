import TicketDAO from '../dao/TicketDAO.js';

class TicketRepository {
    static #ticketDAO = new TicketDAO();

    static async createTicket(ticketData) {
        return await this.#ticketDAO.createTicket(ticketData);
    }

    static async getTicketById(tid) {
        return await this.#ticketDAO.getTicketById(tid);
    }
}

export default TicketRepository; 
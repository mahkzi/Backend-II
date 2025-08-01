import { UserDAO } from '../dao/UserDAO.js'; 

class UserRepository {
    

    async getUsers() {
        return await UserDAO.getUsers(); 
    }

    async getUserByEmail(email) {
        return await UserDAO.getUserByEmail(email); 
    }

    async getUserById(id) {
        const user = await UserDAO.getUserById(id); 
        
        return user; 
    }

    async createUser(userData) {
        return await UserDAO.createUser(userData); 
    }

    async updateUser(id, newData) {
        return await UserDAO.updateUser(id, newData); 
    }

    async findUserByResetToken(token) {
        const user = await UserDAO.findUserByToken(token); 
        return user; 
    }

    
    async updatePassword(email, newPlainPassword) {

        return await UserDAO.updatePassword(email, newPlainPassword); 
    }
}

export default new UserRepository();
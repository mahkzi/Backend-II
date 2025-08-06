import { UserDAO } from '../dao/UserDAO.js'; 
import { createHash } from '../utils/passwordUtil.js';
import UserDTO from '../DTO/UserDTO.js';

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
        console.log('UserRepository: Recibiendo userData:', userData);
        if (!userData || !userData.password) {
            console.error('UserRepository: Error, userData o password es undefined.');
            throw new Error('Error al crear usuario: datos incompletos.');
        }

        
        userData.password = createHash(userData.password);
        
        console.log('UserRepository: Hasheando la contraseña y enviando al DAO.');
        console.log('Contraseña hasheada a guardar:', userData.password);

        let userCreated = await UserDAO.createUser(userData);
        return new UserDTO(userCreated);
    }

   async updateUser(id, newData) {
        if (newData.password) {
            newData.password = createHash(newData.password);
        }
        return await UserDAO.updateUser(id, newData);
    }

}

export default new UserRepository();
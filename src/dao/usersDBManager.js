import { usersModel} from "./models/userModel.js";

export class UsersManager{
    
   static async getUsers(){
        try {
            const users = await usersModel.find().lean();
            console.log("Usuarios obtenidos de DB (usersDBManager):", users);
            return users;
        } catch (error) {
            console.error("Error al obtener usuarios de DB (usersDBManager):", error); 
            throw error;
        }
    }

    static async createUser(user){
        return await usersModel.create(user);
    }

}
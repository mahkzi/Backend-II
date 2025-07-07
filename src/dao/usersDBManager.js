import { usersModel} from "./models/userModel.js";
import { cartDBManager } from "./cartDBManager.js";

const cartManager = new cartDBManager();

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

     static async getUserByEmail(email) {
        try {
            return await usersModel.findOne({ email }).lean();

        } catch (error) {
            console.error("Error al obtener usuario por email:", error);
            throw error;
        }
    }

   static async createUser(userData) {
        try {
            const newCart = await cartManager.createCart();
            userData.cart = newCart._id;
            
            return await usersModel.create(userData);
        } catch (error) {
            console.error("Error al crear usuario en DB:", error);
            throw error;
        }
    }

}
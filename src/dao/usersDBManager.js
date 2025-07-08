import { usersModel} from "./models/userModel.js";
import { cartDBManager } from "./cartDBManager.js";
import bcrypt from "bcrypt";

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
             console.log("DEBUG: userData justo antes del hash:", userData);
              userData.password = await bcrypt.hash(userData.password, 10);
               console.log("DEBUG: userData DESPUÉS del hash:", userData);
                return await usersModel.create(userData);
                
        } catch (error) {
            console.error("Error al crear usuario en DB:", error);
            throw error;
        }
    }

}
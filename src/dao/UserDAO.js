import { userModel } from './models/userModel.js';

export class UserDAO { 
    static async getUsers() {
        return await userModel.find().lean();
    }

    static async getUserByEmail(email) {
        return await userModel.findOne({ email }).lean();
    }

    static async getUserById(uid) {
        return await userModel.findById(uid).lean();
    }

    static async createUser(userData) {
        console.log('UserDAO: Creando usuario en la base de datos.');
        const newUser = await userModel.create(userData);
        return newUser.toObject();
    }


     static async updateUser(uid, newData) {
      
        if (newData.password) {
           
            newData.password = createHash(newData.password);
        }
        const updatedUser = await userModel.findByIdAndUpdate(uid, newData, { new: true }).lean();
        if (!updatedUser) {
            throw new Error(`Usuario con ID ${uid} no encontrado para actualizar.`);
        }
        return updatedUser;
    }

    static async findUserByToken(token) {
        
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } 
        }).lean();
        return user;
    }

    static async updatePassword(email, newHashedPassword) {
       
        const updatedUser = await userModel.findOneAndUpdate(
            { email: email },
            {
                password: newHashedPassword,
                resetPasswordToken: undefined, 
                resetPasswordExpires: undefined 
            },
            { new: true }
        ).lean();
        if (!updatedUser) {
            throw new Error(`Usuario con email ${email} no encontrado para actualizar contraseña.`);
        }
        return updatedUser;
    }
}
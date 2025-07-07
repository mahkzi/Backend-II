import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const usersModel = mongoose.model(
    "users",
    new mongoose.Schema(
        {
            first_name: { type: String, required: true }, 
            last_name: { type: String, required: true },  
            email: {
                type: String,
                unique: true,
                required: true
            },
            age: { type: Number, required: true }, 
            password: { type: String, required: true }, 
            cart: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: "carts" 
            },
            role: {
                type: String,
                default: "user",
            }
        },
        {
            timestamps: true
        }
    )
);

usersModel.schema.pre('save', async function (next) {
    if (this.isModified('password')) {
        console.log("-----------------------------------------");
        console.log("Hook pre('save') ejecutándose para:", this.email);
        console.log("Contraseña ANTES del hashing:", this.password); 
        this.password = await bcrypt.hash(this.password, 10);
        console.log("Contraseña DESPUÉS del hashing:", this.password); 
        console.log("-----------------------------------------");
    }
    next();
});

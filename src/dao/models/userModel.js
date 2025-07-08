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


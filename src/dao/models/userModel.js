import mongoose from "mongoose";

export const usersModel = mongoose.model(
    "users",
    new mongoose.Schema(
        {
            first_name: String,
            last_name : String,
            email:{
                type:String,
                unique: true
            },
            age: Number,
            password: String,
            cart: String,
            role: {
                type: String,
                default: "user",
            }
        },
        {
            timestamps: true
        }
    )
)
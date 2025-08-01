import dotenv from "dotenv";

dotenv.config();

export const config = {
   PORT: process.env.PORT || 8080,
    MONGO_URL: process.env.MONGO_URL,
    DB_Name: process.env.DB_NAME || "entrega-final",
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
};
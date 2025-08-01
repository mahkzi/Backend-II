import mongoose from 'mongoose';

const ticketCollection = 'tickets';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: { 
        type: String,
        required: true
    },
    products: { 
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products", 
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                price: { 
                    type: Number,
                    required: false
                }
            }
        ],
        default: []
    }
});

export const ticketModel = mongoose.model(ticketCollection, ticketSchema);
const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    catererId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing', 
        required: true
    },
    proposedPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    deliveryLocation: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending_caterer', 'pending_customer', 'accepted', 'declined'],
        default: 'pending_caterer'
    }
}, { timestamps: true });

module.exports = mongoose.model('Negotiation', negotiationSchema);
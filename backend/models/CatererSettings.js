const mongoose = require('mongoose');

const catererSettingsSchema = new mongoose.Schema({
    catererId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    isNegotiationsEnabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('CatererSettings', catererSettingsSchema);
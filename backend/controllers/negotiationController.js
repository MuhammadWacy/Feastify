const Negotiation = require('../models/Negotiation');
const CatererSettings = require('../models/CatererSettings');

// ==========================================
// EXISTING: Create negotiation (with NEW check for disabled negotiations)
// ==========================================
exports.createNegotiation = async (req, res) => {
    try {
        const { catererId } = req.body;

        // NEW ADDITION: Check if caterer has turned off negotiations
        if (catererId) {
            const settings = await CatererSettings.findOne({ catererId });
            if (settings && settings.isNegotiationsEnabled === false) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Caterer has turned off negotiations currently.' 
                });
            }
        }

        const negotiation = new Negotiation(req.body);
        await negotiation.save();
        res.status(201).json({ success: true, data: negotiation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// EXISTING: Get negotiation by ID (includes demo mode)
// ==========================================
exports.getNegotiationById = async (req, res) => {
    try {
        if (req.params.id === 'test-id' || req.params.id === 'test') {
            return res.status(200).json({
                success: true,
                data: {
                    deliveryLocation: 'Gulshan 2, Dhaka (Demo Mode)',
                    items: [
                        { itemId: 1, name: 'Regular Kacchi Platter', offeredPrice: 220, quantity: 1, image: 'Food Img' }
                    ]
                }
            });
        }

        const negotiation = await Negotiation.findById(req.params.id).populate('customerId', 'name email');
        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }
        res.status(200).json({ success: true, data: negotiation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// EXISTING: Update negotiation (with NEW check for disabled negotiations)
// ==========================================
exports.updateNegotiation = async (req, res) => {
    try {
        const existingNegotiation = await Negotiation.findById(req.params.id);
        if (!existingNegotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }

        // NEW ADDITION: Check if caterer has turned off negotiations
        const settings = await CatererSettings.findOne({ catererId: existingNegotiation.catererId });
        if (settings && settings.isNegotiationsEnabled === false) {
            return res.status(403).json({ 
                success: false, 
                message: 'Caterer has turned off negotiations currently.' 
            });
        }

        const updated = await Negotiation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// NEW ADDITION: Get all customers requesting negotiations for a caterer
// ==========================================
exports.getCatererNegotiationsHub = async (req, res) => {
    try {
        const { catererId } = req.params;

        const negotiations = await Negotiation.find({ catererId })
            .populate('customerId', 'name email')
            .sort({ updatedAt: -1 });

        // Get or initialize caterer settings
        let settings = await CatererSettings.findOne({ catererId });
        if (!settings) {
            settings = await CatererSettings.create({ catererId, isNegotiationsEnabled: true });
        }

        res.status(200).json({
            success: true,
            isNegotiationsEnabled: settings.isNegotiationsEnabled,
            negotiations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// NEW ADDITION: Toggle negotiations on/off for caterer
// ==========================================
exports.toggleNegotiations = async (req, res) => {
    try {
        const { catererId } = req.params;
        const { isNegotiationsEnabled } = req.body;

        let settings = await CatererSettings.findOne({ catererId });
        if (!settings) {
            settings = new CatererSettings({ catererId, isNegotiationsEnabled });
        } else {
            settings.isNegotiationsEnabled = isNegotiationsEnabled;
        }
        await settings.save();

        res.status(200).json({
            success: true,
            message: `Negotiations have been ${settings.isNegotiationsEnabled ? 'enabled' : 'disabled'}.`,
            isNegotiationsEnabled: settings.isNegotiationsEnabled
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// NEW ADDITION: Decline all incoming/existing negotiation requests for a caterer
// ==========================================
exports.declineAllNegotiations = async (req, res) => {
    try {
        const { catererId } = req.params;

        await Negotiation.updateMany(
            { catererId, status: { $ne: 'accepted' } },
            { $set: { status: 'declined' } }
        );

        res.status(200).json({
            success: true,
            message: 'All pending and active negotiation requests have been declined.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const Negotiation = require("../models/Negotiation");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const Catering = require("../models/Catering");
const MenuItem = require("../models/MenuItem");

const parseEventDate = (value) => {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
        const [day, month, year] = value.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const makeHistoryItems = (items) =>
    items.map((item) => ({
        foodName: item.foodName,
        pricePerServing: item.currentPrice,
    }));

const calculatePayableAmount = (items) =>
    items.reduce(
        (total, item) => total + item.currentPrice * item.servings,
        0
    );

const makeServiceItems = (items) =>
    items.map((item) => ({
        foodName: item.foodName,
        image: item.image,
        pricePerServing: item.currentPrice,
        servings: item.servings,
    }));

const createNegotiation = async (req, res) => {
    try {
        const customer = await User.findById(req.user.id);

        if (!customer || customer.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only customers can start negotiations.",
            });
        }

        const { sellerId, cateringId, eventDate, items } = req.body;

        if (!sellerId || !cateringId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Seller, catering, event date and dishes are required.",
            });
        }

        const parsedEventDate = parseEventDate(eventDate);

        if (!parsedEventDate) {
            return res.status(400).json({
                success: false,
                message: "A valid event date is required.",
            });
        }

        const [seller, catering] = await Promise.all([
            User.findOne({ _id: sellerId, role: "seller" }),
            Catering.findOne({
                _id: cateringId,
                owner: sellerId,
                isPublished: true,
                negotiationEnabled: true,
            }),
        ]);

        if (!seller || !catering) {
            return res.status(404).json({
                success: false,
                message: "This caterer is not available for negotiation.",
            });
        }

        const menuItemIds = items.map((item) => item.menuItemId);
        const menuItems = await MenuItem.find({
            _id: { $in: menuItemIds },
            catering: catering._id,
            isAvailable: true,
        });

        if (menuItems.length !== items.length) {
            return res.status(400).json({
                success: false,
                message: "One or more selected dishes are no longer available.",
            });
        }

        const menuMap = new Map(
            menuItems.map((item) => [String(item._id), item])
        );

        const cleanItems = [];

        for (const requestedItem of items) {
            const menuItem = menuMap.get(String(requestedItem.menuItemId));
            const servings = Number(requestedItem.servings);
            const proposedPrice = Number(requestedItem.proposedPrice);

            if (
                !menuItem ||
                !Number.isFinite(servings) ||
                servings < menuItem.minQty ||
                servings > menuItem.maxQty ||
                !Number.isFinite(proposedPrice) ||
                proposedPrice <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "One or more negotiation values are invalid.",
                });
            }

            cleanItems.push({
                menuItem: menuItem._id,
                foodName: menuItem.name,
                image: menuItem.image || "",
                unit: menuItem.unit || "serving",
                servings,
                listedPrice: Number(menuItem.price),
                currentPrice: proposedPrice,
            });
        }

        const negotiation = await Negotiation.create({
            customer: customer._id,
            seller: seller._id,
            catering: catering._id,
            customerName: customer.fullName,
            customerEmail: customer.email,
            sellerName: catering.name,
            sellerEmail: seller.email,
            eventDate: parsedEventDate,
            items: cleanItems,
            lastUpdatedBy: "customer",
            history: [
                {
                    updatedBy: "customer",
                    updatedByName: customer.fullName,
                    action: "offer",
                    items: makeHistoryItems(cleanItems),
                },
            ],
        });

        return res.status(201).json({
            success: true,
            message: "Negotiation request sent successfully.",
            negotiation,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getMyNegotiations = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only customers can view customer negotiations.",
            });
        }

        const negotiations = await Negotiation.find({ customer: req.user.id })
            .sort({ updatedAt: -1 });

        return res.status(200).json({ success: true, negotiations });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getIncomingNegotiations = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only sellers can view incoming negotiations.",
            });
        }

        const negotiations = await Negotiation.find({ seller: req.user.id })
            .sort({ updatedAt: -1 });

        return res.status(200).json({ success: true, negotiations });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateNegotiationOffer = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const negotiation = await Negotiation.findById(req.params.id);

        if (!user || !negotiation) {
            return res.status(404).json({
                success: false,
                message: "Negotiation request not found.",
            });
        }

        const isCustomer =
            user.role === "customer" &&
            String(negotiation.customer) === String(user._id);
        const isSeller =
            user.role === "seller" &&
            String(negotiation.seller) === String(user._id);

        if (!isCustomer && !isSeller) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this negotiation.",
            });
        }

        if (negotiation.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "This negotiation can no longer be countered.",
            });
        }

        const actorRole = isCustomer ? "customer" : "seller";

        if (negotiation.lastUpdatedBy === actorRole) {
            return res.status(400).json({
                success: false,
                message: "Wait for the other party to respond before updating again.",
            });
        }

        const updates = req.body.items;

        if (!Array.isArray(updates) || updates.length !== negotiation.items.length) {
            return res.status(400).json({
                success: false,
                message: "A price must be provided for every dish.",
            });
        }

        const priceMap = new Map(
            updates.map((item) => [String(item.menuItemId), Number(item.proposedPrice)])
        );

        for (const item of negotiation.items) {
            const newPrice = priceMap.get(String(item.menuItem));

            if (!Number.isFinite(newPrice) || newPrice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Every proposed price must be greater than zero.",
                });
            }

            item.currentPrice = newPrice;
        }

        negotiation.lastUpdatedBy = actorRole;
        negotiation.history.push({
            updatedBy: actorRole,
            updatedByName: user.fullName,
            action: actorRole === "seller" ? "counter" : "offer",
            items: makeHistoryItems(negotiation.items),
            updatedAt: new Date(),
        });

        await negotiation.save();

        return res.status(200).json({
            success: true,
            message:
                actorRole === "customer"
                    ? "Your updated offer was sent to the seller."
                    : "Your counter offer was sent to the customer.",
            negotiation,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const confirmSellerCounter = async (req, res) => {
    try {
        const customer = await User.findById(req.user.id);
        const negotiation = await Negotiation.findOne({
            _id: req.params.id,
            customer: req.user.id,
        });

        if (!customer || customer.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only the customer can confirm a seller counter offer.",
            });
        }

        if (!negotiation) {
            return res.status(404).json({
                success: false,
                message: "Negotiation request not found.",
            });
        }

        if (negotiation.status !== "open" || negotiation.lastUpdatedBy !== "seller") {
            return res.status(400).json({
                success: false,
                message: "There is no seller counter offer waiting for your confirmation.",
            });
        }

        negotiation.status = "customer_confirmed";
        negotiation.lastUpdatedBy = "customer";
        negotiation.history.push({
            updatedBy: "customer",
            updatedByName: customer.fullName,
            action: "confirm",
            items: makeHistoryItems(negotiation.items),
            updatedAt: new Date(),
        });

        await negotiation.save();

        return res.status(200).json({
            success: true,
            message: "You confirmed the seller's prices. The seller can now only accept or reject the deal.",
            negotiation,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const finalizeNegotiation = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);
        const negotiation = await Negotiation.findOne({
            _id: req.params.id,
            seller: req.user.id,
        });

        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only the seller can finalize a negotiation.",
            });
        }

        if (!negotiation) {
            return res.status(404).json({
                success: false,
                message: "Negotiation request not found.",
            });
        }

        if (!["open", "customer_confirmed"].includes(negotiation.status)) {
            return res.status(400).json({
                success: false,
                message: "This negotiation cannot be finalized.",
            });
        }

        if (negotiation.status === "open" && negotiation.lastUpdatedBy !== "customer") {
            return res.status(400).json({
                success: false,
                message: "You cannot accept your own counter offer. Wait for the customer to update or confirm it.",
            });
        }

        const payableAmount = calculatePayableAmount(negotiation.items);

        const serviceRequest = await ServiceRequest.create({
            customer: negotiation.customer,
            seller: negotiation.seller,
            catering: negotiation.catering,
            customerName: negotiation.customerName,
            customerEmail: negotiation.customerEmail,
            sellerName: negotiation.sellerName,
            sellerEmail: negotiation.sellerEmail,
            eventDate: negotiation.eventDate,
            items: makeServiceItems(negotiation.items),
            payableAmount,
            approvalStatus: "approved",
            sourceType: "negotiation",
            negotiation: negotiation._id,
        });

        negotiation.status = "finalized";
        negotiation.serviceRequest = serviceRequest._id;
        negotiation.finalizedAt = new Date();
        negotiation.history.push({
            updatedBy: "seller",
            updatedByName: seller.fullName,
            action: "accept",
            items: makeHistoryItems(negotiation.items),
            updatedAt: new Date(),
        });
        await negotiation.save();

        return res.status(200).json({
            success: true,
            message: "Negotiation accepted. The order is ready for customer payment.",
            negotiation,
            serviceRequest,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const rejectNegotiation = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);
        const negotiation = await Negotiation.findOne({
            _id: req.params.id,
            seller: req.user.id,
        });

        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only the seller can reject a negotiation.",
            });
        }

        if (!negotiation) {
            return res.status(404).json({
                success: false,
                message: "Negotiation request not found.",
            });
        }

        if (!["open", "customer_confirmed"].includes(negotiation.status)) {
            return res.status(400).json({
                success: false,
                message: "This negotiation can no longer be rejected.",
            });
        }

        const payableAmount = calculatePayableAmount(negotiation.items);

        const serviceRequest = await ServiceRequest.create({
            customer: negotiation.customer,
            seller: negotiation.seller,
            catering: negotiation.catering,
            customerName: negotiation.customerName,
            customerEmail: negotiation.customerEmail,
            sellerName: negotiation.sellerName,
            sellerEmail: negotiation.sellerEmail,
            eventDate: negotiation.eventDate,
            items: makeServiceItems(negotiation.items),
            payableAmount,
            approvalStatus: "rejected",
            rejectionReason: "Negotiation rejected by seller",
            sourceType: "negotiation",
            negotiation: negotiation._id,
        });

        negotiation.status = "rejected";
        negotiation.serviceRequest = serviceRequest._id;
        negotiation.rejectedAt = new Date();
        negotiation.history.push({
            updatedBy: "seller",
            updatedByName: seller.fullName,
            action: "reject",
            items: makeHistoryItems(negotiation.items),
            updatedAt: new Date(),
        });
        await negotiation.save();

        return res.status(200).json({
            success: true,
            message: "Negotiation rejected. The customer order has been marked as rejected.",
            negotiation,
            serviceRequest,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createNegotiation,
    getMyNegotiations,
    getIncomingNegotiations,
    updateNegotiationOffer,
    confirmSellerCounter,
    finalizeNegotiation,
    rejectNegotiation,
};

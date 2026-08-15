const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const Catering = require("../models/Catering");

const parseEventDate = (value) => {
    if (!value) return null;

    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
        const [day, month, year] = value.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const createRequest = async (req, res) => {
    try {
        const { cateringId, sellerId, eventDate, items } = req.body;

        if (!cateringId || !sellerId || !eventDate || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Caterer, event date and at least one dish are required.",
            });
        }

        const parsedEventDate = parseEventDate(eventDate);

        if (!parsedEventDate) {
            return res.status(400).json({
                success: false,
                message: "A valid event date is required.",
            });
        }

        const [customer, seller, catering] = await Promise.all([
            User.findById(req.user.id),
            User.findOne({ _id: sellerId, role: "seller" }),
            Catering.findOne({
                _id: cateringId,
                owner: sellerId,
                isPublished: true,
            }),
        ]);

        if (!customer || customer.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only customers can request a catering service.",
            });
        }

        if (!seller || !catering) {
            return res.status(404).json({
                success: false,
                message: "The selected caterer could not be found.",
            });
        }

        const cleanItems = items.map((item) => ({
            foodName: String(item.foodName || "").trim(),
            image: String(item.image || "").trim(),
            pricePerServing: Number(item.pricePerServing),
            servings: Number(item.servings),
        }));

        const invalidItem = cleanItems.some(
            (item) =>
                !item.foodName ||
                !Number.isFinite(item.pricePerServing) ||
                item.pricePerServing < 0 ||
                !Number.isFinite(item.servings) ||
                item.servings < 1
        );

        if (invalidItem) {
            return res.status(400).json({
                success: false,
                message: "One or more requested dishes contain invalid information.",
            });
        }

        const payableAmount = cleanItems.reduce(
            (total, item) => total + item.pricePerServing * item.servings,
            0
        );

        const request = await ServiceRequest.create({
            customer: customer._id,
            seller: seller._id,
            catering: catering._id,
            customerName: customer.fullName,
            customerEmail: customer.email,
            sellerName: catering.name,
            sellerEmail: seller.email,
            eventDate: parsedEventDate,
            items: cleanItems,
            payableAmount,
        });

        res.status(201).json({
            success: true,
            message: "Service request sent successfully.",
            request,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ customer: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getIncomingRequests = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);

        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only sellers can view incoming requests.",
            });
        }

        const requests = await ServiceRequest.find({ seller: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateApprovalStatus = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);

        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only sellers can approve or reject service requests.",
            });
        }

        const { status, rejectionReason = "" } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected.",
            });
        }

        const request = await ServiceRequest.findOne({
            _id: req.params.id,
            seller: req.user.id,
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Service request not found.",
            });
        }

        if (request.approvalStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This service request has already been answered.",
            });
        }

        request.approvalStatus = status;
        request.rejectionReason =
            status === "rejected" ? String(rejectionReason || "").trim() : "";

        await request.save();

        res.status(200).json({
            success: true,
            message:
                status === "approved"
                    ? "Service request approved."
                    : "Service request rejected.",
            request,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const markRequestPaid = async (req, res) => {
    try {
        const customer = await User.findById(req.user.id);

        if (!customer || customer.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only customers can update payment status.",
            });
        }

        const request = await ServiceRequest.findOne({
            _id: req.params.id,
            customer: req.user.id,
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Service request not found.",
            });
        }

        if (request.approvalStatus !== "approved") {
            return res.status(400).json({
                success: false,
                message: "Only approved requests can be marked as paid.",
            });
        }

        const { paymentMethod = "", paymentReference = "" } = req.body;

        request.paymentStatus = "paid";
        request.paymentMethod = String(paymentMethod || "").trim();
        request.paymentReference = String(paymentReference || "").trim();
        request.paidAt = new Date();

        await request.save();

        res.status(200).json({
            success: true,
            message: "Payment status updated successfully.",
            request,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createRequest,
    getMyRequests,
    getIncomingRequests,
    updateApprovalStatus,
    markRequestPaid,
};

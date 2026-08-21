const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const Catering = require("../models/Catering");
const cloudinary = require("../config/cloudinary");
const { sendDeliveryNotification } = require("../services/oneSignalService");


const uploadBuffer = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        stream.end(buffer);
    });
};

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



const updateOrderProgress = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);

        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only sellers can update order progress.",
            });
        }

        const { status } = req.body;
        const allowedStatuses = ["", "preparing", "on_the_way"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Order progress must be preparing, on_the_way, or empty.",
            });
        }

        const request = await ServiceRequest.findOne({
            _id: req.params.id,
            seller: req.user.id,
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (request.approvalStatus !== "approved") {
            return res.status(400).json({
                success: false,
                message: "Only approved orders can receive progress updates.",
            });
        }

        if (request.paymentStatus !== "paid") {
            return res.status(400).json({
                success: false,
                message: "The customer must complete payment before order progress can be updated.",
            });
        }

        if (request.deliveryStatus === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered orders can no longer receive progress updates.",
            });
        }

        request.orderProgressStatus = status;
        request.orderProgressUpdatedAt = status ? new Date() : null;
        await request.save();

        const statusMessage =
            status === "preparing"
                ? "Order status updated to Preparing Food."
                : status === "on_the_way"
                    ? "Order status updated to On the Way."
                    : "Order progress update cleared.";

        res.status(200).json({
            success: true,
            message: statusMessage,
            request,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const markRequestDelivered = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);

        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only sellers can complete an order delivery.",
            });
        }

        const request = await ServiceRequest.findOne({
            _id: req.params.id,
            seller: req.user.id,
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (request.approvalStatus !== "approved") {
            return res.status(400).json({
                success: false,
                message: "Only approved orders can be marked as delivered.",
            });
        }

        if (request.paymentStatus !== "paid") {
            return res.status(400).json({
                success: false,
                message: "The customer must complete payment before delivery can be verified.",
            });
        }

        if (request.deliveryStatus === "delivered") {
            return res.status(400).json({
                success: false,
                message: "This order has already been marked as delivered.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Upload a delivery location photo as proof of work.",
            });
        }

        const uploadResult = await uploadBuffer(
            req.file.buffer,
            "feastify/delivery-proofs"
        );

        request.deliveryStatus = "delivered";
        request.deliveryProofImage = uploadResult.secure_url;
        request.deliveryProofPublicId = uploadResult.public_id;
        request.deliveredAt = new Date();

        await request.save();

        let notification = { sent: false };

        try {
            notification = await sendDeliveryNotification({
                customerId: request.customer,
                sellerName: request.sellerName,
                orderId: request._id,
            });

            request.deliveryNotificationSent = Boolean(notification.sent);
            request.deliveryNotificationId = notification.notificationId || "";
            request.deliveryNotificationError = notification.sent
                ? ""
                : notification.message || "No active push subscription was found.";
        } catch (notificationError) {
            request.deliveryNotificationSent = false;
            request.deliveryNotificationError = notificationError.message;
        }

        await request.save();

        res.status(200).json({
            success: true,
            message: request.deliveryNotificationSent
                ? "Order marked as delivered and customer notification sent."
                : "Order marked as delivered. Push notification could not be confirmed.",
            request,
            notificationSent: request.deliveryNotificationSent,
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
    updateOrderProgress,
    markRequestDelivered,
};

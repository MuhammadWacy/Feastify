const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");

const STATUS_FLOW = {
    accepted: "preparing",
    preparing: "out_for_delivery",
    out_for_delivery: "completed",
};

// Create a service request (customer)
const createRequest = async (req, res) => {
    try {
        const { catererId, serviceId, eventDate, location, guests, items } = req.body;

        const [customer, caterer] = await Promise.all([
            User.findById(req.user.id),
            User.findOne({ _id: catererId, role: "seller" }),
        ]);

        if (!caterer) {
            return res.status(404).json({
                success: false,
                message: "Caterer not found",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one item must be selected",
            });
        }

        const estimatedPrice = items.reduce(
            (total, item) => total + item.pricePerServing * item.servings,
            0
        );

        const newRequest = new ServiceRequest({
            customer: req.user.id,
            caterer: catererId,
            serviceId,
            customerEmail: customer.email,
            sellerEmail: caterer.email,
            sellerName: caterer.fullName,
            eventDate,
            location,
            guests,
            items,
            estimatedPrice,
        });

        await newRequest.save();

        res.status(201).json({
            success: true,
            message: "Service request submitted successfully",
            request: newRequest,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get requests submitted by the logged-in customer
const getMyRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ customer: req.user.id })
            .populate("caterer", "fullName email phone area address")
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


// Get requests received by the logged-in caterer
const getIncomingRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ caterer: req.user.id })
            .populate("customer", "fullName email phone address")
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


// Get a single request (customer or caterer involved)
const getRequestById = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate("customer", "fullName email phone address")
            .populate("caterer", "fullName email phone area address");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        const isCustomer = request.customer._id.toString() === req.user.id;
        const isCaterer = request.caterer._id.toString() === req.user.id;

        if (!isCustomer && !isCaterer) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this request",
            });
        }

        res.status(200).json({
            success: true,
            request,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Accept or reject a request (caterer)
const respondToRequest = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'accepted' or 'rejected'",
            });
        }

        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        if (request.caterer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to respond to this request",
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This request has already been responded to",
            });
        }

        request.status = status;
        await request.save();

        res.status(200).json({
            success: true,
            message: `Request ${status}`,
            request,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Advance order status (caterer): accepted -> preparing -> out_for_delivery -> completed
const updateStatus = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        if (request.caterer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this request",
            });
        }

        const nextStatus = STATUS_FLOW[request.status];

        if (!nextStatus) {
            return res.status(400).json({
                success: false,
                message: `Cannot advance status from '${request.status}'`,
            });
        }

        request.status = nextStatus;
        await request.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${nextStatus}`,
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
    getRequestById,
    respondToRequest,
    updateStatus,
};

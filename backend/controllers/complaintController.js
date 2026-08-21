const Complaint = require("../models/Complaint");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

const uploadBuffer = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });

const categories = [
    "Food Quality",
    "Wrong or Missing Items",
    "Late Delivery",
    "Packaging Issue",
    "Quantity or Serving Issue",
    "Other",
];

const fileComplaint = async (req, res) => {
    try {
        const customer = await User.findById(req.user.id);
        if (!customer || customer.role !== "customer") {
            return res.status(403).json({ success: false, message: "Only customers can file complaints." });
        }

        const { serviceRequestId, category, details } = req.body;
        if (!serviceRequestId || !categories.includes(category) || !String(details || "").trim()) {
            return res.status(400).json({ success: false, message: "Order, complaint category and details are required." });
        }

        const request = await ServiceRequest.findOne({
            _id: serviceRequestId,
            customer: req.user.id,
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "Delivered order not found." });
        }

        if (request.deliveryStatus !== "delivered" || !request.deliveredAt) {
            return res.status(400).json({ success: false, message: "A complaint can only be filed after delivery is completed." });
        }

        const existing = await Complaint.findOne({ serviceRequest: request._id, customer: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: "A complaint has already been filed for this order." });
        }

        const uploadedImages = [];
        for (const file of req.files || []) {
            const result = await uploadBuffer(file.buffer, "feastify/complaints");
            uploadedImages.push({ url: result.secure_url, publicId: result.public_id });
        }

        const items = request.items.map((item) => ({
            foodName: item.foodName,
            pricePerServing: item.pricePerServing,
            servings: item.servings,
        }));
        const totalServings = items.reduce((sum, item) => sum + Number(item.servings || 0), 0);

        const complaint = await Complaint.create({
            serviceRequest: request._id,
            customer: request.customer,
            seller: request.seller,
            catering: request.catering,
            customerName: request.customerName,
            customerEmail: request.customerEmail,
            sellerName: request.sellerName,
            category,
            details: String(details).trim(),
            images: uploadedImages,
            eventDate: request.eventDate,
            deliveredAt: request.deliveredAt,
            amountPaid: request.payableAmount,
            items,
            totalServings,
            sourceType: request.sourceType,
            deliveryLocation: request.needBasedDetails?.deliveryLocation || "",
            contactNumber: request.needBasedDetails?.contactNumber || "",
        });

        return res.status(201).json({ success: true, message: "Complaint filed successfully.", complaint });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "A complaint has already been filed for this order." });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getMyComplaints = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "customer") {
            return res.status(403).json({ success: false, message: "Only customers can view filed complaints." });
        }
        const complaints = await Complaint.find({ customer: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, complaints });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSellerComplaints = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "seller") {
            return res.status(403).json({ success: false, message: "Only sellers can view complaints against them." });
        }
        const complaints = await Complaint.find({ seller: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, complaints });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { fileComplaint, getMyComplaints, getSellerComplaints };

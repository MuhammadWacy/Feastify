const Catering = require("../models/Catering");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

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

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete failed:", error.message);
    }
};

const sellerOnly = (req, res) => {
    if (req.user.role !== "seller") {
        res.status(403).json({
            success: false,
            message: "Only sellers can manage catering listings",
        });
        return false;
    }

    return true;
};

const parseDays = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

const getMyListing = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const listing = await Catering.findOne({ owner: req.user.id });

        if (!listing) {
            return res.status(200).json({
                success: true,
                listing: null,
                items: [],
            });
        }

        const items = await MenuItem.find({ catering: listing._id }).sort({
            createdAt: 1,
        });

        res.status(200).json({
            success: true,
            listing,
            items,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const saveMyListing = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const user = await User.findById(req.user.id).select("fullName email phone area");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Seller account not found",
            });
        }

        const {
            name,
            description,
            cuisine,
            category,
            area,
            phone,
            negotiationEnabled,
        } = req.body;

        if (!name || !description || !area) {
            return res.status(400).json({
                success: false,
                message: "Business name, description and area are required",
            });
        }

        const availableDays = parseDays(req.body.availableDays);

        let listing = await Catering.findOne({ owner: req.user.id });

        if (!listing) {
            listing = new Catering({
                owner: req.user.id,
                name,
                description,
                cuisine: cuisine || "",
                category: category || "General",
                area,
                phone: phone || user.phone || "",
                email: user.email,
                availableDays,
                negotiationEnabled: negotiationEnabled !== "false",
                isPublished: false,
            });
        } else {
            listing.name = name;
            listing.description = description;
            listing.cuisine = cuisine || "";
            listing.category = category || "General";
            listing.area = area;
            listing.phone = phone || user.phone || "";
            listing.email = user.email;
            listing.availableDays = availableDays;
            listing.negotiationEnabled = negotiationEnabled !== "false";
        }

        if (req.file) {
            const uploadResult = await uploadBuffer(
                req.file.buffer,
                "feastify/catering-banners"
            );

            await deleteCloudinaryImage(listing.bannerImagePublicId);

            listing.bannerImage = uploadResult.secure_url;
            listing.bannerImagePublicId = uploadResult.public_id;
        }

        await listing.save();

        res.status(200).json({
            success: true,
            message: "Catering listing saved successfully",
            listing,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const setPublished = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const listing = await Catering.findOne({ owner: req.user.id });

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Create your catering listing first",
            });
        }

        const itemCount = await MenuItem.countDocuments({
            catering: listing._id,
            isAvailable: true,
        });

        if (req.body.isPublished && itemCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Add at least one available dish before publishing",
            });
        }

        if (req.body.isPublished && listing.availableDays.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Select at least one operating day before publishing",
            });
        }

        listing.isPublished = Boolean(req.body.isPublished);
        await listing.save();

        res.status(200).json({
            success: true,
            message: listing.isPublished
                ? "Listing published successfully"
                : "Listing unpublished successfully",
            listing,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createMenuItem = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const listing = await Catering.findOne({ owner: req.user.id });

        if (!listing) {
            return res.status(400).json({
                success: false,
                message: "Save your catering listing before adding dishes",
            });
        }

        const { name, description, price, unit, minQty, maxQty } = req.body;

        const minimum = Number(minQty);
        const maximum = Number(maxQty);
        const itemPrice = Number(price);

        if (!name || Number.isNaN(itemPrice) || Number.isNaN(minimum) || Number.isNaN(maximum)) {
            return res.status(400).json({
                success: false,
                message: "Dish name, price, minimum quantity and maximum quantity are required",
            });
        }

        if (minimum < 1 || maximum < minimum) {
            return res.status(400).json({
                success: false,
                message: "Maximum quantity must be greater than or equal to minimum quantity",
            });
        }

        let image = "";
        let imagePublicId = "";

        if (req.file) {
            const uploadResult = await uploadBuffer(
                req.file.buffer,
                "feastify/menu-items"
            );
            image = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const item = await MenuItem.create({
            catering: listing._id,
            name,
            description: description || "",
            image,
            imagePublicId,
            price: itemPrice,
            unit: unit || "serving",
            minQty: minimum,
            maxQty: maximum,
            isAvailable: true,
        });

        res.status(201).json({
            success: true,
            message: "Dish added successfully",
            item,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const listing = await Catering.findOne({ owner: req.user.id });

        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        const item = await MenuItem.findOne({
            _id: req.params.id,
            catering: listing._id,
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Dish not found" });
        }

        const minimum = Number(req.body.minQty);
        const maximum = Number(req.body.maxQty);
        const itemPrice = Number(req.body.price);

        if (!req.body.name || Number.isNaN(itemPrice) || Number.isNaN(minimum) || Number.isNaN(maximum)) {
            return res.status(400).json({
                success: false,
                message: "Dish name, price, minimum quantity and maximum quantity are required",
            });
        }

        if (minimum < 1 || maximum < minimum) {
            return res.status(400).json({
                success: false,
                message: "Maximum quantity must be greater than or equal to minimum quantity",
            });
        }

        item.name = req.body.name;
        item.description = req.body.description || "";
        item.price = itemPrice;
        item.unit = req.body.unit || "serving";
        item.minQty = minimum;
        item.maxQty = maximum;
        item.isAvailable = req.body.isAvailable !== "false";

        if (req.file) {
            const uploadResult = await uploadBuffer(
                req.file.buffer,
                "feastify/menu-items"
            );

            await deleteCloudinaryImage(item.imagePublicId);

            item.image = uploadResult.secure_url;
            item.imagePublicId = uploadResult.public_id;
        }

        await item.save();

        res.status(200).json({
            success: true,
            message: "Dish updated successfully",
            item,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const listing = await Catering.findOne({ owner: req.user.id });

        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        const item = await MenuItem.findOne({
            _id: req.params.id,
            catering: listing._id,
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Dish not found" });
        }

        await deleteCloudinaryImage(item.imagePublicId);
        await item.deleteOne();

        res.status(200).json({
            success: true,
            message: "Dish deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMyListing,
    saveMyListing,
    setPublished,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
};

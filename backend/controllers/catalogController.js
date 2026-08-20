const Catering = require("../models/Catering");
const Offer = require("../models/Offer");
const MenuItem = require("../models/MenuItem");

const getCaterings = async (req, res) => {
    try {
        const caterings = await Catering.find({
            isPublished: true,
            owner: { $ne: null },
        })
            .sort({ createdAt: -1 })
            .select(
                "name bannerImage description cuisine category area rating phone email availableDays negotiationEnabled owner"
            );

        res.status(200).json({
            success: true,
            count: caterings.length,
            caterings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getSearchOptions = async (req, res) => {
    try {
        const baseFilter = {
            isPublished: true,
            owner: { $ne: null },
        };

        const [areas, categories] = await Promise.all([
            Catering.distinct("area", baseFilter),
            Catering.distinct("category", baseFilter),
        ]);

        res.status(200).json({
            success: true,
            areas: areas.filter(Boolean).sort((a, b) => a.localeCompare(b)),
            categories: categories
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b)),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const searchCaterings = async (req, res) => {
    try {
        const keyword = String(req.query.q || "").trim();
        const area = String(req.query.area || "").trim();
        const category = String(req.query.category || "").trim();
        const negotiation = String(req.query.negotiation || "").trim();

        const parsedMinPrice = Number(req.query.minPrice ?? 0);
        const parsedMaxPrice = Number(req.query.maxPrice ?? 10000);
        const parsedMinServings = Number(req.query.minServings ?? 10);
        const parsedMaxServings = Number(req.query.maxServings ?? 500);

        const minPrice = Number.isFinite(parsedMinPrice)
            ? Math.max(0, parsedMinPrice)
            : 0;
        const maxPrice = Number.isFinite(parsedMaxPrice)
            ? Math.min(10000, Math.max(minPrice, parsedMaxPrice))
            : 10000;
        const minServings = Number.isFinite(parsedMinServings)
            ? Math.max(10, parsedMinServings)
            : 10;
        const maxServings = Number.isFinite(parsedMaxServings)
            ? Math.max(minServings, parsedMaxServings)
            : Math.max(minServings, 500);

        const cateringFilter = {
            isPublished: true,
            owner: { $ne: null },
        };

        if (area) cateringFilter.area = area;
        if (category) cateringFilter.category = category;
        if (negotiation === "yes") cateringFilter.negotiationEnabled = true;
        if (negotiation === "no") cateringFilter.negotiationEnabled = false;

        const candidateCaterings = await Catering.find(cateringFilter)
            .sort({ rating: -1, createdAt: -1 })
            .select(
                "name bannerImage description cuisine category area rating phone email availableDays negotiationEnabled owner"
            );

        if (candidateCaterings.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                caterings: [],
                appliedFilters: {
                    keyword,
                    area,
                    category,
                    negotiation,
                    minPrice,
                    maxPrice,
                    minServings,
                    maxServings,
                },
            });
        }

        const candidateIds = candidateCaterings.map((item) => item._id);

        const menuFilter = {
            catering: { $in: candidateIds },
            isAvailable: true,
            price: { $gte: minPrice, $lte: maxPrice },
            // The dish must support the customer's ENTIRE requested serving range.
            // Example: searching 10-1000 must NOT match a dish that only supports 10-500.
            minQty: { $lte: minServings },
            maxQty: { $gte: maxServings },
        };

        const menuItems = await MenuItem.find(menuFilter)
            .select(
                "catering name description image price unit minQty maxQty isAvailable"
            )
            .sort({ price: 1, name: 1 });

        const keywordRegex = keyword
            ? new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
            : null;

        const itemsByCatering = new Map();

        for (const item of menuItems) {
            const key = String(item.catering);
            if (!itemsByCatering.has(key)) itemsByCatering.set(key, []);
            itemsByCatering.get(key).push(item);
        }

        const results = [];

        for (const cateringDoc of candidateCaterings) {
            const catering = cateringDoc.toObject();
            const allMatchingFilterItems =
                itemsByCatering.get(String(cateringDoc._id)) || [];

            // Price/serving filters are dish-level filters, so a caterer must have
            // at least one available dish that satisfies them.
            if (allMatchingFilterItems.length === 0) continue;

            let matchingItems = allMatchingFilterItems;

            if (keywordRegex) {
                const cateringTextMatches = [
                    catering.name,
                    catering.description,
                    catering.cuisine,
                    catering.category,
                    catering.area,
                ].some((value) => keywordRegex.test(String(value || "")));

                const keywordItems = allMatchingFilterItems.filter((item) =>
                    [item.name, item.description].some((value) =>
                        keywordRegex.test(String(value || ""))
                    )
                );

                if (!cateringTextMatches && keywordItems.length === 0) continue;

                // If the caterer itself matches, still show useful qualifying dishes.
                matchingItems = cateringTextMatches
                    ? allMatchingFilterItems
                    : keywordItems;
            }

            const prices = matchingItems.map((item) => item.price);
            const maxCapabilities = matchingItems.map((item) => item.maxQty);

            results.push({
                ...catering,
                searchMatches: matchingItems.slice(0, 5),
                searchSummary: {
                    matchingDishCount: matchingItems.length,
                    lowestPrice: prices.length ? Math.min(...prices) : null,
                    highestServingCapacity: maxCapabilities.length
                        ? Math.max(...maxCapabilities)
                        : null,
                },
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            caterings: results,
            appliedFilters: {
                keyword,
                area,
                category,
                negotiation,
                minPrice,
                maxPrice,
                minServings,
                maxServings,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find({
            validUntil: { $gte: new Date() },
        })
            .populate({
                path: "catering",
                match: { isPublished: true, owner: { $ne: null } },
                select: "name bannerImage area cuisine rating negotiationEnabled",
            })
            .sort({ createdAt: -1 });

        const publishedOffers = offers.filter((offer) => offer.catering);

        res.status(200).json({
            success: true,
            count: publishedOffers.length,
            offers: publishedOffers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getCateringMenu = async (req, res) => {
    try {
        const catering = await Catering.findOne({
            _id: req.params.id,
            isPublished: true,
        }).select(
            "name bannerImage description cuisine category area rating availableDays email phone negotiationEnabled owner"
        );

        if (!catering) {
            return res.status(404).json({
                success: false,
                message: "Catering listing not found",
            });
        }

        const items = await MenuItem.find({
            catering: catering._id,
            isAvailable: true,
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            catering,
            items,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getCateringProfile = async (req, res) => {
    try {
        const catering = await Catering.findOne({
            _id: req.params.id,
            isPublished: true,
            owner: { $ne: null },
        })
            .select(
                "name bannerImage description cuisine category area rating phone email availableDays negotiationEnabled owner createdAt"
            )
            .populate("owner", "fullName createdAt");

        if (!catering) {
            return res.status(404).json({
                success: false,
                message: "Caterer profile not found",
            });
        }

        const items = await MenuItem.find({
            catering: catering._id,
            isAvailable: true,
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            catering,
            items,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getCaterings,
    getSearchOptions,
    searchCaterings,
    getOffers,
    getCateringMenu,
    getCateringProfile,
};

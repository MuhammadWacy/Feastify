import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CateringCard from "./CateringCard";
import CateringMenuModal from "./CateringMenuModal";
import {
    addFavorite,
    removeFavorite,
} from "../../services/favoriteService";

const CATEGORY_ORDER = [
    "Desi",
    "Chinese",
    "BBQ & Grill",
    "Fast Food",
    "Seafood",
    "Italian",
    "Street Food",
    "Breakfast & Brunch",
    "Healthy & Vegan",
    "Desserts",
    "Continental & Mediterranean",
    "General",
];

function CateringFeed({
    caterings,
    initialFavoriteIds = [],
    emptyMessage = "No caterers have published listings yet.",
}) {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState(initialFavoriteIds);
    const [favoriteMessage, setFavoriteMessage] = useState("");

    useEffect(() => {
        setFavoriteIds(initialFavoriteIds);
    }, [initialFavoriteIds]);

    const toggleFavorite = async (catering) => {
        const cateringId = String(catering._id);
        const currentlyFavorite = favoriteIds.includes(cateringId);

        try {
            const result = currentlyFavorite
                ? await removeFavorite(cateringId)
                : await addFavorite(cateringId);

            setFavoriteIds(result.favoriteIds || []);
            setFavoriteMessage(result.message || "Favorites updated.");

            window.setTimeout(() => {
                setFavoriteMessage("");
            }, 1800);
        } catch (error) {
            setFavoriteMessage(
                error.response?.data?.message || "Could not update favorites."
            );
        }
    };

    if (!caterings || caterings.length === 0) {
        return (
            <div className="alert alert-info">
                {emptyMessage}
            </div>
        );
    }

    const groups = CATEGORY_ORDER.map((category) => ({
        category,
        items: caterings.filter((catering) => catering.category === category),
    })).filter((group) => group.items.length > 0);

    const uncategorized = caterings.filter(
        (catering) => !CATEGORY_ORDER.includes(catering.category)
    );

    if (uncategorized.length > 0) {
        groups.push({ category: "Other", items: uncategorized });
    }

    return (
        <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Restaurants & Caterers</h3>
                {favoriteMessage && (
                    <span className="small text-muted">{favoriteMessage}</span>
                )}
            </div>

            {groups.map((group) => (
                <div className="mb-4" key={group.category}>
                    <h5 className="fw-bold mb-2">{group.category}</h5>

                    <div className="catering-row">
                        {group.items.map((catering) => (
                            <CateringCard
                                catering={catering}
                                onSelect={setSelected}
                                isFavorite={favoriteIds.includes(String(catering._id))}
                                onToggleFavorite={toggleFavorite}
                                onViewProfile={() =>
                                    navigate(`/customer/caterers/${catering._id}`)
                                }
                                key={catering._id}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {selected && (
                <CateringMenuModal
                    catering={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </section>
    );
}

export default CateringFeed;

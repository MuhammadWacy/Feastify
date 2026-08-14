import { useState } from "react";
import CateringCard from "./CateringCard";
import CateringMenuModal from "./CateringMenuModal";

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

function CateringFeed({ caterings }) {
    const [selected, setSelected] = useState(null);

    if (!caterings || caterings.length === 0) {
        return (
            <div className="alert alert-info">
                No caterers have published listings yet.
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
            <h3 className="fw-bold mb-4">Restaurants & Caterers</h3>

            {groups.map((group) => (
                <div className="mb-4" key={group.category}>
                    <h5 className="fw-bold mb-2">{group.category}</h5>

                    <div className="catering-row">
                        {group.items.map((catering) => (
                            <CateringCard
                                catering={catering}
                                onSelect={setSelected}
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

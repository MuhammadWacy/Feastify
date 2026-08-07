import { useEffect, useState } from "react";
import API from "../../services/api";

function CateringMenuModal({ catering, onClose, discount = 0 }) {
    const [items, setItems] = useState([]);
    const [cateringInfo, setCateringInfo] = useState(catering);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState({});
    const [drafts, setDrafts] = useState({});
    const [message, setMessage] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [dateError, setDateError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchMenu = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await API.get(
                    `/catalog/caterings/${catering._id}/menu`
                );

                if (cancelled) return;

                setCateringInfo(response.data.catering || catering);
                setItems(response.data.items || []);
            } catch (err) {
                if (cancelled) return;

                setError(
                    err.response?.data?.message ||
                        "Could not load the menu."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchMenu();

        return () => {
            cancelled = true;
        };
    }, [catering]);

    const days = cateringInfo.availableDays || [];
    const price = (value) =>
        `৳${Math.round(value ?? 0).toLocaleString()}`;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const minDateStr = `${tomorrow.getFullYear()}-${String(
        tomorrow.getMonth() + 1
    ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    const deliveryDayOk = (() => {
        if (!deliveryDate) return false;
        const day = dayNames[new Date(deliveryDate).getDay()];
        return days.includes(day);
    })();

    const handleDateChange = (value) => {
        setDeliveryDate(value);
        setDateError("");

        if (!value) return;

        const day = dayNames[new Date(value).getDay()];

        if (!days.includes(day)) {
            setDateError(
                `This catering does not serve on ${day}. Please choose another date.`
            );
        }
    };

    const effectivePrice = (itemPrice) =>
        discount > 0 ? (itemPrice * (100 - discount)) / 100 : itemPrice;

    const toggleItem = (item) => {
        setMessage("");

        setSelected((prev) => {
            const next = { ...prev };

            if (next[item._id]) {
                delete next[item._id];
            } else {
                next[item._id] = {
                    qty: item.minQty,
                    price: item.price,
                    unit: item.unit,
                    name: item.name,
                    minQty: item.minQty,
                    maxQty: item.maxQty,
                };
            }

            return next;
        });

        setDrafts((prev) => {
            const next = { ...prev };
            delete next[item._id];
            return next;
        });
    };

    const commitQty = (itemId, rawValue) => {
        const entry = selected[itemId];
        if (!entry) return;

        const parsed = Number(rawValue);

        const qty = Number.isNaN(parsed)
            ? entry.qty
            : Math.min(entry.maxQty, Math.max(entry.minQty, parsed));

        setSelected((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], qty },
        }));

        setDrafts((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
        });
    };

    const selectedEntries = Object.values(selected);
    const total = selectedEntries.reduce(
        (sum, entry) => sum + effectivePrice(entry.price) * entry.qty,
        0
    );

    const handleAddToCart = () => {
        if (selectedEntries.length === 0 || !deliveryDayOk) return;

        const cart = JSON.parse(
            localStorage.getItem("feastify-cart") || "[]"
        );

        const formatDate = (value) => {
            if (!value) return "";
            const [year, month, day] = value.split("-");
            return `${day}-${month}-${year}`;
        };

        cart.push({
            sellerEmail: cateringInfo.email || "",
            sellerName: cateringInfo.name,
            customerEmail: localStorage.getItem("email") || "",
            date: formatDate(deliveryDate),
            items: selectedEntries.map((entry) => ({
                foodName: entry.name,
                image: "",
                pricePerServing: effectivePrice(entry.price),
                servings: entry.qty,
            })),
        });

        localStorage.setItem("feastify-cart", JSON.stringify(cart));
        setMessage("Added to cart successfully!");
    };

    const handleNegotiate = () => {
        if (selectedEntries.length === 0 || !deliveryDayOk) return;

        const negotiations = JSON.parse(
            localStorage.getItem("feastify-negotiations") || "[]"
        );

        negotiations.push({
            cateringId: cateringInfo._id,
            cateringName: cateringInfo.name,
            deliveryDate,
            requestedAt: new Date().toISOString(),
            items: selectedEntries.map((entry) => ({
                name: entry.name,
                qty: entry.qty,
                unit: entry.unit,
            })),
        });

        localStorage.setItem(
            "feastify-negotiations",
            JSON.stringify(negotiations)
        );

        setMessage("Negotiation request sent!");
    };

    return (
        <div className="modal fade show d-block" tabIndex={-1}>
            <div
                className="modal-dialog modal-lg modal-dialog-scrollable"
                role="dialog"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title mb-1">
                                {catering.name}
                            </h5>
                            <p className="small text-muted mb-0">
                                {catering.cuisine} · {catering.area}
                            </p>
                            {discount > 0 && (
                                <span className="badge badge-bg mt-2">
                                    Special Offer: -{discount}%
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <strong>Available Days</strong>
                            <div className="mt-2">
                                {days.length ? (
                                    days.map((day) => (
                                        <span
                                            className="badge bg-primary me-1 mb-1"
                                            key={day}
                                        >
                                            {day}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-muted small">
                                        Not specified
                                    </span>
                                )}
                            </div>
                        </div>

                        <h6 className="fw-bold mb-3">
                            Menu Items{" "}
                            <span className="text-muted small fw-normal">
                                — tap items to select
                            </span>
                        </h6>

                        {loading && (
                            <p className="text-muted">Loading menu...</p>
                        )}

                        {error && (
                            <p className="text-danger">{error}</p>
                        )}

                        {!loading && !error && items.length === 0 && (
                            <p className="text-muted">
                                No menu items available yet.
                            </p>
                        )}

                        {!loading &&
                            !error &&
                            items.map((item) => {
                                const entry = selected[item._id];
                                const isSelected = Boolean(entry);

                                return (
                                    <div
                                        className={`menu-item-card mb-2 ${
                                            isSelected ? "selected" : ""
                                        }`}
                                        role="button"
                                        tabIndex={0}
                                        key={item._id}
                                        onClick={() => toggleItem(item)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault();
                                                toggleItem(item);
                                            }
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <strong>
                                                        {item.name}
                                                    </strong>
                                                    {isSelected && (
                                                        <span className="menu-item-tick">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-muted small">
                                                    Price:{" "}
                                                    {discount > 0 ? (
                                                        <>
                                                            <s>
                                                                {price(
                                                                    item.price
                                                                )}
                                                            </s>{" "}
                                                            <strong className="text-primary">
                                                                {price(
                                                                    effectivePrice(
                                                                        item.price
                                                                    )
                                                                )}
                                                            </strong>
                                                        </>
                                                    ) : (
                                                        price(item.price)
                                                    )}{" "}
                                                    / {item.unit}
                                                </div>
                                            </div>

                                            <div className="text-end small">
                                                <div>
                                                    Min: {item.minQty}
                                                </div>
                                                <div>
                                                    Max: {item.maxQty}
                                                </div>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div
                                                className="d-flex align-items-center gap-2 mt-2"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <label className="small mb-0">
                                                    Quantity:
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm quantity-input"
                                                    min={entry.minQty}
                                                    max={entry.maxQty}
                                                    value={
                                                        drafts[item._id] ??
                                                        String(entry.qty)
                                                    }
                                                    onChange={(e) =>
                                                        setDrafts((prev) => ({
                                                            ...prev,
                                                            [item._id]:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    onBlur={(e) =>
                                                        commitQty(
                                                            item._id,
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === "Enter"
                                                        ) {
                                                            commitQty(
                                                                item._id,
                                                                e.target.value
                                                            );
                                                        }
                                                    }}
                                                />

                                                <span className="small text-muted">
                                                    ({entry.minQty}–{entry.maxQty})
                                                </span>

                                                <span className="small ms-auto text-primary fw-bold">
                                                    {price(
                                                        effectivePrice(
                                                            entry.price
                                                        ) * entry.qty
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>

                    <div className="modal-footer flex-column align-items-stretch gap-2">
                        {message && (
                            <div className="alert alert-success small py-2 mb-0">
                                {message}
                            </div>
                        )}

                        {selectedEntries.length > 0 && (
                            <>
                                <div>
                                    <label className="form-label small fw-bold mb-1">
                                        Delivery Date
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        min={minDateStr}
                                        value={deliveryDate}
                                        onChange={(e) =>
                                            handleDateChange(e.target.value)
                                        }
                                    />

                                    <small className="text-muted">
                                        Serving days:{" "}
                                        {days.length
                                            ? days.join(", ")
                                            : "Not specified"}
                                    </small>

                                    {dateError && (
                                        <div className="text-danger small mt-1">
                                            {dateError}
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">
                                            Total:{" "}
                                            <span className="text-primary">
                                                {price(total)}
                                            </span>
                                        </h6>
                                        <small className="text-muted">
                                            {selectedEntries.length} item(s)
                                        </small>
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark flex-fill"
                                        onClick={handleNegotiate}
                                        disabled={!deliveryDayOk}
                                    >
                                        Negotiate
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary flex-fill"
                                        onClick={handleAddToCart}
                                        disabled={!deliveryDayOk}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </>
                        )}

                        <button
                            type="button"
                            className="btn btn-secondary w-100"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CateringMenuModal;
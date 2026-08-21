import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function CateringMenuModal({ catering, onClose, discount = 0 }) {
    const navigate = useNavigate();
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
                setError(err.response?.data?.message || "Could not load the menu.");
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
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const price = (value) => `৳${Math.round(value ?? 0).toLocaleString()}`;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const minDateStr = `${tomorrow.getFullYear()}-${String(
        tomorrow.getMonth() + 1
    ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    const deliveryDayOk = (() => {
        if (!deliveryDate) return false;
        const day = dayNames[new Date(`${deliveryDate}T00:00:00`).getDay()];
        return days.includes(day);
    })();

    const effectivePrice = (itemPrice) =>
        discount > 0 ? (itemPrice * (100 - discount)) / 100 : itemPrice;

    const handleDateChange = (value) => {
        setDeliveryDate(value);
        setDateError("");

        if (!value) return;

        const day = dayNames[new Date(`${value}T00:00:00`).getDay()];

        if (!days.includes(day)) {
            setDateError(
                `This caterer does not operate on ${day}. Please choose another date.`
            );
        }
    };

    const toggleItem = (item) => {
        setMessage("");

        setSelected((prev) => {
            const next = { ...prev };

            if (next[item._id]) {
                delete next[item._id];
            } else {
                next[item._id] = {
                    menuItemId: item._id,
                    qty: item.minQty,
                    price: item.price,
                    unit: item.unit,
                    name: item.name,
                    image: item.image || "",
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

        const cart = JSON.parse(localStorage.getItem("feastify-cart") || "[]");

        const [year, month, day] = deliveryDate.split("-");
        const formattedDate = `${day}-${month}-${year}`;

        cart.push({
            cateringId: cateringInfo._id,
            sellerId: cateringInfo.owner || "",
            sellerEmail: cateringInfo.email || "",
            sellerName: cateringInfo.name,
            customerEmail: localStorage.getItem("email") || "",
            date: formattedDate,
            items: selectedEntries.map((entry) => ({
                foodName: entry.name,
                image: entry.image,
                pricePerServing: effectivePrice(entry.price),
                servings: entry.qty,
            })),
        });

        localStorage.setItem("feastify-cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        setMessage("Added to cart successfully!");
    };

    const handleNegotiate = () => {
        if (!cateringInfo.negotiationEnabled) {
            setMessage("This caterer does not currently accept negotiation requests.");
            return;
        }

        if (selectedEntries.length === 0 || !deliveryDayOk) return;

        const negotiationDraft = {
            cateringId: cateringInfo._id,
            sellerId: cateringInfo.owner || "",
            sellerEmail: cateringInfo.email || "",
            sellerName: cateringInfo.name,
            eventDate: deliveryDate,
            items: selectedEntries.map((entry) => ({
                menuItemId: entry.menuItemId,
                foodName: entry.name,
                image: entry.image,
                servings: entry.qty,
                unit: entry.unit,
                listedPrice: effectivePrice(entry.price),
            })),
        };

        onClose();
        navigate("/customer/negotiations/new", {
            state: { negotiationDraft },
        });
    };

    return (
        <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable" role="dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title mb-1">{cateringInfo.name}</h5>
                            <p className="small text-muted mb-0">
                                {cateringInfo.cuisine || "Catering"} · {cateringInfo.area}
                            </p>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body">
                        {loading && <p className="text-muted">Loading menu...</p>}
                        {error && <div className="alert alert-danger">{error}</div>}

                        {!loading && !error && items.length === 0 && (
                            <div className="alert alert-info">
                                This caterer has no available dishes right now.
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            items.map((item) => {
                                const entry = selected[item._id];

                                return (
                                    <div
                                        key={item._id}
                                        className={`menu-item-card mb-3 ${entry ? "selected" : ""}`}
                                    >
                                        <div className="row g-3 align-items-center">
                                            {item.image && (
                                                <div className="col-md-3">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="img-fluid rounded"
                                                        style={{
                                                            width: "100%",
                                                            height: "110px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div className={item.image ? "col-md-9" : "col-12"}>
                                                <div className="d-flex justify-content-between gap-3">
                                                    <div>
                                                        <h6 className="fw-bold mb-1">{item.name}</h6>
                                                        {item.description && (
                                                            <p className="small text-muted mb-2">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        <div className="small">
                                                            {price(effectivePrice(item.price))} / {item.unit}
                                                        </div>
                                                        <div className="small text-muted">
                                                            Quantity range: {item.minQty} - {item.maxQty}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm ${
                                                            entry ? "btn-success" : "btn-outline-primary"
                                                        }`}
                                                        onClick={() => toggleItem(item)}
                                                    >
                                                        {entry ? "Selected" : "Select"}
                                                    </button>
                                                </div>

                                                {entry && (
                                                    <div className="d-flex align-items-center gap-2 mt-3">
                                                        <label className="small fw-bold">Quantity</label>
                                                        <input
                                                            type="number"
                                                            className="form-control quantity-input"
                                                            min={entry.minQty}
                                                            max={entry.maxQty}
                                                            value={drafts[item._id] ?? entry.qty}
                                                            onChange={(e) =>
                                                                setDrafts((prev) => ({
                                                                    ...prev,
                                                                    [item._id]: e.target.value,
                                                                }))
                                                            }
                                                            onBlur={(e) =>
                                                                commitQty(item._id, e.target.value)
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    commitQty(item._id, e.target.value);
                                                                }
                                                            }}
                                                        />
                                                        <span className="small text-muted">
                                                            ({entry.minQty}-{entry.maxQty})
                                                        </span>
                                                        <span className="small ms-auto text-primary fw-bold">
                                                            {price(
                                                                effectivePrice(entry.price) * entry.qty
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <div className="modal-footer flex-column align-items-stretch gap-2">
                        {message && <div className="alert alert-info small py-2 mb-0">{message}</div>}

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
                                        onChange={(e) => handleDateChange(e.target.value)}
                                    />
                                    <small className="text-muted">
                                        Operating days: {days.length ? days.join(", ") : "Not specified"}
                                    </small>
                                    {dateError && (
                                        <div className="text-danger small mt-1">{dateError}</div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">
                                        Total: <span className="text-primary">{price(total)}</span>
                                    </h6>
                                    <small className="text-muted">
                                        {selectedEntries.length} item(s)
                                    </small>
                                </div>

                                <div className="d-flex gap-2">
                                    {cateringInfo.negotiationEnabled && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-dark flex-fill"
                                            onClick={handleNegotiate}
                                            disabled={!deliveryDayOk}
                                        >
                                            Negotiate
                                        </button>
                                    )}

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

                        <button type="button" className="btn btn-secondary w-100" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CateringMenuModal;

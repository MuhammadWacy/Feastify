import { useMemo, useState } from "react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

function SpecialOfferOrderModal({ offer, onClose }) {
    const catering = offer.catering || {};
    const [servings, setServings] = useState(offer.minServings || 1);
    const [deliveryDate, setDeliveryDate] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const tomorrow = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const maxDate = toInputDate(new Date(offer.validUntil));
    const minDate = toInputDate(tomorrow);
    const availableDays = catering.availableDays || [];
    const total = Number(offer.pricePerServing || 0) * Number(servings || 0);

    const validateDate = (value) => {
        if (!value) return "Choose an event date.";
        const selectedDate = new Date(`${value}T12:00:00`);
        const expiry = new Date(offer.validUntil);
        expiry.setHours(23, 59, 59, 999);
        if (selectedDate < tomorrow) return "Choose a future event date.";
        if (selectedDate > expiry) return "The event date must be within the offer validity date.";

        if (availableDays.length > 0) {
            const dayName = DAY_NAMES[selectedDate.getDay()];
            if (!availableDays.includes(dayName)) {
                return `This caterer does not operate on ${dayName}.`;
            }
        }
        return "";
    };

    const handleAddToCart = () => {
        setError("");
        setMessage("");

        const qty = Number(servings);
        const minServings = Number(offer.minServings);
        const maxServings = Number(offer.maxServings);
        if (!Number.isInteger(qty) || qty < minServings || qty > maxServings) {
            setError(`Servings must be between ${minServings} and ${maxServings}.`);
            return;
        }

        const dateError = validateDate(deliveryDate);
        if (dateError) {
            setError(dateError);
            return;
        }

        const [year, month, day] = deliveryDate.split("-");
        const formattedDate = `${day}-${month}-${year}`;
        const cart = JSON.parse(localStorage.getItem("feastify-cart") || "[]");

        cart.push({
            cateringId: catering._id,
            sellerId: catering.owner || "",
            sellerEmail: catering.email || "",
            sellerName: catering.name || "Caterer",
            customerEmail: localStorage.getItem("email") || "",
            date: formattedDate,
            specialOfferId: offer._id,
            items: [
                {
                    foodName: offer.title,
                    image: offer.image || "",
                    pricePerServing: Number(offer.pricePerServing),
                    servings: qty,
                },
            ],
        });

        localStorage.setItem("feastify-cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        setMessage("Special offer added to cart successfully.");
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title fw-bold mb-1">{offer.title}</h5>
                            <div className="text-muted small">{catering.name}</div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body">
                        <div className="row g-4">
                            <div className="col-md-5">
                                {offer.image ? (
                                    <img
                                        src={offer.image}
                                        alt={offer.title}
                                        className="img-fluid rounded w-100"
                                        style={{ height: "260px", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className="special-offer-image-placeholder rounded d-flex align-items-center justify-content-center">
                                        <span>Special Deal</span>
                                    </div>
                                )}
                            </div>

                            <div className="col-md-7">
                                <p>{offer.description}</p>
                                <div className="mb-2">
                                    <strong>Price:</strong> ৳{Number(offer.pricePerServing).toLocaleString()} / serving
                                </div>
                                <div className="mb-2">
                                    <strong>Serving range:</strong> {offer.minServings} - {offer.maxServings}
                                </div>
                                <div className="mb-3">
                                    <strong>Valid through:</strong> {new Date(offer.validUntil).toLocaleDateString()}
                                </div>

                                <label className="form-label fw-semibold">Servings</label>
                                <input
                                    type="number"
                                    className="form-control mb-3"
                                    min={offer.minServings}
                                    max={offer.maxServings}
                                    value={servings}
                                    onChange={(e) => {
                                        const rawValue = e.target.value;

                                        if (rawValue === "") {
                                            setServings("");
                                            setError("");
                                            return;
                                        }

                                        const nextValue = Number(rawValue);
                                        const min = Number(offer.minServings);
                                        const max = Number(offer.maxServings);

                                        if (nextValue > max) {
                                            setServings(max);
                                            setError(`Maximum allowed servings for this offer is ${max}.`);
                                            return;
                                        }

                                        if (nextValue < 0) {
                                            setServings(min);
                                            setError(`Minimum allowed servings for this offer is ${min}.`);
                                            return;
                                        }

                                        setServings(rawValue);
                                        setError("");
                                    }}
                                    onBlur={() => {
                                        const qty = Number(servings);
                                        const min = Number(offer.minServings);
                                        const max = Number(offer.maxServings);

                                        if (!Number.isFinite(qty) || qty < min) {
                                            setServings(min);
                                        } else if (qty > max) {
                                            setServings(max);
                                        }
                                    }}
                                />

                                <label className="form-label fw-semibold">Event / Delivery Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    min={minDate}
                                    max={maxDate}
                                    value={deliveryDate}
                                    onChange={(e) => {
                                        setDeliveryDate(e.target.value);
                                        setError("");
                                    }}
                                />
                                <small className="text-muted">
                                    Date must be within the offer validity period
                                    {availableDays.length ? ` and on: ${availableDays.join(", ")}` : ""}.
                                </small>
                            </div>
                        </div>

                        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
                        {message && <div className="alert alert-success mt-3 mb-0">{message}</div>}
                    </div>

                    <div className="modal-footer d-flex justify-content-between">
                        <strong>Total: ৳{Number(total || 0).toLocaleString()}</strong>
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                Close
                            </button>
                            <button type="button" className="btn btn-warning" onClick={handleAddToCart}>
                                Add Special to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SpecialOfferOrderModal;

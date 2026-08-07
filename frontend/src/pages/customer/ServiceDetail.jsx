import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCaterer, createRequest } from "../../services/requestService";
import mockCartItems from "../../constants/mockCartItems";

function getUpcomingDates(count) {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= count; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date);
    }

    return dates;
}

function formatISODate(date) {
    return date.toISOString().split("T")[0];
}

function ServiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [caterer, setCaterer] = useState(null);
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const availableDates = useMemo(() => getUpcomingDates(5), []);

    const [formData, setFormData] = useState({
        eventDate: "",
        location: "",
        guests: "",
    });

    const [cartItems, setCartItems] = useState(
        mockCartItems.map((item) => ({ ...item, selected: false, servings: "" }))
    );

    useEffect(() => {
        const fetchCaterer = async () => {
            try {
                const response = await getCaterer(id);
                setCaterer(response.data.caterer);
            } catch (error) {
                setMessage(
                    error.response?.data?.message || "Failed to load caterer."
                );
            }
        };

        fetchCaterer();
    }, [id]);

    const selectedItems = cartItems.filter(
        (item) => item.selected && Number(item.servings) > 0
    );

    const estimatedPrice = selectedItems.reduce(
        (total, item) => total + item.pricePerServing * Number(item.servings),
        0
    );

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const toggleItem = (foodName) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.foodName === foodName
                    ? {
                        ...item,
                        selected: !item.selected,
                        servings: !item.selected && !item.servings ? formData.guests : item.servings,
                    }
                    : item
            )
        );
    };

    const updateServings = (foodName, value) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.foodName === foodName ? { ...item, servings: value } : item
            )
        );
    };

    const handleCheckout = async () => {
        if (!formData.eventDate || !formData.location || !formData.guests || selectedItems.length === 0) {
            setMessage("Please fill in all fields and select at least one item.");
            return;
        }

        setSubmitting(true);
        setMessage("");

        try {
            const response = await createRequest({
                catererId: id,
                eventDate: formData.eventDate,
                location: formData.location,
                guests: Number(formData.guests),
                items: selectedItems.map((item) => ({
                    foodName: item.foodName,
                    image: item.image,
                    pricePerServing: item.pricePerServing,
                    servings: Number(item.servings),
                })),
            });

            navigate("/customer/request-success", {
                state: { requestId: response.data.request._id },
            });

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to submit request."
            );
            setSubmitting(false);
        }
    };

    if (!caterer) {
        return (
            <div className="container mt-5">
                {message ? (
                    <div className="alert alert-danger">{message}</div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        );
    }

    return (
        <div className="container mt-5">

            <div className="row g-4">

                <div className="col-md-5">
                    <div
                        className="bg-light rounded d-flex align-items-center justify-content-center"
                        style={{ height: "260px" }}
                    >
                        <span className="text-muted">Service Image</span>
                    </div>

                    <h4 className="mt-4">Available Dates</h4>

                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {availableDates.map((date) => {
                            const iso = formatISODate(date);
                            const isSelected = formData.eventDate === iso;

                            return (
                                <button
                                    key={iso}
                                    type="button"
                                    className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                                    onClick={() =>
                                        setFormData({ ...formData, eventDate: iso })
                                    }
                                >
                                    {date.toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "short",
                                    })}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="col-md-7">
                    <h2>{caterer.fullName}</h2>

                    <p className="text-muted mb-1">📍 {caterer.area}</p>
                    <p className="text-muted">{caterer.address}</p>

                    <p>
                        {caterer.fullName} offers professional catering services
                        for weddings, corporate events, birthdays, and family
                        gatherings.
                    </p>

                    <button
                        type="button"
                        className="btn btn-primary btn-lg mt-3"
                        onClick={() => setShowForm(true)}
                    >
                        Request Service
                    </button>
                </div>

            </div>

            {message && !showForm && (
                <div className="alert alert-danger mt-4">{message}</div>
            )}

            {showForm && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title text-primary">
                                    Request Service
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowForm(false)}
                                />
                            </div>

                            <div className="modal-body">

                                {message && (
                                    <div className="alert alert-danger">{message}</div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">Event Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Home location"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Number of guests</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        name="guests"
                                        value={formData.guests}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label d-block">Select items</label>

                                    {cartItems.map((item) => (
                                        <div
                                            className="d-flex align-items-center gap-2 mb-2"
                                            key={item.foodName}
                                        >
                                            <div className="form-check flex-grow-1 mb-0">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`item-${item.foodName}`}
                                                    checked={item.selected}
                                                    onChange={() => toggleItem(item.foodName)}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`item-${item.foodName}`}
                                                >
                                                    {item.foodName} ({item.pricePerServing} BDT/serving)
                                                </label>
                                            </div>

                                            {item.selected && (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control form-control-sm"
                                                    style={{ width: "100px" }}
                                                    placeholder="Servings"
                                                    value={item.servings}
                                                    onChange={(e) =>
                                                        updateServings(item.foodName, e.target.value)
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <p className="fw-bold">
                                    Estimated price:{" "}
                                    <span className="text-primary">
                                        {estimatedPrice} BDT
                                    </span>
                                </p>

                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowForm(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCheckout}
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting..." : "Checkout"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ServiceDetail;

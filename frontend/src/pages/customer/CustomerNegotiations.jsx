import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    confirmNegotiation,
    getMyNegotiations,
    updateNegotiationOffer,
} from "../../services/negotiationService";

const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
};

const statusLabel = (status) => {
    if (status === "customer_confirmed") return "Confirmed by You";
    if (status === "finalized") return "Accepted";
    if (status === "rejected") return "Rejected";
    return "Open";
};

const statusClass = (status) => {
    if (status === "finalized") return "bg-success";
    if (status === "rejected") return "bg-danger";
    if (status === "customer_confirmed") return "bg-info text-dark";
    return "bg-warning text-dark";
};

function CustomerNegotiations() {
    const location = useLocation();
    const navigate = useNavigate();

    const [negotiations, setNegotiations] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState(location.state?.successMessage || "");

    const selected = negotiations.find((item) => item._id === selectedId) || null;

    const loadNegotiations = async () => {
        try {
            setError("");
            const response = await getMyNegotiations();
            const data = response.data.negotiations || [];
            setNegotiations(data);
            setSelectedId((current) => current || data[0]?._id || "");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not load your negotiations."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNegotiations();
    }, []);

    useEffect(() => {
        if (!selected) return;
        const values = {};
        selected.items.forEach((item) => {
            values[item.menuItem] = item.currentPrice;
        });
        setPrices(values);
    }, [selectedId, negotiations]);

    const updateOffer = async () => {
        if (
            !selected ||
            selected.status !== "open" ||
            selected.lastUpdatedBy !== "seller"
        ) {
            return;
        }

        const items = selected.items.map((item) => ({
            menuItemId: item.menuItem,
            proposedPrice: Number(prices[item.menuItem]),
        }));

        if (
            items.some(
                (item) =>
                    !Number.isFinite(item.proposedPrice) ||
                    item.proposedPrice <= 0
            )
        ) {
            setError("Enter a valid price greater than zero for every dish.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            const response = await updateNegotiationOffer(selected._id, items);
            setNegotiations((current) =>
                current.map((item) =>
                    item._id === selected._id
                        ? response.data.negotiation
                        : item
                )
            );
            setMessage(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not update the negotiation."
            );
        } finally {
            setSaving(false);
        }
    };

    const confirmOffer = async () => {
        if (
            !selected ||
            selected.status !== "open" ||
            selected.lastUpdatedBy !== "seller"
        ) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            const response = await confirmNegotiation(selected._id);
            setNegotiations((current) =>
                current.map((item) =>
                    item._id === selected._id
                        ? response.data.negotiation
                        : item
                )
            );
            setMessage(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not confirm the seller counter offer."
            );
        } finally {
            setSaving(false);
        }
    };

    const canCustomerRespond =
        selected?.status === "open" && selected?.lastUpdatedBy === "seller";

    return (
        <div className="container py-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">My Negotiations</h2>
                    <p className="text-muted mb-0">
                        Review seller counter offers and respond once per turn.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => navigate("/customer/home")}
                >
                    Browse Caterers
                </button>
            </div>

            {message && (
                <div className="alert alert-success alert-dismissible fade show">
                    {message}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage("")}
                    />
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                </div>
            ) : negotiations.length === 0 ? (
                <div className="card shadow-sm border-0">
                    <div className="card-body text-center py-5">
                        <h4>No negotiations yet</h4>
                        <p className="text-muted mb-0">
                            Start one from a caterer's menu in the customer feed.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="d-grid gap-3">
                            {negotiations.map((negotiation) => (
                                <button
                                    key={negotiation._id}
                                    type="button"
                                    className={`card text-start border-0 shadow-sm ${
                                        selectedId === negotiation._id
                                            ? "border border-primary"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedId(negotiation._id)
                                    }
                                >
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between gap-2">
                                            <h5 className="fw-bold mb-1">
                                                {negotiation.sellerName}
                                            </h5>
                                            <span
                                                className={`badge ${statusClass(
                                                    negotiation.status
                                                )}`}
                                            >
                                                {statusLabel(negotiation.status)}
                                            </span>
                                        </div>
                                        <div className="small text-muted">
                                            Event: {formatDate(negotiation.eventDate)}
                                        </div>
                                        <div className="small mt-2">
                                            Last updated by:{" "}
                                            <strong>
                                                {negotiation.lastUpdatedBy}
                                            </strong>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-8">
                        {selected && (
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
                                        <div>
                                            <h3 className="fw-bold mb-1">
                                                {selected.sellerName}
                                            </h3>
                                            <div className="text-muted">
                                                {selected.sellerEmail}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-semibold">
                                                Event Date
                                            </div>
                                            <div>
                                                {formatDate(selected.eventDate)}
                                            </div>
                                        </div>
                                    </div>

                                    {selected.status === "open" &&
                                        selected.lastUpdatedBy === "seller" && (
                                            <div className="alert alert-info">
                                                The seller sent a counter offer. You can either counter once with new prices or confirm these prices.
                                            </div>
                                        )}

                                    {selected.status === "open" &&
                                        selected.lastUpdatedBy === "customer" && (
                                            <div className="alert alert-warning">
                                                Your offer has been sent. Wait for the seller to counter, accept, or reject it.
                                            </div>
                                        )}

                                    {selected.status === "customer_confirmed" && (
                                        <div className="alert alert-info">
                                            You confirmed the seller's prices. The seller can now only accept or reject this deal.
                                        </div>
                                    )}

                                    {selected.status === "rejected" && (
                                        <div className="alert alert-danger">
                                            This negotiation was rejected by the seller. The related order is also marked as rejected.
                                        </div>
                                    )}

                                    {selected.items.map((item) => (
                                        <div
                                            key={item.menuItem}
                                            className="border rounded p-3 mb-3"
                                        >
                                            <div className="row g-3 align-items-center">
                                                <div className="col-md-7">
                                                    <div className="d-flex align-items-center gap-3">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.foodName}
                                                                style={{
                                                                    width: "70px",
                                                                    height: "70px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "8px",
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            <h5 className="fw-bold mb-1">
                                                                {item.foodName}
                                                            </h5>
                                                            <div className="small text-muted">
                                                                {item.servings} {item.unit} · Listed ৳
                                                                {Number(
                                                                    item.listedPrice
                                                                ).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-5">
                                                    <label className="form-label fw-semibold">
                                                        Current price / {item.unit}
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text">
                                                            ৳
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="form-control"
                                                            disabled={!canCustomerRespond}
                                                            value={
                                                                prices[item.menuItem] ??
                                                                ""
                                                            }
                                                            onChange={(event) =>
                                                                setPrices(
                                                                    (current) => ({
                                                                        ...current,
                                                                        [item.menuItem]:
                                                                            event.target.value,
                                                                    })
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {canCustomerRespond && (
                                        <div className="d-flex flex-wrap justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                disabled={saving}
                                                onClick={updateOffer}
                                            >
                                                {saving
                                                    ? "Updating..."
                                                    : "Counter With New Price"}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                disabled={saving}
                                                onClick={confirmOffer}
                                            >
                                                {saving
                                                    ? "Confirming..."
                                                    : "Confirm Seller Price"}
                                            </button>
                                        </div>
                                    )}

                                    {selected.status === "finalized" && (
                                        <div className="alert alert-success mb-0">
                                            <strong>Deal accepted by the seller.</strong>
                                            <div className="small mb-3">
                                                The agreed order is now available in Live Order Tracking.
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={() =>
                                                    navigate("/customer/orders")
                                                }
                                            >
                                                Go to Orders
                                            </button>
                                        </div>
                                    )}

                                    {selected.history?.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="fw-bold">
                                                Negotiation History
                                            </h5>
                                            <div className="d-grid gap-2">
                                                {[...selected.history]
                                                    .reverse()
                                                    .map((entry, index) => (
                                                        <div
                                                            className="border rounded p-3"
                                                            key={`${entry.updatedAt}-${index}`}
                                                        >
                                                            <div className="d-flex justify-content-between gap-2 mb-2">
                                                                <strong className="text-capitalize">
                                                                    {entry.updatedBy} ·{" "}
                                                                    {entry.updatedByName}
                                                                    {entry.action
                                                                        ? ` · ${entry.action}`
                                                                        : ""}
                                                                </strong>
                                                                <small className="text-muted">
                                                                    {new Date(
                                                                        entry.updatedAt
                                                                    ).toLocaleString()}
                                                                </small>
                                                            </div>
                                                            {entry.items.map(
                                                                (item) => (
                                                                    <div
                                                                        className="small"
                                                                        key={
                                                                            item.foodName
                                                                        }
                                                                    >
                                                                        {item.foodName}: ৳
                                                                        {Number(
                                                                            item.pricePerServing
                                                                        ).toLocaleString()}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerNegotiations;

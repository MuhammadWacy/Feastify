import { useEffect, useState } from "react";
import {
    finalizeNegotiation,
    getIncomingNegotiations,
    rejectNegotiation,
    updateNegotiationOffer,
} from "../../services/negotiationService";

const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
};

const statusLabel = (status) => {
    if (status === "customer_confirmed") return "Customer Confirmed";
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

function SellerNegotiations() {
    const [negotiations, setNegotiations] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const selected = negotiations.find((item) => item._id === selectedId) || null;

    const loadNegotiations = async () => {
        try {
            setError("");
            const response = await getIncomingNegotiations();
            const data = response.data.negotiations || [];
            setNegotiations(data);
            setSelectedId((current) => current || data[0]?._id || "");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not load negotiation requests."
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

    const replaceNegotiation = (updatedNegotiation) => {
        setNegotiations((current) =>
            current.map((item) =>
                item._id === updatedNegotiation._id
                    ? updatedNegotiation
                    : item
            )
        );
    };

    const counterOffer = async () => {
        if (
            !selected ||
            selected.status !== "open" ||
            selected.lastUpdatedBy !== "customer"
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
            replaceNegotiation(response.data.negotiation);
            setMessage(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not send the counter offer."
            );
        } finally {
            setSaving(false);
        }
    };

    const acceptDeal = async () => {
        if (!selected) return;

        try {
            setSaving(true);
            setError("");
            const response = await finalizeNegotiation(selected._id);
            replaceNegotiation(response.data.negotiation);
            setMessage(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not finalize the negotiation."
            );
        } finally {
            setSaving(false);
        }
    };

    const rejectDeal = async () => {
        if (!selected) return;

        try {
            setSaving(true);
            setError("");
            const response = await rejectNegotiation(selected._id);
            replaceNegotiation(response.data.negotiation);
            setMessage(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not reject the negotiation."
            );
        } finally {
            setSaving(false);
        }
    };

    const canSellerCounter =
        selected?.status === "open" && selected?.lastUpdatedBy === "customer";

    const canSellerAccept =
        selected?.status === "customer_confirmed" ||
        (selected?.status === "open" &&
            selected?.lastUpdatedBy === "customer");

    const canSellerReject =
        selected?.status === "open" || selected?.status === "customer_confirmed";

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Negotiation Requests</h2>
                <p className="text-muted mb-0">
                    Review customer offers, counter once per turn, accept, or reject.
                </p>
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
                        <h4>No negotiation requests yet</h4>
                        <p className="text-muted mb-0">
                            Customer negotiation requests will appear here.
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
                                                {negotiation.customerName}
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
                                            {negotiation.customerEmail}
                                        </div>
                                        <div className="small mt-2">
                                            Event: {formatDate(negotiation.eventDate)}
                                        </div>
                                        <div className="small mt-1">
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
                                                {selected.customerName}
                                            </h3>
                                            <div className="text-muted">
                                                {selected.customerEmail}
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
                                        selected.lastUpdatedBy === "customer" && (
                                            <div className="alert alert-info">
                                                The customer has offered these prices. You may accept, reject, or send one counter offer.
                                            </div>
                                        )}

                                    {selected.status === "open" &&
                                        selected.lastUpdatedBy === "seller" && (
                                            <div className="alert alert-warning">
                                                Your counter offer has been sent. You cannot counter again or accept your own price. Wait for the customer to counter or confirm it. You may still reject the negotiation.
                                            </div>
                                        )}

                                    {selected.status === "customer_confirmed" && (
                                        <div className="alert alert-info">
                                            The customer confirmed your counter offer. Prices are now locked. You can only accept or reject the deal.
                                        </div>
                                    )}

                                    {selected.status === "rejected" && (
                                        <div className="alert alert-danger">
                                            This negotiation and its related order were rejected.
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
                                                                {item.servings} {item.unit}
                                                            </div>
                                                            <div className="small text-muted">
                                                                Listed: ৳
                                                                {Number(
                                                                    item.listedPrice
                                                                ).toLocaleString()} / {item.unit}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-5">
                                                    <label className="form-label fw-semibold">
                                                        Negotiated price / {item.unit}
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text">
                                                            ৳
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="form-control"
                                                            disabled={!canSellerCounter}
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

                                    {(canSellerCounter ||
                                        canSellerAccept ||
                                        canSellerReject) && (
                                        <div className="d-flex flex-wrap justify-content-end gap-2">
                                            {canSellerCounter && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    disabled={saving}
                                                    onClick={counterOffer}
                                                >
                                                    {saving
                                                        ? "Updating..."
                                                        : "Counter Offer"}
                                                </button>
                                            )}

                                            {canSellerReject && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    disabled={saving}
                                                    onClick={rejectDeal}
                                                >
                                                    {saving
                                                        ? "Processing..."
                                                        : "Reject Negotiation"}
                                                </button>
                                            )}

                                            {canSellerAccept && (
                                                <button
                                                    type="button"
                                                    className="btn btn-success"
                                                    disabled={saving}
                                                    onClick={acceptDeal}
                                                >
                                                    {saving
                                                        ? "Finalizing..."
                                                        : "Accept & Finalize Deal"}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {selected.status === "finalized" && (
                                        <div className="alert alert-success mb-0">
                                            <strong>Deal finalized.</strong>
                                            <div className="small">
                                                An approved order was created for the customer and is waiting for payment.
                                            </div>
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

export default SellerNegotiations;

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createNegotiation } from "../../services/negotiationService";

function NewNegotiation() {
    const location = useLocation();
    const navigate = useNavigate();
    const draft = location.state?.negotiationDraft;

    const [prices, setPrices] = useState(() => {
        const values = {};
        draft?.items?.forEach((item) => {
            values[item.menuItemId] = item.listedPrice;
        });
        return values;
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const proposedTotal = useMemo(() => {
        if (!draft?.items) return 0;
        return draft.items.reduce(
            (total, item) =>
                total + Number(prices[item.menuItemId] || 0) * item.servings,
            0
        );
    }, [draft, prices]);

    if (!draft || !Array.isArray(draft.items) || draft.items.length === 0) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning">
                    No negotiation draft was found. Please select dishes from a caterer first.
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate("/customer/home")}
                >
                    Return to Feed
                </button>
            </div>
        );
    }

    const handleSubmit = async () => {
        setError("");

        const items = draft.items.map((item) => ({
            menuItemId: item.menuItemId,
            servings: item.servings,
            listedPrice: item.listedPrice,
            proposedPrice: Number(prices[item.menuItemId]),
        }));

        if (items.some((item) => !Number.isFinite(item.proposedPrice) || item.proposedPrice <= 0)) {
            setError("Enter a valid proposed price greater than zero for every dish.");
            return;
        }

        try {
            setSubmitting(true);
            await createNegotiation({
                cateringId: draft.cateringId,
                sellerId: draft.sellerId,
                eventDate: draft.eventDate,
                items,
            });

            navigate("/customer/negotiations", {
                state: {
                    successMessage: "Negotiation request sent successfully.",
                },
                replace: true,
            });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not send the negotiation request."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Negotiate Prices</h2>
                <p className="text-muted mb-0">
                    Propose a price per serving for each selected dish from {draft.sellerName}.
                </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <strong>Caterer</strong>
                            <div>{draft.sellerName}</div>
                            <small className="text-muted">{draft.sellerEmail}</small>
                        </div>
                        <div className="col-md-6">
                            <strong>Event Date</strong>
                            <div>{draft.eventDate}</div>
                        </div>
                    </div>

                    {draft.items.map((item) => (
                        <div
                            key={item.menuItemId}
                            className="border rounded p-3 mb-3"
                        >
                            <div className="row g-3 align-items-center">
                                {item.image && (
                                    <div className="col-md-2">
                                        <img
                                            src={item.image}
                                            alt={item.foodName}
                                            className="img-fluid rounded"
                                            style={{
                                                width: "100%",
                                                height: "90px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                )}

                                <div className={item.image ? "col-md-5" : "col-md-7"}>
                                    <h5 className="fw-bold mb-1">{item.foodName}</h5>
                                    <div className="text-muted small">
                                        Quantity: {item.servings} {item.unit}
                                    </div>
                                    <div className="text-muted small">
                                        Listed price: ৳{Number(item.listedPrice).toLocaleString()} / {item.unit}
                                    </div>
                                </div>

                                <div className="col-md-5">
                                    <label className="form-label fw-semibold">
                                        Your proposed price per {item.unit}
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">৳</span>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            className="form-control"
                                            value={prices[item.menuItemId] ?? ""}
                                            onChange={(event) =>
                                                setPrices((current) => ({
                                                    ...current,
                                                    [item.menuItemId]: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
                        <div>
                            <div className="text-muted small">Proposed Total</div>
                            <h4 className="fw-bold text-primary mb-0">
                                ৳{proposedTotal.toLocaleString()}
                            </h4>
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary px-4"
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? "Sending..." : "Update & Send Negotiation"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewNegotiation;

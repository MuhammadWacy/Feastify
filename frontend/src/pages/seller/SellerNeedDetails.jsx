import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    acceptNeedPost,
    getNeedPostDetails,
} from "../../services/needPostService";

const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "";

function SellerNeedDetails() {
    const { needId } = useParams();
    const navigate = useNavigate();
    const [need, setNeed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadNeed = async () => {
            try {
                const response = await getNeedPostDetails(needId);
                setNeed(response.data.need);
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                        "Could not load this customer need."
                );
            } finally {
                setLoading(false);
            }
        };

        loadNeed();
    }, [needId]);

    const confirmNeed = async () => {
        if (!window.confirm("Confirm this customer need and create an approved order?")) {
            return;
        }

        try {
            setConfirming(true);
            setError("");
            await acceptNeedPost(needId);
            navigate("/seller/dashboard", {
                state: {
                    successMessage:
                        "Customer need confirmed. It is now an approved order waiting for customer payment.",
                },
            });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not confirm this customer need."
            );
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status" />
            </div>
        );
    }

    if (!need) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error || "Customer need not found."}</div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <button
                type="button"
                className="btn btn-outline-secondary mb-4"
                onClick={() => navigate("/seller/home")}
            >
                ← Back to Customer Needs
            </button>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row justify-content-center">
                <div className="col-xl-9">
                    <div className="card shadow border-0">
                        <div className="card-body p-4 p-md-5">
                            <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-4">
                                <div>
                                    <div className="text-uppercase small fw-semibold text-muted mb-1">
                                        Customer Cooking Need
                                    </div>
                                    <h2 className="fw-bold mb-1">{need.dishName}</h2>
                                    <div className="text-muted">
                                        {need.eventName} · Needed on {formatDate(need.eventDate)}
                                    </div>
                                </div>
                                <span
                                    className={`badge fs-6 ${
                                        need.status === "open" ? "bg-success" : "bg-secondary"
                                    }`}
                                >
                                    {need.status === "open" ? "Available" : need.status}
                                </span>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <div className="border rounded p-3 h-100">
                                        <div className="small text-muted">Servings</div>
                                        <div className="fs-4 fw-bold">{need.servings}</div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="border rounded p-3 h-100">
                                        <div className="small text-muted">Price per serving</div>
                                        <div className="fs-4 fw-bold">
                                            ৳{Number(need.pricePerServing).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="border rounded p-3 h-100">
                                        <div className="small text-muted">Total order value</div>
                                        <div className="fs-4 fw-bold">
                                            ৳{(need.servings * need.pricePerServing).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h5 className="fw-bold">Preparation Request</h5>
                            <p className="border rounded p-3 bg-light" style={{ whiteSpace: "pre-wrap" }}>
                                {need.preparationDetails}
                            </p>

                            {need.additionalNotes && (
                                <>
                                    <h5 className="fw-bold mt-4">Additional Notes</h5>
                                    <p className="border rounded p-3" style={{ whiteSpace: "pre-wrap" }}>
                                        {need.additionalNotes}
                                    </p>
                                </>
                            )}

                            <div className="row g-3 mt-2">
                                <div className="col-md-6">
                                    <h5 className="fw-bold">Delivery Location</h5>
                                    <div className="border rounded p-3">{need.deliveryLocation}</div>
                                </div>
                                <div className="col-md-6">
                                    <h5 className="fw-bold">Customer Contact</h5>
                                    <div className="border rounded p-3">
                                        <div>{need.customerName}</div>
                                        <div>{need.contactNumber}</div>
                                        <div className="small text-muted">{need.customerEmail}</div>
                                    </div>
                                </div>
                            </div>

                            {need.status === "open" ? (
                                <div className="d-flex justify-content-end mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-success btn-lg"
                                        disabled={confirming}
                                        onClick={confirmNeed}
                                    >
                                        {confirming ? "Confirming..." : "Confirm This Cooking Need"}
                                    </button>
                                </div>
                            ) : (
                                <div className="alert alert-secondary mt-4 mb-0">
                                    This customer need is no longer available for confirmation.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerNeedDetails;

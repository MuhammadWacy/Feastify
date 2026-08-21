import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOpenNeedPosts } from "../../services/needPostService";

const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "";

function SellerHome() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("name") || "Seller";
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadNeeds = async () => {
            try {
                setError("");
                const response = await getOpenNeedPosts();
                setNeeds(response.data.needs || []);
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                        "Could not load customer cooking needs."
                );
            } finally {
                setLoading(false);
            }
        };

        loadNeeds();
    }, []);

    return (
        <div className="container py-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Welcome, {userName}</h2>
                    <p className="text-muted mb-0">
                        Browse customer cooking needs. Earlier event dates are shown first.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/seller/listing")}
                >
                    Manage Catering Listing
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Customer Need Feed</h4>
                <span className="text-muted small">
                    {needs.length} open need{needs.length === 1 ? "" : "s"}
                </span>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                </div>
            ) : needs.length === 0 ? (
                <div className="card shadow-sm border-0">
                    <div className="card-body text-center py-5">
                        <h5>No customer cooking needs are open right now.</h5>
                        <p className="text-muted mb-0">
                            New customer posts will appear here automatically.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {needs.map((need, index) => (
                        <div className="col-md-6 col-xl-4" key={need._id}>
                            <button
                                type="button"
                                className="card h-100 w-100 shadow-sm border-0 text-start need-feed-card"
                                onClick={() => navigate(`/seller/needs/${need._id}`)}
                            >
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                        <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center need-card-icon">
                                            🍲
                                        </div>
                                        <div className="text-end">
                                            <span className={`badge ${index === 0 ? "bg-danger" : "bg-warning text-dark"}`}>
                                                {index === 0 ? "Earliest Need" : "Open Need"}
                                            </span>
                                            <div className="small text-muted mt-1">
                                                {formatDate(need.eventDate)}
                                            </div>
                                        </div>
                                    </div>

                                    <h5 className="fw-bold mb-1">{need.dishName}</h5>
                                    <div className="text-muted small mb-3">{need.eventName}</div>

                                    <p className="mb-3 need-card-description">
                                        {need.preparationDetails}
                                    </p>

                                    <div className="row g-2 small">
                                        <div className="col-6">
                                            <div className="border rounded p-2 h-100">
                                                <span className="text-muted d-block">Servings</span>
                                                <strong>{need.servings}</strong>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="border rounded p-2 h-100">
                                                <span className="text-muted d-block">Per serving</span>
                                                <strong>৳{Number(need.pricePerServing).toLocaleString()}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 small text-muted">
                                        📍 {need.deliveryLocation}
                                    </div>

                                    <div className="mt-3 fw-semibold text-primary">
                                        View full request →
                                    </div>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SellerHome;

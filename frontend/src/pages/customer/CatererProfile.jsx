import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import {
    addFavorite,
    getFavorites,
    removeFavorite,
} from "../../services/favoriteService";

const formatMoney = (value) => `৳${Number(value || 0).toFixed(2)}`;

function CatererProfile() {
    const { cateringId } = useParams();
    const navigate = useNavigate();

    const [catering, setCatering] = useState(null);
    const [items, setItems] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            try {
                const [profileResponse, favoriteData] = await Promise.all([
                    API.get(`/catalog/caterings/${cateringId}/profile`),
                    getFavorites(),
                ]);

                if (cancelled) return;

                setCatering(profileResponse.data.catering);
                setItems(profileResponse.data.items || []);
                setIsFavorite(
                    (favoriteData.favoriteIds || []).includes(String(cateringId))
                );
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message || "Could not load caterer profile."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [cateringId]);

    const toggleFavorite = async () => {
        try {
            const result = isFavorite
                ? await removeFavorite(cateringId)
                : await addFavorite(cateringId);

            setIsFavorite((result.favoriteIds || []).includes(String(cateringId)));
            setMessage(result.message || "Favorites updated.");
        } catch (err) {
            setMessage(
                err.response?.data?.message || "Could not update favorites."
            );
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center text-muted py-5">
                Loading caterer profile...
            </div>
        );
    }

    if (error || !catering) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    {error || "Caterer profile not found."}
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/customer/favorites")}
                >
                    Back to Favorites
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <button
                className="btn btn-link px-0 text-decoration-none mb-3"
                onClick={() => navigate("/customer/favorites")}
            >
                ← Back to Favorites
            </button>

            <div className="card border-0 shadow-sm overflow-hidden mb-4 caterer-profile-card">
                <div className="caterer-profile-banner">
                    {catering.bannerImage ? (
                        <img src={catering.bannerImage} alt={catering.name} />
                    ) : (
                        <div className="caterer-profile-banner-placeholder">
                            {catering.name}
                        </div>
                    )}
                </div>

                <div className="card-body p-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                                <h2 className="fw-bold mb-0">{catering.name}</h2>
                                <span className="badge bg-primary">
                                    ⭐ {Number(catering.rating || 0).toFixed(1)}
                                </span>
                            </div>

                            <p className="text-muted mb-3">{catering.description}</p>

                            <div className="row g-2 small caterer-profile-details">
                                <div className="col-md-6">
                                    <strong>Owner:</strong>{" "}
                                    {catering.owner?.fullName || "Not specified"}
                                </div>
                                <div className="col-md-6">
                                    <strong>Area:</strong> {catering.area}
                                </div>
                                <div className="col-md-6">
                                    <strong>Cuisine:</strong>{" "}
                                    {catering.cuisine || "General catering"}
                                </div>
                                <div className="col-md-6">
                                    <strong>Category:</strong>{" "}
                                    {catering.category || "General"}
                                </div>
                                <div className="col-md-6">
                                    <strong>Phone:</strong>{" "}
                                    {catering.phone || "Not provided"}
                                </div>
                                <div className="col-md-6">
                                    <strong>Email:</strong> {catering.email}
                                </div>
                                <div className="col-12">
                                    <strong>Operating days:</strong>{" "}
                                    {catering.availableDays?.length
                                        ? catering.availableDays.join(", ")
                                        : "Not specified"}
                                </div>
                                <div className="col-12">
                                    <strong>Negotiation:</strong>{" "}
                                    {catering.negotiationEnabled
                                        ? "Available"
                                        : "Not available"}
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-2 caterer-profile-actions">
                            <button
                                className={`btn ${
                                    isFavorite ? "btn-danger" : "btn-outline-danger"
                                }`}
                                onClick={toggleFavorite}
                            >
                                {isFavorite ? "♥ Favorited" : "♡ Add to Favorites"}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/customer/home")}
                            >
                                Browse & Order
                            </button>
                            {message && (
                                <small className="text-muted text-center">{message}</small>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <section className="mb-5">
                <div className="d-flex justify-content-between align-items-end mb-3">
                    <div>
                        <h3 className="fw-bold mb-1">Current Listings</h3>
                        <p className="text-muted mb-0">
                            Available dishes currently published by this caterer.
                        </p>
                    </div>
                    <span className="badge text-bg-light">{items.length} item(s)</span>
                </div>

                {items.length === 0 ? (
                    <div className="alert alert-info mb-0">
                        This caterer has no available dishes right now.
                    </div>
                ) : (
                    <div className="row g-4">
                        {items.map((item) => (
                            <div className="col-md-6 col-lg-4" key={item._id}>
                                <div className="card h-100 border-0 shadow-sm profile-menu-item">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="card-img-top"
                                        />
                                    ) : (
                                        <div className="profile-menu-placeholder">
                                            {item.name}
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h5 className="fw-bold">{item.name}</h5>
                                        {item.description && (
                                            <p className="small text-muted">
                                                {item.description}
                                            </p>
                                        )}
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong className="text-primary">
                                                {formatMoney(item.price)} / {item.unit}
                                            </strong>
                                            <small className="text-muted">
                                                Qty {item.minQty}-{item.maxQty}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="card border-0 shadow-sm review-placeholder-card">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                            <h3 className="fw-bold mb-1">Customer Reviews</h3>
                            <p className="text-muted mb-0">
                                This section is reserved for the upcoming review system.
                            </p>
                        </div>
                        <span className="badge text-bg-light">Coming soon</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default CatererProfile;

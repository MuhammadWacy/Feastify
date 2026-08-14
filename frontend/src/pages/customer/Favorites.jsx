import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CateringCard from "../../components/catalog/CateringCard";
import CateringMenuModal from "../../components/catalog/CateringMenuModal";
import {
    getFavorites,
    removeFavorite,
} from "../../services/favoriteService";

function Favorites() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const data = await getFavorites();
                setFavorites(data.favorites || []);
            } catch (err) {
                setError(
                    err.response?.data?.message || "Could not load favorites."
                );
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, []);

    const handleRemove = async (catering) => {
        try {
            await removeFavorite(catering._id);
            setFavorites((current) =>
                current.filter((item) => item._id !== catering._id)
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not remove favorite."
            );
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">My Favorites</h2>
                <p className="text-muted mb-0">
                    Your saved caterers are kept here for quick access.
                </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading && (
                <div className="text-center text-muted py-5">
                    Loading favorites...
                </div>
            )}

            {!loading && favorites.length === 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <div className="favorites-empty-heart mb-3">♡</div>
                        <h5 className="fw-bold">No favorite caterers yet</h5>
                        <p className="text-muted">
                            Tap the heart on a caterer in the feed to save it here.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/customer/home")}
                        >
                            Browse Caterers
                        </button>
                    </div>
                </div>
            )}

            {!loading && favorites.length > 0 && (
                <div className="row g-4">
                    {favorites.map((catering) => (
                        <div className="col-sm-6 col-lg-4 col-xl-3" key={catering._id}>
                            <CateringCard
                                catering={catering}
                                onSelect={setSelected}
                                isFavorite
                                onToggleFavorite={handleRemove}
                                showProfileButton
                                onViewProfile={() =>
                                    navigate(`/customer/caterers/${catering._id}`)
                                }
                            />
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <CateringMenuModal
                    catering={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}

export default Favorites;

import { useEffect, useState } from "react";
import API from "../../services/api";

import CateringFeed from "../../components/catalog/CateringFeed";
import SpecialOffers from "../../components/catalog/SpecialOffers";

function CustomerHome() {
    const [caterings, setCaterings] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userName = localStorage.getItem("name") || "there";

    useEffect(() => {
        let cancelled = false;

        const fetchCatalog = async () => {
            try {
                const [cateringRes, offerRes] = await Promise.all([
                    API.get("/catalog/caterings"),
                    API.get("/catalog/offers"),
                ]);

                if (cancelled) return;

                setCaterings(cateringRes.data.caterings || []);
                setOffers(offerRes.data.offers || []);
            } catch (err) {
                if (cancelled) return;

                setError(err.response?.data?.message || "Could not load the feed.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCatalog();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="container mt-5">

            <h2 className="fw-bold">Welcome back, {userName}</h2>

            <p className="text-muted mb-4">
                Browse restaurants, search foods, and discover offers here.
            </p>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {loading && (
                <div className="text-center text-muted my-5 py-5">
                    <p className="mb-0">Loading the feed...</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    <SpecialOffers offers={offers} />
                    <CateringFeed caterings={caterings} />
                </>
            )}

        </div>
    );
}

export default CustomerHome;
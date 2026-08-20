import { useEffect, useState } from "react";
import API from "../../services/api";
import { searchCaterings } from "../../services/catalogSearchService";

import CateringFeed from "../../components/catalog/CateringFeed";
import SpecialOffers from "../../components/catalog/SpecialOffers";
import CatalogSearchPanel from "../../components/catalog/CatalogSearchPanel";

function CustomerHome() {
    const [caterings, setCaterings] = useState([]);
    const [displayedCaterings, setDisplayedCaterings] = useState([]);
    const [offers, setOffers] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [searchCount, setSearchCount] = useState(0);
    const [error, setError] = useState("");
    const [searchError, setSearchError] = useState("");

    const userName = localStorage.getItem("name") || "there";

    useEffect(() => {
        let cancelled = false;

        const fetchCatalog = async () => {
            try {
                const [cateringRes, offerRes, favoriteRes] = await Promise.all([
                    API.get("/catalog/caterings"),
                    API.get("/catalog/offers"),
                    API.get("/favorites"),
                ]);

                if (cancelled) return;

                const loadedCaterings = cateringRes.data.caterings || [];
                setCaterings(loadedCaterings);
                setDisplayedCaterings(loadedCaterings);
                setOffers(offerRes.data.offers || []);
                setFavoriteIds(favoriteRes.data.favoriteIds || []);
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

    const handleSearch = async (filters) => {
        setSearching(true);
        setSearchError("");

        try {
            const result = await searchCaterings(filters);
            const results = result.caterings || [];
            setDisplayedCaterings(results);
            setSearchCount(result.count || 0);
            setSearchActive(true);
        } catch (err) {
            setSearchError(
                err.response?.data?.message || "Could not complete the search."
            );
        } finally {
            setSearching(false);
        }
    };

    const handleClearSearch = () => {
        setDisplayedCaterings(caterings);
        setSearchActive(false);
        setSearchCount(0);
        setSearchError("");
    };

    return (
        <div className="container mt-5">
            <h2 className="fw-bold">Welcome back, {userName}</h2>

            <p className="text-muted mb-4">
                Browse caterers, search dishes, and discover offers here.
            </p>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading && (
                <div className="text-center text-muted my-5 py-5">
                    <p className="mb-0">Loading the feed...</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    <CatalogSearchPanel
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        searching={searching}
                    />

                    {searchError && (
                        <div className="alert alert-danger">{searchError}</div>
                    )}

                    {searchActive && !searchError && (
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <strong>{searchCount}</strong>{" "}
                                {searchCount === 1 ? "caterer" : "caterers"} matched
                                your search.
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={handleClearSearch}
                            >
                                Back to full feed
                            </button>
                        </div>
                    )}

                    {!searchActive && <SpecialOffers offers={offers} />}

                    <CateringFeed
                        caterings={displayedCaterings}
                        initialFavoriteIds={favoriteIds}
                        emptyMessage={
                            searchActive
                                ? "No caterers or dishes match these search filters."
                                : "No caterers have published listings yet."
                        }
                    />
                </>
            )}
        </div>
    );
}

export default CustomerHome;

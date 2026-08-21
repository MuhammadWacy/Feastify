import { useEffect, useState } from "react";
import { getSearchOptions } from "../../services/catalogSearchService";

const DEFAULT_FILTERS = {
    q: "",
    minPrice: 0,
    maxPrice: 10000,
    minServings: 10,
    maxServings: 500,
    area: "",
    category: "",
    negotiation: "",
};

function CatalogSearchPanel({ onSearch, onClear, searching = false }) {
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [areas, setAreas] = useState([]);
    const [categories, setCategories] = useState([]);
    const [optionError, setOptionError] = useState("");
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadOptions = async () => {
            try {
                const result = await getSearchOptions();
                if (cancelled) return;
                setAreas(result.areas || []);
                setCategories(result.categories || []);
            } catch (error) {
                if (cancelled) return;
                setOptionError(
                    error.response?.data?.message ||
                        "Could not load filter options."
                );
            }
        };

        loadOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    const updateFilter = (name, value) => {
        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const validate = () => {
        const minPrice = Number(filters.minPrice);
        const maxPrice = Number(filters.maxPrice);
        const minServings = Number(filters.minServings);
        const maxServings = Number(filters.maxServings);

        if (minPrice < 0 || maxPrice > 10000 || minPrice > maxPrice) {
            return "Price must stay between ৳0 and ৳10,000, and minimum cannot exceed maximum.";
        }

        if (minServings < 10) {
            return "Minimum servings cannot be less than 10.";
        }

        if (minServings > maxServings) {
            return "Minimum servings cannot exceed maximum servings.";
        }

        return "";
    };

    const submit = (event) => {
        event.preventDefault();
        const error = validate();
        setValidationError(error);
        if (error) return;

        onSearch({
            ...filters,
            minPrice: Number(filters.minPrice),
            maxPrice: Number(filters.maxPrice),
            minServings: Number(filters.minServings),
            maxServings: Number(filters.maxServings),
        });
    };

    const clear = () => {
        setFilters(DEFAULT_FILTERS);
        setValidationError("");
        onClear();
    };

    return (
        <section className="catalog-search-shell mb-4">
            <form onSubmit={submit}>
                <div className="catalog-search-bar">
                    <span className="catalog-search-icon" aria-hidden="true">
                        ⌕
                    </span>
                    <input
                        type="search"
                        className="form-control catalog-search-input"
                        placeholder="Search caterers or dishes, e.g. Biryani, BBQ, Royal Catering..."
                        value={filters.q}
                        onChange={(event) => updateFilter("q", event.target.value)}
                        onFocus={() => setOpen(true)}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary catalog-filter-toggle"
                        onClick={() => setOpen((current) => !current)}
                    >
                        Filters {open ? "▲" : "▼"}
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary catalog-search-button"
                        disabled={searching}
                    >
                        {searching ? "Searching..." : "Search"}
                    </button>
                </div>

                {open && (
                    <div className="catalog-filter-panel shadow-sm">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    Price per serving / plate
                                </label>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="input-group">
                                        <span className="input-group-text">৳</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            max="10000"
                                            value={filters.minPrice}
                                            onChange={(event) =>
                                                updateFilter(
                                                    "minPrice",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <span className="text-muted">to</span>
                                    <div className="input-group">
                                        <span className="input-group-text">৳</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            max="10000"
                                            value={filters.maxPrice}
                                            onChange={(event) =>
                                                updateFilter(
                                                    "maxPrice",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <small className="text-muted">
                                    Allowed range: ৳0–৳10,000
                                </small>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    Serving capability
                                </label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="10"
                                        value={filters.minServings}
                                        onChange={(event) =>
                                            updateFilter(
                                                "minServings",
                                                event.target.value
                                            )
                                        }
                                    />
                                    <span className="text-muted">to</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="10"
                                        value={filters.maxServings}
                                        onChange={(event) =>
                                            updateFilter(
                                                "maxServings",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                                <small className="text-muted">
                                    Minimum selectable serving count is 10.
                                </small>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Caterer area
                                </label>
                                <select
                                    className="form-select"
                                    value={filters.area}
                                    onChange={(event) =>
                                        updateFilter("area", event.target.value)
                                    }
                                >
                                    <option value="">All registered areas</option>
                                    {areas.map((area) => (
                                        <option value={area} key={area}>
                                            {area}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Food category
                                </label>
                                <select
                                    className="form-select"
                                    value={filters.category}
                                    onChange={(event) =>
                                        updateFilter(
                                            "category",
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">All categories</option>
                                    {categories.map((category) => (
                                        <option value={category} key={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Negotiation
                                </label>
                                <select
                                    className="form-select"
                                    value={filters.negotiation}
                                    onChange={(event) =>
                                        updateFilter(
                                            "negotiation",
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">Any</option>
                                    <option value="yes">Negotiation available</option>
                                    <option value="no">Fixed price only</option>
                                </select>
                            </div>
                        </div>

                        {optionError && (
                            <div className="alert alert-warning py-2 mt-3 mb-0">
                                {optionError}
                            </div>
                        )}

                        {validationError && (
                            <div className="alert alert-danger py-2 mt-3 mb-0">
                                {validationError}
                            </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <small className="text-muted">
                                Results use live caterer and dish data from Feastify.
                            </small>
                            <button
                                type="button"
                                className="btn btn-link text-decoration-none"
                                onClick={clear}
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </section>
    );
}

export default CatalogSearchPanel;

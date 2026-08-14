function CateringCard({
    catering,
    onSelect,
    isFavorite = false,
    onToggleFavorite,
    showProfileButton = false,
    onViewProfile,
}) {
    const handleClick = () => {
        if (onSelect) {
            onSelect(catering);
        }
    };

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onToggleFavorite) {
            onToggleFavorite(catering);
        }
    };

    const handleProfile = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onViewProfile) {
            onViewProfile(catering);
        }
    };

    return (
        <div
            className="card catering-card shadow-sm"
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleClick();
                }
            }}
        >
            <div className="catering-banner-wrapper">
                {catering.bannerImage ? (
                    <img
                        src={catering.bannerImage}
                        alt={catering.name}
                        className="catering-banner"
                        loading="lazy"
                    />
                ) : (
                    <div className="catering-banner-placeholder">
                        {catering.name}
                    </div>
                )}

                {onToggleFavorite && (
                    <button
                        type="button"
                        className={`favorite-heart-button ${
                            isFavorite ? "is-favorite" : ""
                        }`}
                        onClick={handleFavorite}
                        aria-label={
                            isFavorite
                                ? `Remove ${catering.name} from favorites`
                                : `Add ${catering.name} to favorites`
                        }
                        title={
                            isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                        }
                    >
                        {isFavorite ? "♥" : "♡"}
                    </button>
                )}

                <div className="catering-banner-overlay">
                    <div>
                        <h5 className="mb-1 text-white">{catering.name}</h5>
                        <p className="small mb-0 text-white">
                            {catering.cuisine || "Catering"} · {catering.area}
                        </p>
                    </div>
                </div>
            </div>

            <div className="card-body d-flex flex-column">
                <p className="card-text text-muted small mb-2">
                    {catering.description}
                </p>

                <div className="small mb-2">
                    <strong>Operating:</strong>{" "}
                    {catering.availableDays?.length
                        ? catering.availableDays.join(", ")
                        : "Not specified"}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="badge bg-primary">
                        ⭐ {Number(catering.rating || 0).toFixed(1)}
                    </span>
                    <small className="text-muted">
                        {showProfileButton ? "Saved caterer" : "View menu"}
                    </small>
                </div>

                {showProfileButton && onViewProfile && (
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mt-3 w-100"
                        onClick={handleProfile}
                    >
                        View Caterer Profile
                    </button>
                )}
            </div>
        </div>
    );
}

export default CateringCard;

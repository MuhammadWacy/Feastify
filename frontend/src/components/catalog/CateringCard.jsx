function CateringCard({ catering, onSelect }) {
    const handleClick = () => {
        if (onSelect) {
            onSelect(catering);
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

                <div className="catering-banner-overlay">
                    <div>
                        <h5 className="mb-1 text-white">{catering.name}</h5>
                        <p className="small mb-0 text-white-75">
                            {catering.cuisine} · {catering.area}
                        </p>
                    </div>
                </div>
            </div>

            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary">
                        ⭐ {catering.rating?.toFixed(1) || "N/A"}
                    </span>

                    {catering.phone && (
                        <small className="text-muted">{catering.phone}</small>
                    )}
                </div>

                <p className="card-text text-muted small mb-0">
                    Tap to view menu & availability.
                </p>
            </div>
        </div>
    );
}

export default CateringCard;
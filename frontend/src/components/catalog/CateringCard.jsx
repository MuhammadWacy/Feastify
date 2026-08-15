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
                        <p className="small mb-0 text-white">
                            {catering.cuisine || "Catering"} · {catering.area}
                        </p>
                    </div>
                </div>
            </div>

            <div className="card-body">
                <p className="card-text text-muted small mb-2">
                    {catering.description}
                </p>

                <div className="small mb-2">
                    <strong>Operating:</strong>{" "}
                    {catering.availableDays?.length
                        ? catering.availableDays.join(", ")
                        : "Not specified"}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-primary">
                        ⭐ {Number(catering.rating || 0).toFixed(1)}
                    </span>
                    <small className="text-muted">View menu</small>
                </div>
            </div>
        </div>
    );
}

export default CateringCard;

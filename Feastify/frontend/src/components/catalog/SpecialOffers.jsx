import { useState } from "react";
import CateringMenuModal from "./CateringMenuModal";

function SpecialOffers({ offers }) {
    const [selected, setSelected] = useState(null);

    if (!offers || offers.length === 0) {
        return null;
    }

    const formatDate = (date) => {
        if (!date) return "Valid until further notice";

        return `Valid until ${new Date(date).toLocaleDateString()}`;
    };

    return (
        <section className="mb-5">
            <h3 className="fw-bold mb-3">Special Offers</h3>

            <div className="row g-4">
                {offers.map((offer) => {
                    const catering = offer.catering || {};

                    const handleOpen = () => {
                        if (catering._id) {
                            setSelected(offer);
                        }
                    };

                    return (
                        <div
                            className="col-12 col-md-6 col-lg-3"
                            key={offer._id}
                        >
                            <div
                                className="card offer-card shadow-sm h-100"
                                role="button"
                                tabIndex={0}
                                onClick={handleOpen}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleOpen();
                                    }
                                }}
                            >
                                <div
                                    className="card-img-top offer-banner"
                                    style={{
                                        backgroundImage: `url(${
                                            catering.bannerImage || ""
                                        })`,
                                    }}
                                >
                                    <span className="offer-badge">
                                        -{offer.discount}%
                                    </span>
                                </div>

                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title mb-1">
                                        {offer.title}
                                    </h5>

                                    <h6 className="text-muted mb-2">
                                        {catering.name}
                                    </h6>

                                    <p className="card-text small flex-grow-1">
                                        {offer.description}
                                    </p>

                                    <small className="text-primary mb-1">
                                        {formatDate(offer.validUntil)}
                                    </small>

                                    <span className="text-muted small">
                                        Tap to view discounted menu.
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selected && (
                <CateringMenuModal
                    catering={selected.catering}
                    discount={selected.discount || 0}
                    onClose={() => setSelected(null)}
                />
            )}
        </section>
    );
}

export default SpecialOffers;
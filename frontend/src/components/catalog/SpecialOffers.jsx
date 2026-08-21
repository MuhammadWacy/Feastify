import { useState } from "react";
import { Link } from "react-router-dom";
import SpecialOfferOrderModal from "./SpecialOfferOrderModal";

function SpecialOffers({ offers }) {
    const [selected, setSelected] = useState(null);

    if (!offers || offers.length === 0) return null;

    return (
        <section className="mb-5">
            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    <h3 className="fw-bold mb-1">Special Offers</h3>
                    <p className="text-muted mb-0">Limited-time deals published by Feastify caterers.</p>
                </div>
            </div>

            <div className="row g-4">
                {offers.map((offer) => {
                    const catering = offer.catering || {};
                    return (
                        <div className="col-12 col-md-6 col-lg-4" key={offer._id}>
                            <div className="card offer-card shadow-sm h-100 border-0">
                                {offer.image ? (
                                    <img
                                        src={offer.image}
                                        className="card-img-top"
                                        alt={offer.title}
                                        style={{ height: "190px", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className="special-offer-card-placeholder d-flex align-items-center justify-content-center">
                                        Special Deal
                                    </div>
                                )}

                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between gap-2 align-items-start mb-1">
                                        <h5 className="fw-bold mb-0">{offer.title}</h5>
                                        <span className="badge text-bg-warning">Limited</span>
                                    </div>

                                    {catering._id ? (
                                        <Link
                                            to={`/customer/caterers/${catering._id}`}
                                            className="text-decoration-none fw-semibold mb-2"
                                        >
                                            {catering.name}
                                        </Link>
                                    ) : (
                                        <div className="text-muted mb-2">{catering.name}</div>
                                    )}

                                    <p className="small text-muted flex-grow-1">{offer.description}</p>
                                    <div className="fw-bold text-primary mb-1">
                                        ৳{Number(offer.pricePerServing).toLocaleString()} / serving
                                    </div>
                                    <div className="small mb-1">
                                        Servings: {offer.minServings} - {offer.maxServings}
                                    </div>
                                    <div className="small text-muted mb-3">
                                        Valid until {new Date(offer.validUntil).toLocaleDateString()}
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-warning mt-auto"
                                        onClick={() => setSelected(offer)}
                                    >
                                        Order Special
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selected && (
                <SpecialOfferOrderModal offer={selected} onClose={() => setSelected(null)} />
            )}
        </section>
    );
}

export default SpecialOffers;

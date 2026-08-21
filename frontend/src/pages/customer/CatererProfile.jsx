import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import {
    addFavorite,
    getFavorites,
    removeFavorite,
} from "../../services/favoriteService";
import {
    askCatererQuestion,
    getCateringFaqs,
} from "../../services/faqService";

const formatMoney = (value) => `৳${Number(value || 0).toFixed(2)}`;
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "");

function CatererProfile() {
    const { cateringId } = useParams();
    const navigate = useNavigate();

    const [catering, setCatering] = useState(null);
    const [items, setItems] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [question, setQuestion] = useState("");
    const [postingQuestion, setPostingQuestion] = useState(false);
    const [faqMessage, setFaqMessage] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            try {
                const [profileResponse, favoriteData, faqData] = await Promise.all([
                    API.get(`/catalog/caterings/${cateringId}/profile`),
                    getFavorites(),
                    getCateringFaqs(cateringId),
                ]);

                if (cancelled) return;

                setCatering(profileResponse.data.catering);
                setItems(profileResponse.data.items || []);
                setFaqs(faqData.faqs || []);
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
            setMessage(err.response?.data?.message || "Could not update favorites.");
        }
    };

    const submitQuestion = async (event) => {
        event.preventDefault();
        const cleanedQuestion = question.trim();

        if (!cleanedQuestion) {
            setFaqMessage("Please write a question first.");
            return;
        }

        setPostingQuestion(true);
        setFaqMessage("");

        try {
            const result = await askCatererQuestion(cateringId, cleanedQuestion);
            setFaqs((current) => [result.faq, ...current]);
            setQuestion("");
            setFaqMessage(result.message || "Question posted successfully.");
        } catch (err) {
            setFaqMessage(err.response?.data?.message || "Could not post your question.");
        } finally {
            setPostingQuestion(false);
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
                    onClick={() => navigate("/customer/home")}
                >
                    Back to Feed
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <button
                className="btn btn-link px-0 text-decoration-none mb-3"
                onClick={() => navigate("/customer/home")}
            >
                ← Back to Feed
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

            <section className="card border-0 shadow-sm mb-5 faq-section-card">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
                        <div>
                            <h3 className="fw-bold mb-1">Questions & Answers</h3>
                            <p className="text-muted mb-0">
                                Ask something specific about {catering.name}. Questions and caterer answers are public to all customers.
                            </p>
                        </div>
                        <span className="badge text-bg-light">{faqs.length} question(s)</span>
                    </div>

                    <form onSubmit={submitQuestion} className="faq-question-form mb-4">
                        <label className="form-label fw-semibold">Ask the caterer</label>
                        <div className="d-flex flex-column flex-md-row gap-2">
                            <textarea
                                className="form-control"
                                rows="2"
                                maxLength="500"
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                placeholder="Example: What ingredients do you use in your biryani?"
                            />
                            <button
                                type="submit"
                                className="btn btn-primary align-self-md-stretch px-4"
                                disabled={postingQuestion}
                            >
                                {postingQuestion ? "Posting..." : "Ask Question"}
                            </button>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                            <small className="text-muted">Your name will be shown with the question.</small>
                            <small className="text-muted">{question.length}/500</small>
                        </div>
                    </form>

                    {faqMessage && <div className="alert alert-info py-2">{faqMessage}</div>}

                    {faqs.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            No questions yet. Be the first customer to ask this caterer something.
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {faqs.map((faq) => (
                                <div className="faq-public-item" key={faq._id}>
                                    <div className="d-flex justify-content-between gap-2 flex-wrap">
                                        <strong>{faq.customer?.fullName || "Customer"}</strong>
                                        <small className="text-muted">{formatDateTime(faq.createdAt)}</small>
                                    </div>
                                    <p className="fw-semibold mb-2 mt-1">Q: {faq.question}</p>

                                    {faq.answer ? (
                                        <div className="faq-answer-box">
                                            <div className="d-flex justify-content-between gap-2 flex-wrap">
                                                <strong>{catering.name}</strong>
                                                {faq.answeredAt && (
                                                    <small className="text-muted">{formatDateTime(faq.answeredAt)}</small>
                                                )}
                                            </div>
                                            <p className="mb-0 mt-1">A: {faq.answer}</p>
                                        </div>
                                    ) : (
                                        <div className="small text-muted fst-italic">
                                            Waiting for the caterer to answer.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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

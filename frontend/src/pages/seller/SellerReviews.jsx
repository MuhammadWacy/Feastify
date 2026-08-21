import { useEffect, useState } from "react";
import { getSellerReviews, replyToReview } from "../../services/reviewService";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "-");
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");

const Stars = ({ rating }) => (
    <span className="review-stars" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
            <span key={index}>{index < rating ? "★" : "☆"}</span>
        ))}
    </span>
);

function SellerReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [replyDrafts, setReplyDrafts] = useState({});
    const [savingId, setSavingId] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setError("");
                const response = await getSellerReviews();
                const data = response.data.reviews || [];
                setReviews(data);
                setReplyDrafts(
                    Object.fromEntries(data.map((review) => [review._id, review.sellerReply || ""]))
                );
            } catch (err) {
                setError(err.response?.data?.message || "Could not load customer reviews.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const saveReply = async (reviewId) => {
        const reply = String(replyDrafts[reviewId] || "").trim();
        if (!reply) {
            setMessage("Write a reply before saving.");
            return;
        }

        try {
            setSavingId(reviewId);
            setMessage("");
            const response = await replyToReview(reviewId, reply);
            setReviews((current) =>
                current.map((review) =>
                    review._id === reviewId
                        ? {
                              ...review,
                              sellerReply: response.data.review.sellerReply,
                              sellerRepliedAt: response.data.review.sellerRepliedAt,
                          }
                        : review
                )
            );
            setMessage("Reply saved. Customers can now see it on your profile.");
        } catch (err) {
            setMessage(err.response?.data?.message || "Could not save the reply.");
        } finally {
            setSavingId("");
        }
    };

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Customer Reviews</h2>
                <p className="text-muted mb-0">
                    Read verified reviews from completed deliveries and reply to each customer separately.
                </p>
            </div>

            {message && <div className="alert alert-info">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border" /></div>
            ) : reviews.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <h4>No reviews yet</h4>
                        <p className="text-muted mb-0">Verified customer reviews will appear here after delivered orders are reviewed.</p>
                    </div>
                </div>
            ) : (
                <div className="d-grid gap-4">
                    {reviews.map((review) => (
                        <article className="card border-0 shadow-sm review-card" key={review._id}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <h5 className="fw-bold mb-0">{review.reviewerName}</h5>
                                            <span className="badge bg-success">Verified delivery</span>
                                        </div>
                                        <div className="small text-muted mt-1">
                                            Delivered {formatDate(review.deliveredAt)} · {review.totalServings} total servings
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <Stars rating={review.rating} />
                                        <div className="small text-muted">Posted {formatDate(review.createdAt)}</div>
                                    </div>
                                </div>

                                <p className="mb-3" style={{ whiteSpace: "pre-wrap" }}>{review.description}</p>

                                <div className="row g-3 mb-3">
                                    {(review.items || []).map((item, index) => (
                                        <div className="col-md-6" key={`${item.foodName}-${index}`}>
                                            <div className="review-dish-card h-100">
                                                {item.image && <img src={item.image} alt={item.foodName} />}
                                                <div>
                                                    <strong>{item.foodName}</strong>
                                                    <div className="small text-muted">{item.servings} servings</div>
                                                    {item.details && <div className="small mt-1">{item.details}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {(review.images || []).length > 0 && (
                                    <div className="review-image-grid mb-4">
                                        {review.images.map((image, index) => (
                                            <a href={image.url} target="_blank" rel="noreferrer" key={image.publicId || index}>
                                                <img src={image.url} alt={`Review evidence ${index + 1}`} />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div className="seller-review-reply-box">
                                    <label className="form-label fw-semibold">
                                        {review.sellerReply ? "Your reply" : "Reply to this review"}
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        maxLength="2000"
                                        value={replyDrafts[review._id] ?? ""}
                                        onChange={(event) =>
                                            setReplyDrafts((current) => ({ ...current, [review._id]: event.target.value }))
                                        }
                                        placeholder="Thank the customer, explain what happened, or address their feedback..."
                                    />
                                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                                        <small className="text-muted">
                                            {review.sellerRepliedAt ? `Last replied ${formatDateTime(review.sellerRepliedAt)}` : "This reply will be public on your caterer profile."}
                                        </small>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={savingId === review._id}
                                            onClick={() => saveReply(review._id)}
                                        >
                                            {savingId === review._id ? "Saving..." : review.sellerReply ? "Update Reply" : "Post Reply"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SellerReviews;

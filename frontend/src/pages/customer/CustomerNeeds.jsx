import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    cancelNeedPost,
    createNeedPost,
    getMyNeedPosts,
} from "../../services/needPostService";

const initialForm = {
    eventName: "",
    eventDate: "",
    deliveryLocation: "",
    contactNumber: "",
    dishName: "",
    preparationDetails: "",
    servings: 50,
    pricePerServing: 250,
    additionalNotes: "",
};

const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "";

function CustomerNeeds() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cancellingId, setCancellingId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const totalBudget = useMemo(() => {
        const servings = Number(form.servings) || 0;
        const price = Number(form.pricePerServing) || 0;
        return servings * price;
    }, [form.servings, form.pricePerServing]);

    const loadNeeds = async () => {
        try {
            const response = await getMyNeedPosts();
            setNeeds(response.data.needs || []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not load your posted catering needs."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNeeds();
    }, []);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const submitNeed = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        try {
            setSubmitting(true);
            await createNeedPost({
                ...form,
                servings: Number(form.servings),
                pricePerServing: Number(form.pricePerServing),
            });
            setSuccess("Your catering need is now visible to caterers.");
            setForm(initialForm);
            await loadNeeds();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not post your catering need."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const cancelNeed = async (needId) => {
        if (!window.confirm("Cancel this posted catering need?")) return;

        try {
            setCancellingId(needId);
            setError("");
            await cancelNeedPost(needId);
            await loadNeeds();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not cancel this catering need."
            );
        } finally {
            setCancellingId("");
        }
    };

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateString = minDate.toISOString().split("T")[0];

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Post What You Need</h2>
                <p className="text-muted mb-0">
                    Describe a custom catering requirement and let available caterers respond to it.
                </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-4">Create a Cooking Need</h4>

                            <form onSubmit={submitNeed} className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Event name / type</label>
                                    <input
                                        className="form-control"
                                        name="eventName"
                                        value={form.eventName}
                                        onChange={updateField}
                                        placeholder="Wedding, office lunch, birthday..."
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Required date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="eventDate"
                                        min={minDateString}
                                        value={form.eventDate}
                                        onChange={updateField}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Dish name</label>
                                    <input
                                        className="form-control"
                                        name="dishName"
                                        value={form.dishName}
                                        onChange={updateField}
                                        placeholder="Chicken biryani"
                                        required
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Servings / plates</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        name="servings"
                                        value={form.servings}
                                        onChange={updateField}
                                        required
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">৳ per serving</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        className="form-control"
                                        name="pricePerServing"
                                        value={form.pricePerServing}
                                        onChange={updateField}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">How should the dish be prepared?</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        name="preparationDetails"
                                        value={form.preparationDetails}
                                        onChange={updateField}
                                        placeholder="Describe ingredients, spice level, cooking preference, dietary requirements, packaging, etc."
                                        required
                                    />
                                </div>

                                <div className="col-md-7">
                                    <label className="form-label">Delivery location</label>
                                    <input
                                        className="form-control"
                                        name="deliveryLocation"
                                        value={form.deliveryLocation}
                                        onChange={updateField}
                                        placeholder="Full event / delivery address"
                                        required
                                    />
                                </div>

                                <div className="col-md-5">
                                    <label className="form-label">Contact number</label>
                                    <input
                                        className="form-control"
                                        name="contactNumber"
                                        value={form.contactNumber}
                                        onChange={updateField}
                                        placeholder="01XXXXXXXXX"
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Additional notes (optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        name="additionalNotes"
                                        value={form.additionalNotes}
                                        onChange={updateField}
                                        placeholder="Any other information the caterer should know"
                                    />
                                </div>

                                <div className="col-12">
                                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 border rounded p-3 bg-light">
                                        <div>
                                            <div className="small text-muted">Estimated total</div>
                                            <div className="fs-4 fw-bold">
                                                ৳{totalBudget.toLocaleString()}
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Posting..." : "Post Need"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h4 className="fw-bold">My Posted Needs</h4>
                            <p className="text-muted small">
                                A confirmed need automatically becomes an approved order in Live Order Tracking.
                            </p>

                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border" role="status" />
                                </div>
                            ) : needs.length === 0 ? (
                                <div className="text-muted py-3">No needs posted yet.</div>
                            ) : (
                                <div className="d-grid gap-3">
                                    {needs.map((need) => (
                                        <div key={need._id} className="border rounded p-3">
                                            <div className="d-flex justify-content-between gap-2 mb-2">
                                                <div>
                                                    <div className="fw-bold">{need.dishName}</div>
                                                    <div className="small text-muted">
                                                        {need.eventName} · {formatDate(need.eventDate)}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`badge align-self-start ${
                                                        need.status === "accepted"
                                                            ? "bg-success"
                                                            : need.status === "cancelled"
                                                                ? "bg-secondary"
                                                                : "bg-warning text-dark"
                                                    }`}
                                                >
                                                    {need.status}
                                                </span>
                                            </div>
                                            <div className="small">
                                                {need.servings} servings · ৳{Number(need.pricePerServing).toLocaleString()} each
                                            </div>

                                            {need.status === "accepted" && (
                                                <div className="mt-3">
                                                    <div className="small text-success mb-2">
                                                        Confirmed by {need.acceptedCatering?.name || "a caterer"}.
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => navigate("/customer/orders")}
                                                    >
                                                        Go to Live Order Tracking
                                                    </button>
                                                </div>
                                            )}

                                            {need.status === "open" && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger mt-3"
                                                    disabled={cancellingId === need._id}
                                                    onClick={() => cancelNeed(need._id)}
                                                >
                                                    {cancellingId === need._id ? "Cancelling..." : "Cancel Post"}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerNeeds;

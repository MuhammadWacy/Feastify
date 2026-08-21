import { useEffect, useState } from "react";
import {
    createSpecialOffer,
    deleteSpecialOffer,
    getMySpecialOffers,
    updateSpecialOffer,
} from "../../services/specialOfferService";

const emptyForm = {
    title: "",
    description: "",
    pricePerServing: "",
    minServings: "",
    maxServings: "",
    validUntil: "",
    isActive: true,
};

function SellerSpecialOffers() {
    const [listing, setListing] = useState(null);
    const [offers, setOffers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadOffers = async () => {
        try {
            setError("");
            const response = await getMySpecialOffers();
            setListing(response.data.listing || null);
            setOffers(response.data.offers || []);
        } catch (err) {
            setError(err.response?.data?.message || "Could not load special offers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOffers();
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setImage(null);
        setEditingId(null);
    };

    const startEdit = (offer) => {
        setEditingId(offer._id);
        setForm({
            title: offer.title || "",
            description: offer.description || "",
            pricePerServing: offer.pricePerServing ?? "",
            minServings: offer.minServings ?? "",
            maxServings: offer.maxServings ?? "",
            validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().slice(0, 10) : "",
            isActive: offer.isActive !== false,
        });
        setImage(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const data = new FormData();
            data.append("title", form.title);
            data.append("description", form.description);
            data.append("pricePerServing", form.pricePerServing);
            data.append("minServings", form.minServings);
            data.append("maxServings", form.maxServings);
            data.append("validUntil", form.validUntil);
            data.append("isActive", String(form.isActive));
            if (image) data.append("image", image);

            const response = editingId
                ? await updateSpecialOffer(editingId, data)
                : await createSpecialOffer(data);

            setMessage(response.data.message);
            resetForm();
            await loadOffers();
        } catch (err) {
            setError(err.response?.data?.message || "Could not save special offer.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this special offer?")) return;
        try {
            setMessage("");
            setError("");
            const response = await deleteSpecialOffer(id);
            setMessage(response.data.message);
            if (editingId === id) resetForm();
            await loadOffers();
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete special offer.");
        }
    };

    if (loading) {
        return <div className="container py-5"><h3>Loading special offers...</h3></div>;
    }

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Special Offers</h2>
                <p className="text-muted mb-0">
                    Publish limited-time deals that appear in the customer's home feed.
                </p>
            </div>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!listing && (
                <div className="alert alert-warning">
                    Create your catering listing first before publishing special offers.
                </div>
            )}

            {listing && !listing.isPublished && (
                <div className="alert alert-warning">
                    Your catering listing is currently unpublished. Publish it before creating customer-visible offers.
                </div>
            )}

            <div className="card shadow-sm border-0 mb-5">
                <div className="card-body p-4">
                    <h4 className="fw-bold mb-4">
                        {editingId ? "Edit Special Offer" : "Create Special Offer"}
                    </h4>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Offer Name</label>
                                <input
                                    className="form-control"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Price per Serving (৳)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    name="pricePerServing"
                                    value={form.pricePerServing}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">Offer Details</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Minimum Servings</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    name="minServings"
                                    value={form.minServings}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Maximum Servings</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    name="maxServings"
                                    value={form.maxServings}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Valid Until</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="validUntil"
                                    value={form.validUntil}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-8">
                                <label className="form-label">
                                    Offer Image {editingId ? "(leave blank to keep current image)" : ""}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                />
                            </div>

                            {editingId && (
                                <div className="col-md-4 d-flex align-items-end">
                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="offerActive"
                                            name="isActive"
                                            checked={form.isActive}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="offerActive">
                                            Active
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="d-flex gap-2 mt-4">
                            <button
                                type="submit"
                                className="btn btn-warning"
                                disabled={saving || !listing?.isPublished}
                            >
                                {saving ? "Saving..." : editingId ? "Update Offer" : "Publish Offer"}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <h4 className="fw-bold mb-3">Your Published Specials</h4>

            {offers.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-muted">You have not created any special offers yet.</div>
                </div>
            ) : (
                <div className="row g-4">
                    {offers.map((offer) => (
                        <div className="col-md-6 col-lg-4" key={offer._id}>
                            <div className="card h-100 shadow-sm border-0">
                                {offer.image && (
                                    <img
                                        src={offer.image}
                                        alt={offer.title}
                                        className="card-img-top"
                                        style={{ height: "180px", objectFit: "cover" }}
                                    />
                                )}
                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                        <h5 className="fw-bold">{offer.title}</h5>
                                        <span className={`badge ${offer.isActive ? "text-bg-success" : "text-bg-secondary"}`}>
                                            {offer.isActive ? "Active" : "Paused"}
                                        </span>
                                    </div>
                                    <p className="text-muted small flex-grow-1">{offer.description}</p>
                                    <div className="mb-1">৳{Number(offer.pricePerServing).toLocaleString()} / serving</div>
                                    <div className="small mb-1">Servings: {offer.minServings} - {offer.maxServings}</div>
                                    <div className="small text-muted mb-3">
                                        Valid until {new Date(offer.validUntil).toLocaleDateString()}
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(offer)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(offer._id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SellerSpecialOffers;

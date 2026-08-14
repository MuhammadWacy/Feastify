import { useEffect, useState } from "react";
import {
    createMenuItem,
    deleteMenuItem,
    getMyListing,
    saveMyListing,
    setListingPublished,
    updateMenuItem,
} from "../../services/sellerListingAPI";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CATEGORIES = [
    "Desi",
    "Chinese",
    "BBQ & Grill",
    "Fast Food",
    "Seafood",
    "Italian",
    "Street Food",
    "Breakfast & Brunch",
    "Healthy & Vegan",
    "Desserts",
    "Continental & Mediterranean",
    "General",
];

const emptyListingForm = {
    name: "",
    description: "",
    cuisine: "",
    category: "General",
    area: "",
    phone: "",
    availableDays: [],
    negotiationEnabled: true,
};

const emptyDishForm = {
    name: "",
    description: "",
    price: "",
    unit: "serving",
    minQty: "",
    maxQty: "",
    isAvailable: true,
};

function SellerListing() {
    const [listing, setListing] = useState(null);
    const [items, setItems] = useState([]);
    const [listingForm, setListingForm] = useState(emptyListingForm);
    const [bannerImage, setBannerImage] = useState(null);
    const [dishForm, setDishForm] = useState(emptyDishForm);
    const [dishImage, setDishImage] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingListing, setSavingListing] = useState(false);
    const [savingDish, setSavingDish] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadListing = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyListing();
            const savedListing = response.data.listing;
            const savedItems = response.data.items || [];

            setListing(savedListing);
            setItems(savedItems);

            if (savedListing) {
                setListingForm({
                    name: savedListing.name || "",
                    description: savedListing.description || "",
                    cuisine: savedListing.cuisine || "",
                    category: savedListing.category || "General",
                    area: savedListing.area || "",
                    phone: savedListing.phone || "",
                    availableDays: savedListing.availableDays || [],
                    negotiationEnabled: savedListing.negotiationEnabled !== false,
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Could not load your listing.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadListing();
    }, []);

    const handleListingChange = (e) => {
        const { name, value, type, checked } = e.target;

        setListingForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const toggleDay = (day) => {
        setListingForm((prev) => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter((item) => item !== day)
                : [...prev.availableDays, day],
        }));
    };

    const handleSaveListing = async (e) => {
        e.preventDefault();
        setSavingListing(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();
            formData.append("name", listingForm.name);
            formData.append("description", listingForm.description);
            formData.append("cuisine", listingForm.cuisine);
            formData.append("category", listingForm.category);
            formData.append("area", listingForm.area);
            formData.append("phone", listingForm.phone);
            formData.append("availableDays", JSON.stringify(listingForm.availableDays));
            formData.append("negotiationEnabled", String(listingForm.negotiationEnabled));

            if (bannerImage) {
                formData.append("bannerImage", bannerImage);
            }

            const response = await saveMyListing(formData);
            setListing(response.data.listing);
            setBannerImage(null);
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Could not save listing.");
        } finally {
            setSavingListing(false);
        }
    };

    const handleDishChange = (e) => {
        const { name, value, type, checked } = e.target;

        setDishForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const resetDishForm = () => {
        setDishForm(emptyDishForm);
        setDishImage(null);
        setEditingItemId(null);
    };

    const startEditingDish = (item) => {
        setEditingItemId(item._id);
        setDishForm({
            name: item.name || "",
            description: item.description || "",
            price: item.price ?? "",
            unit: item.unit || "serving",
            minQty: item.minQty ?? "",
            maxQty: item.maxQty ?? "",
            isAvailable: item.isAvailable !== false,
        });
        setDishImage(null);
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    const handleDishSubmit = async (e) => {
        e.preventDefault();
        setSavingDish(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();
            formData.append("name", dishForm.name);
            formData.append("description", dishForm.description);
            formData.append("price", dishForm.price);
            formData.append("unit", dishForm.unit);
            formData.append("minQty", dishForm.minQty);
            formData.append("maxQty", dishForm.maxQty);
            formData.append("isAvailable", String(dishForm.isAvailable));

            if (dishImage) {
                formData.append("image", dishImage);
            }

            const response = editingItemId
                ? await updateMenuItem(editingItemId, formData)
                : await createMenuItem(formData);

            setMessage(response.data.message);
            resetDishForm();
            await loadListing();
        } catch (err) {
            setError(err.response?.data?.message || "Could not save dish.");
        } finally {
            setSavingDish(false);
        }
    };

    const handleDeleteDish = async (id) => {
        const confirmed = window.confirm("Delete this dish from your menu?");
        if (!confirmed) return;

        try {
            setMessage("");
            setError("");
            const response = await deleteMenuItem(id);
            setMessage(response.data.message);
            await loadListing();
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete dish.");
        }
    };

    const handlePublishToggle = async () => {
        try {
            setMessage("");
            setError("");

            const response = await setListingPublished(!listing?.isPublished);
            setListing(response.data.listing);
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Could not update listing status.");
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <h3>Loading your catering listing...</h3>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Manage Catering Listing</h2>
                    <p className="text-muted mb-0">
                        Create the business profile and dishes customers will see in Feastify.
                    </p>
                </div>

                {listing && (
                    <button
                        type="button"
                        className={`btn ${listing.isPublished ? "btn-outline-danger" : "btn-success"}`}
                        onClick={handlePublishToggle}
                    >
                        {listing.isPublished ? "Unpublish Listing" : "Publish Listing"}
                    </button>
                )}
            </div>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {listing && (
                <div className={`alert ${listing.isPublished ? "alert-success" : "alert-warning"}`}>
                    Status: <strong>{listing.isPublished ? "Published" : "Draft"}</strong>
                </div>
            )}

            <div className="card shadow-sm mb-5">
                <div className="card-body p-4">
                    <h4 className="fw-bold mb-4">Business Information</h4>

                    <form onSubmit={handleSaveListing}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Business Name</label>
                                <input
                                    className="form-control"
                                    name="name"
                                    value={listingForm.name}
                                    onChange={handleListingChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Cuisine</label>
                                <input
                                    className="form-control"
                                    name="cuisine"
                                    value={listingForm.cuisine}
                                    onChange={handleListingChange}
                                    placeholder="Example: Bangladeshi, Indian"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    name="category"
                                    value={listingForm.category}
                                    onChange={handleListingChange}
                                >
                                    {CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Operating Area</label>
                                <input
                                    className="form-control"
                                    name="area"
                                    value={listingForm.area}
                                    onChange={handleListingChange}
                                    required
                                    placeholder="Example: Dhanmondi"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Business Phone</label>
                                <input
                                    className="form-control"
                                    name="phone"
                                    value={listingForm.phone}
                                    onChange={handleListingChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Banner Image</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setBannerImage(e.target.files?.[0] || null)}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    name="description"
                                    value={listingForm.description}
                                    onChange={handleListingChange}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label d-block">Operating Days</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {DAYS.map((day) => (
                                        <button
                                            type="button"
                                            key={day}
                                            className={`btn ${
                                                listingForm.availableDays.includes(day)
                                                    ? "btn-primary"
                                                    : "btn-outline-secondary"
                                            }`}
                                            onClick={() => toggleDay(day)}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="negotiationEnabled"
                                        name="negotiationEnabled"
                                        checked={listingForm.negotiationEnabled}
                                        onChange={handleListingChange}
                                    />
                                    <label className="form-check-label" htmlFor="negotiationEnabled">
                                        Allow customers to negotiate prices
                                    </label>
                                </div>
                            </div>
                        </div>

                        {listing?.bannerImage && (
                            <div className="mt-3">
                                <img
                                    src={listing.bannerImage}
                                    alt={listing.name}
                                    className="img-fluid rounded"
                                    style={{ maxHeight: "220px", objectFit: "cover" }}
                                />
                            </div>
                        )}

                        <button className="btn btn-primary mt-4" disabled={savingListing}>
                            {savingListing ? "Saving..." : "Save Business Listing"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="card shadow-sm mb-5">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">Current Menu</h4>
                        <span className="badge bg-primary">{items.length} dish(es)</span>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-muted mb-0">No dishes added yet.</p>
                    ) : (
                        <div className="row g-3">
                            {items.map((item) => (
                                <div className="col-md-6" key={item._id}>
                                    <div className="card h-100">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="card-img-top"
                                                style={{ height: "180px", objectFit: "cover" }}
                                            />
                                        )}
                                        <div className="card-body">
                                            <h5 className="card-title">{item.name}</h5>
                                            <p className="text-muted small">{item.description}</p>
                                            <p className="mb-1">
                                                <strong>Price:</strong> ৳{item.price} / {item.unit}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Daily quantity:</strong> {item.minQty} - {item.maxQty}
                                            </p>
                                            <p className="mb-3">
                                                <strong>Status:</strong>{" "}
                                                {item.isAvailable ? "Available" : "Hidden"}
                                            </p>

                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => startEditingDish(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDeleteDish(item._id)}
                                                >
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
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-4">
                    <h4 className="fw-bold mb-4">
                        {editingItemId ? "Edit Dish" : "Add New Dish"}
                    </h4>

                    {!listing && (
                        <div className="alert alert-warning">
                            Save your business listing before adding menu items.
                        </div>
                    )}

                    <form onSubmit={handleDishSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Dish Name</label>
                                <input
                                    className="form-control"
                                    name="name"
                                    value={dishForm.name}
                                    onChange={handleDishChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Price</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    name="price"
                                    value={dishForm.price}
                                    onChange={handleDishChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Unit</label>
                                <input
                                    className="form-control"
                                    name="unit"
                                    value={dishForm.unit}
                                    onChange={handleDishChange}
                                    placeholder="serving"
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Minimum Quantity</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="1"
                                    name="minQty"
                                    value={dishForm.minQty}
                                    onChange={handleDishChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Maximum Quantity</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="1"
                                    name="maxQty"
                                    value={dishForm.maxQty}
                                    onChange={handleDishChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Dish Image</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setDishImage(e.target.files?.[0] || null)}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">Dish Description</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    name="description"
                                    value={dishForm.description}
                                    onChange={handleDishChange}
                                />
                            </div>

                            {editingItemId && (
                                <div className="col-12">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="isAvailable"
                                            name="isAvailable"
                                            checked={dishForm.isAvailable}
                                            onChange={handleDishChange}
                                        />
                                        <label className="form-check-label" htmlFor="isAvailable">
                                            Dish is currently available
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="d-flex gap-2 mt-4">
                            <button
                                className="btn btn-primary"
                                disabled={!listing || savingDish}
                            >
                                {savingDish
                                    ? "Saving..."
                                    : editingItemId
                                      ? "Update Dish"
                                      : "Add Dish"}
                            </button>

                            {editingItemId && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={resetDishForm}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SellerListing;

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMyServiceRequests } from "../../services/requestService";
import { getEventWeather } from "../../services/weatherService";
import { fileComplaint, getMyComplaints } from "../../services/complaintService";

const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
};

function OrderTracking() {
    const location = useLocation();
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [weatherLoadingId, setWeatherLoadingId] = useState("");
    const [weatherCities, setWeatherCities] = useState({});
    const [weatherResults, setWeatherResults] = useState({});
    const [weatherErrors, setWeatherErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(
        location.state?.successMessage || ""
    );
    const [complaintOrderId, setComplaintOrderId] = useState("");
    const [complaintCategory, setComplaintCategory] = useState("Food Quality");
    const [complaintDetails, setComplaintDetails] = useState("");
    const [complaintImages, setComplaintImages] = useState([]);
    const [complaintSubmitting, setComplaintSubmitting] = useState(false);
    const [complaintError, setComplaintError] = useState("");
    const [complaintFiledIds, setComplaintFiledIds] = useState(new Set());

    useEffect(() => {
        const loadRequests = async () => {
            try {
                setError("");
                const [requestResponse, complaintResponse] = await Promise.all([
                    getMyServiceRequests(),
                    getMyComplaints(),
                ]);
                setRequests(requestResponse.data.requests || []);
                setComplaintFiledIds(
                    new Set((complaintResponse.data.complaints || []).map((item) => String(item.serviceRequest)))
                );
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                        "Could not load your service requests."
                );
            } finally {
                setLoading(false);
            }
        };

        loadRequests();

        if (location.state?.successMessage) {
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handlePayment = (request) => {
        const booking = {
            serviceRequestId: request._id,
            cateringId: request.catering,
            sellerId: request.seller,
            sellerEmail: request.sellerEmail,
            sellerName: request.sellerName,
            customerEmail: request.customerEmail,
            date: formatDate(request.eventDate),
            items: request.items,
        };

        navigate("/checkout/payment", {
            state: { booking },
        });
    };

    const handleCheckWeather = async (request) => {
        const city = weatherCities[request._id] || "Dhaka";

        try {
            setWeatherLoadingId(request._id);
            setWeatherErrors((current) => ({
                ...current,
                [request._id]: "",
            }));

            const result = await getEventWeather({
                city,
                eventDate: request.eventDate,
            });

            setWeatherResults((current) => ({
                ...current,
                [request._id]: result,
            }));
        } catch (weatherError) {
            setWeatherResults((current) => ({
                ...current,
                [request._id]: null,
            }));
            setWeatherErrors((current) => ({
                ...current,
                [request._id]:
                    weatherError.message || "Could not load event weather.",
            }));
        } finally {
            setWeatherLoadingId("");
        }
    };


    const resetComplaintForm = () => {
        setComplaintOrderId("");
        setComplaintCategory("Food Quality");
        setComplaintDetails("");
        setComplaintImages([]);
        setComplaintError("");
    };

    const handleSubmitComplaint = async (requestId) => {
        if (!complaintDetails.trim()) {
            setComplaintError("Please explain why you are filing this complaint.");
            return;
        }
        if (complaintImages.length > 5) {
            setComplaintError("You can upload up to 5 images.");
            return;
        }
        try {
            setComplaintSubmitting(true);
            setComplaintError("");
            await fileComplaint({
                serviceRequestId: requestId,
                category: complaintCategory,
                details: complaintDetails,
                images: complaintImages,
            });
            setComplaintFiledIds((current) => new Set([...current, String(requestId)]));
            setSuccessMessage("Complaint filed successfully. You can view it from Filed Complaints.");
            resetComplaintForm();
        } catch (err) {
            setComplaintError(err.response?.data?.message || "Could not file complaint.");
        } finally {
            setComplaintSubmitting(false);
        }
    };

    const statusBadge = (status) => {
        if (status === "approved") return "bg-success";
        if (status === "rejected") return "bg-danger";
        return "bg-warning text-dark";
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Live Order Tracking</h2>
                    <p className="text-muted mb-0">
                        Track whether your service requests are pending, approved or rejected.
                    </p>
                </div>
            </div>

            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show">
                    {successMessage}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccessMessage("")}
                    />
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                </div>
            ) : requests.length === 0 ? (
                <div className="card shadow-sm">
                    <div className="card-body text-center py-5">
                        <h4>No service requests yet</h4>
                        <p className="text-muted mb-0">
                            Send a request from your cart and it will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {requests.map((request) => (
                        <div className="col-12" key={request._id}>
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                                        <div>
                                            <div className="d-flex flex-wrap align-items-center gap-2">
                                                <h4 className="fw-bold mb-1">
                                                    {request.sellerName}
                                                </h4>
                                                {request.sourceType === "need_based" && (
                                                    <span className="badge bg-dark mb-1">Need-Based Order</span>
                                                )}
                                            </div>
                                            <div className="text-muted small">
                                                {request.sellerEmail}
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <span
                                                className={`badge ${statusBadge(
                                                    request.approvalStatus
                                                )} fs-6 text-capitalize`}
                                            >
                                                {request.approvalStatus}
                                            </span>
                                            {request.paymentStatus === "paid" && (
                                                <span className="badge bg-primary fs-6 ms-2">
                                                    Paid
                                                </span>
                                            )}
                                            <div className="text-muted small mt-2">
                                                Requested {formatDate(request.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <strong>Event Date</strong>
                                            <div>{formatDate(request.eventDate)}</div>
                                        </div>

                                        <div className="col-md-6">
                                            <strong>Payable Amount</strong>
                                            <div className="fw-bold text-primary">
                                                ৳{Number(
                                                    request.payableAmount || 0
                                                ).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {request.sourceType === "need_based" && request.needBasedDetails && (
                                        <div className="card border-primary-subtle mb-3">
                                            <div className="card-body">
                                                <h5 className="fw-bold mb-3">Your Custom Cooking Request</h5>
                                                <div className="row g-3 small">
                                                    <div className="col-md-6">
                                                        <strong>Event</strong>
                                                        <div>{request.needBasedDetails.eventName || "Custom event"}</div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <strong>Delivery Location</strong>
                                                        <div>{request.needBasedDetails.deliveryLocation || "-"}</div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <strong>Contact Number</strong>
                                                        <div>{request.needBasedDetails.contactNumber || "-"}</div>
                                                    </div>
                                                    <div className="col-12">
                                                        <strong>Preparation Details</strong>
                                                        <div style={{ whiteSpace: "pre-wrap" }}>
                                                            {request.needBasedDetails.preparationDetails || "-"}
                                                        </div>
                                                    </div>
                                                    {request.needBasedDetails.additionalNotes && (
                                                        <div className="col-12">
                                                            <strong>Additional Notes</strong>
                                                            <div style={{ whiteSpace: "pre-wrap" }}>
                                                                {request.needBasedDetails.additionalNotes}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {request.approvalStatus === "approved" && (
                                        <div className="card bg-light border-0 mb-3">
                                            <div className="card-body">
                                                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                                                    <div>
                                                        <strong>Event Weather</strong>
                                                        <div className="small text-muted">
                                                            Check the forecast for your catering event using Open-Meteo.
                                                        </div>
                                                    </div>
                                                    <span className="badge bg-info text-dark">External API</span>
                                                </div>

                                                <div className="row g-2 align-items-end">
                                                    <div className="col-md-8">
                                                        <label className="form-label small fw-semibold">
                                                            Event city or area
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="e.g. Dhaka"
                                                            value={weatherCities[request._id] ?? "Dhaka"}
                                                            onChange={(event) =>
                                                                setWeatherCities((current) => ({
                                                                    ...current,
                                                                    [request._id]: event.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-md-4 d-grid">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary"
                                                            onClick={() => handleCheckWeather(request)}
                                                            disabled={weatherLoadingId === request._id}
                                                        >
                                                            {weatherLoadingId === request._id
                                                                ? "Checking..."
                                                                : "Check Event Weather"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {weatherErrors[request._id] && (
                                                <div className="alert alert-danger rounded-0 rounded-bottom mb-0">
                                                    {weatherErrors[request._id]}
                                                </div>
                                            )}

                                            {weatherResults[request._id] && (
                                                <div className="border-top p-3">
                                                    {!weatherResults[request._id].forecastAvailable && (
                                                        <div className="alert alert-warning py-2 mb-3">
                                                            The event date is outside Open-Meteo's 16-day forecast window, so this is the nearest available weather preview for the selected location.
                                                        </div>
                                                    )}

                                                    <div className="d-flex flex-wrap justify-content-between gap-3">
                                                        <div>
                                                            <div className="fw-bold">
                                                                {weatherResults[request._id].locationName}
                                                            </div>
                                                            <div className="text-muted small">
                                                                {weatherResults[request._id].forecastAvailable
                                                                    ? `Forecast for ${formatDate(request.eventDate)}`
                                                                    : `Preview for ${weatherResults[request._id].forecastDate}`}
                                                            </div>
                                                        </div>
                                                        <div className="text-md-end">
                                                            <div className="fs-5 fw-bold">
                                                                {weatherResults[request._id].condition}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row g-3 mt-1">
                                                        <div className="col-sm-6 col-lg-3">
                                                            <div className="small text-muted">High</div>
                                                            <div className="fw-bold">
                                                                {weatherResults[request._id].maxTemperature}
                                                                {weatherResults[request._id].temperatureUnit}
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6 col-lg-3">
                                                            <div className="small text-muted">Low</div>
                                                            <div className="fw-bold">
                                                                {weatherResults[request._id].minTemperature}
                                                                {weatherResults[request._id].temperatureUnit}
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6 col-lg-3">
                                                            <div className="small text-muted">Rain chance</div>
                                                            <div className="fw-bold">
                                                                {weatherResults[request._id].rainChance ?? 0}%
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6 col-lg-3">
                                                            <div className="small text-muted">Max wind</div>
                                                            <div className="fw-bold">
                                                                {weatherResults[request._id].maxWindSpeed} {weatherResults[request._id].windUnit}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Dish</th>
                                                    <th>Price / Serving</th>
                                                    <th>Servings</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {request.items.map((item, index) => (
                                                    <tr key={`${request._id}-${index}`}>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                {item.image && (
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.foodName}
                                                                        style={{
                                                                            width: "52px",
                                                                            height: "52px",
                                                                            objectFit: "cover",
                                                                            borderRadius: "8px",
                                                                        }}
                                                                    />
                                                                )}
                                                                <span>{item.foodName}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            ৳{Number(
                                                                item.pricePerServing
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td>{item.servings}</td>
                                                        <td>
                                                            ৳{(
                                                                item.pricePerServing *
                                                                item.servings
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {request.approvalStatus === "pending" && (
                                        <div className="alert alert-warning mb-0">
                                            Waiting for the caterer to respond to this request.
                                        </div>
                                    )}

                                    {request.approvalStatus === "rejected" && (
                                        <div className="alert alert-danger mb-0">
                                            <strong>Request rejected.</strong>
                                        </div>
                                    )}

                                    {request.approvalStatus === "approved" &&
                                        request.paymentStatus === "unpaid" && (
                                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 alert alert-success mb-0">
                                                <div>
                                                    <strong>Request approved.</strong>
                                                    <div className="small">
                                                        You can now continue to payment.
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn btn-success"
                                                    onClick={() => handlePayment(request)}
                                                >
                                                    Proceed to Payment
                                                </button>
                                            </div>
                                        )}

                                    {request.approvalStatus === "approved" &&
                                        request.paymentStatus === "paid" &&
                                        request.deliveryStatus !== "delivered" && (
                                            <div className="d-grid gap-2">
                                                <div className="alert alert-primary mb-0">
                                                    <strong>Payment completed.</strong>
                                                    <div className="small">
                                                        The caterer will update this order after delivery or handover.
                                                    </div>
                                                </div>

                                                {request.orderProgressStatus === "preparing" && (
                                                    <div className="alert alert-warning mb-0">
                                                        <strong>Food is being prepared.</strong>
                                                        <div className="small">
                                                            The caterer has started preparing your order
                                                            {request.orderProgressUpdatedAt
                                                                ? ` · Updated ${new Date(request.orderProgressUpdatedAt).toLocaleString()}`
                                                                : ""}.
                                                        </div>
                                                    </div>
                                                )}

                                                {request.orderProgressStatus === "on_the_way" && (
                                                    <div className="alert alert-info mb-0">
                                                        <strong>Your order is on the way.</strong>
                                                        <div className="small">
                                                            The caterer has marked the food as being delivered
                                                            {request.orderProgressUpdatedAt
                                                                ? ` · Updated ${new Date(request.orderProgressUpdatedAt).toLocaleString()}`
                                                                : ""}.
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    {request.deliveryStatus === "delivered" && (
                                        <div className="d-grid gap-3">
                                            <div className="alert alert-success mb-0">
                                                <div className="d-flex flex-wrap justify-content-between gap-3 align-items-center">
                                                    <div>
                                                        <strong>Order delivered.</strong>
                                                        <div className="small">
                                                            Delivery completed {request.deliveredAt
                                                                ? new Date(request.deliveredAt).toLocaleString()
                                                                : ""}.
                                                        </div>
                                                    </div>
                                                    {request.deliveryProofImage && (
                                                        <a href={request.deliveryProofImage} target="_blank" rel="noreferrer">
                                                            <img src={request.deliveryProofImage} alt="Delivery proof" className="rounded" style={{ width: "110px", height: "80px", objectFit: "cover" }} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {complaintFiledIds.has(String(request._id)) ? (
                                                <div className="alert alert-secondary mb-0">
                                                    <strong>Complaint filed for this order.</strong>
                                                    <div className="small">Open Filed Complaints from the navbar to view the complete record.</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger align-self-start"
                                                        onClick={() => {
                                                            setComplaintOrderId(complaintOrderId === request._id ? "" : request._id);
                                                            setComplaintError("");
                                                        }}
                                                    >
                                                        {complaintOrderId === request._id ? "Close Complaint Form" : "File Complaint"}
                                                    </button>

                                                    {complaintOrderId === request._id && (
                                                        <div className="card border-danger-subtle">
                                                            <div className="card-body">
                                                                <h5 className="fw-bold">File Complaint</h5>
                                                                <p className="text-muted small">Describe the issue with this completed delivery. You may upload up to 5 supporting images.</p>
                                                                {complaintError && <div className="alert alert-danger py-2">{complaintError}</div>}
                                                                <div className="mb-3">
                                                                    <label className="form-label fw-semibold">Complaint Type</label>
                                                                    <select className="form-select" value={complaintCategory} onChange={(e) => setComplaintCategory(e.target.value)}>
                                                                        <option>Food Quality</option>
                                                                        <option>Wrong or Missing Items</option>
                                                                        <option>Late Delivery</option>
                                                                        <option>Packaging Issue</option>
                                                                        <option>Quantity or Serving Issue</option>
                                                                        <option>Other</option>
                                                                    </select>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label fw-semibold">Complaint Details</label>
                                                                    <textarea className="form-control" rows="4" maxLength="3000" value={complaintDetails} onChange={(e) => setComplaintDetails(e.target.value)} placeholder="Explain what went wrong with the delivered order..." />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label fw-semibold">Evidence Images (optional)</label>
                                                                    <input className="form-control" type="file" accept="image/*" multiple onChange={(e) => setComplaintImages(Array.from(e.target.files || []).slice(0, 5))} />
                                                                    <div className="form-text">Maximum 5 images, up to 5 MB each.</div>
                                                                </div>
                                                                <button type="button" className="btn btn-danger" disabled={complaintSubmitting} onClick={() => handleSubmitComplaint(request._id)}>
                                                                    {complaintSubmitting ? "Submitting..." : "Submit Complaint"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderTracking;

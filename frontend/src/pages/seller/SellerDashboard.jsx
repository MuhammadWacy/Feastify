import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    getIncomingServiceRequests,
    updateServiceRequestApproval,
    updateServiceRequestProgress,
} from "../../services/requestService";

const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
};

function SellerDashboard() {
    const location = useLocation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState(location.state?.successMessage || "");
    const [updatingId, setUpdatingId] = useState("");
    const [progressUpdatingId, setProgressUpdatingId] = useState("");

    const loadRequests = async () => {
        try {
            setError("");
            const response = await getIncomingServiceRequests();
            setRequests(response.data.requests || []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not load incoming service requests."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const answerRequest = async (requestId, status) => {
        setUpdatingId(requestId);
        setError("");
        setMessage("");

        try {
            const response = await updateServiceRequestApproval(
                requestId,
                status
            );

            setRequests((current) =>
                current.map((request) =>
                    request._id === requestId
                        ? response.data.request
                        : request
                )
            );

            setMessage(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not update the service request."
            );
        } finally {
            setUpdatingId("");
        }
    };

    const updateProgress = async (requestId, status) => {
        setProgressUpdatingId(requestId);
        setError("");
        setMessage("");

        try {
            const response = await updateServiceRequestProgress(requestId, status);

            setRequests((current) =>
                current.map((request) =>
                    request._id === requestId
                        ? response.data.request
                        : request
                )
            );

            setMessage(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not update the order progress."
            );
        } finally {
            setProgressUpdatingId("");
        }
    };

    const progressLabel = (status) => {
        if (status === "preparing") return "Preparing Food";
        if (status === "on_the_way") return "On the Way";
        return "No live update";
    };

    const badgeClass = (status) => {
        if (status === "approved") return "bg-success";
        if (status === "rejected") return "bg-danger";
        return "bg-warning text-dark";
    };

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Seller Dashboard</h2>
                <p className="text-muted mb-0">
                    Review service requests sent by customers.
                </p>
            </div>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                </div>
            ) : requests.length === 0 ? (
                <div className="card shadow-sm">
                    <div className="card-body text-center py-5">
                        <h4>No incoming requests</h4>
                        <p className="text-muted mb-0">
                            Customer service requests will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="d-grid gap-4">
                    {requests.map((request) => (
                        <div className="card shadow-sm border-0" key={request._id}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
                                    <div>
                                        <div className="d-flex flex-wrap align-items-center gap-2">
                                            <h4 className="fw-bold mb-1">
                                                {request.customerName}
                                            </h4>
                                            {request.sourceType === "need_based" && (
                                                <span className="badge bg-dark mb-1">Need-Based Order</span>
                                            )}
                                        </div>
                                        <div className="text-muted">
                                            {request.customerEmail}
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <span
                                            className={`badge ${badgeClass(
                                                request.approvalStatus
                                            )} fs-6 text-capitalize`}
                                        >
                                            {request.approvalStatus}
                                        </span>
                                        <div className="small text-muted mt-2">
                                            Sent {formatDate(request.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <strong>Catering Listing</strong>
                                        <div>{request.sellerName}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <strong>Event Date</strong>
                                        <div>{formatDate(request.eventDate)}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <strong>Payable Amount</strong>
                                        <div className="fw-bold text-primary">
                                            ৳{Number(
                                                request.payableAmount || 0
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {request.sourceType === "need_based" && request.needBasedDetails && (
                                    <div className="card bg-light border-0 mb-4">
                                        <div className="card-body">
                                            <h5 className="fw-bold mb-3">Customer Custom Cooking Details</h5>
                                            <div className="row g-3 small">
                                                <div className="col-md-4">
                                                    <strong>Event</strong>
                                                    <div>{request.needBasedDetails.eventName || "Custom event"}</div>
                                                </div>
                                                <div className="col-md-4">
                                                    <strong>Delivery Location</strong>
                                                    <div>{request.needBasedDetails.deliveryLocation || "-"}</div>
                                                </div>
                                                <div className="col-md-4">
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

                                <div className="table-responsive">
                                    <table className="table align-middle">
                                        <thead>
                                            <tr>
                                                <th>Dish</th>
                                                <th>Price / Serving</th>
                                                <th>Servings</th>
                                                <th>Subtotal</th>
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
                                                                        width: "55px",
                                                                        height: "55px",
                                                                        objectFit: "cover",
                                                                        borderRadius: "8px",
                                                                    }}
                                                                />
                                                            )}
                                                            <span className="fw-semibold">
                                                                {item.foodName}
                                                            </span>
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

                                {request.approvalStatus === "pending" ? (
                                    <div className="d-flex gap-2 justify-content-end mt-3">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            disabled={updatingId === request._id}
                                            onClick={() =>
                                                answerRequest(
                                                    request._id,
                                                    "rejected"
                                                )
                                            }
                                        >
                                            {updatingId === request._id
                                                ? "Updating..."
                                                : "Reject Request"}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            disabled={updatingId === request._id}
                                            onClick={() =>
                                                answerRequest(
                                                    request._id,
                                                    "approved"
                                                )
                                            }
                                        >
                                            {updatingId === request._id
                                                ? "Updating..."
                                                : "Approve Request"}
                                        </button>
                                    </div>
                                ) : request.approvalStatus === "rejected" ? (
                                    <div className="alert alert-danger mb-0 mt-3">
                                        This request has been rejected.
                                    </div>
                                ) : request.paymentStatus === "paid" ? (
                                    <div className="mt-3">
                                        <div className="alert alert-primary mb-3">
                                            This request has been approved and paid.
                                        </div>

                                        {request.deliveryStatus !== "delivered" ? (
                                            <div className="border rounded p-3 bg-light">
                                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                                    <div>
                                                        <strong>Live Order Status</strong>
                                                        <div className="small text-muted">
                                                            Update the customer only when there is a real preparation or delivery progress change.
                                                        </div>
                                                    </div>
                                                    <span className={`badge ${
                                                        request.orderProgressStatus === "preparing"
                                                            ? "bg-warning text-dark"
                                                            : request.orderProgressStatus === "on_the_way"
                                                                ? "bg-info text-dark"
                                                                : "bg-secondary"
                                                    }`}>
                                                        {progressLabel(request.orderProgressStatus)}
                                                    </span>
                                                </div>

                                                <div className="d-flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-warning"
                                                        disabled={
                                                            progressUpdatingId === request._id ||
                                                            request.orderProgressStatus === "preparing"
                                                        }
                                                        onClick={() => updateProgress(request._id, "preparing")}
                                                    >
                                                        Mark Preparing Food
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-info"
                                                        disabled={
                                                            progressUpdatingId === request._id ||
                                                            request.orderProgressStatus === "on_the_way"
                                                        }
                                                        onClick={() => updateProgress(request._id, "on_the_way")}
                                                    >
                                                        Mark On the Way
                                                    </button>

                                                    {request.orderProgressStatus && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            disabled={progressUpdatingId === request._id}
                                                            onClick={() => updateProgress(request._id, "")}
                                                        >
                                                            Clear Live Update
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="alert alert-success mb-0">
                                                Delivery has already been completed.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="alert alert-success mb-0 mt-3">
                                        This request has been approved and is waiting for customer payment.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SellerDashboard;

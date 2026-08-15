import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMyServiceRequests } from "../../services/requestService";

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
    const [successMessage, setSuccessMessage] = useState(
        location.state?.successMessage || ""
    );

    useEffect(() => {
        const loadRequests = async () => {
            try {
                setError("");
                const response = await getMyServiceRequests();
                setRequests(response.data.requests || []);
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
                                            <h4 className="fw-bold mb-1">
                                                {request.sellerName}
                                            </h4>
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
                                        request.paymentStatus === "paid" && (
                                            <div className="alert alert-primary mb-0">
                                                <strong>Payment completed.</strong>
                                                <div className="small">
                                                    This order has already been paid successfully.
                                                </div>
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

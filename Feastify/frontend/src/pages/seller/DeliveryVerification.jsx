import { useEffect, useState } from "react";
import {
    getIncomingServiceRequests,
    markServiceRequestDelivered,
} from "../../services/requestService";

const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString();
};

function DeliveryVerification() {
    const [orders, setOrders] = useState([]);
    const [files, setFiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadOrders = async () => {
        try {
            setError("");
            const response = await getIncomingServiceRequests();
            const eligible = (response.data.requests || []).filter(
                (order) =>
                    order.approvalStatus === "approved" &&
                    order.paymentStatus === "paid"
            );
            setOrders(eligible);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not load paid orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const completeDelivery = async (orderId) => {
        const proofImage = files[orderId];

        if (!proofImage) {
            setError("Choose a delivery location photo first.");
            return;
        }

        setSubmittingId(orderId);
        setMessage("");
        setError("");

        try {
            const response = await markServiceRequestDelivered(
                orderId,
                proofImage
            );

            setOrders((current) =>
                current.map((order) =>
                    order._id === orderId
                        ? response.data.request
                        : order
                )
            );

            setFiles((current) => ({
                ...current,
                [orderId]: null,
            }));

            setMessage(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not complete delivery verification."
            );
        } finally {
            setSubmittingId("");
        }
    };

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Delivery Verification</h2>
                <p className="text-muted mb-0">
                    Complete paid orders and upload a delivery location photo as proof of work.
                </p>
            </div>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                </div>
            ) : orders.length === 0 ? (
                <div className="card shadow-sm border-0">
                    <div className="card-body text-center py-5">
                        <h4>No paid orders ready for verification</h4>
                        <p className="text-muted mb-0">
                            Approved and paid customer orders will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="d-grid gap-4">
                    {orders.map((order) => (
                        <div className="card shadow-sm border-0" key={order._id}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
                                    <div>
                                        <h4 className="fw-bold mb-1">
                                            {order.customerName}
                                        </h4>
                                        <div className="text-muted">
                                            {order.customerEmail}
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <span
                                            className={`badge fs-6 ${
                                                order.deliveryStatus === "delivered"
                                                    ? "bg-success"
                                                    : "bg-warning text-dark"
                                            }`}
                                        >
                                            {order.deliveryStatus === "delivered"
                                                ? "Delivered"
                                                : "Ready for Delivery"}
                                        </span>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <strong>Event Date</strong>
                                        <div>{formatDate(order.eventDate)}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <strong>Total Paid</strong>
                                        <div className="fw-bold text-primary">
                                            ৳{Number(order.payableAmount || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <strong>Payment</strong>
                                        <div className="text-success fw-semibold">
                                            Paid
                                        </div>
                                    </div>
                                </div>

                                <div className="table-responsive mb-4">
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
                                            {order.items.map((item, index) => (
                                                <tr key={`${order._id}-${index}`}>
                                                    <td>{item.foodName}</td>
                                                    <td>
                                                        ৳{Number(item.pricePerServing).toLocaleString()}
                                                    </td>
                                                    <td>{item.servings}</td>
                                                    <td>
                                                        ৳{Number(
                                                            item.pricePerServing * item.servings
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {order.deliveryStatus === "delivered" ? (
                                    <div className="row g-3 align-items-center">
                                        <div className="col-md-8">
                                            <div className="alert alert-success mb-0">
                                                <strong>Delivery completed</strong>
                                                <div className="small">
                                                    Completed {formatDate(order.deliveredAt)}
                                                </div>
                                                <div className="small mt-1">
                                                    Customer notification: {order.deliveryNotificationSent
                                                        ? "Sent"
                                                        : "Not confirmed"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 text-md-end">
                                            {order.deliveryProofImage && (
                                                <a
                                                    href={order.deliveryProofImage}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <img
                                                        src={order.deliveryProofImage}
                                                        alt="Delivery proof"
                                                        className="img-fluid rounded"
                                                        style={{ maxHeight: "150px" }}
                                                    />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border rounded p-3 bg-light">
                                        <label className="form-label fw-semibold">
                                            Delivery Location Proof Photo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-control mb-3"
                                            onChange={(event) =>
                                                setFiles((current) => ({
                                                    ...current,
                                                    [order._id]: event.target.files?.[0] || null,
                                                }))
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            disabled={submittingId === order._id}
                                            onClick={() => completeDelivery(order._id)}
                                        >
                                            {submittingId === order._id
                                                ? "Completing Delivery..."
                                                : "Complete Delivery & Notify Customer"}
                                        </button>
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

export default DeliveryVerification;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyRequests, getRequestById } from "../../services/requestService";

const STEPS = [
    { key: "pending", label: "Request Submitted" },
    { key: "accepted", label: "Accepted by Caterer" },
    { key: "preparing", label: "Food Preparing" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "completed", label: "Completed" },
];

function OrderTracking() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getMyRequests();
                setOrders(response.data.requests);

                if (!id && response.data.requests.length > 0) {
                    navigate(`/customer/orders/${response.data.requests[0]._id}`, {
                        replace: true,
                    });
                }
            } catch (error) {
                setMessage(
                    error.response?.data?.message || "Failed to load orders."
                );
            }
        };

        fetchOrders();
    }, [id, navigate]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;

            try {
                const response = await getRequestById(id);
                setSelectedOrder(response.data.request);
            } catch (error) {
                setMessage(
                    error.response?.data?.message || "Failed to load order."
                );
            }
        };

        fetchOrder();
    }, [id]);

    const currentStepIndex = selectedOrder
        ? STEPS.findIndex((step) => step.key === selectedOrder.status)
        : -1;

    return (
        <div className="container mt-5">

            <h2 className="mb-4">Order Tracking</h2>

            {message && (
                <div className="alert alert-info">{message}</div>
            )}

            <div className="row g-4">

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header fw-bold">Your Orders</div>
                        <div className="list-group list-group-flush">
                            {orders.map((order) => (
                                <button
                                    key={order._id}
                                    type="button"
                                    className={`list-group-item list-group-item-action ${order._id === id ? "active" : ""}`}
                                    onClick={() => navigate(`/customer/orders/${order._id}`)}
                                >
                                    <div className="fw-bold">
                                        {order.caterer?.fullName}
                                    </div>
                                    <div className="small">
                                        {new Date(order.eventDate).toLocaleDateString()}
                                    </div>
                                    <span
                                        className={`badge ${order.status === "rejected" ? "bg-danger" : order.status === "completed" ? "bg-success" : "bg-warning text-dark"}`}
                                    >
                                        {order.status}
                                    </span>
                                </button>
                            ))}

                            {orders.length === 0 && (
                                <div className="list-group-item text-muted">
                                    No orders yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    {selectedOrder && (
                        <div className="card">
                            <div className="card-body">

                                <h4>{selectedOrder.caterer?.fullName}</h4>

                                {selectedOrder.items.map((item) => (
                                    <p key={item.foodName} className="fw-bold">
                                        {item.foodName} X {item.servings} ={" "}
                                        <span className="text-primary">
                                            {item.pricePerServing * item.servings} BDT
                                        </span>
                                    </p>
                                ))}

                                {selectedOrder.status === "rejected" ? (
                                    <div className="alert alert-danger mt-3">
                                        This request was rejected by the caterer.
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        {STEPS.map((step, index) => (
                                            <div
                                                key={step.key}
                                                className="d-flex align-items-center gap-2 mb-2"
                                            >
                                                <span
                                                    className={`rounded-circle d-inline-block ${index <= currentStepIndex ? "bg-primary" : "bg-secondary"}`}
                                                    style={{ width: "16px", height: "16px" }}
                                                />
                                                <span
                                                    className={index <= currentStepIndex ? "text-primary fw-bold" : "text-muted"}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <hr />

                                <h6>Delivery Details</h6>
                                <p className="mb-1">Address: {selectedOrder.location}</p>
                                <p className="mb-1">
                                    Recipient: {selectedOrder.customer?.fullName}
                                </p>
                                <p className="mb-3">
                                    Phone: {selectedOrder.customer?.phone}
                                </p>

                                <a
                                    className="btn btn-primary"
                                    href={`mailto:${selectedOrder.caterer?.email}`}
                                >
                                    Contact Caterer
                                </a>

                            </div>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}

export default OrderTracking;

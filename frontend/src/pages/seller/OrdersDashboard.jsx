import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getIncomingRequests,
    getRequestById,
    respondToRequest,
    advanceRequestStatus,
} from "../../services/requestService";

const NEXT_STATUS_LABEL = {
    preparing: "Mark as Out for Delivery",
    out_for_delivery: "Mark as Completed",
};

function OrdersDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    const loadOrders = async () => {
        try {
            const response = await getIncomingRequests();
            setOrders(response.data.requests);

            if (!id && response.data.requests.length > 0) {
                navigate(`/seller/orders/${response.data.requests[0]._id}`, {
                    replace: true,
                });
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to load orders."
            );
        }
    };

    const loadSelectedOrder = async () => {
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

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        loadSelectedOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleRespond = async (status) => {
        setBusy(true);
        setMessage("");

        try {
            await respondToRequest(id, status);
            await loadOrders();
            await loadSelectedOrder();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to update request."
            );
        } finally {
            setBusy(false);
        }
    };

    const handleAdvance = async () => {
        setBusy(true);
        setMessage("");

        try {
            await advanceRequestStatus(id);
            await loadOrders();
            await loadSelectedOrder();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to update order status."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="container mt-5">

            <h2 className="mb-4">Order Requests</h2>

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
                                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                                >
                                    <div className="fw-bold">
                                        {order.customer?.fullName}
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
                                    No requests yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    {selectedOrder && (
                        <div className="card">
                            <div className="card-body">

                                {selectedOrder.items.map((item) => (
                                    <p key={item.foodName} className="fw-bold">
                                        {item.foodName} X {item.servings} ={" "}
                                        <span className="text-primary">
                                            {item.pricePerServing * item.servings} BDT
                                        </span>
                                    </p>
                                ))}

                                <div className="mb-3">
                                    <span
                                        className={`badge ${selectedOrder.status === "rejected" ? "bg-danger" : selectedOrder.status === "completed" ? "bg-success" : "bg-warning text-dark"}`}
                                    >
                                        {selectedOrder.status}
                                    </span>
                                </div>

                                {selectedOrder.status === "pending" && (
                                    <div className="d-flex gap-2 mb-3">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={busy}
                                            onClick={() => handleRespond("accepted")}
                                        >
                                            Accept order
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            disabled={busy}
                                            onClick={() => handleRespond("rejected")}
                                        >
                                            Decline order
                                        </button>
                                    </div>
                                )}

                                {NEXT_STATUS_LABEL[selectedOrder.status] && (
                                    <button
                                        type="button"
                                        className="btn btn-primary mb-3"
                                        disabled={busy}
                                        onClick={handleAdvance}
                                    >
                                        {NEXT_STATUS_LABEL[selectedOrder.status]}
                                    </button>
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

                            </div>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}

export default OrdersDashboard;

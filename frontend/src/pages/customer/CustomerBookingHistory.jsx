import { useEffect, useMemo, useState } from "react";
import BookingHistoryList from "../../components/history/BookingHistoryList";
import { getCustomerBookingHistory } from "../../services/requestService";

function CustomerBookingHistory() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getCustomerBookingHistory()
            .then((response) => setRequests(response.data.requests || []))
            .catch((err) => setError(err.response?.data?.message || "Could not load booking history."))
            .finally(() => setLoading(false));
    }, []);

    const totalSpent = useMemo(
        () => requests.reduce((sum, request) => sum + Number(request.payableAmount || 0), 0),
        [requests]
    );

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Service Booking History</h2>
                <p className="text-muted mb-0">
                    A permanent view of your catering services after delivery verification is completed.
                </p>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100"><div className="card-body">
                        <div className="text-muted small">Completed Bookings</div>
                        <div className="display-6 fw-bold">{requests.length}</div>
                    </div></div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100"><div className="card-body">
                        <div className="text-muted small">Total Paid Across Completed Bookings</div>
                        <div className="display-6 fw-bold">৳{totalSpent.toLocaleString()}</div>
                    </div></div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
            ) : (
                <BookingHistoryList requests={requests} perspective="customer" />
            )}
        </div>
    );
}

export default CustomerBookingHistory;

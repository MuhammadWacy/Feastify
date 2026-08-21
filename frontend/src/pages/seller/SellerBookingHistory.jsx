import { useEffect, useMemo, useState } from "react";
import BookingHistoryList from "../../components/history/BookingHistoryList";
import { getSellerBookingHistory } from "../../services/requestService";

function SellerBookingHistory() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getSellerBookingHistory()
            .then((response) => setRequests(response.data.requests || []))
            .catch((err) => setError(err.response?.data?.message || "Could not load service history."))
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = useMemo(
        () => requests.reduce((sum, request) => sum + Number(request.payableAmount || 0), 0),
        [requests]
    );

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Service Booking History</h2>
                <p className="text-muted mb-0">
                    Your completed catering services. Only delivery-verified orders are listed here.
                </p>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100"><div className="card-body">
                        <div className="text-muted small">Completed Services</div>
                        <div className="display-6 fw-bold">{requests.length}</div>
                    </div></div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100"><div className="card-body">
                        <div className="text-muted small">Revenue From Completed Services</div>
                        <div className="display-6 fw-bold">৳{totalRevenue.toLocaleString()}</div>
                    </div></div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
            ) : (
                <BookingHistoryList requests={requests} perspective="seller" />
            )}
        </div>
    );
}

export default SellerBookingHistory;

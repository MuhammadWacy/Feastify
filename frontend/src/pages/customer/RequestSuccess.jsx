import { Navigate, useLocation, useNavigate } from "react-router-dom";

function RequestSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    const requestId = location.state?.requestId;

    if (!requestId) {
        return <Navigate to="/customer/home" replace />;
    }

    return (
        <div className="container mt-5 d-flex flex-column align-items-center text-center">

            <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center mb-4"
                style={{ width: "80px", height: "80px" }}
            >
                <span className="text-white fs-1">✓</span>
            </div>

            <h3>Request Submitted Successfully</h3>

            <div className="d-flex flex-column gap-2 mt-4" style={{ width: "250px" }}>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/customer/orders/${requestId}`)}
                >
                    Track Order
                </button>

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/customer/home")}
                >
                    Back to Home
                </button>
            </div>

        </div>
    );
}

export default RequestSuccess;

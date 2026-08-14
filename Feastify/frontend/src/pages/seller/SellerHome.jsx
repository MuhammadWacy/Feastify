import { useNavigate } from "react-router-dom";

function SellerHome() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("name") || "Seller";

    return (
        <div className="container py-5">
            <div className="card shadow-sm">
                <div className="card-body p-5">
                    <h2 className="fw-bold">Welcome, {userName}</h2>
                    <p className="text-muted">
                        Manage your catering business and publish dishes for Feastify customers.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/seller/listing")}
                    >
                        Manage Catering Listing
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SellerHome;

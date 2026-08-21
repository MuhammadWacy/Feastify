import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";
import { createServiceRequest } from "../../services/requestService";

function SellerCart({ seller, onRequestSuccess }) {
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const subtotal = seller.items.reduce(
        (total, item) => total + item.pricePerServing * item.servings,
        0
    );

    const totalServings = seller.items.reduce(
        (total, item) => total + item.servings,
        0
    );

    const handleRequestService = async () => {
        setSubmitting(true);
        setError("");

        try {
            const response = await createServiceRequest(seller);

            if (onRequestSuccess) {
                onRequestSuccess(seller);
            }

            navigate("/customer/orders", {
                state: {
                    successMessage:
                        response.data.message || "Service request sent successfully.",
                },
            });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Could not send the service request. Please try again."
            );
            setSubmitting(false);
        }
    };

    return (
        <div className="seller-card shadow-sm">
            <div className="seller-header">
                <div>
                    <h4 className="mb-1">🏢 {seller.sellerName}</h4>
                    <small className="text-muted">{seller.sellerEmail}</small>
                </div>
            </div>

            <hr />

            <div className="row mb-4">
                <div className="col-md-6">
                    <strong>Customer</strong>
                    <p className="mb-0">{seller.customerEmail || "Not available"}</p>
                </div>

                <div className="col-md-6">
                    <strong>Event Date</strong>
                    <p className="mb-0">{seller.date}</p>
                </div>
            </div>

            <div>
                {seller.items.map((item, index) => (
                    <CartItem key={index} item={item} />
                ))}
            </div>

            <OrderSummary
                itemCount={seller.items.length}
                totalServings={totalServings}
                subtotal={subtotal}
            />

            {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

            <div className="d-grid mt-4">
                <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleRequestService}
                    disabled={submitting}
                >
                    {submitting ? "Sending Request..." : "Request Service"}
                </button>
            </div>
        </div>
    );
}

export default SellerCart;

import React from "react";
import { useNavigate } from "react-router-dom";

import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";

function SellerCart({ seller }) {

    const navigate = useNavigate();

    const subtotal = seller.items.reduce(
        (total, item) =>
            total + item.pricePerServing * item.servings,
        0
    );

    const totalServings = seller.items.reduce(
        (total, item) =>
            total + item.servings,
        0
    );

    const handleRequestService = () => {

        console.log("Booking Request:", seller);

        navigate("/checkout/payment", {
            state: {
                booking: seller,
            },
        });

    };

    return (

        <div className="seller-card shadow-sm">

            {/* Seller Header */}

            <div className="seller-header">

                <div>

                    <h4 className="mb-1">
                        🏢 {seller.sellerName}
                    </h4>

                    <small className="text-muted">
                        {seller.sellerEmail}
                    </small>

                </div>

            </div>

            <hr />

            {/* Customer Information */}

            <div className="row mb-4">

                <div className="col-md-6">

                    <strong>Customer</strong>

                    <p className="mb-0">
                        {seller.customerEmail || "Not available"}
                    </p>

                </div>

                <div className="col-md-6">

                    <strong>Event Date</strong>

                    <p className="mb-0">
                        {seller.date}
                    </p>

                </div>

            </div>

            {/* Food Items */}

            <div>

                {seller.items.map((item, index) => (

                    <CartItem
                        key={index}
                        item={item}
                    />

                ))}

            </div>

            {/* Summary */}

            <OrderSummary
                itemCount={seller.items.length}
                totalServings={totalServings}
                subtotal={subtotal}
            />

            <div className="d-grid mt-4">

                <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleRequestService}
                >
                    Request Service
                </button>

            </div>

        </div>

    );
}

export default SellerCart;
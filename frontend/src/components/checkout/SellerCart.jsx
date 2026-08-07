import React from "react";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";

function SellerCart({ seller }) {

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

        /*
            This is where your teammate's
            Booking Request API will be called.

            Example later:

            await API.post("/booking/request", seller);
        */

        console.log("Booking Request:", seller);

        alert(
            `Booking request sent to ${seller.sellerName}`
        );

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

                        {seller.customerEmail}

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

                {

                    seller.items.map((item, index) => (

                        <CartItem
                            key={index}
                            item={item}
                        />

                    ))

                }

            </div>

            {/* Summary */}

            <OrderSummary
                itemCount={seller.items.length}
                totalServings={totalServings}
                subtotal={subtotal}
            />

            <div className="d-grid mt-4">

                <button
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
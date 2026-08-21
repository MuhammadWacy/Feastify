import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BookingSummary from "../../components/payment/BookingSummary";
import PaymentMethods from "../../components/payment/PaymentMethods";
import PaymentButton from "../../components/payment/PaymentButton";

function Checkout() {

    const navigate = useNavigate();
    const location = useLocation();

    const booking = location.state?.booking;

    const [selectedMethod, setSelectedMethod] = useState("");

    /*
     * If someone opens /checkout/payment directly
     * without coming from the Cart, there is no booking.
     */
    if (!booking) {

        return (
            <div className="container py-5">

                <div className="row justify-content-center">

                    <div className="col-md-7">

                        <div className="card shadow-sm">

                            <div className="card-body text-center p-5">

                                <h2 className="fw-bold mb-3">
                                    Booking Not Found
                                </h2>

                                <p className="text-muted mb-4">
                                    Please select a catering service
                                    from your cart before proceeding
                                    to checkout.
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate("/customer/cart")
                                    }
                                >
                                    Return to Cart
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    const handlePayment = () => {

        if (!selectedMethod) {
            return;
        }

        navigate("/checkout/processing", {
            state: {
                booking,
                paymentMethod: selectedMethod,
            },
        });

    };

    return (

        <div className="container py-5">

            {/* Page Header */}

            <div className="text-center mb-5">

                <h1 className="fw-bold">
                    Checkout
                </h1>

                <p className="text-muted">
                    Review your booking and complete your payment.
                </p>

            </div>

            {/* Checkout Content */}

            <div className="row g-4">

                {/* Booking Summary */}

                <div className="col-lg-7">

                    <BookingSummary
                        booking={booking}
                    />

                </div>

                {/* Payment Section */}

                <div className="col-lg-5">

                    <PaymentMethods
                        selectedMethod={selectedMethod}
                        onMethodChange={setSelectedMethod}
                    />

                    <div className="mt-4">

                        <PaymentButton
                            onClick={handlePayment}
                            disabled={!selectedMethod}
                        />

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Checkout;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BookingSummary from "../../components/payment/BookingSummary";
import PaymentMethods from "../../components/payment/PaymentMethods";
import PaymentButton from "../../components/payment/PaymentButton";

import mockCheckout from "../../data/mockCheckout";

function Checkout() {

    const navigate = useNavigate();

    const [selectedMethod, setSelectedMethod] = useState("");

    const handlePayment = () => {

        if (!selectedMethod) {
            return;
        }

        navigate("/checkout/processing", {
            state: {
                booking: mockCheckout,
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
                        booking={mockCheckout}
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
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    Elements,
    CardElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";

import createPayment from "../../services/paymentApi";

const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

function CardPaymentForm({
    booking,
    paymentMethod,
    totalAmount,
}) {

    const stripe = useStripe();
    const elements = useElements();

    const navigate = useNavigate();

    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {

        const createIntent = async () => {

            try {

                const response = await createPayment({

                    amount: totalAmount,

                    currency: "bdt",

                    paymentMethod,

                    customerEmail: booking.customerEmail,

                });

                if (!response.success) {

                    setErrorMessage(
                        response.message ||
                        "Unable to create payment."
                    );

                    return;
                }

                setPaymentData(response);

            } catch (error) {

                console.error(
                    "Payment intent creation error:",
                    error
                );

                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to connect to the payment service."
                );
            }
        };

        createIntent();

    }, [booking, paymentMethod, totalAmount]);

    const handleCardPayment = async (event) => {

        event.preventDefault();

        if (!stripe || !elements || !paymentData) {
            return;
        }

        setProcessing(true);
        setErrorMessage("");

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {

            setProcessing(false);

            setErrorMessage(
                "Card information is not available."
            );

            return;
        }

        const result = await stripe.confirmCardPayment(
            paymentData.clientSecret,
            {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        email: booking.customerEmail,
                    },
                },
            }
        );

        if (result.error) {

            setProcessing(false);

            setErrorMessage(
                result.error.message ||
                "Payment failed."
            );

            return;
        }

        if (
            result.paymentIntent &&
            result.paymentIntent.status === "succeeded"
        ) {

            navigate("/checkout/receipt", {

                state: {

                    booking,

                    paymentMethod,

                    payment: {
                        ...paymentData,

                        status: result.paymentIntent.status,

                        paymentIntentId:
                            result.paymentIntent.id,

                    },

                },

                replace: true,

            });

            return;
        }

        setProcessing(false);

        setErrorMessage(
            "Payment was not completed."
        );
    };

    if (errorMessage) {

        return (
            <div className="card shadow-sm border-0">

                <div className="card-body p-4 text-center">

                    <h3 className="fw-bold text-danger mb-3">
                        Payment Failed
                    </h3>

                    <p className="text-muted mb-4">
                        {errorMessage}
                    </p>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                            navigate("/checkout/payment")
                        }
                    >
                        Return to Checkout
                    </button>

                </div>

            </div>
        );
    }

    if (!paymentData) {

        return (
            <div className="card shadow-sm border-0">

                <div className="card-body p-5 text-center">

                    <div
                        className="spinner-border text-primary mb-4"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <h3 className="fw-bold">
                        Preparing Payment
                    </h3>

                    <p className="text-muted">
                        Please wait while we connect to Stripe.
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="card shadow-sm border-0">

            <div className="card-body p-4">

                <h3 className="fw-bold mb-3">
                    Card Payment
                </h3>

                <p className="text-muted">
                    Enter your Stripe test card details below.
                </p>

                <form onSubmit={handleCardPayment}>

                    <div className="border rounded p-3 mb-4">

                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: "16px",
                                        color: "#32325d",
                                        "::placeholder": {
                                            color: "#a0aec0",
                                        },
                                    },
                                },
                            }}
                        />

                    </div>

                    {errorMessage && (
                        <div className="alert alert-danger">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={
                            !stripe ||
                            !elements ||
                            processing
                        }
                    >
                        {processing
                            ? "Processing Payment..."
                            : `Pay ৳${totalAmount.toLocaleString()}`}
                    </button>

                </form>

            </div>

        </div>
    );
}

function PaymentProcessing() {

    const location = useLocation();

    const navigate = useNavigate();

    const booking = location.state?.booking;

    const paymentMethod =
        location.state?.paymentMethod;

    if (!booking || !paymentMethod) {

        return (
            <div className="container py-5">

                <div className="alert alert-danger">

                    Payment information is missing.

                </div>

            </div>
        );
    }

    /*
     * Calculate the total amount from the booking.
     *
     * Each item:
     *
     * price per serving × number of servings
     *
     * Then all items are added together.
     */

    const totalAmount = booking.items.reduce(
        (total, item) =>
            total +
            item.pricePerServing * item.servings,
        0
    );

    /*
     * Stripe is the real external payment
     * integration for Card payments.
     *
     * bKash and Nagad remain simulated
     * methods for this project.
     */

    if (paymentMethod !== "card") {

        return (
            <div className="container py-5">

                <div className="row justify-content-center">

                    <div className="col-md-7">

                        <div className="card shadow-sm">

                            <div className="card-body p-5 text-center">

                                <h2 className="fw-bold mb-3">
                                    {paymentMethod === "bkash"
                                        ? "bKash Payment"
                                        : "Nagad Payment"}
                                </h2>

                                <p className="text-muted">
                                    This payment method is currently
                                    simulated for the Feastify project.
                                </p>

                                <h4 className="fw-bold my-4">
                                    Amount: ৳
                                    {totalAmount.toLocaleString()}
                                </h4>

                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={() =>
                                        navigate(
                                            "/checkout/receipt",
                                            {
                                                state: {
                                                    booking,
                                                    paymentMethod,
                                                    payment: {
                                                        success: true,
                                                        status:
                                                            "simulated",
                                                        paymentIntentId:
                                                            "SIMULATED-" +
                                                            Date.now(),
                                                        amount:
                                                            totalAmount,
                                                        currency:
                                                            "bdt",
                                                    },
                                                },
                                                replace: true,
                                            }
                                        )
                                    }
                                >
                                    Confirm Simulated Payment
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="container py-5">

            <div className="row justify-content-center">

                <div className="col-lg-7">

                    <Elements stripe={stripePromise}>

                        <CardPaymentForm
                            booking={booking}
                            paymentMethod={paymentMethod}
                            totalAmount={totalAmount}
                        />

                    </Elements>

                </div>

            </div>

        </div>
    );
}

export default PaymentProcessing;
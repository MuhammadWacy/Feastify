import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    Elements,
    CardElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";

import createPayment from "../../services/paymentAPI";
import { markServiceRequestPaid } from "../../services/requestService";

const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);


/*
 * Remove the successfully paid booking from the cart.
 *
 * The cart is stored in localStorage as:
 * feastify-cart
 *
 * We match the booking using the seller, customer and date.
 */
const removePaidBookingFromCart = (booking) => {
    try {
        const storedCart = localStorage.getItem("feastify-cart");

        if (!storedCart) {
            return;
        }

        const cart = JSON.parse(storedCart);

        if (!Array.isArray(cart)) {
            return;
        }

        const updatedCart = cart.filter((seller) => {
            const sameSeller =
                seller.sellerEmail &&
                booking.sellerEmail &&
                seller.sellerEmail === booking.sellerEmail;

            const sameCustomer =
                !booking.customerEmail ||
                !seller.customerEmail ||
                seller.customerEmail === booking.customerEmail;

            const sameDate =
                seller.date &&
                booking.date &&
                seller.date === booking.date;

            /*
             * Remove only the matching paid booking.
             *
             * If seller/date information is unavailable, we do NOT
             * delete anything accidentally.
             */
            return !(sameSeller && sameCustomer && sameDate);
        });

        localStorage.setItem(
            "feastify-cart",
            JSON.stringify(updatedCart)
        );

        /*
         * Notify other components in the same browser tab.
         */
        window.dispatchEvent(new Event("cartUpdated"));

        console.log(
            "Paid booking removed from cart:",
            booking
        );

    } catch (error) {
        console.error(
            "Failed to remove paid booking from cart:",
            error
        );
    }
};


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


        const cardElement =
            elements.getElement(CardElement);


        if (!cardElement) {

            setProcessing(false);

            setErrorMessage(
                "Card information is not available."
            );

            return;
        }


        const result =
            await stripe.confirmCardPayment(
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

            /*
             * PAYMENT SUCCESSFUL.
             *
             * Remove this booking from localStorage BEFORE
             * sending the customer to the receipt.
             */
            removePaidBookingFromCart(booking);

            if (booking.serviceRequestId) {
                try {
                    await markServiceRequestPaid(
                        booking.serviceRequestId,
                        paymentMethod,
                        result.paymentIntent.id
                    );
                } catch (syncError) {
                    console.error(
                        "Payment succeeded but order status could not be updated:",
                        syncError
                    );

                    setProcessing(false);
                    setErrorMessage(
                        "Payment succeeded, but Feastify could not update the order status. Please try refreshing the order page."
                    );
                    return;
                }
            }

            navigate(
                "/checkout/receipt",
                {
                    state: {

                        booking,

                        paymentMethod,

                        payment: {
                            ...paymentData,

                            status:
                                result.paymentIntent.status,

                            paymentIntentId:
                                result.paymentIntent.id,
                        },
                    },

                    replace: true,
                }
            );

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

    const booking =
        location.state?.booking;

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
     */
    const totalAmount =
        booking.items.reduce(
            (total, item) =>
                total +
                item.pricePerServing *
                item.servings,
            0
        );


    /*
     * bKash and Nagad are simulated payment methods.
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
                                    onClick={async () => {

                                        removePaidBookingFromCart(booking);

                                        const simulatedPaymentId =
                                            "SIMULATED-" + Date.now();

                                        if (booking.serviceRequestId) {
                                            try {
                                                await markServiceRequestPaid(
                                                    booking.serviceRequestId,
                                                    paymentMethod,
                                                    simulatedPaymentId
                                                );
                                            } catch (syncError) {
                                                console.error(
                                                    "Payment succeeded but order status could not be updated:",
                                                    syncError
                                                );
                                                return;
                                            }
                                        }

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
                                                            simulatedPaymentId,

                                                        amount:
                                                            totalAmount,

                                                        currency:
                                                            "bdt",
                                                    },
                                                },

                                                replace: true,
                                            }
                                        );
                                    }}
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
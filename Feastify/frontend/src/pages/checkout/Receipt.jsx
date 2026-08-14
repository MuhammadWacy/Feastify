import { useLocation, useNavigate } from "react-router-dom";

function Receipt() {

    const location = useLocation();
    const navigate = useNavigate();

    const booking = location.state?.booking;
    const paymentMethod = location.state?.paymentMethod;
    const payment = location.state?.payment;

    if (!booking || !payment) {
        return (
            <div className="container py-5">

                <div className="row justify-content-center">

                    <div className="col-md-7">

                        <div className="card shadow-sm">

                            <div className="card-body text-center p-5">

                                <h2 className="fw-bold mb-3">
                                    Receipt Not Available
                                </h2>

                                <p className="text-muted mb-4">
                                    No completed payment information was found.
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => navigate("/checkout/payment")}
                                >
                                    Return to Checkout
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

                <div className="col-lg-8">

                    <div className="card shadow-sm">

                        <div className="card-body p-5">

                            <div className="text-center mb-4">

                                <h1 className="fw-bold text-success">
                                    Payment Successful
                                </h1>

                                <p className="text-muted">
                                    Your payment has been processed successfully.
                                </p>

                            </div>

                            <hr />

                            <h4 className="fw-bold mb-3">
                                Payment Details
                            </h4>

                            <div className="mb-2">
                                <strong>Customer Email:</strong>{" "}
                                {booking.customerEmail}
                            </div>

                            <div className="mb-2">
                                <strong>Payment Method:</strong>{" "}
                                {paymentMethod}
                            </div>

                            <div className="mb-2">
                                <strong>Payment ID:</strong>{" "}
                                {payment.paymentIntentId}
                            </div>

                            <div className="mb-2">
                                <strong>Status:</strong>{" "}
                                {payment.status}
                            </div>

                            <div className="mb-4">
                                <strong>Total Paid:</strong>{" "}
                                ৳{payment.amount?.toLocaleString()}
                            </div>

                            <hr />

                            <h4 className="fw-bold mb-3">
                                Order Summary
                            </h4>

                            {booking.items.map((item, index) => (

                                <div
                                    key={index}
                                    className="d-flex justify-content-between border-bottom py-3"
                                >

                                    <div>

                                        <strong>
                                            {item.foodName}
                                        </strong>

                                        <div className="text-muted small">
                                            {item.servings} servings × ৳
                                            {item.pricePerServing}
                                        </div>

                                    </div>

                                    <div className="fw-bold">
                                        ৳
                                        {(
                                            item.pricePerServing *
                                            item.servings
                                        ).toLocaleString()}
                                    </div>

                                </div>

                            ))}

                            <div className="text-end mt-4">

                                <h4 className="fw-bold">
                                    Total: ৳
                                    {payment.amount?.toLocaleString()}
                                </h4>

                            </div>

                            <div className="text-center mt-4">

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate("/customer/home")
                                    }
                                >
                                    Return to Home
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Receipt;
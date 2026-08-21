function BookingSummary({ booking }) {

    const totalAmount = booking.items.reduce(
        (total, item) =>
            total + item.pricePerServing * item.servings,
        0
    );

    return (
        <div className="card shadow-sm border-0">

            <div className="card-body p-4">

                <h3 className="fw-bold mb-4">
                    Booking Summary
                </h3>

                <div className="mb-4">

                    <p className="mb-1">
                        <strong>Caterer:</strong>{" "}
                        {booking.sellerName}
                    </p>

                    <p className="mb-1">
                        <strong>Event Date:</strong>{" "}
                        {booking.bookingDate || booking.date}
                    </p>

                    <p className="mb-0">
                        <strong>Customer:</strong>{" "}
                        {booking.customerEmail}
                    </p>

                </div>

                <hr />

                {booking.items.map((item, index) => {

                    const itemTotal =
                        item.pricePerServing * item.servings;

                    return (
                        <div
                            key={index}
                            className="d-flex align-items-center gap-3 mb-4"
                        >

                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.foodName}
                                    style={{
                                        width: "90px",
                                        height: "70px",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                    }}
                                />
                            ) : (
                                <div
                                    className="d-flex align-items-center justify-content-center border rounded bg-light"
                                    style={{
                                        width: "90px",
                                        height: "70px",
                                        fontSize: "1.7rem",
                                        flexShrink: 0,
                                    }}
                                    aria-label="Custom dish without a listing photo"
                                >
                                    🍲
                                </div>
                            )}

                            <div className="flex-grow-1">

                                <h5 className="mb-1">
                                    {item.foodName}
                                </h5>

                                <p className="text-muted mb-1">
                                    {item.servings} servings × ৳
                                    {item.pricePerServing.toLocaleString()}
                                </p>

                            </div>

                            <strong>
                                ৳ {itemTotal.toLocaleString()}
                            </strong>

                        </div>
                    );
                })}

                <hr />

                <div className="d-flex justify-content-between align-items-center">

                    <h4 className="mb-0">
                        Total Payable
                    </h4>

                    <h4
                        className="mb-0"
                        style={{ color: "#FF7034" }}
                    >
                        ৳ {totalAmount.toLocaleString()}
                    </h4>

                </div>

            </div>

        </div>
    );
}

export default BookingSummary;
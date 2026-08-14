function OrderSummary({
    itemCount,
    totalServings,
    subtotal,
}) {

    return (

        <div className="order-summary">

            <h4 className="mb-4">
                Order Summary
            </h4>

            <div className="summary-row">

                <span>Total Items</span>

                <span>{itemCount}</span>

            </div>

            <div className="summary-row">

                <span>Total Servings</span>

                <span>{totalServings}</span>

            </div>

            <hr />

            <div className="summary-row">

                <strong>Subtotal</strong>

                <strong>

                    ৳ {subtotal.toLocaleString()}

                </strong>

            </div>

        </div>

    );

}

export default OrderSummary;
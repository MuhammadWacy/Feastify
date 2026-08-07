import React from "react";

function CartItem({ item }) {
    const itemTotal = item.pricePerServing * item.servings;

    return (
        <div className="cart-item-card">

            <img
                src={item.image}
                alt={item.foodName}
                className="cart-item-image"
            />

            <div className="cart-item-details">

                <h5 className="fw-bold mb-3">
                    {item.foodName}
                </h5>

                <div className="row">

                    <div className="col-md-6 mb-2">
                        <strong>Price / Serving</strong>
                        <br />
                        ৳ {item.pricePerServing}
                    </div>

                    <div className="col-md-6 mb-2">
                        <strong>Servings</strong>
                        <br />
                        {item.servings}
                    </div>

                </div>

                <hr />

                <h6 className="text-end text-success fw-bold">

                    Item Total

                    <br />

                    ৳ {itemTotal.toLocaleString()}

                </h6>

            </div>

        </div>
    );
}

export default CartItem;
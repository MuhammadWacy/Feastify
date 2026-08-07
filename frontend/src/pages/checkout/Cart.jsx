import React from "react";
import SellerCart from "../../components/checkout/SellerCart";
import cartData from "../../data/mockCart";

function Cart() {

    const totalSellerGroups = cartData.length;

    const totalItems = cartData.reduce(
        (total, seller) => total + seller.items.length,
        0
    );

    return (

        <div className="container py-5">

            {/* Page Header */}

            <div className="text-center mb-5">

                <h1 className="fw-bold">

                    Shopping Cart

                </h1>

                <p className="text-muted">

                    Review your selected catering services before sending booking requests.

                </p>

            </div>

            {/* Statistics */}

            <div className="row mb-5">

                <div className="col-md-6">

                    <div className="cart-stat-card">

                        <h5>Total Caterers</h5>

                        <h2>{totalSellerGroups}</h2>

                    </div>

                </div>

                <div className="col-md-6">

                    <div className="cart-stat-card">

                        <h5>Total Food Items</h5>

                        <h2>{totalItems}</h2>

                    </div>

                </div>

            </div>

            {/* Seller Groups */}

            {

                cartData.map((seller, index) => (

                    <SellerCart

                        key={index}

                        seller={seller}

                    />

                ))

            }

        </div>

    );

}

export default Cart;
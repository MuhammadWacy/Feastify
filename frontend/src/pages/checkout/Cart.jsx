import { useEffect, useState } from "react";
import SellerCart from "../../components/checkout/SellerCart";

function Cart() {

    const [cartData, setCartData] = useState([]);

    useEffect(() => {

        const loadCart = () => {

            try {

                const storedCart =
                    localStorage.getItem("feastify-cart");

                if (!storedCart) {
                    setCartData([]);
                    return;
                }

                const parsedCart = JSON.parse(storedCart);

                if (Array.isArray(parsedCart)) {
                    setCartData(parsedCart);
                } else {
                    setCartData([]);
                }

            } catch (error) {

                console.error(
                    "Failed to load cart:",
                    error
                );

                setCartData([]);

            }

        };

        loadCart();

        window.addEventListener(
            "storage",
            loadCart
        );

        return () => {
            window.removeEventListener(
                "storage",
                loadCart
            );
        };

    }, []);

    const totalSellerGroups = cartData.length;

    const totalItems = cartData.reduce(
        (total, seller) =>
            total + (seller.items?.length || 0),
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
                    Review your selected catering services
                    before sending booking requests.
                </p>

            </div>

            {/* Empty Cart */}

            {cartData.length === 0 ? (

                <div className="text-center py-5">

                    <h3 className="fw-bold">
                        Your cart is empty
                    </h3>

                    <p className="text-muted">
                        Add some catering items from the
                        homepage to get started.
                    </p>

                </div>

            ) : (

                <>

                    {/* Statistics */}

                    <div className="row mb-5">

                        <div className="col-md-6">

                            <div className="cart-stat-card">

                                <h5>
                                    Total Caterers
                                </h5>

                                <h2>
                                    {totalSellerGroups}
                                </h2>

                            </div>

                        </div>

                        <div className="col-md-6">

                            <div className="cart-stat-card">

                                <h5>
                                    Total Food Items
                                </h5>

                                <h2>
                                    {totalItems}
                                </h2>

                            </div>

                        </div>

                    </div>

                    {/* Seller Groups */}

                    {cartData.map((seller, index) => (

                        <SellerCart
                            key={`${seller.sellerEmail}-${seller.date}-${index}`}
                            seller={seller}
                        />

                    ))}

                </>

            )}

        </div>
    );
}

export default Cart;
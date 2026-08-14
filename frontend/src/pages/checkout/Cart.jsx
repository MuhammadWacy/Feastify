import { useEffect, useState } from "react";
import SellerCart from "../../components/checkout/SellerCart";

function Cart() {
    const [cartData, setCartData] = useState([]);

    const loadCart = () => {
        try {
            const storedCart = localStorage.getItem("feastify-cart");

            if (!storedCart) {
                setCartData([]);
                return;
            }

            const parsedCart = JSON.parse(storedCart);
            setCartData(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (error) {
            console.error("Failed to load cart:", error);
            setCartData([]);
        }
    };

    useEffect(() => {
        loadCart();

        window.addEventListener("storage", loadCart);
        window.addEventListener("cartUpdated", loadCart);

        return () => {
            window.removeEventListener("storage", loadCart);
            window.removeEventListener("cartUpdated", loadCart);
        };
    }, []);

    const handleRequestSuccess = (requestedBooking) => {
        const updatedCart = cartData.filter((booking) => {
            const sameSeller = booking.sellerId === requestedBooking.sellerId;
            const sameCatering = booking.cateringId === requestedBooking.cateringId;
            const sameDate = booking.date === requestedBooking.date;

            return !(sameSeller && sameCatering && sameDate);
        });

        localStorage.setItem("feastify-cart", JSON.stringify(updatedCart));
        setCartData(updatedCart);
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const totalSellerGroups = cartData.length;
    const totalItems = cartData.reduce(
        (total, seller) => total + (seller.items?.length || 0),
        0
    );

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold">Shopping Cart</h1>
                <p className="text-muted">
                    Review your selected catering services before sending booking requests.
                </p>
            </div>

            {cartData.length === 0 ? (
                <div className="text-center py-5">
                    <h3 className="fw-bold">Your cart is empty</h3>
                    <p className="text-muted">
                        Add some catering items from the homepage to get started.
                    </p>
                </div>
            ) : (
                <>
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

                    {cartData.map((seller, index) => (
                        <SellerCart
                            key={`${seller.sellerId}-${seller.date}-${index}`}
                            seller={seller}
                            onRequestSuccess={handleRequestSuccess}
                        />
                    ))}
                </>
            )}
        </div>
    );
}

export default Cart;

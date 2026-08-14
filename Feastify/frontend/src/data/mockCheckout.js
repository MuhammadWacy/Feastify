import biryaniImage from "../assets/checkout/biryani.png";
import roastImage from "../assets/checkout/roast.png";

const mockCheckout = {
    customerEmail: "customer1@gmail.com",

    bookingDate: "13-08-2026",

    sellerEmail: "royalcaterers@gmail.com",

    sellerName: "Royal Caterers",

    items: [
        {
            foodName: "Chicken Biryani",
            image: biryaniImage,
            pricePerServing: 550,
            servings: 200,
        },
        {
            foodName: "Chicken Roast",
            image: roastImage,
            pricePerServing: 350,
            servings: 200,
        },
    ],
};

export default mockCheckout;
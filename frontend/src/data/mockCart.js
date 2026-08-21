import biryani from "../assets/checkout/biryani.png";
import roast from "../assets/checkout/roast.png";
import brownie from "../assets/checkout/brownie.png";

const cartData = [
    {
        sellerEmail: "royalcaterers@gmail.com",

        sellerName: "Royal Caterers",

        customerEmail: "customer1@gmail.com",

        date: "13-08-2026",

        items: [
            {
                foodName: "Chicken Biryani",
                image: biryani,
                pricePerServing: 550,
                servings: 200,
            },

            {
                foodName: "Chicken Roast",
                image: roast,
                pricePerServing: 350,
                servings: 200,
            },
        ],
    },

    {
        sellerEmail: "dreamcaterers@gmail.com",

        sellerName: "Dream Caterers",

        customerEmail: "customer1@gmail.com",

        date: "13-08-2026",

        items: [
            {
                foodName: "Chocolate Brownie",
                image: brownie,
                pricePerServing: 120,
                servings: 200,
            },
        ],
    },
];

export default cartData;
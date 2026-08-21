require("dotenv").config();

const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPayment = async (req, res) => {
    try {

        const {
            amount,
            currency = "bdt",
            paymentMethod,
            customerEmail,
        } = req.body;

        // Basic validation
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount.",
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required.",
            });
        }

        if (!customerEmail) {
            return res.status(400).json({
                success: false,
                message: "Customer email is required.",
            });
        }

        /*
         * Stripe expects the amount in the smallest
         * currency unit.
         *
         * Example:
         * ৳1,000 → 100000
         */
        const stripeAmount = Math.round(amount * 100);

        const paymentIntent = await stripe.paymentIntents.create({

            amount: stripeAmount,

            currency: currency.toLowerCase(),

            payment_method_types: ["card"],

            metadata: {
                paymentMethod,
                customerEmail,
            },

        });

        return res.status(200).json({

            success: true,

            message: "Payment intent created successfully.",

            paymentIntentId: paymentIntent.id,

            clientSecret: paymentIntent.client_secret,

            status: paymentIntent.status,

            paymentMethod,

            customerEmail,

            amount,

            currency,

        });

    } catch (error) {

        console.error("Stripe payment error:", error);

        return res.status(500).json({

            success: false,

            message: "Payment processing failed.",

            error: error.message,

        });
    }
};

module.exports = {
    createPayment,
};
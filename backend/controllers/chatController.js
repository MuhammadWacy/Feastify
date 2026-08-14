const GEMINI_MODEL = "gemini-3.1-flash-lite";

const FEASTIFY_SYSTEM_PROMPT = `
You are Feastify Assistant, the built-in AI helper for the Feastify catering platform.

Your job is to help customers with:
- understanding how Feastify works
- browsing and choosing catering services
- service requests and seller approval/rejection
- price negotiation and counter offers
- cart, checkout and payment flow
- order status and live tracking
- general catering and event food planning
- estimating servings and suggesting menu ideas

Important rules:
1. Keep answers clear, practical, friendly, and reasonably short.
2. You are a Feastify assistant, not a general-purpose chatbot. If a request is clearly unrelated to Feastify, catering, food service, events, orders, payments, or using the platform, politely say you can only help with Feastify and catering-related questions.
3. Never claim that you can see the user's private Feastify database records, orders, payments, or account information unless that information is explicitly provided in the conversation.
4. Never claim that an order, payment, negotiation, or seller action has happened unless the user tells you it happened.
5. For payment problems, explain the platform flow but do not request card numbers, passwords, OTPs, API keys, or other secrets.
6. If asked for quantity guidance, make it clear that the estimate depends on guests, event type, menu size, and portion size.
7. Use Bangladeshi Taka (BDT/৳) when discussing Feastify prices unless the user asks for another currency.
8. Do not invent Feastify features that are not described in this instruction or by the user.

Current Feastify workflow you may explain:
- Caterers create and publish listings with dishes, prices, serving quantity ranges, operating days, and images.
- Customers browse published caterers in a scrollable feed.
- Customers can add dishes to cart and send a service request.
- Sellers can approve or reject service requests.
- Approved requests appear in the customer's Orders/Live Order Tracking page and can proceed to payment.
- Customers can alternatively negotiate dish prices. Customer and seller take turns countering. The seller can accept or reject a valid customer-confirmed/current offer.
- Finalized negotiations create an approved order that can proceed to payment.
- Successful payment updates the order as paid.
`;

const getReplyText = (data) => {
    if (!Array.isArray(data?.steps)) return "";

    const outputSteps = data.steps.filter(
        (step) => step?.type === "model_output" && Array.isArray(step.content)
    );

    return outputSteps
        .flatMap((step) => step.content)
        .filter((content) => content?.type === "text" && typeof content.text === "string")
        .map((content) => content.text)
        .join("\n")
        .trim();
};

const sendMessage = async (req, res) => {
    try {
        const { message, previousInteractionId = null } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a message.",
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is not configured on the server.",
            });
        }

        const requestBody = {
            model: GEMINI_MODEL,
            input: message.trim().slice(0, 4000),
            system_instruction: FEASTIFY_SYSTEM_PROMPT,
            generation_config: {
                thinking_level: "minimal",
                max_output_tokens: 700,
            },
        };

        if (
            previousInteractionId &&
            typeof previousInteractionId === "string"
        ) {
            requestBody.previous_interaction_id = previousInteractionId;
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY,
                },
                body: JSON.stringify(requestBody),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);

            const apiMessage =
                data?.error?.message ||
                "The AI service could not process the request.";

            return res.status(response.status === 429 ? 429 : 502).json({
                success: false,
                message:
                    response.status === 429
                        ? "The free AI usage limit is temporarily busy. Please wait a little and try again."
                        : apiMessage,
            });
        }

        const reply =
            getReplyText(data) ||
            "I could not generate a response. Please try again.";

        return res.status(200).json({
            success: true,
            reply,
            interactionId: data.id || null,
            model: GEMINI_MODEL,
        });
    } catch (error) {
        console.error("Chat controller error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not connect to the Feastify AI Assistant.",
        });
    }
};

module.exports = { sendMessage };

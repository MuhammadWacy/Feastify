const sendDeliveryNotification = async ({
    customerId,
    sellerName,
    orderId,
}) => {
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey =
        process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
        console.log(
            "OneSignal configuration missing."
        );

        return {
            sent: false,
            message:
                "OneSignal is not configured on the backend.",
        };
    }

    const payload = {
        app_id: appId,

        target_channel: "push",

        include_aliases: {
            external_id: [
                String(customerId),
            ],
        },

        headings: {
            en: "Your Feastify order was delivered",
        },

        contents: {
            en: `${sellerName} marked your catering order as delivered. Open Feastify to view the delivery proof.`,
        },

        url: `${
            process.env.FRONTEND_URL ||
            "http://localhost:5173"
        }/customer/orders`,

        data: {
            type: "order_delivered",
            orderId: String(orderId),
        },
    };

    console.log(
        "Sending OneSignal notification..."
    );

    console.log(
        "Target customer external ID:",
        String(customerId)
    );

    try {
        const response = await fetch(
            "https://api.onesignal.com/notifications",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Key ${apiKey}`,
                },

                body: JSON.stringify(
                    payload
                ),
            }
        );

        const data = await response
            .json()
            .catch(() => ({}));

        console.log(
            "OneSignal status:",
            response.status
        );

        console.log(
            "OneSignal response:",
            data
        );

        if (!response.ok) {
            console.error(
                "OneSignal notification failed:",
                data
            );

            return {
                sent: false,

                message:
                    data?.errors?.[0] ||
                    data?.message ||
                    "OneSignal notification could not be sent.",

                response: data,
            };
        }

        if (!data.id) {
            console.log(
                "OneSignal request succeeded but no notification ID was returned."
            );

            return {
                sent: false,

                message:
                    "OneSignal did not confirm a notification recipient.",

                response: data,
            };
        }

        console.log(
            "OneSignal notification sent successfully:",
            data.id
        );

        return {
            sent: true,

            notificationId:
                data.id,

            response: data,
        };

    } catch (error) {
        console.error(
            "OneSignal request error:",
            error.message
        );

        return {
            sent: false,
            message: error.message,
        };
    }
};

module.exports = {
    sendDeliveryNotification,
};
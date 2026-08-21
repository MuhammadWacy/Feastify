const sendDeliveryNotification = async ({ customerId, sellerName, orderId }) => {
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
        return {
            sent: false,
            message: "OneSignal is not configured on the backend.",
        };
    }

    const response = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify({
            app_id: appId,
            target_channel: "push",
            include_aliases: {
                external_id: [String(customerId)],
            },
            headings: {
                en: "Your Feastify order was delivered",
            },
            contents: {
                en: `${sellerName} marked your catering order as delivered. Open Feastify to view the delivery proof.`,
            },
            url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/orders`,
            data: {
                type: "order_delivered",
                orderId: String(orderId),
            },
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data?.errors?.[0] ||
                data?.errors ||
                data?.message ||
                "OneSignal notification could not be sent."
        );
    }

    return {
        sent: Boolean(data.id),
        notificationId: data.id || "",
        response: data,
    };
};

module.exports = {
    sendDeliveryNotification,
};

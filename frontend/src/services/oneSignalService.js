import OneSignal from "react-onesignal";

let initPromise = null;
let initialized = false;

export const initializeOneSignal = async () => {
    if (initialized) {
        return OneSignal;
    }

    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;

    if (!appId) {
        console.error(
            "OneSignal: VITE_ONESIGNAL_APP_ID is missing from frontend/.env"
        );
        return null;
    }

    if (!initPromise) {
        initPromise = OneSignal.init({
            appId,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: "/OneSignalSDKWorker.js",
            serviceWorkerParam: {
                scope: "/",
            },
            notifyButton: {
                enable: false,
            },
            promptOptions: {
                slidedown: {
                    prompts: [
                        {
                            type: "push",
                            autoPrompt: false,
                        },
                    ],
                },
            },
        });
    }

    try {
        await initPromise;
        initialized = true;
        console.log("OneSignal initialized successfully");
        return OneSignal;
    } catch (error) {
        const message = String(error?.message || error || "");

        // React StrictMode or a previously loaded SDK instance can cause the
        // OneSignal wrapper to report that initialization already happened.
        // In that case the SDK is usable, so treat it as initialized instead
        // of repeatedly calling OneSignal.init() and breaking the permission flow.
        if (message.toLowerCase().includes("already initialized")) {
            initialized = true;
            initPromise = Promise.resolve();
            console.log("OneSignal was already initialized; reusing the existing SDK instance.");
            return OneSignal;
        }

        initPromise = null;
        console.error("OneSignal initialization failed:", error);
        return null;
    }
};

export const identifyOneSignalUser = async (userId) => {
    if (!userId) {
        return {
            linked: false,
            externalId: null,
        };
    }

    const oneSignal = await initializeOneSignal();

    if (!oneSignal) {
        return {
            linked: false,
            externalId: null,
        };
    }

    try {
        await oneSignal.login(String(userId));

        const externalId = oneSignal.User.externalId || null;

        console.log("OneSignal user identified:", String(userId));
        console.log("OneSignal external ID:", externalId);

        return {
            linked: true,
            externalId,
        };
    } catch (error) {
        console.error("OneSignal user identification failed:", error);

        return {
            linked: false,
            externalId: null,
        };
    }
};

export const requestNotificationPermission = async (userId) => {
    const oneSignal = await initializeOneSignal();

    if (!oneSignal) {
        return {
            supported: false,
            permission: false,
            linked: false,
            message: "OneSignal could not initialize.",
        };
    }

    if (!oneSignal.Notifications.isPushSupported()) {
        return {
            supported: false,
            permission: false,
            linked: false,
            message: "Push notifications are not supported in this browser.",
        };
    }

    try {
        console.log(
            "Notification permission before request:",
            Notification.permission
        );

        if (Notification.permission === "default") {
            await oneSignal.Notifications.requestPermission();
        }

        if (Notification.permission !== "granted") {
            return {
                supported: true,
                permission: false,
                linked: false,
                message: "Notification permission was not granted.",
            };
        }

        // Make sure this browser is actively subscribed after permission is granted.
        if (!oneSignal.User.PushSubscription.optedIn) {
            await oneSignal.User.PushSubscription.optIn();
        }

        // Link this browser subscription to the logged-in Feastify customer.
        // The MongoDB user ID becomes OneSignal's external_id.
        const identity = await identifyOneSignalUser(userId);

        const subscriptionId =
            oneSignal.User.PushSubscription.id || null;

        console.log(
            "Notification permission after request:",
            Notification.permission
        );
        console.log(
            "OneSignal subscription ID:",
            subscriptionId
        );

        return {
            supported: true,
            permission: true,
            linked: identity.linked,
            externalId: identity.externalId,
            subscriptionId,
            message: identity.linked
                ? "Delivery notifications enabled and linked to your account."
                : "Notifications are enabled, but the customer account could not be linked.",
        };
    } catch (error) {
        console.error("Notification setup failed:", error);

        return {
            supported: true,
            permission: false,
            linked: false,
            message:
                error.message ||
                "Could not enable delivery notifications.",
        };
    }
};

export const logoutOneSignalUser = async () => {
    try {
        const oneSignal = await initializeOneSignal();

        if (!oneSignal) return;

        await oneSignal.logout();
    } catch (error) {
        console.error("OneSignal logout failed:", error);
    }
};

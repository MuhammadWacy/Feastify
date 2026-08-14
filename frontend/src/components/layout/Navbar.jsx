import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    identifyOneSignalUser,
    requestNotificationPermission,
    logoutOneSignalUser,
} from "../../services/oneSignalService";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        typeof Notification !== "undefined" && Notification.permission === "granted"
    );

    useEffect(() => {
        if (
            token &&
            role === "customer" &&
            userId &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
        ) {
            identifyOneSignalUser(userId)
                .then((result) => {
                    if (result?.linked) {
                        setNotificationsEnabled(true);
                    }
                })
                .catch((error) => {
                    console.error("OneSignal user restore failed:", error);
                });
        }
    }, [token, role, userId]);

    const logout = async () => {
        if (role === "customer") {
            await logoutOneSignalUser();
        }
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        localStorage.removeItem("userId");
        navigate("/login");
    };

    const enableNotifications = async () => {
        setNotificationMessage("");

        try {
            if (!userId) {
                setNotificationMessage(
                    "Please log out and log in again first."
                );
                return;
            }

            const result =
                await requestNotificationPermission(userId);

            if (!result.supported) {
                setNotificationMessage(
                    result.message ||
                        "Push notifications are not supported in this browser."
                );
                return;
            }

            if (result.permission && result.linked) {
                setNotificationsEnabled(true);
                setNotificationMessage(
                    "Delivery notifications enabled."
                );
                return;
            }

            setNotificationsEnabled(false);
            setNotificationMessage(
                result.message ||
                    "Notification setup could not be completed."
            );
        } catch (error) {
            setNotificationsEnabled(false);
            setNotificationMessage(
                error.message || "Could not enable notifications."
            );
        }
    };

    const getHomeRoute = () => {
        if (!token) return "/";
        if (role === "customer") return "/customer/home";
        if (role === "seller") return "/seller/home";
        return "/";
    };

    const getDashboardRoute = () => {
        if (role === "customer") return "/customer/dashboard";
        if (role === "seller") return "/seller/dashboard";
        return "/";
    };

    const activeClass = (path) =>
        location.pathname === path
            ? "fw-bold text-decoration-underline"
            : "";

    return (
        <nav
            className="navbar navbar-expand-lg"
            style={{ backgroundColor: "#FF7034" }}
        >
            <div className="container">
                <Link
                    className="navbar-brand fw-bold text-white"
                    to={getHomeRoute()}
                >
                    🍽 Feastify
                </Link>

                <button
                    className="navbar-toggler bg-light"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link
                                className={`nav-link text-white ${activeClass(
                                    getHomeRoute()
                                )}`}
                                to={getHomeRoute()}
                            >
                                Home
                            </Link>
                        </li>

                        {!token && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link text-white ${activeClass(
                                            "/login"
                                        )}`}
                                        to="/login"
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link text-white ${activeClass(
                                            "/register"
                                        )}`}
                                        to="/register"
                                    >
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}

                        {token && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link text-white ${activeClass(
                                            getDashboardRoute()
                                        )}`}
                                        to={getDashboardRoute()}
                                    >
                                        Dashboard
                                    </Link>
                                </li>

                                {role === "customer" && (
                                    <>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-white ${
                                                    location.pathname.startsWith(
                                                        "/customer/negotiations"
                                                    )
                                                        ? "fw-bold text-decoration-underline"
                                                        : ""
                                                }`}
                                                to="/customer/negotiations"
                                            >
                                                Negotiations
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-white ${activeClass(
                                                    "/customer/orders"
                                                )}`}
                                                to="/customer/orders"
                                            >
                                                Orders
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-white ${activeClass(
                                                    "/customer/assistant"
                                                )}`}
                                                to="/customer/assistant"
                                            >
                                                AI Assistant
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-white ${
                                                    location.pathname.startsWith(
                                                        "/customer/favorites"
                                                    ) ||
                                                    location.pathname.startsWith(
                                                        "/customer/caterers/"
                                                    )
                                                        ? "fw-bold text-decoration-underline"
                                                        : ""
                                                }`}
                                                to="/customer/favorites"
                                            >
                                                Favorites
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className="nav-link text-white border-0 bg-transparent"
                                                onClick={enableNotifications}
                                                title={notificationMessage || "Enable browser push notifications"}
                                            >
                                                {notificationsEnabled
                                                    ? "Notifications Enabled"
                                                    : "Enable Notifications"}
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-white ${activeClass(
                                                    "/customer/cart"
                                                )}`}
                                                to="/customer/cart"
                                            >
                                                Cart
                                            </Link>
                                        </li>
                                    </>
                                )}

                                {role === "seller" && (
                                    <>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-white ${activeClass(
                                                    "/seller/negotiations"
                                                )}`}
                                                to="/seller/negotiations"
                                            >
                                                Negotiations
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-white ${activeClass(
                                                    "/seller/deliveries"
                                                )}`}
                                                to="/seller/deliveries"
                                            >
                                                Delivery Verification
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-white ${activeClass(
                                                    "/seller/listing"
                                                )}`}
                                                to="/seller/listing"
                                            >
                                                Listing
                                            </Link>
                                        </li>
                                    </>
                                )}

                                <li className="nav-item">
                                    <Link
                                        className={`nav-link text-white ${activeClass(
                                            "/profile"
                                        )}`}
                                        to="/profile"
                                    >
                                        Profile
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    {token && (
                        <button className="btn btn-light" onClick={logout}>
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

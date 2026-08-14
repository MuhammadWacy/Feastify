import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login");
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

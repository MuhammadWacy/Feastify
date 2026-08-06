import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

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
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbarNav"
                >
                    <ul className="navbar-nav me-auto">

                        <li className="nav-item">
                            <Link
                                className={`nav-link text-white ${
                                    location.pathname === getHomeRoute()
                                        ? "fw-bold text-decoration-underline"
                                        : ""
                                }`}
                                to={getHomeRoute()}
                            >
                                Home
                            </Link>
                        </li>

                        {!token && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link text-white ${
                                            location.pathname === "/login"
                                                ? "fw-bold text-decoration-underline"
                                                : ""
                                        }`}
                                        to="/login"
                                    >
                                        Login
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className={`nav-link text-white ${
                                            location.pathname === "/register"
                                                ? "fw-bold text-decoration-underline"
                                                : ""
                                        }`}
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
                                        className={`nav-link text-white ${
                                            location.pathname ===
                                            getDashboardRoute()
                                                ? "fw-bold text-decoration-underline"
                                                : ""
                                        }`}
                                        to={getDashboardRoute()}
                                    >
                                        Dashboard
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className={`nav-link text-white ${
                                            location.pathname === "/profile"
                                                ? "fw-bold text-decoration-underline"
                                                : ""
                                        }`}
                                        to="/profile"
                                    >
                                        Profile
                                    </Link>
                                </li>
                            </>
                        )}

                    </ul>

                    {token && (
                        <button
                            className="btn btn-light"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    )}

                </div>

            </div>
        </nav>
    );
}

export default Navbar;
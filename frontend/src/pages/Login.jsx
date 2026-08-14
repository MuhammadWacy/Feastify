import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Redirect if already logged in
    if (token) {
        if (role === "customer") {
            return <Navigate to="/customer/home" replace />;
        }

        if (role === "seller") {
            return <Navigate to="/seller/home" replace />;
        }
    }

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post("/auth/login", formData);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.user.role);
            localStorage.setItem("name", response.data.user.fullName);
            localStorage.setItem("email", response.data.user.email);
            localStorage.setItem("userId", response.data.user.id);

            setMessage("Login successful!");

            if (response.data.user.role === "customer") {
                navigate("/customer/home");
            } else if (response.data.user.role === "seller") {
                navigate("/seller/home");
            } else {
                navigate("/");
            }

        } catch (error) {

            setMessage(
                error.response?.data?.message || "Login failed."
            );

        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <div className="card shadow">
                <div className="card-body">

                    <h2 className="text-center mb-4">
                        Login
                    </h2>

                    {message && (
                        <div className="alert alert-info">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label className="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Password
                            </label>

                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            className="btn btn-primary w-100"
                            type="submit"
                        >
                            Login
                        </button>

                    </form>

                    <p className="text-center mt-3">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Register
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}

export default Login;
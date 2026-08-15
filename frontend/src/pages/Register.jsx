import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
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
        fullName: "",
        email: "",
        phone: "",
        address: "",
        area: "",
        password: "",
        role: "customer",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post(
                "/auth/register",
                formData
            );

            alert(response.data.message);

            navigate("/login");

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Registration Failed"
            );

        }
    };

    return (
        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-7">

                    <div className="card shadow">

                        <div className="card-body">

                            <h2 className="text-center mb-4">
                                Register
                            </h2>

                            <form onSubmit={handleSubmit}>

                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-control mb-3"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control mb-3"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="phone"
                                    className="form-control mb-3"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="address"
                                    className="form-control mb-3"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="area"
                                    className="form-control mb-3"
                                    placeholder="Area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="password"
                                    name="password"
                                    className="form-control mb-3"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="mb-3">

                                    <label className="form-label">
                                        Register As
                                    </label>

                                    <div className="form-check">

                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="role"
                                            value="customer"
                                            checked={formData.role === "customer"}
                                            onChange={handleChange}
                                        />

                                        <label className="form-check-label">
                                            Customer
                                        </label>

                                    </div>

                                    <div className="form-check">

                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="role"
                                            value="seller"
                                            checked={formData.role === "seller"}
                                            onChange={handleChange}
                                        />

                                        <label className="form-check-label">
                                            Seller
                                        </label>

                                    </div>

                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                    type="submit"
                                >
                                    Register
                                </button>

                            </form>

                            <p className="text-center mt-3">
                                Already have an account?{" "}
                                <Link to="/login">
                                    Login
                                </Link>
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;
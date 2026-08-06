import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Profile() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {

        const fetchProfile = async () => {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {

                const response = await API.get(
                    "/auth/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUser(response.data.user);

            } catch (error) {

                localStorage.removeItem("token");

                navigate("/login");

            }

        };

        fetchProfile();

    }, [navigate]);

    const logout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };

    if (!user) {

        return (
            <div className="container mt-5">
                <h3>Loading...</h3>
            </div>
        );

    }

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-body">

                    <h2 className="mb-4">
                        My Profile
                    </h2>

                    <p>
                        <strong>Name:</strong> {user.fullName}
                    </p>

                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>

                    <p>
                        <strong>Phone:</strong> {user.phone}
                    </p>

                    <p>
                        <strong>Address:</strong> {user.address}
                    </p>

                    <p>
                        <strong>Area:</strong> {user.area}
                    </p>

                    <p>
                        <strong>Role:</strong> {user.role}
                    </p>

                    <button
                        className="btn btn-danger"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </div>

        </div>

    );

}

export default Profile;
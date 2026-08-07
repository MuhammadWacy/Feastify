import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCaterers } from "../../services/requestService";

function Caterers() {
    const [caterers, setCaterers] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchCaterers = async () => {
            try {
                const response = await listCaterers();
                setCaterers(response.data.caterers);
            } catch (error) {
                setMessage(
                    error.response?.data?.message || "Failed to load caterers."
                );
            }
        };

        fetchCaterers();
    }, []);

    return (
        <div className="container mt-5">

            <h2 className="mb-4">Browse Caterers</h2>

            {message && (
                <div className="alert alert-info">{message}</div>
            )}

            {caterers.length === 0 && !message && (
                <p className="text-muted">No caterers registered yet.</p>
            )}

            <div className="row g-3">
                {caterers.map((caterer) => (
                    <div className="col-md-4" key={caterer._id}>
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{caterer.fullName}</h5>
                                <p className="card-text text-muted mb-1">
                                    {caterer.area}
                                </p>
                                <p className="card-text text-muted">
                                    {caterer.address}
                                </p>
                                <Link
                                    to={`/customer/caterers/${caterer._id}`}
                                    className="btn btn-primary w-100"
                                >
                                    View Service
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default Caterers;

import { useEffect, useState } from "react";
import { getMyComplaints } from "../../services/complaintService";

const fmt = (value) => (value ? new Date(value).toLocaleString() : "-");

function FiledComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getMyComplaints()
            .then((response) => setComplaints(response.data.complaints || []))
            .catch((err) => setError(err.response?.data?.message || "Could not load complaints."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-1">Filed Complaints</h2>
            <p className="text-muted mb-4">Complaints you submitted after completed deliveries.</p>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? <div className="text-center py-5"><div className="spinner-border" /></div> : complaints.length === 0 ? (
                <div className="card shadow-sm"><div className="card-body text-center py-5"><h5>No complaints filed</h5><p className="text-muted mb-0">Delivered orders can be reported from your Orders page.</p></div></div>
            ) : (
                <div className="d-grid gap-4">
                    {complaints.map((c) => (
                        <div className="card shadow-sm border-0" key={c._id}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                                    <div><h4 className="fw-bold mb-1">{c.sellerName}</h4><span className="badge bg-danger">{c.category}</span></div>
                                    <div className="text-muted small text-end">Filed {fmt(c.createdAt)}</div>
                                </div>
                                <div className="row g-3 small mb-3">
                                    <div className="col-md-3"><strong>Event Date</strong><div>{fmt(c.eventDate)}</div></div>
                                    <div className="col-md-3"><strong>Delivery Date</strong><div>{fmt(c.deliveredAt)}</div></div>
                                    <div className="col-md-3"><strong>Amount Paid</strong><div>৳{Number(c.amountPaid || 0).toLocaleString()}</div></div>
                                    <div className="col-md-3"><strong>Total Servings</strong><div>{c.totalServings}</div></div>
                                    {c.deliveryLocation && <div className="col-md-6"><strong>Delivery Location</strong><div>{c.deliveryLocation}</div></div>}
                                    {c.contactNumber && <div className="col-md-6"><strong>Contact</strong><div>{c.contactNumber}</div></div>}
                                </div>
                                <div className="mb-3"><strong>Complaint Details</strong><div className="mt-1">{c.details}</div></div>
                                <div className="table-responsive mb-3"><table className="table table-sm"><thead><tr><th>Item</th><th>Servings</th><th>Price/Serving</th></tr></thead><tbody>{c.items.map((item, i) => <tr key={`${c._id}-${i}`}><td>{item.foodName}</td><td>{item.servings}</td><td>৳{Number(item.pricePerServing).toLocaleString()}</td></tr>)}</tbody></table></div>
                                {c.images?.length > 0 && <div className="d-flex flex-wrap gap-2">{c.images.map((image, i) => <a href={image.url} target="_blank" rel="noreferrer" key={image.publicId || i}><img src={image.url} alt={`Complaint evidence ${i + 1}`} className="rounded border" style={{ width: 120, height: 90, objectFit: "cover" }} /></a>)}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FiledComplaints;

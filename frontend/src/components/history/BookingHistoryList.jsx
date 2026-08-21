const formatDate = (value, withTime = false) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

const sourceLabel = (sourceType) => {
    if (sourceType === "negotiation") return "Negotiated Order";
    if (sourceType === "need_based") return "Need-Based Order";
    if (sourceType === "special_offer") return "Special Offer";
    return "Regular Order";
};

const totalServings = (items = []) =>
    items.reduce((sum, item) => sum + Number(item.servings || 0), 0);

function ItemImage({ item }) {
    if (item.image) {
        return (
            <img
                src={item.image}
                alt={item.foodName}
                className="rounded border"
                style={{ width: 86, height: 70, objectFit: "cover" }}
            />
        );
    }

    return (
        <div
            className="rounded border bg-light d-flex align-items-center justify-content-center text-muted text-center px-2"
            style={{ width: 86, height: 70, fontSize: 12 }}
        >
            Custom dish
        </div>
    );
}

function BookingHistoryList({ requests, perspective }) {
    const isCustomer = perspective === "customer";

    if (!requests.length) {
        return (
            <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                    <div className="display-6 mb-3">📚</div>
                    <h4 className="fw-bold">No completed bookings yet</h4>
                    <p className="text-muted mb-0">
                        Only orders completed through Delivery Verification appear in booking history.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="d-grid gap-4">
            {requests.map((request) => (
                <div className="card shadow-sm border-0 overflow-hidden" key={request._id}>
                    <div className="card-body p-4">
                        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-4">
                            <div>
                                <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
                                    <h4 className="fw-bold mb-0">
                                        {isCustomer ? request.sellerName : request.customerName}
                                    </h4>
                                    <span className="badge bg-success">Delivered</span>
                                    <span className="badge bg-secondary">{sourceLabel(request.sourceType)}</span>
                                </div>
                                <div className="text-muted small">
                                    {isCustomer ? request.sellerEmail : request.customerEmail}
                                </div>
                                <div className="text-muted small mt-1">
                                    Order #{String(request._id).slice(-8).toUpperCase()}
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="small text-muted">Total Paid</div>
                                <div className="fs-4 fw-bold">৳{Number(request.payableAmount || 0).toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-6 col-lg-3">
                                <div className="border rounded p-3 h-100 bg-light">
                                    <div className="text-muted small">Event Date</div>
                                    <div className="fw-semibold">{formatDate(request.eventDate)}</div>
                                </div>
                            </div>
                            <div className="col-6 col-lg-3">
                                <div className="border rounded p-3 h-100 bg-light">
                                    <div className="text-muted small">Delivered</div>
                                    <div className="fw-semibold">{formatDate(request.deliveredAt, true)}</div>
                                </div>
                            </div>
                            <div className="col-6 col-lg-3">
                                <div className="border rounded p-3 h-100 bg-light">
                                    <div className="text-muted small">Total Servings</div>
                                    <div className="fw-semibold">{totalServings(request.items)}</div>
                                </div>
                            </div>
                            <div className="col-6 col-lg-3">
                                <div className="border rounded p-3 h-100 bg-light">
                                    <div className="text-muted small">Payment</div>
                                    <div className="fw-semibold text-capitalize">
                                        {request.paymentMethod || "Paid"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {request.sourceType === "need_based" && request.needBasedDetails && (
                            <div className="alert alert-light border mb-4">
                                <div className="fw-bold mb-2">Custom Event Requirements</div>
                                <div className="row g-2 small">
                                    {request.needBasedDetails.eventName && (
                                        <div className="col-md-6"><strong>Event:</strong> {request.needBasedDetails.eventName}</div>
                                    )}
                                    {request.needBasedDetails.deliveryLocation && (
                                        <div className="col-md-6"><strong>Delivery Location:</strong> {request.needBasedDetails.deliveryLocation}</div>
                                    )}
                                    {request.needBasedDetails.contactNumber && (
                                        <div className="col-md-6"><strong>Contact:</strong> {request.needBasedDetails.contactNumber}</div>
                                    )}
                                    {request.needBasedDetails.preparationDetails && (
                                        <div className="col-12"><strong>Preparation:</strong> {request.needBasedDetails.preparationDetails}</div>
                                    )}
                                    {request.needBasedDetails.additionalNotes && (
                                        <div className="col-12"><strong>Notes:</strong> {request.needBasedDetails.additionalNotes}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <h5 className="fw-bold mb-3">Food & Booking Details</h5>
                        <div className="d-grid gap-3 mb-4">
                            {(request.items || []).map((item, index) => (
                                <div
                                    className="d-flex flex-wrap flex-sm-nowrap align-items-center gap-3 border rounded p-3"
                                    key={`${request._id}-${item.foodName}-${index}`}
                                >
                                    <ItemImage item={item} />
                                    <div className="flex-grow-1">
                                        <div className="fw-bold">{item.foodName}</div>
                                        <div className="text-muted small">
                                            {item.servings} servings × ৳{Number(item.pricePerServing || 0).toLocaleString()} per serving
                                        </div>
                                    </div>
                                    <div className="fw-semibold">
                                        ৳{(Number(item.servings || 0) * Number(item.pricePerServing || 0)).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="row g-4 align-items-stretch">
                            <div className="col-lg-5">
                                <div className="border rounded p-3 h-100">
                                    <h5 className="fw-bold mb-3">Delivery Proof</h5>
                                    {request.deliveryProofImage ? (
                                        <a href={request.deliveryProofImage} target="_blank" rel="noreferrer">
                                            <img
                                                src={request.deliveryProofImage}
                                                alt="Delivery proof"
                                                className="img-fluid rounded border w-100"
                                                style={{ maxHeight: 260, objectFit: "cover" }}
                                            />
                                        </a>
                                    ) : (
                                        <div className="text-muted">No delivery proof image is available.</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <div className="border rounded p-3 h-100">
                                    <h5 className="fw-bold mb-3">Order Record</h5>
                                    <div className="row g-3 small">
                                        <div className="col-md-6">
                                            <strong>Payment Status</strong>
                                            <div className="text-capitalize">{request.paymentStatus}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Paid At</strong>
                                            <div>{formatDate(request.paidAt, true)}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Approval</strong>
                                            <div className="text-capitalize">{request.approvalStatus}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Delivery Status</strong>
                                            <div className="text-capitalize">{request.deliveryStatus.replaceAll("_", " ")}</div>
                                        </div>
                                        {request.paymentReference && (
                                            <div className="col-12">
                                                <strong>Payment Reference</strong>
                                                <div className="text-break">{request.paymentReference}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default BookingHistoryList;

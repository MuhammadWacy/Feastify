import API from "./api";

export const createServiceRequest = (booking) =>
    API.post("/service-requests", {
        cateringId: booking.cateringId,
        sellerId: booking.sellerId,
        eventDate: booking.date,
        items: booking.items,
        specialOfferId: booking.specialOfferId || null,
    });

export const getMyServiceRequests = () =>
    API.get("/service-requests/my");

export const getIncomingServiceRequests = () =>
    API.get("/service-requests/incoming");

export const updateServiceRequestApproval = (
    requestId,
    status,
    rejectionReason = ""
) =>
    API.patch(`/service-requests/${requestId}/approval`, {
        status,
        rejectionReason,
    });

export const markServiceRequestPaid = (
    requestId,
    paymentMethod,
    paymentReference
) =>
    API.patch(`/service-requests/${requestId}/payment`, {
        paymentMethod,
        paymentReference,
    });

export const updateServiceRequestProgress = (requestId, status) =>
    API.patch(`/service-requests/${requestId}/progress`, {
        status,
    });

export const markServiceRequestDelivered = (requestId, proofImage) => {
    const formData = new FormData();
    formData.append("proofImage", proofImage);

    return API.patch(`/service-requests/${requestId}/delivery`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};


export const getCustomerBookingHistory = () =>
    API.get("/service-requests/history/customer");

export const getSellerBookingHistory = () =>
    API.get("/service-requests/history/seller");

import API from "./api";

export const createServiceRequest = (booking) =>
    API.post("/service-requests", {
        cateringId: booking.cateringId,
        sellerId: booking.sellerId,
        eventDate: booking.date,
        items: booking.items,
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

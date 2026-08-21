import API from "./api";

export const createNegotiation = (draft) =>
    API.post("/negotiations", draft);

export const getMyNegotiations = () =>
    API.get("/negotiations/my");

export const getIncomingNegotiations = () =>
    API.get("/negotiations/incoming");

export const updateNegotiationOffer = (negotiationId, items) =>
    API.patch(`/negotiations/${negotiationId}/offer`, { items });

export const confirmNegotiation = (negotiationId) =>
    API.patch(`/negotiations/${negotiationId}/confirm`);

export const finalizeNegotiation = (negotiationId) =>
    API.patch(`/negotiations/${negotiationId}/finalize`);

export const rejectNegotiation = (negotiationId) =>
    API.patch(`/negotiations/${negotiationId}/reject`);

import API from "./api";

export const listCaterers = () => API.get("/caterers");

export const getCaterer = (catererId) => API.get(`/caterers/${catererId}`);

export const createRequest = (data) => API.post("/requests", data);

export const getMyRequests = () => API.get("/requests/mine");

export const getIncomingRequests = () => API.get("/requests/incoming");

export const getRequestById = (id) => API.get(`/requests/${id}`);

export const respondToRequest = (id, status) =>
    API.put(`/requests/${id}/respond`, { status });

export const advanceRequestStatus = (id) =>
    API.put(`/requests/${id}/status`);

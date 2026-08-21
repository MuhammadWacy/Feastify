import API from "./api";

export const getMySpecialOffers = () => API.get("/special-offers/mine");

export const createSpecialOffer = (formData) =>
    API.post("/special-offers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const updateSpecialOffer = (id, formData) =>
    API.put(`/special-offers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const deleteSpecialOffer = (id) =>
    API.delete(`/special-offers/${id}`);

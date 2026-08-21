import API from "./api";

export const getMyListing = () => API.get("/seller/listing");

export const saveMyListing = (formData) =>
    API.post("/seller/listing", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const setListingPublished = (isPublished) =>
    API.put("/seller/listing/publish", { isPublished });

export const createMenuItem = (formData) =>
    API.post("/seller/listing/menu", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const updateMenuItem = (id, formData) =>
    API.put(`/seller/listing/menu/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const deleteMenuItem = (id) =>
    API.delete(`/seller/listing/menu/${id}`);

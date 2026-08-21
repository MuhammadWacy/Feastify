import API from "./api";

export const fileComplaint = ({ serviceRequestId, category, details, images }) => {
    const formData = new FormData();
    formData.append("serviceRequestId", serviceRequestId);
    formData.append("category", category);
    formData.append("details", details);
    (images || []).forEach((image) => formData.append("images", image));

    return API.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const getMyComplaints = () => API.get("/complaints/my");
export const getSellerComplaints = () => API.get("/complaints/seller");

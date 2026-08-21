import API from "./api";

export const postReview = ({ serviceRequestId, rating, description, images }) => {
    const formData = new FormData();
    formData.append("serviceRequestId", serviceRequestId);
    formData.append("rating", String(rating));
    formData.append("description", description);
    (images || []).forEach((image) => formData.append("images", image));

    return API.post("/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const getMyReviews = () => API.get("/reviews/my");
export const getCateringReviews = (cateringId) => API.get(`/reviews/catering/${cateringId}`);
export const getSellerReviews = () => API.get("/reviews/seller");
export const replyToReview = (reviewId, reply) => API.patch(`/reviews/${reviewId}/reply`, { reply });

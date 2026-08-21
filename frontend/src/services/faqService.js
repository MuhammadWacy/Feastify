import API from "./api";

export const getCateringFaqs = async (cateringId) => {
    const response = await API.get(`/faqs/catering/${cateringId}`);
    return response.data;
};

export const askCatererQuestion = async (cateringId, question) => {
    const response = await API.post(`/faqs/catering/${cateringId}`, { question });
    return response.data;
};

export const getSellerFaqs = async () => {
    const response = await API.get("/faqs/seller/mine");
    return response.data;
};

export const answerCatererQuestion = async (faqId, answer) => {
    const response = await API.patch(`/faqs/${faqId}/answer`, { answer });
    return response.data;
};

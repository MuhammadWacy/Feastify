import API from "./api";

export const getFavorites = async () => {
    const response = await API.get("/favorites");
    return response.data;
};

export const addFavorite = async (cateringId) => {
    const response = await API.post(`/favorites/${cateringId}`);
    return response.data;
};

export const removeFavorite = async (cateringId) => {
    const response = await API.delete(`/favorites/${cateringId}`);
    return response.data;
};

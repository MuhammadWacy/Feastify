import API from "./api";

export const getSearchOptions = async () => {
    const response = await API.get("/catalog/search-options");
    return response.data;
};

export const searchCaterings = async (filters) => {
    const response = await API.get("/catalog/search", {
        params: filters,
    });

    return response.data;
};

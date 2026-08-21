import API from "./api";

export const createNeedPost = (payload) => API.post("/needs", payload);
export const getMyNeedPosts = () => API.get("/needs/my");
export const getOpenNeedPosts = () => API.get("/needs/open");
export const getNeedPostDetails = (needId) => API.get(`/needs/${needId}`);
export const acceptNeedPost = (needId) => API.patch(`/needs/${needId}/accept`);
export const cancelNeedPost = (needId) => API.patch(`/needs/${needId}/cancel`);

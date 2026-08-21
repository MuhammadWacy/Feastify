import API from "./api";

export const sendChatMessage = (message, previousInteractionId = null) => {
    return API.post("/chat/message", {
        message,
        previousInteractionId,
    });
};

import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../../services/chatService";

const STARTER_MESSAGE = {
    role: "assistant",
    text: "Hi! I’m the Feastify Assistant. Ask me about catering, service requests, negotiation, payments, orders, or planning food for your event.",
};

function AIAssistant() {
    const [messages, setMessages] = useState([STARTER_MESSAGE]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [previousInteractionId, setPreviousInteractionId] = useState(null);

    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const text = input.trim();
        if (!text || sending) return;

        const previousMessages = messages;
        const userMessage = { role: "user", text };

        setMessages((current) => [...current, userMessage]);
        setInput("");
        setError("");
        setSending(true);

        try {
            const response = await sendChatMessage(
                text,
                previousInteractionId
            );

            setMessages((current) => [
                ...current,
                {
                    role: "assistant",
                    text: response.data.reply,
                },
            ]);

            setPreviousInteractionId(
                response.data.interactionId || null
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Could not reach the AI Assistant. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    const clearChat = () => {
        setMessages([STARTER_MESSAGE]);
        setInput("");
        setError("");
        setPreviousInteractionId(null);
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-9 col-xl-8">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h2 className="fw-bold mb-1">Feastify AI Assistant</h2>
                            <p className="text-muted mb-0">
                                Ask questions about Feastify, catering, and event food planning.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={clearChat}
                            disabled={sending}
                        >
                            Clear Chat
                        </button>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div
                            className="card-body bg-light"
                            style={{
                                height: "520px",
                                overflowY: "auto",
                            }}
                        >
                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={`d-flex mb-3 ${
                                        message.role === "user"
                                            ? "justify-content-end"
                                            : "justify-content-start"
                                    }`}
                                >
                                    <div
                                        className={`rounded-3 px-3 py-2 ${
                                            message.role === "user"
                                                ? "bg-primary text-white"
                                                : "bg-white border"
                                        }`}
                                        style={{
                                            maxWidth: "82%",
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        <div className="small fw-bold mb-1">
                                            {message.role === "user"
                                                ? "You"
                                                : "Feastify Assistant"}
                                        </div>
                                        <div>{message.text}</div>
                                    </div>
                                </div>
                            ))}

                            {sending && (
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="bg-white border rounded-3 px-3 py-2">
                                        <div className="small fw-bold mb-1">
                                            Feastify Assistant
                                        </div>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                        />
                                        Thinking...
                                    </div>
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        <div className="card-footer bg-white p-3">
                            {error && (
                                <div className="alert alert-danger py-2 mb-3">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ask Feastify Assistant..."
                                        value={input}
                                        onChange={(event) =>
                                            setInput(event.target.value)
                                        }
                                        maxLength={4000}
                                        disabled={sending}
                                    />

                                    <button
                                        className="btn btn-primary"
                                        type="submit"
                                        disabled={!input.trim() || sending}
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>

                            <p className="small text-muted mt-2 mb-0">
                                Do not share passwords, OTPs, card numbers, or other secrets in chat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIAssistant;

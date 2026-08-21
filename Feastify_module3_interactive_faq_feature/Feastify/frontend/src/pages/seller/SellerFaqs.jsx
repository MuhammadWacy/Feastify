import { useEffect, useState } from "react";
import {
    answerCatererQuestion,
    getSellerFaqs,
} from "../../services/faqService";

const formatDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString();
};

function SellerFaqs() {
    const [catering, setCatering] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadFaqs = async () => {
        try {
            const data = await getSellerFaqs();
            setCatering(data.catering || null);
            setFaqs(data.faqs || []);
        } catch (err) {
            setError(err.response?.data?.message || "Could not load customer questions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFaqs();
    }, []);

    const submitAnswer = async (faq) => {
        const answer = String(answers[faq._id] ?? faq.answer ?? "").trim();
        if (!answer) {
            setMessage("Write an answer before submitting.");
            return;
        }

        setSavingId(faq._id);
        setMessage("");
        try {
            const result = await answerCatererQuestion(faq._id, answer);
            setFaqs((current) =>
                current.map((item) => (item._id === faq._id ? result.faq : item))
            );
            setAnswers((current) => ({ ...current, [faq._id]: result.faq.answer }));
            setMessage(result.message || "Answer posted successfully.");
        } catch (err) {
            setMessage(err.response?.data?.message || "Could not post the answer.");
        } finally {
            setSavingId("");
        }
    };

    if (loading) {
        return <div className="container mt-5 text-center text-muted py-5">Loading customer questions...</div>;
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Customer FAQ Questions</h2>
                <p className="text-muted mb-0">
                    Answer public questions customers have asked about your catering service.
                </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-info">{message}</div>}

            {!catering ? (
                <div className="alert alert-warning">
                    Create your catering listing first. Questions will appear here after customers visit your public caterer profile.
                </div>
            ) : faqs.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body py-5 text-center">
                        <h5 className="fw-bold">No questions yet</h5>
                        <p className="text-muted mb-0">
                            Customer questions for {catering.name} will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {faqs.map((faq) => (
                        <div className="card border-0 shadow-sm" key={faq._id}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between gap-3 flex-wrap mb-2">
                                    <div>
                                        <span className="fw-semibold">{faq.customer?.fullName || "Customer"}</span>
                                        <span className="text-muted small ms-2">{formatDateTime(faq.createdAt)}</span>
                                    </div>
                                    <span className={`badge ${faq.answer ? "bg-success" : "bg-warning text-dark"}`}>
                                        {faq.answer ? "Answered" : "Waiting for answer"}
                                    </span>
                                </div>

                                <h5 className="mb-3">Q: {faq.question}</h5>

                                {faq.answer && (
                                    <div className="faq-answer-box mb-3">
                                        <strong>Your current answer</strong>
                                        <p className="mb-1 mt-1">{faq.answer}</p>
                                        {faq.answeredAt && (
                                            <small className="text-muted">Answered {formatDateTime(faq.answeredAt)}</small>
                                        )}
                                    </div>
                                )}

                                <label className="form-label fw-semibold">
                                    {faq.answer ? "Update your answer" : "Write an answer"}
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    maxLength="1000"
                                    value={answers[faq._id] ?? faq.answer ?? ""}
                                    onChange={(e) =>
                                        setAnswers((current) => ({
                                            ...current,
                                            [faq._id]: e.target.value,
                                        }))
                                    }
                                    placeholder="Answer this customer's question..."
                                />
                                <div className="d-flex justify-content-end mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={savingId === faq._id}
                                        onClick={() => submitAnswer(faq)}
                                    >
                                        {savingId === faq._id
                                            ? "Saving..."
                                            : faq.answer
                                              ? "Update Answer"
                                              : "Post Answer"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SellerFaqs;

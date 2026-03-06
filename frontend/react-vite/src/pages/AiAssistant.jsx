import { useState } from 'react';
import api from '../services/api';

const AiAssistant = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault();
        if (!prompt.trim()) return;
        const userMessage = { role: 'user', text: prompt };
        setMessages((prev) => [...prev, userMessage]);
        setError('');
        setLoading(true);

        try {
            const response = await api.post('analytics/assistant/', { prompt });
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: response.data.response,
                },
            ]);
            setPrompt('');
        } catch (err) {
            setError(err.response?.data?.error || 'Chatbot request failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <h2 className="page-title">AI Chatbot</h2>
            <p className="page-subtitle">Context-aware financial assistant for approvals, audits, and bill analytics.</p>

            <div className="card glass chat-box">
                {messages.length === 0 ? (
                    <p className="text-muted">Ask: pending bills, under review, top vendors, monthly spend, overdue bills.</p>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`chat-message ${message.role}`}>
                            <p>{message.text}</p>
                        </div>
                    ))
                )}
            </div>

            <form className="card glass" onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                    <label>Ask chatbot</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Example: Show bills awaiting my approval"
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Thinking...' : 'Send'}
                </button>
            </form>

            {error ? <div className="alert alert-error">{error}</div> : null}
        </div>
    );
};

export default AiAssistant;

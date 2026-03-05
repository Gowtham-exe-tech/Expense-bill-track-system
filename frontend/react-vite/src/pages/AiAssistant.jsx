import { useState } from 'react';
import api from '../services/api';

const AiAssistant = () => {
    const [prompt, setPrompt] = useState('');
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('analytics/assistant/', { prompt });
            setAnswer(response.data.response);
        } catch (err) {
            setError(err.response?.data?.error || 'Assistant request failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <h2 className="page-title">AI Assistant</h2>
            <p className="page-subtitle">Ask questions about bill processing trends.</p>
            <form className="card" onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Question</label>
                    <textarea
                        className="form-control"
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Example: Summarize risk in pending approvals."
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Thinking...' : 'Ask'}
                </button>
            </form>

            {error ? <div className="alert alert-error">{error}</div> : null}
            {answer ? (
                <div className="card" style={{ marginTop: '1rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Response</h3>
                    <p>{answer}</p>
                </div>
            ) : null}
        </div>
    );
};

export default AiAssistant;

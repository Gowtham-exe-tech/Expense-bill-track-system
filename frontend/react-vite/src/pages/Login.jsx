import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.username, form.password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <form className="login-card" onSubmit={onSubmit}>
                <h2>Sign In</h2>
                <p className="text-muted">Use your assigned role credentials.</p>
                {error ? <div className="alert alert-error">{error}</div> : null}
                <div className="form-group">
                    <label>Username</label>
                    <input
                        className="form-control"
                        value={form.username}
                        onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;

import { Link } from 'react-router-dom';

const AccessDenied = () => {
    return (
        <div className="login-screen">
            <div className="login-card">
                <h2>Access Denied</h2>
                <p className="text-muted">Your role does not have permission to view this page.</p>
                <Link className="btn btn-primary" to="/">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default AccessDenied;

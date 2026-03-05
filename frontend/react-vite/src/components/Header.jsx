import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <div>
                <h1 className="header-title">AI Expense Bill Approval System</h1>
                <p className="header-meta">{user?.department || 'General'} Department</p>
            </div>
            <div className="header-actions">
                <span className="badge badge-review">{user?.role || 'GUEST'}</span>
                <button type="button" className="btn btn-outline" onClick={logout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;

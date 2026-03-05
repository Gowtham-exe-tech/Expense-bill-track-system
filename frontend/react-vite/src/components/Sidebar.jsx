import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const NAV_BY_ROLE = {
    [ROLES.RECEPTIONIST]: [
        { to: '/upload', label: 'Upload Bill' },
        { to: '/bills', label: 'Uploaded Bills' },
    ],
    [ROLES.ACCOUNTANT]: [
        { to: '/bills', label: 'Verify Bills' },
    ],
    [ROLES.MANAGER]: [
        { to: '/bills', label: 'Approve Bills' },
    ],
    [ROLES.CEO]: [
        { to: '/analytics', label: 'Analytics' },
        { to: '/assistant', label: 'AI Assistant' },
        { to: '/audit-logs', label: 'Audit Logs' },
        { to: '/bills', label: 'All Bills' },
    ],
};

const Sidebar = () => {
    const { user } = useAuth();
    const navItems = NAV_BY_ROLE[user?.role] || [];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">ExpenseAI</div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

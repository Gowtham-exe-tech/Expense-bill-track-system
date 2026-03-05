import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { ROLES } from './constants/roles';
import UploadBill from './pages/UploadBill';
import BillList from './pages/BillList';
import BillDetail from './pages/BillDetail';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import AuditLogs from './pages/AuditLogs';
import AiAssistant from './pages/AiAssistant';
import './styles/global.css';
import './styles/layout.css';

const HomeRedirect = () => {
    const { user } = useAuth();
    if (user?.role === ROLES.RECEPTIONIST) return <Navigate to="/upload" replace />;
    if (user?.role === ROLES.CEO) return <Navigate to="/analytics" replace />;
    return <Navigate to="/bills" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<HomeRedirect />} />
                    <Route
                        path="upload"
                        element={
                            <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
                                <UploadBill />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="bills"
                        element={
                            <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ACCOUNTANT, ROLES.MANAGER, ROLES.CEO]}>
                                <BillList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="bills/:id"
                        element={
                            <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ACCOUNTANT, ROLES.MANAGER, ROLES.CEO]}>
                                <BillDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="analytics"
                        element={
                            <ProtectedRoute allowedRoles={[ROLES.CEO]}>
                                <Analytics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="assistant"
                        element={
                            <ProtectedRoute allowedRoles={[ROLES.CEO]}>
                                <AiAssistant />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="audit-logs"
                        element={
                            <ProtectedRoute allowedRoles={[ROLES.CEO]}>
                                <AuditLogs />
                            </ProtectedRoute>
                        }
                    />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

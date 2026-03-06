import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const DEFAULT_FILTERS = {
    bill_id: '',
    user: '',
    action_type: '',
    status: '',
    date_from: '',
    date_to: '',
};

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [error, setError] = useState('');

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        return params.toString();
    }, [filters]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const url = queryString ? `audit/?${queryString}` : 'audit/';
                const response = await api.get(url);
                setLogs(response.data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.error || 'Unable to load audit logs.');
            }
        };
        fetchLogs();
    }, [queryString]);

    return (
        <div className="fade-in">
            <h2 className="page-title">Audit Logs</h2>
            <p className="page-subtitle">Complete system activity trail with live filters.</p>

            <div className="card glass filters-grid">
                <input className="form-control" placeholder="Bill ID" value={filters.bill_id} onChange={(e) => setFilters((prev) => ({ ...prev, bill_id: e.target.value }))} />
                <input className="form-control" placeholder="User" value={filters.user} onChange={(e) => setFilters((prev) => ({ ...prev, user: e.target.value }))} />
                <select className="form-control" value={filters.action_type} onChange={(e) => setFilters((prev) => ({ ...prev, action_type: e.target.value }))}>
                    <option value="">Action Type</option>
                    <option value="uploaded">Bill Uploaded</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="under_review">Under Review</option>
                    <option value="status">Status Changed</option>
                </select>
                <select className="form-control" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
                    <option value="">Status</option>
                    <option value="UPLOADED">UPLOADED</option>
                    <option value="ACCOUNTANT_VERIFIED">ACCOUNTANT_VERIFIED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="PAID">PAID</option>
                </select>
                <input type="date" className="form-control" value={filters.date_from} onChange={(e) => setFilters((prev) => ({ ...prev, date_from: e.target.value }))} />
                <input type="date" className="form-control" value={filters.date_to} onChange={(e) => setFilters((prev) => ({ ...prev, date_to: e.target.value }))} />
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}

            <div className="card glass table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Bill ID</th>
                            <th>Action</th>
                            <th>User</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.audit_id}>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>#{log.bill}</td>
                                <td>{log.action}</td>
                                <td>{log.performed_by}</td>
                                <td>{log.bill_status}</td>
                            </tr>
                        ))}
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-row">No logs match current filters.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;

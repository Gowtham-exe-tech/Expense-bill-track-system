import { useEffect, useState } from 'react';
import api from '../services/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('audit/');
                setLogs(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Unable to load audit logs.');
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="fade-in">
            <h2 className="page-title">Audit Logs</h2>
            <p className="page-subtitle">Complete system activity trail.</p>
            {error ? <div className="alert alert-error">{error}</div> : null}
            <div className="card" style={{ overflowX: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Bill ID</th>
                            <th>Action</th>
                            <th>Performed By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.audit_id}>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>#{log.bill}</td>
                                <td>{log.action}</td>
                                <td>{log.performed_by}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;

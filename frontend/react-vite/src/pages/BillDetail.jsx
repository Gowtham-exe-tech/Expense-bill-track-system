import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const BillDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bill, setBill] = useState(null);
    const [comment, setComment] = useState('');
    const [form, setForm] = useState({ vendor_name: '', amount: '', category: '', bill_date: '', bill_due_date: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBill = async () => {
            const response = await api.get(`bills/${id}/`);
            setBill(response.data);
            setForm({
                vendor_name: response.data.vendor_name || '',
                amount: response.data.amount || '',
                category: response.data.category || 'Other',
                bill_date: response.data.bill_date || '',
                bill_due_date: response.data.bill_due_date || '',
            });
        };
        fetchBill().catch(() => setError('Failed to load bill details.'));
    }, [id]);

    const canAccountantVerify = user?.role === ROLES.ACCOUNTANT && bill?.status === 'UPLOADED';
    const canManagerAct = user?.role === ROLES.MANAGER && bill?.status === 'ACCOUNTANT_VERIFIED';
    const canCeoAct = user?.role === ROLES.CEO && bill?.status === 'MANAGER_APPROVED';
    const canMarkPaid = (user?.role === ROLES.ACCOUNTANT || user?.role === ROLES.CEO) && bill?.status === 'CEO_APPROVED';

    const currentApproval = useMemo(
        () => bill?.approvals?.find((approval) => approval.status === 'Pending'),
        [bill]
    );

    const refresh = async () => {
        const response = await api.get(`bills/${id}/`);
        setBill(response.data);
    };

    const submitVerification = async () => {
        try {
            await api.patch(`bills/${id}/`, form);
            await refresh();
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed.');
        }
    };

    const handleAction = async (action) => {
        try {
            if (action === 'approve') {
                await api.post(`bills/${id}/approve/`);
            } else if (action === 'reject') {
                await api.post(`bills/${id}/reject/`, { comments: comment });
            } else if (action === 'paid') {
                await api.post(`bills/${id}/mark-paid/`);
            }
            await refresh();
            setComment('');
        } catch (err) {
            setError(err.response?.data?.error || 'Action failed.');
        }
    };

    if (!bill) {
        return <div className="page-subtitle">Loading...</div>;
    }

    return (
        <div className="fade-in">
            <div className="row-between">
                <h1 className="page-title">Bill #{bill.bill_id}</h1>
                <button onClick={() => navigate('/bills')} className="btn btn-outline" type="button">
                    Back
                </button>
            </div>
            {error ? <div className="alert alert-error">{error}</div> : null}

            <div className="detail-grid">
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Bill Information</h3>
                    <div className="form-group">
                        <label>Vendor Name</label>
                        <input
                            className="form-control"
                            value={form.vendor_name}
                            disabled={!canAccountantVerify}
                            onChange={(e) => setForm((prev) => ({ ...prev, vendor_name: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            className="form-control"
                            value={form.amount}
                            disabled={!canAccountantVerify}
                            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <input
                            className="form-control"
                            value={form.category}
                            disabled={!canAccountantVerify}
                            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Bill Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={form.bill_date}
                            disabled={!canAccountantVerify}
                            onChange={(e) => setForm((prev) => ({ ...prev, bill_date: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Due Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={form.bill_due_date}
                            disabled={!canAccountantVerify}
                            onChange={(e) => setForm((prev) => ({ ...prev, bill_due_date: e.target.value }))}
                        />
                    </div>
                    <p className="page-subtitle">Current Status: {bill.status}</p>
                    {canAccountantVerify ? (
                        <button className="btn btn-primary" type="button" onClick={submitVerification}>
                            Verify OCR and Save
                        </button>
                    ) : null}
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Workflow Actions</h3>
                    <p className="page-subtitle">Pending Approval: {currentApproval?.approver_role || 'None'}</p>
                    {canManagerAct || canCeoAct ? (
                        <div className="action-stack">
                            <button className="btn btn-primary" type="button" onClick={() => handleAction('approve')}>
                                Approve
                            </button>
                            <textarea
                                className="form-control"
                                rows={3}
                                placeholder="Rejection reason"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button className="btn btn-danger" type="button" onClick={() => handleAction('reject')}>
                                Reject
                            </button>
                        </div>
                    ) : null}
                    {canMarkPaid ? (
                        <button className="btn btn-primary" type="button" onClick={() => handleAction('paid')}>
                            Mark as Paid
                        </button>
                    ) : null}
                    {!canAccountantVerify && !canManagerAct && !canCeoAct && !canMarkPaid ? (
                        <p className="text-muted">No actions available for your role at this status.</p>
                    ) : null}
                </div>
            </div>

            <div className="card" style={{ marginTop: '1.2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>OCR Extracted Data</h3>
                <pre className="code-block">{JSON.stringify(bill.ocr_extracted_data || {}, null, 2)}</pre>
            </div>

            <div className="card" style={{ marginTop: '1.2rem' }}>
                <h3 style={{ marginBottom: '0.8rem' }}>Audit Trail</h3>
                {bill.audit_trails?.map((audit) => (
                    <div key={audit.audit_id} className="audit-row">
                        <strong>{audit.action}</strong>
                        <span>{new Date(audit.timestamp).toLocaleString()} by {audit.performed_by}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BillDetail;

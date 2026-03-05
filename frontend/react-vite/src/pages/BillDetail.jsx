import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const BillDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchBill();
    }, [id]);

    const fetchBill = async () => {
        try {
            const response = await api.get(`bills/${id}/`);
            setBill(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAction = async (action) => {
        try {
            if (action === 'approve') {
                await api.post(`bills/${id}/approve/`);
            } else {
                await api.post(`bills/${id}/reject/`, { comments: comment });
            }
            fetchBill(); // Refresh data
        } catch (er) {
            alert(er.response?.data?.error || "Error performing action");
        }
    };

    if (!bill) return <div>Loading...</div>;

    const currentApproval = bill.approvals.find(a => a.status === 'Pending');

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title">Bill #{bill.bill_id}</h1>
                <button onClick={() => navigate('/bills')} className="btn" style={{ border: '1px solid var(--border-color)' }}>&larr; Back to List</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Left Side: Summary and Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Vendor: {bill.vendor_name}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><p className="text-muted">Amount</p><p style={{ fontSize: '1.25rem', fontWeight: 600 }}>₹{bill.amount}</p></div>
                            <div><p className="text-muted">Category</p><span className="badge" style={{ background: '#e0e7ff', color: 'var(--primary)' }}>{bill.category}</span></div>
                            <div><p className="text-muted">Bill Date</p><p>{bill.bill_date || 'N/A'}</p></div>
                            <div><p className="text-muted">Due Date</p><p>{bill.bill_due_date || 'N/A'}</p></div>
                            <div><p className="text-muted">Status</p><p className={`badge badge-${bill.status.split(' ')[0].toLowerCase()}`}>{bill.status}</p></div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Document Image</h3>
                        {bill.file_path ? (
                            <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                                <img src={bill.file_path} alt="Receipt" style={{ width: '100%', display: 'block' }} />
                            </div>
                        ) : (
                            <p>No document attached.</p>
                        )}
                    </div>
                </div>

                {/* Right Side: Approvals & Audit Trail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Action Panel</h3>
                        {bill.status === 'Approved' || bill.status === 'Rejected' ? (
                            <div className={`alert alert-${bill.status === 'Approved' ? 'success' : 'error'}`}>
                                This bill has been {bill.status.toLowerCase()}. No further actions available.
                            </div>
                        ) : (
                            <div>
                                <p style={{ marginBottom: '1rem' }}>Pending Approval from: <b>{currentApproval?.approver_role || 'Unknown'}</b></p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button onClick={() => handleAction('approve')} className="btn btn-primary" style={{ backgroundColor: 'var(--secondary)' }}>Approve Bill</button>
                                    <textarea
                                        className="form-control"
                                        placeholder="Rejection reason (optional)"
                                        style={{ marginTop: '1rem' }}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <button onClick={() => handleAction('reject')} className="btn" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>Reject Bill</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>History & Audit Trail</h3>
                        <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
                            {bill.audit_trails.map((audit, i) => (
                                <div key={i} style={{ marginBottom: '1rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-1.9rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid white' }}></div>
                                    <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{audit.action}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(audit.timestamp).toLocaleString()} by {audit.performed_by}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BillDetail;

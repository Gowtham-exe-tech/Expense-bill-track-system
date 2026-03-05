import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BillList = () => {
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const response = await api.get('bills/');
            setBills(response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    const getBadgeClass = (status) => {
        switch (status) {
            case 'Pending': return 'badge-pending';
            case 'Under Review': return 'badge-review';
            case 'Approved': return 'badge-approved';
            case 'Rejected': return 'badge-rejected';
            default: return '';
        }
    };

    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Manage Bills</h1>
                    <p className="page-subtitle">Track, review, and approve submitted expenses.</p>
                </div>
                <Link to="/upload" className="btn btn-primary">+ New Bill</Link>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search by vendor name..."
                    className="form-control"
                    style={{ flex: 1 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-control"
                    style={{ width: '200px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Vendor</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBills.map(bill => (
                            <tr key={bill.bill_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem' }}>#{bill.bill_id}</td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{bill.vendor_name}</td>
                                <td style={{ padding: '1rem' }}>₹{bill.amount}</td>
                                <td style={{ padding: '1rem' }}>{bill.category}</td>
                                <td style={{ padding: '1rem' }}>{bill.bill_date || 'N/A'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${getBadgeClass(bill.status)}`}>{bill.status}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <Link to={`/bills/${bill.bill_id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>Review &rarr;</Link>
                                </td>
                            </tr>
                        ))}
                        {filteredBills.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No bills found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BillList;

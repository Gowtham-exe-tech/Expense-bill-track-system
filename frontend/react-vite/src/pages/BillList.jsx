import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROLES, STATUS_FLOW } from '../constants/roles';

const BillList = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchBills = async () => {
            const response = await api.get('bills/');
            setBills(response.data);
        };
        fetchBills().catch(() => setBills([]));
    }, []);

    const filteredBills = useMemo(() => {
        return bills.filter((bill) => {
            const vendor = (bill.vendor_name || '').toLowerCase();
            const matchesSearch = vendor.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bills, searchTerm, statusFilter]);

    return (
        <div className="fade-in">
            <div className="row-between">
                <div>
                    <h1 className="page-title">Bills</h1>
                    <p className="page-subtitle">Track upload, verification, and approval stages.</p>
                </div>
                {user?.role === ROLES.RECEPTIONIST ? (
                    <Link to="/upload" className="btn btn-primary">
                        New Bill
                    </Link>
                ) : null}
            </div>

            <div className="card filters-row">
                <input
                    type="text"
                    placeholder="Search vendor..."
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-control select-small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    {STATUS_FLOW.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>

            <div className="card table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vendor</th>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Bill Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBills.map((bill) => (
                            <tr key={bill.bill_id}>
                                <td>#{bill.bill_id}</td>
                                <td>{bill.vendor_name || 'Unknown Vendor'}</td>
                                <td>Rs {bill.amount || 0}</td>
                                <td>{bill.category}</td>
                                <td>{bill.bill_date || 'N/A'}</td>
                                <td>
                                    <span className="badge badge-pending">{bill.status}</span>
                                </td>
                                <td>
                                    <Link className="inline-link" to={`/bills/${bill.bill_id}`}>
                                        Open
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filteredBills.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-row">
                                    No bills found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BillList;

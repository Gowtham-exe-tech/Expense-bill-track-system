import { useEffect, useState } from 'react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('analytics/');
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Unable to load analytics.');
            }
        };
        fetchAnalytics();
    }, []);

    if (error) return <div className="alert alert-error">{error}</div>;
    if (!data) return <div className="page-subtitle">Loading analytics...</div>;

    const pieData = {
        labels: data.expenses_by_category.map((item) => item.category),
        datasets: [{ data: data.expenses_by_category.map((item) => item.total), backgroundColor: ['#0f766e', '#f59e0b', '#ef4444', '#2563eb', '#9333ea', '#6b7280'] }],
    };

    const barData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                label: 'Bills',
                data: [data.approval_statistics.approved, data.approval_statistics.pending, data.approval_statistics.rejected],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            },
        ],
    };

    return (
        <div className="fade-in">
            <h2 className="page-title">Analytics</h2>
            <p className="page-subtitle">CEO dashboard overview.</p>

            <div className="stats-grid">
                <div className="card">
                    <p className="text-muted">Total Expenses</p>
                    <h3>Rs {data.total_expenses || 0}</h3>
                </div>
                <div className="card">
                    <p className="text-muted">Approved Bills</p>
                    <h3>{data.approval_statistics.approved}</h3>
                </div>
                <div className="card">
                    <p className="text-muted">Pending Bills</p>
                    <h3>{data.approval_statistics.pending}</h3>
                </div>
            </div>

            <div className="charts-grid">
                <div className="card">
                    <h3 style={{ marginBottom: '0.8rem' }}>Expenses by Category</h3>
                    <div className="chart-box">
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '0.8rem' }}>Approval Summary</h3>
                    <div className="chart-box">
                        <Bar data={barData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

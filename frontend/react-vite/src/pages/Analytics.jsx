import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('analytics/');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    if (!data) return <div style={{ padding: '2rem' }}>Loading analytics...</div>;

    const categoryLabels = data.expenses_by_category.map(c => c.category);
    const categoryValues = data.expenses_by_category.map(c => c.total);

    const pieData = {
        labels: categoryLabels,
        datasets: [
            {
                data: categoryValues,
                backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                borderWidth: 1,
            },
        ],
    };

    const barData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                label: 'Number of Bills',
                data: [
                    data.approval_statistics.approved,
                    data.approval_statistics.pending,
                    data.approval_statistics.rejected
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            },
        ],
    };

    return (
        <div className="fade-in">
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-subtitle">AI-driven insights and spending overview.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <p className="text-muted">Total Expenses</p>
                    <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>₹{data.total_expenses || 0}</h2>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                    <p className="text-muted">Approved Bills</p>
                    <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{data.approval_statistics.approved}</h2>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <p className="text-muted">Pending Bills</p>
                    <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{data.approval_statistics.pending}</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Expenses by Category</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Approval Workflow Stats</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={barData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

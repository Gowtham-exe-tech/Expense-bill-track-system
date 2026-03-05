import React, { useState, useRef } from 'react';
import api from '../services/api';
import './UploadBill.css';

const UploadBill = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [formData, setFormData] = useState({
        vendor_name: '',
        amount: '',
        category: 'Other',
        bill_date: '',
        bill_due_date: ''
    });

    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState(''); // 'success', 'error', 'warning'
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setStatusMsg('Unsupported file format. Please upload PDF, PNG, JPG, or JPEG.');
            setStatusType('error');
            return;
        }
        setFile(selectedFile);
        setStatusMsg('');
        setStatusType('');

        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview('pdf'); // Placeholder for PDF
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setStatusMsg('Please select a file to upload.');
            setStatusType('error');
            return;
        }

        const data = new FormData();
        data.append('file_path', file);
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        try {
            setStatusMsg('Uploading and processing...');
            setStatusType('info');

            const response = await api.post('bills/upload/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.data.duplicate_warning) {
                setStatusMsg('Warning: ' + response.data.duplicate_warning);
                setStatusType('warning');
            } else {
                setStatusMsg('Bill uploaded successfully! AI extraction complete.');
                setStatusType('success');
            }

            // We could update the fields if AI fetched something, but usually on upload it creates it immediately.
            // Reset form on full success:
            // setFile(null); setPreview(null); setFormData({vendor_name:'', amount:'', category:'Other', bill_date:'', bill_due_date:''}); setUploadProgress(0);
        } catch (error) {
            setStatusMsg('Failed to upload bill. Please try again.');
            setStatusType('error');
            setUploadProgress(0);
        }
    };

    return (
        <div className="fade-in">
            <h1 className="page-title">Upload Bill</h1>
            <p className="page-subtitle">Digitize new expenses. AI will automatically extract and categorize data.</p>

            {statusMsg && (
                <div className={`alert alert-${statusType}`}>
                    {statusMsg}
                </div>
            )}

            <div className="upload-container">

                {/* Left Side: Upload Area */}
                <div className="card">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <div
                        className={`drag-drop-zone ${isDragging ? 'active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3>Drag & Drop your bill here</h3>
                        <p className="text-muted">or click to browse (PDF, PNG, JPG)</p>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    )}

                    {preview && (
                        <div className="preview-container fade-in">
                            <h4 style={{ marginBottom: '0.5rem' }}>Document Preview</h4>
                            {preview === 'pdf' ? (
                                <div style={{ padding: '2rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                    <p>📄 PDF Document selected</p>
                                </div>
                            ) : (
                                <img src={preview} alt="Bill Preview" className="preview-image" />
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Data Form */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Bill Details</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Vendor Name</label>
                            <input type="text" className="form-control" name="vendor_name" value={formData.vendor_name} onChange={handleInputChange} placeholder="Auto-filled by AI if empty" />
                        </div>

                        <div className="form-group">
                            <label>Amount (₹)</label>
                            <input type="number" step="0.01" className="form-control" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="Auto-filled by AI if empty" />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select className="form-control" name="category" value={formData.category} onChange={handleInputChange}>
                                <option value="Travel">Travel</option>
                                <option value="Fuel">Fuel</option>
                                <option value="Repair">Repair</option>
                                <option value="Courier">Courier</option>
                                <option value="Other">Other (AI will predict)</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Bill Date</label>
                                <input type="date" className="form-control" name="bill_date" value={formData.bill_date} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input type="date" className="form-control" name="bill_due_date" value={formData.bill_due_date} onChange={handleInputChange} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
                            Submit Bill for Approval
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadBill;

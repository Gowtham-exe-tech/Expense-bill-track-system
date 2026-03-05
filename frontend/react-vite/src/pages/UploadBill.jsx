import { useRef, useState } from 'react';
import api from '../services/api';
import './UploadBill.css';

const UploadBill = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        vendor_name: '',
        amount: '',
        category: 'Other',
        bill_date: '',
        bill_due_date: '',
    });

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
            setPreview('pdf');
        }
    };

    const handleDrag = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(event.type === 'dragenter' || event.type === 'dragover');
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files?.[0]) {
            handleFile(event.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const hasManualPayload = Boolean(
            formData.vendor_name && formData.amount && formData.category && formData.bill_date && formData.bill_due_date
        );

        if (!file && !hasManualPayload) {
            setStatusMsg('Attach a bill file or fill all bill fields for manual submission.');
            setStatusType('error');
            return;
        }

        const data = new FormData();
        if (file) {
            data.append('file_path', file);
        }
        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });

        try {
            setStatusType('info');
            setStatusMsg('Uploading and processing...');
            await api.post('bills/upload/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total || 1;
                    const percent = Math.round((progressEvent.loaded * 100) / total);
                    setUploadProgress(percent);
                },
            });
            setStatusType('success');
            setStatusMsg('Bill uploaded successfully. OCR and AI categorization completed.');
            setUploadProgress(100);
        } catch (error) {
            if (error.response?.status === 409 && error.response?.data?.duplicate_bill_id) {
                const duplicateId = error.response.data.duplicate_bill_id;
                const shouldContinue = window.confirm(
                    `This bill is already submitted with Bill ID #${duplicateId}. Do you want to add again?`
                );
                if (shouldContinue) {
                    data.append('confirm_duplicate', 'true');
                    try {
                        await api.post('bills/upload/', data, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        setStatusType('warning');
                        setStatusMsg(`Duplicate bill submitted after confirmation. Existing Bill ID: #${duplicateId}.`);
                        setUploadProgress(100);
                        return;
                    } catch (duplicateSubmitError) {
                        setStatusType('error');
                        setStatusMsg(duplicateSubmitError.response?.data?.error || 'Failed to submit duplicate bill.');
                        setUploadProgress(0);
                        return;
                    }
                }
                setStatusType('warning');
                setStatusMsg(`Submission canceled. Existing bill found: #${duplicateId}.`);
                setUploadProgress(0);
                return;
            }

            setStatusType('error');
            setStatusMsg(error.response?.data?.error || 'Failed to upload bill.');
            setUploadProgress(0);
        }
    };

    return (
        <div className="fade-in">
            <h1 className="page-title">Upload Bill</h1>
            <p className="page-subtitle">Upload expense bills for OCR extraction and approval workflow.</p>

            {statusMsg ? <div className={`alert alert-${statusType}`}>{statusMsg}</div> : null}

            <div className="upload-container">
                <div className="card">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(event) => handleFile(event.target.files[0])}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <div
                        className={`drag-drop-zone ${isDragging ? 'active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <h3>Drag and drop bill file here</h3>
                        <p className="text-muted">or click to browse (PDF, PNG, JPG, JPEG)</p>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 ? (
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    ) : null}

                    {preview ? (
                        <div className="preview-container fade-in">
                            <h4 style={{ marginBottom: '0.5rem' }}>Document Preview</h4>
                            {preview === 'pdf' ? (
                                <div style={{ padding: '2rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                    <p>PDF document selected</p>
                                </div>
                            ) : (
                                <img src={preview} alt="Bill Preview" className="preview-image" />
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Bill Details</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Vendor Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="vendor_name"
                                value={formData.vendor_name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, vendor_name: e.target.value }))}
                                placeholder="Required for manual submission"
                            />
                        </div>
                        <div className="form-group">
                            <label>Amount (Rs)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                name="amount"
                                value={formData.amount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                placeholder="Required for manual submission"
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className="form-control"
                                name="category"
                                value={formData.category}
                                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="Travel">Travel</option>
                                <option value="Fuel">Fuel</option>
                                <option value="Repair">Repair</option>
                                <option value="Courier">Courier</option>
                                <option value="Office Supplies">Office Supplies</option>
                                <option value="Other">Other (AI can predict)</option>
                            </select>
                        </div>
                        <div className="two-col">
                            <div className="form-group">
                                <label>Bill Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="bill_date"
                                    value={formData.bill_date}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, bill_date: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="bill_due_date"
                                    value={formData.bill_due_date}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, bill_due_date: e.target.value }))}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary full-width">
                            Submit Bill (OCR or Manual)
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadBill;

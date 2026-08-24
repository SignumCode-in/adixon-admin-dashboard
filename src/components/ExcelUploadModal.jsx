import React, { useState } from 'react';
import { FileSpreadsheet, Upload, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { medicineAPI } from '../services/api';

export default function ExcelUploadModal({ isOpen, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setSummary(null);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Product Name,Quantity,Frequency,Route,No of Days,Instruction,Additional Comments\n' +
      'Paracetamol 650mg,10,1-0-1,Oral,5,After Meals,Take with water\n' +
      'Amoxicillin 500mg,15,1-1-1,Oral,7,After Meals,Complete full course';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_medicine_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an Excel (.xlsx, .xls) or CSV (.csv) file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSummary(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await medicineAPI.bulkUploadMedicines(formData);
      if (response && response.success) {
        setSummary(response.summary || {
          total_rows: 0,
          created: 0,
          updated: 0,
          skipped: 0
        });
        if (onSuccess) {
          onSuccess(response.message);
        }
      } else {
        setError(response?.message || 'Failed to upload medicine file.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploading(false);
    setError('');
    setSummary(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px', borderRadius: '16px', padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              color: 'var(--color-primary, #3b82f6)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary, #111827)' }}>
                Import Medicines from Excel
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #6b7280)' }}>
                Bulk upload medicines using .xlsx, .xls, or .csv files
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={handleClose} style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: '#dc2626', 
            padding: '10px 14px', 
            borderRadius: '8px', 
            fontSize: '13px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {summary ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle size={32} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
              Upload Completed Successfully!
            </h4>
            <div style={{ 
              backgroundColor: 'var(--color-bg-secondary, #f9fafb)', 
              borderRadius: '12px', 
              padding: '16px', 
              margin: '16px 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{summary.created}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Created</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{summary.updated}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Updated</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b7280' }}>{summary.skipped}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Skipped</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleClose} style={{ width: '100%', padding: '10px' }}>
              Done
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              border: '2px dashed var(--color-border, #e5e7eb)', 
              borderRadius: '12px', 
              padding: '24px 16px', 
              textAlign: 'center',
              backgroundColor: 'var(--color-bg-secondary, #f9fafb)',
              marginBottom: '16px',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('excel-file-input').click()}
            >
              <input 
                id="excel-file-input"
                type="file" 
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Upload size={32} style={{ color: 'var(--color-primary, #3b82f6)', marginBottom: '8px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {selectedFile ? selectedFile.name : 'Click or drop file to select Excel sheet'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Supports .xlsx, .xls, and .csv files
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justify: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.05)'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Need a template format?
              </span>
              <button 
                type="button" 
                onClick={handleDownloadSample}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--color-primary, #3b82f6)', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={14} /> Download Sample CSV
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose} 
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleUpload} 
                disabled={uploading || !selectedFile}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={16} />
                {uploading ? 'Processing & Importing...' : 'Import Medicines'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

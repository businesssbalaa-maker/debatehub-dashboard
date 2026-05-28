import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, X, ArrowUpCircle, Loader2, Trash2, Edit } from 'lucide-react';
import './QRCodeSubmit.css';
import { uploadQR, fetchQRs, updateQR, deleteQR } from './api';

const MAX_FILES = 8;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const QRCodeSubmit = () => {
  const [files, setFiles] = useState([]);
  const [qrs, setQrs] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Fetch QR images ---
  const loadQRs = useCallback(async () => {
    try {
      const data = await fetchQRs();
      setQrs(data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch QR images.');
    }
  }, []);

  useEffect(() => {
    loadQRs();
  }, [loadQRs]);

  // --- File selection ---
  const handleFileChange = useCallback((event) => {
    setMessage('');
    const newFilesArray = Array.from(event.target.files);

    const validNewFiles = newFilesArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        setMessage(prev => prev + `\nSkipped: ${file.name} not an image.`);
        return false;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setMessage(prev => prev + `\nSkipped: ${file.name} too large.`);
        return false;
      }
      if (files.some(f => f.name === file.name && f.size === file.size)) {
        setMessage(prev => prev + `\nSkipped: ${file.name} already selected.`);
        return false;
      }
      return true;
    });

    const availableSlots = MAX_FILES - files.length;
    const filesToAdd = validNewFiles.slice(0, availableSlots);

    if (filesToAdd.length < validNewFiles.length) {
      setMessage(prev => prev + `\nMaximum ${MAX_FILES} files allowed.`);
    }

    setFiles(prev => [...prev, ...filesToAdd]);
    event.target.value = null;
  }, [files]);

  // --- Remove file before upload ---
  const handleRemoveFile = index => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setMessage('');
  };

  // --- Upload files ---
  const handleUpload = useCallback(async () => {
    if (!files.length) return;
    setMessage('Uploading...');
    setIsLoading(true);

    const formData = new FormData();
    files.forEach(f => formData.append('qr', f));

    try {
      const res = await uploadQR(formData);
      if (res.ok) {
        setMessage(`Successfully uploaded ${files.length} files!`);
        setFiles([]);
        loadQRs();
      } else {
        setMessage(`Upload failed: ${res.statusText}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [files, loadQRs]);

  // --- Delete QR ---
  const handleDeleteQR = async (id) => {
    if (!window.confirm('Are you sure you want to delete this QR?')) return;
    try {
      const data = await deleteQR(id);
      if (data.success) {
        setMessage('QR deleted successfully.');
        loadQRs();
      } else {
        setMessage('Failed to delete QR.');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // --- Replace QR (update) ---
  const handleUpdateQR = async (id) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setIsLoading(true);
      try {
        const data = await updateQR(id, file);
        if (data.success) {
          setMessage('QR updated successfully.');
          loadQRs();
        } else {
          setMessage('Failed to update QR.');
        }
      } catch (err) {
        setMessage(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fileInput.click();
  };

  // --- Previews for new files ---
  const filePreviews = useMemo(() => (
    files.map((file, index) => (
      <div key={index} className="file-card">
        <div className="file-preview">
          <img src={URL.createObjectURL(file)} alt={file.name} />
        </div>
        <div className="file-info">
          <p>{file.name}</p>
          <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button className="remove-btn" onClick={() => handleRemoveFile(index)}>
          <X size={16} />
        </button>
      </div>
    ))
  ), [files]);

  return (
    <div className="uploader">
      <h1>Admin QR Upload</h1>

      <div className="upload-box">
        <p>Selected: {files.length} / {MAX_FILES}</p>
        <label className={`upload-label ${files.length >= MAX_FILES ? 'disabled' : ''}`}>
          <Upload />
          <span>{files.length >= MAX_FILES ? 'Limit Reached' : 'Click to select images'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={files.length >= MAX_FILES || isLoading}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="preview-list">
          {filePreviews}
        </div>
      )}

      <div className="actions">
        {message && <p className="message">{message}</p>}
        <button onClick={handleUpload} disabled={!files.length || isLoading} className="upload-btn">
          {isLoading ? <><Loader2 className="spin"/> Uploading...</> : <><ArrowUpCircle/> Start Upload</>}
        </button>
      </div>

      <h2>Existing QR Images</h2>
      <div className="existing-qrs">
        {qrs.map(qr => (
          <div key={qr._id} className="file-card">
            <div className="file-preview">
              <img src={qr.url} alt={qr.filename} />
            </div>
            <div className="file-info">
              <p>{qr.filename}</p>
              <p>{new Date(qr.createdAt).toLocaleString()}</p>
            </div>
            <div className="qr-actions">
              <button onClick={() => handleUpdateQR(qr._id)}><Edit size={16}/> Update</button>
              <button onClick={() => handleDeleteQR(qr._id)}><Trash2 size={16}/> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodeSubmit;

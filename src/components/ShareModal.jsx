import React, { useState } from 'react';

const API_BASE = "http://localhost:5000";

export default function ShareModal({ file, token, users, onClose }) {
  const [recipientId, setRecipientId] = useState('');
  const [status,      setStatus]      = useState('');

  const handleShareFile = async () => {
    if (!recipientId) { setStatus('Please select a recipient'); return; }
    setStatus('Sharing file...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipient_id', recipientId);

    try {
      const res  = await fetch(`${API_BASE}/api/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('File shared successfully!');
        setTimeout(onClose, 1500);
      } else {
        setStatus(data.error || 'Failed to share file.');
      }
    } catch (err) {
      console.error(err);
      setStatus('A server error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Share File with User</h2>
        <div className="space-y-4">
          <select
            value={recipientId}
            onChange={e => setRecipientId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="" disabled>Select a user</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.email})
              </option>
            ))}
          </select>
          <div className="text-center text-sm text-gray-600">
            File to be sent: <strong>{file?.name}</strong>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShareFile}
            className="px-6 py-2 font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
          >
            Share
          </button>
        </div>
        {status && <p className="mt-4 text-center text-sm text-gray-600">{status}</p>}
      </div>
    </div>
  );
}

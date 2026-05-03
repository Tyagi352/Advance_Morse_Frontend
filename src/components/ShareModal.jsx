import React, { useState } from 'react';
import { Loader } from 'lucide-react';

import { API_BASE } from '../constants';

export default function ShareModal({ file, token, users, onClose }) {
  const [recipientId, setRecipientId] = useState('');
  const [status,      setStatus]      = useState('');
  const [isLoading,   setIsLoading]   = useState(false);

  const handleShareFile = async () => {
    if (!recipientId) { setStatus('Please select a recipient'); return; }
    setIsLoading(true);
    setStatus('');

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
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setStatus('A server error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#18181B] p-7 rounded-xl shadow-2xl w-full max-w-md border border-[#27272A] animate-fade-in-up">
        <h2 className="text-xl font-bold mb-5 text-white">Share File</h2>
        <div className="space-y-4">
          <select
            value={recipientId}
            onChange={e => setRecipientId(e.target.value)}
            disabled={isLoading}
            className="w-full p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-white placeholder-[#52525B] focus:outline-none focus:ring-1 focus:ring-[#3F3F46] transition-all disabled:opacity-50 text-[14px]"
          >
            <option value="" disabled className="bg-[#18181B]">Select a user</option>
            {users.map(u => (
              <option key={u.id} value={u.id} className="bg-[#18181B]">
                {u.username} ({u.email})
              </option>
            ))}
          </select>
          <div className="text-center text-[13px] text-[#71717A]">
            File: <strong className="text-white">{file?.name}</strong>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 font-medium text-[#A1A1AA] bg-[#27272A] rounded-lg hover:bg-[#3F3F46] transition-colors disabled:opacity-50 border border-[#3F3F46] text-[13px]"
          >
            Cancel
          </button>
          <button
            onClick={handleShareFile}
            disabled={isLoading}
            className="px-5 py-2 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all disabled:opacity-50 flex items-center gap-2 text-[13px] btn-lift"
          >
            {isLoading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Sharing...
              </>
            ) : (
              'Share'
            )}
          </button>
        </div>
        {status && (
          <p className={`mt-4 text-center text-[13px] font-medium ${status.includes('success') ? 'text-white' : 'text-[#A1A1AA]'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

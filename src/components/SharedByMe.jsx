import React, { useState, useEffect } from 'react';

export default function SharedByMe({ token }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/shared/sent', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setFiles(data);
        } else {
          setError(data.error || 'Failed to fetch files');
        }
      } catch (err) {
        setError('Server error');
      }
    };

    if (token) {
      fetchFiles();
    }
  }, [token]);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Shared By Me</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-3">
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div>
                <p className="font-semibold">{file.fileName}</p>
                <p className="text-sm text-gray-500">To: {file.receiver_username}</p>
              </div>
              <button className="px-4 py-2 font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200">
                Revoke
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">You haven't shared any files.</p>
        )}
      </div>
    </div>
  );
}
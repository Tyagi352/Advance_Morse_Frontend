import React, { useState, useEffect } from 'react';

export default function SharedWithMe({ token }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/shared/received', {
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

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  const handleDecode = async (file) => {
    try {
        const res = await fetch('http://localhost:5000/api/decode-shared', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ file_id: file.id }),
        });
        const data = await res.json();
        if (res.ok) {
            alert(`Decoded Text:\n\n${data.decoded_text}`);
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (err) {
        alert('A server error occurred during decoding.');
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Shared With Me</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-3">
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div>
                <p className="font-semibold">{file.fileName}</p>
                <p className="text-sm text-gray-500">From: {file.sender_username}</p>
                {file.message && <p className="text-sm text-gray-600 mt-1"><em>Message: {file.message}</em></p>}
              </div>
              <button
                onClick={() => handleDecode(file)}
                className="px-4 py-2 font-bold text-white bg-black rounded-lg hover:bg-gray-800"
              >
                Decode
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No files have been shared with you.</p>
        )}
      </div>
    </div>
  );
}
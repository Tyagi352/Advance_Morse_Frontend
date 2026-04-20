import React, { useState } from "react";
import {
  Unlock,
  FileBadge,
  CheckCircle,
  Download
} from "lucide-react";

export default function DecodeFile({ token, API_BASE, setMessage, openShareModal, languages }) {
  const [file, setFile] = useState(null);
  const [decoded, setDecoded] = useState("");
  const [language, setLanguage] = useState("english");

  const decodeFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
      const res = await fetch(`${API_BASE}/decode`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setDecoded(data.decoded_text);
        setMessage("File decoded successfully!");
      } else {
        setDecoded("");
        setMessage(data.error || "Decoding failed");
      }
    } catch { setMessage("Server error"); }
  };

  const shareDecodedText = () => {
    const blob = new Blob([decoded], { type: "text/plain" });
    openShareModal(new File([blob], "decoded.txt", { type: "text/plain" }));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Decode & Decrypt</h1>
        <p className="text-[#71717A] text-[14px]">Restore your encrypted .enc files back to readable text.</p>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-all whitespace-nowrap ${
              language === lang
                ? "bg-white text-[#09090B]"
                : "bg-[#18181B] text-[#71717A] border border-[#27272A] hover:border-[#3F3F46] hover:text-white"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] p-6 rounded-xl transition-all group flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2.5">
              <div className="p-1.5 bg-[#27272A] rounded-md group-hover:bg-white transition-all">
                <Unlock className="text-white group-hover:text-[#09090B]" size={16} />
              </div>
              File Decoding
            </h2>
            <div className="border border-dashed border-[#27272A] group-hover:border-[#3F3F46] rounded-xl p-6 mb-4 text-center hover:bg-white/[0.02] transition-all relative cursor-pointer bg-[#09090B]">
              <input
                type="file"
                accept=".enc"
                onChange={e => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileBadge className="mx-auto h-8 w-8 text-[#52525B] group-hover:text-white transition-colors mb-2" />
              <p className="text-[13px] text-[#71717A]">
                {file ? (
                  <span className="text-white font-medium">{file.name}</span>
                ) : (
                  <>Drop or <span className="text-white font-medium">browse</span> .enc file</>
                )}
              </p>
            </div>
          </div>
          <button onClick={decodeFile} disabled={!file} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all text-[13px] disabled:opacity-30 disabled:cursor-not-allowed btn-lift">
            <Unlock size={14} /> Decode File
          </button>
        </div>

        {decoded && (
          <div className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] p-6 rounded-xl transition-all group">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-semibold text-white flex items-center gap-2.5">
                <div className="p-1.5 bg-white rounded-md">
                  <CheckCircle className="text-[#09090B]" size={16} />
                </div>
                Decoded Output
              </h2>
              <button
                onClick={shareDecodedText}
                className="px-4 py-1.5 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] text-[12px] transition-all btn-lift"
              >
                Share
              </button>
            </div>
            <textarea
              readOnly
              value={decoded}
              className="w-full p-3 rounded-lg bg-[#09090B] text-[#A1A1AA] font-mono border border-[#27272A] h-36 resize-none text-[13px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

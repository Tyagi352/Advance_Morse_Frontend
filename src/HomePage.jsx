import React from "react";
import { Link } from "react-router-dom";
import { Lock, Globe, ShieldCheck, Zap, ArrowRight, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white font-['Inter',sans-serif] overflow-x-hidden selection:bg-white/10">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full opacity-[0.015] blur-[150px]"></div>
      </div>

      <nav className="relative z-10 border-b border-[#18181B] bg-[#09090B]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield className="text-[#09090B]" size={16} />
            </div>
            <span className="text-[16px] font-bold tracking-tight">Morse Encoder</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/auth" className="text-[13px] font-medium text-[#71717A] hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link to="/auth" className="text-[13px] font-semibold bg-white text-[#09090B] px-5 py-2 rounded-lg hover:bg-[#E4E4E7] transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center max-w-3xl mx-auto mb-28 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] mb-8">
            <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
            <span className="text-[11px] font-semibold text-[#71717A] tracking-wide uppercase">Enterprise-Grade Encryption v2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Secure your payloads<br/>using <span className="text-[#71717A]">Morse Code.</span>
          </h1>
          <p className="text-lg text-[#71717A] mb-10 max-w-xl mx-auto leading-relaxed">
            A powerful, end-to-end encoded platform to convert sensitive text and files into layered secure Morse code accessible only by your trusted network.
          </p>
          <Link to="/auth" className="inline-flex px-7 py-3.5 items-center gap-2 text-[15px] font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all btn-lift">
            Start Encoding Free <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-28">
          {[
            { icon: <Globe size={20} />, title: "Multi-Language Support", desc: "Dynamically encode and decode payloads in English, Hindi, Marathi, and French using our expansive mapping algorithms." },
            { icon: <Zap size={20} />, title: "Batch File Processing", desc: "Handle direct text input arrays or upload entire batch files for instantaneous, parallel encoding directly in your browser." },
            { icon: <ShieldCheck size={20} />, title: "Zero-Trust Environment", desc: "Military-grade secured channels using JWT tokens. Your encoded payloads are wrapped in .enc format securely transferred between peers." }
          ].map((f, i) => (
            <div key={i} className="bg-[#18181B] border border-[#27272A] p-7 rounded-xl hover:border-[#3F3F46] transition-all group">
              <div className="w-10 h-10 bg-[#09090B] border border-[#27272A] flex items-center justify-center rounded-lg mb-5 group-hover:bg-white group-hover:border-white transition-all text-[#71717A] group-hover:text-[#09090B]">{f.icon}</div>
              <h3 className="text-[16px] font-semibold mb-2">{f.title}</h3>
              <p className="text-[#71717A] leading-relaxed text-[14px]">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-10 md:p-14 flex flex-col md:flex-row items-start gap-14">
          <div className="flex-1 space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Flawless Transmission.</h2>
            <p className="text-[15px] text-[#71717A] leading-relaxed">
              The internal infrastructure encodes your standard data into Morse standard strings, vaulted within .enc files. Decrypting requires proper platform clearance.
            </p>
            <ul className="space-y-3 mt-6">
              {["1. Upload or type your sensitive string.", "2. System parses and transpiles into Morse.", "3. Payload is packaged and isolated.", "4. Share securely via internal routing."].map((s, i) => (
                <li key={i} className="flex items-center gap-3 text-[#A1A1AA] font-medium text-[14px]">
                  <div className="w-5 h-5 rounded-md bg-[#27272A] border border-[#3F3F46] flex items-center justify-center shrink-0"><Lock size={10} className="text-[#71717A]" /></div>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full bg-[#09090B] border border-[#27272A] rounded-xl p-5">
            <div className="flex items-center gap-1.5 mb-4 border-b border-[#27272A] pb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]"></div>
            </div>
            <pre className="text-[12px] md:text-[13px] font-mono text-[#A1A1AA] overflow-x-auto"><code><span className="text-[#52525B]">// Payload Encryptor</span>{"\n"}<span className="text-white">const</span> payload = <span className="text-[#A1A1AA]">"SaaS Ready"</span>;{"\n\n"}<span className="text-white">await</span> MorseEncoder.secure({"{"}{"\n"}  body: payload,{"\n"}  network: <span className="text-[#A1A1AA]">"trusted-peers"</span>,{"\n"}  compression: <span className="text-white">true</span>{"\n"}{"}"});{"\n\n"}<span className="text-[#52525B]">/* ... .- .- ... / .-. . .- -.. -.-- */</span></code></pre>
          </div>
        </div>

        <div className="mt-28 text-center border-t border-[#18181B] pt-16">
          <h2 className="text-2xl font-bold mb-6">Ready to secure your communications?</h2>
          <Link to="/auth" className="inline-flex px-7 py-3.5 text-[15px] font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all btn-lift">Create Your Vault Access</Link>
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between text-[#52525B] text-[13px]">
            <p>© 2026 Morse Encoder Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Status</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
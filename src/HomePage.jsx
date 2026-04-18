import React from "react";
import { Link } from "react-router-dom";
import { Lock, Globe, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white font-sans overflow-x-hidden selection:bg-[#FACC15] selection:text-black">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FACC15] rounded-full mix-blend-screen filter opacity-[0.03] blur-[100px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-500 rounded-full mix-blend-screen filter opacity-[0.03] blur-[120px]"></div>
      </div>

      {/* Simplified Top Nav for Landing Page */}
      <nav className="relative z-10 border-b border-[#1F2937] bg-[#0B0F14]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="text-[#FACC15] h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-white">Morse Encoder</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/auth" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors hidden sm:block">
              Log In
            </Link>
            <Link to="/auth" className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#1F2937] mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#FACC15] animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">Enterprise-Grade Encryption v2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Secure your payloads using <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-orange-400">Morse Code.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A powerful, end-to-end encoded platform to convert sensitive text and files into layered secure Morse code accessible only by your trusted network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2 text-lg font-bold text-black bg-[#FACC15] rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 hover:scale-105"
            >
              Start Encoding Free <ArrowRight size={20} />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-2 text-lg font-bold text-white bg-[#111827] border border-[#1F2937] rounded-xl hover:bg-[#1F2937] transition-all"
            >
              {/* <Github size={20} /> View Documentation */}
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-[#111827] border border-[#1F2937] p-8 rounded-3xl hover:border-gray-500 transition-colors group">
            <div className="w-12 h-12 bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform">
              <Globe className="text-[#FACC15]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Language Support</h3>
            <p className="text-gray-400 leading-relaxed">
              Dynamically encode and decode payloads in English, Hindi, Marathi, and French using our expansive mapping algorithms.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] p-8 rounded-3xl hover:border-gray-500 transition-colors group">
            <div className="w-12 h-12 bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform">
              <Zap className="text-[#FACC15]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Batch File Processing</h3>
            <p className="text-gray-400 leading-relaxed">
              Handle direct text input arrays or upload entire batch files for instantaneous, parallel encoding directly in your browser.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] p-8 rounded-3xl hover:border-gray-500 transition-colors group">
            <div className="w-12 h-12 bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-[#FACC15]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Zero-Trust Environment</h3>
            <p className="text-gray-400 leading-relaxed">
              Military-grade secured channels using JWT tokens. Your encoded payloads are wrapped in `.enc` format securely transferred between peers.
            </p>
          </div>
        </div>

        {/* Deep Dive / How it works */}
        <div className="bg-gradient-to-b from-[#111827] to-[#0B0F14] border border-[#1F2937] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15] blur-[150px] opacity-10 pointer-events-none text-transparent">glow</div>
          <div className="flex-1 space-y-6 z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Flawless Transmission.
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              The internal infrastructure acts under a robust architecture to encode your standard data into Morse standard strings, which are then vaulted within `.enc` files. Decrypting the payload requires proper platform clearance, ensuring only authorized receivers can process the internal message.
            </p>
            <ul className="space-y-3 mt-6">
              {[
                "1. Upload or type your sensitive string.",
                "2. System parses and transpiles into Morse standard.",
                "3. Payload is packaged and isolated.",
                "4. Share securely via internal network routing."
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                  <span className="text-[#FACC15]"><Lock size={16} /></span> {step}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full bg-[#0B0F14] border border-[#1F2937] rounded-2xl p-6 shadow-2xl relative">
            {/* Fake terminal / code block */}
            <div className="flex items-center gap-2 mb-4 border-b border-[#1F2937] pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre className="text-xs md:text-sm font-mono text-gray-300 overflow-x-auto">
              <code>
                <span className="text-gray-500">// Payload Encryptor Executable</span><br/>
                <span className="text-blue-400">const</span> payload <span className="text-white">=</span> <span className="text-green-400">"SaaS Ready"</span>;<br/><br/>
                <span className="text-blue-400">await</span> MorseEncoder.secure({"{ "}<br/>
                &nbsp;&nbsp;body: payload,<br/>
                &nbsp;&nbsp;network: <span className="text-green-400">"trusted-peers"</span>,<br/>
                &nbsp;&nbsp;compression: <span className="text-blue-400">true</span><br/>
                {"}"});<br/><br/>
                <span className="text-gray-500">/* Output: ... .- .- ... / .-. . .- -.. -.-- */</span>
              </code>
            </pre>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-32 text-center border-t border-[#1F2937] pt-16">
          <h2 className="text-3xl font-bold mb-6">Ready to secure your communications?</h2>
          <Link
            to="/auth"
            className="inline-flex px-8 py-4 text-lg font-bold text-black bg-white rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
          >
            Create Your Vault Access
          </Link>
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
            <p>Copyright © 2026 Morse Encoder Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">System Status</a>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
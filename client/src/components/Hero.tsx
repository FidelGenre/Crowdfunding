import React from 'react';

/**
 * Hero Component
 * This is the landing page section that users see before entering the dApp.
 * @param onEnter - Function passed from the parent to toggle the dashboard view.
 */
export function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 -z-10 bg-slate-950">
        {/* Animated glowing orb in the center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        {/* Subtle noise texture overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="z-10 px-6 max-w-4xl space-y-8 animate-fade-in-up">
        
        {/* Version Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium uppercase tracking-widest mb-4 hover:bg-indigo-500/20 transition-colors cursor-default">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          Web3 Crowdfunding v1.0
        </div>

        {/* Hero Title with Gradient Text */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
          Fund the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Future</span> <br />
          <span className="text-slate-500">Decentralized.</span>
        </h1>

        {/* Value Proposition Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The next generation of fundraising platform. No intermediaries, 
          transparent smart contracts, and instant global access.
        </p>

        {/* --- CALL TO ACTION BUTTONS --- */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          {/* Primary Button: Triggers the application entry */}
          <button 
            onClick={onEnter}
            className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-full text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-all transform hover:scale-105"
          >
            Launch App 🚀
            <div className="absolute inset-0 rounded-full border border-white/50 group-hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"></div>
          </button>
          
          {/* Secondary Button: Links to the GitHub repository */}
          <a 
            href="https://github.com/FidelGenre/Crowdfunding" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full text-white font-bold border border-slate-700 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2"
          >
            Source Code 💻
          </a>
        </div>
      </div>

      {/* --- FOOTER BADGE --- */}
      <div className="absolute bottom-10 text-slate-600 text-xs uppercase tracking-widest">
        Powered by Ethereum & IPFS
      </div>
    </div>
  );
}
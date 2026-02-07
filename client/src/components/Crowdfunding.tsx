'use client';
import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useRouter } from 'next/navigation';
import { useConnectModal } from '@rainbow-me/rainbowkit';

// ✅ DIRECCIÓN DEL CONTRATO EN SEPOLIA
const CONTRACT_ADDRESS = "0x167be4137F6267f19aB865b32843385B70cf2D2e";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CONTRACT_ABI = [
  { "type": "function", "name": "createCampaign", "inputs": [{ "name": "_contentHash", "type": "string" }, { "name": "_goal", "type": "uint256" }, { "name": "_duration", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "getCampaigns", "inputs": [], "outputs": [{ "components": [{ "name": "owner", "type": "address" }, { "name": "contentHash", "type": "string" }, { "name": "goal", "type": "uint256" }, { "name": "deadline", "type": "uint256" }, { "name": "amountCollected", "type": "uint256" }, { "name": "claimed", "type": "bool" }], "type": "tuple[]" }], "stateMutability": "view" },
  { "type": "function", "name": "donateToCampaign", "inputs": [{ "name": "_id", "type": "uint256" }], "outputs": [], "stateMutability": "payable" },
  { "type": "function", "name": "withdrawFunds", "inputs": [{ "name": "_id", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "claimRefund", "inputs": [{ "name": "_id", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "type": "function", "name": "donations", "inputs": [{ "name": "", "type": "uint256" }, { "name": "", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" }
] as const;

const CATEGORIES = ["Technology", "Art", "Cinema", "Games", "Social"];

// --- TARJETA INTELIGENTE ---
function CampaignCard({ campaign, index, now, address, filter }: any) {
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [donationAmount, setDonationAmount] = useState('');
    
    const { openConnectModal } = useConnectModal();

    // Leemos donaciones
    const { data: myDonation, refetch: refetchDonation } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'donations',
        args: [BigInt(index), address || ZERO_ADDRESS],
    });

    const { writeContract, data: hash, isPending: isSignPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            refetchDonation();
        }
    }, [isConfirmed, refetchDonation]);

    useEffect(() => {
        if (!campaign.contentHash) return;
        fetch(`https://gateway.pinata.cloud/ipfs/${campaign.contentHash}`)
            .then(res => res.json())
            .then(data => { setMetadata(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, [campaign.contentHash]);

    if (metadata && filter !== 'All' && metadata.category !== filter) return null;

    const collected = Number(formatEther(campaign.amountCollected));
    const goal = Number(formatEther(campaign.goal));
    const progress = Math.min((collected / goal) * 100, 100);
    const deadlineMs = Number(campaign.deadline) * 1000;
    
    const isClosed = now > deadlineMs;
    const isOwner = address && campaign.owner.toLowerCase() === address.toLowerCase();

    const isProcessing = isSignPending || isConfirming;

    const timeLeftMs = Math.max(0, deadlineMs - now);
    const daysLeft = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minsLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const secsLeft = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    const handleInvest = () => {
        if (!address) {
            if (openConnectModal) openConnectModal();
            else alert("Please connect your wallet!");
            return;
        }
        writeContract({ 
            address: CONTRACT_ADDRESS, 
            abi: CONTRACT_ABI, 
            functionName: 'donateToCampaign', 
            args: [BigInt(index)], 
            value: parseEther(donationAmount || '0.1') 
        });
    };

    const handleRefund = () => {
        writeContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'claimRefund', args: [BigInt(index)] });
    }

    const handleWithdraw = () => {
        writeContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'withdrawFunds', args: [BigInt(index)] });
    }

    if (loading) return <div className="h-[400px] w-full bg-slate-900/50 rounded-[2rem] animate-pulse border border-slate-800"></div>;

    return (
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 group flex flex-col animate-fade-in w-full h-full relative">
            
            {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/60 z-50 flex flex-col items-center justify-center backdrop-blur-[2px] animate-in fade-in rounded-[2rem]">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest animate-pulse">Confirming Transaction...</p>
                </div>
            )}

            <div className="h-44 bg-slate-950 relative overflow-hidden flex-shrink-0">
                <img src={metadata?.image || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 right-3 bg-slate-950/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold border border-slate-800 uppercase tracking-widest">{metadata?.category}</div>
                <div className="absolute top-3 left-3 bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-slate-800 text-slate-300">
                    {isClosed ? <span className="text-rose-400">Ended</span> : <span className="font-mono">{daysLeft > 0 ? `${daysLeft}d ${hoursLeft}h left` : `${hoursLeft}h ${minsLeft}m ${secsLeft}s`}</span>}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
                <div>
                    <h4 className="text-xl font-bold leading-tight mb-1 text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{metadata?.title}</h4>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed h-8">{metadata?.description}</p>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-400 font-mono">
                        <span className="text-cyan-400">{collected} ETH</span>
                        <span>{goal} ETH</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/50">
                        <div className={`h-full shadow-[0_0_15px_rgba(50,255,255,0.3)] ${progress >= 100 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="pt-1">
                    {isOwner ? (
                         isClosed && collected >= goal ? (
                             campaign.claimed ? 
                             <div className="bg-emerald-500/10 text-emerald-400 py-2.5 rounded-xl font-bold text-center border border-emerald-500/20 text-xs">✅ Withdrawn</div> :
                             <button disabled={isProcessing} onClick={handleWithdraw} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold transition-all text-xs disabled:opacity-50 disabled:cursor-wait">
                                {isProcessing ? 'Processing...' : '💰 Withdraw Funds'}
                             </button>
                           ) : (
                            <div className={`w-full py-2.5 rounded-xl font-bold text-center border text-xs ${isClosed ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-800/50 text-slate-400 border-slate-700/50'}`}>
                                {isClosed ? "Goal Not Reached" : "Active Campaign (Owner)"}
                            </div>
                          )
                    ) : (
                        <div className="flex flex-col gap-2">
                            {!isClosed && (
                                <div className="flex gap-2">
                                    <input type="number" placeholder="0.1" step="0.01" value={donationAmount} onChange={e => setDonationAmount(e.target.value)} disabled={isProcessing}
                                        className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 outline-none focus:border-cyan-500 text-center font-mono text-sm disabled:opacity-50" />
                                    
                                    <button disabled={isProcessing} onClick={handleInvest}
                                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-wait text-xs py-2.5 shadow-lg shadow-cyan-500/20">
                                            {isProcessing ? 'Investing...' : (address ? 'Invest' : 'Connect to Invest')}
                                    </button>
                                </div>
                            )}
                            
                            {isClosed && collected < goal && address && Number(myDonation) > 0 && (
                                <button disabled={isProcessing} onClick={handleRefund} 
                                    className="w-full text-[10px] font-bold text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 py-2.5 rounded-xl transition-colors uppercase tracking-widest animate-pulse disabled:opacity-50 disabled:animate-none disabled:cursor-wait flex justify-center items-center gap-2">
                                    {isProcessing ? 'Processing Refund...' : `Claim Refund (${formatEther(myDonation as bigint)} ETH)`}
                                </button>
                            )}

                            {isClosed && collected < goal && (!address || !myDonation || Number(myDonation) === 0) && (
                                <div className="text-center text-xs text-slate-500 font-mono py-2">Campaign Ended (Failed)</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function Crowdfunding() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount(); 
  const router = useRouter();
  const [status, setStatus] = useState(''); 
  
  const [form, setForm] = useState({ title: '', desc: '', category: 'Technology', goal: '' });
  const [duration, setDuration] = useState({ days: '', hours: '', minutes: '' });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(''); 
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [now, setNow] = useState(Date.now());
  useEffect(() => { 
      const i = setInterval(() => setNow(Date.now()), 1000); 
      return () => clearInterval(i); 
  }, []);

  const { data: campaignsRaw, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getCampaigns', query: { refetchInterval: 2000 }
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { 
    if (isSuccess) { setStatus(''); refetch(); resetDashboard(); }
  }, [isSuccess, refetch]);

  const resetDashboard = (e?: React.MouseEvent) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      setForm({ title: '', desc: '', category: 'Technology', goal: '' });
      setDuration({ days: '', hours: '', minutes: '' }); 
      setImageFile(null);
      setPreview('');
      setStatus('');
      setCategoryFilter('All');
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  const adjustGoal = (amount: number) => {
      const current = parseFloat(form.goal) || 0;
      const newVal = Math.max(0.01, current + amount).toFixed(2);
      setForm({...form, goal: newVal});
  }

  const handlePublish = async () => {
      if (!address) return alert("Please connect your wallet first to create a campaign.");
      if (!imageFile) return;

      const d = parseInt(String(duration.days) || '0');
      const h = parseInt(String(duration.hours) || '0');
      const m = parseInt(String(duration.minutes) || '0');

      const totalSeconds = (d * 86400) + (h * 3600) + (m * 60);

      if (totalSeconds < 60) {
        alert("Campaign must last at least 1 minute.");
        return;
      }

      setStatus('Uploading...');
      try {
          const formData = new FormData();
          formData.append("file", imageFile);
          const resImg = await fetch("/api/pinata", { method: "POST", body: formData });
          const imgData = await resImg.json();
          const imageUrl = `https://gateway.pinata.cloud/ipfs/${imgData.IpfsHash}`;

          const metadata = { title: form.title, description: form.desc, image: imageUrl, category: form.category };
          const resMeta = await fetch("/api/pinata", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(metadata) });
          const metaData = await resMeta.json();

          writeContract({ 
            address: CONTRACT_ADDRESS, 
            abi: CONTRACT_ABI, 
            functionName: 'createCampaign', 
            args: [metaData.IpfsHash, parseEther(form.goal || '0'), BigInt(totalSeconds)] 
          });
      } catch (e) { console.error(e); setStatus('Error'); }
  };

  if (!mounted) return null;
  const list = (campaignsRaw as any[]) || [];
  const filterList = ["All", ...CATEGORIES];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* ---------------- BARRA LATERAL (ASIDE) ---------------- */}
      <aside className="w-full md:w-[550px] lg:w-[700px] bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-900 flex flex-col md:h-screen z-20 relative shadow-2xl flex-shrink-0">
        <div className="p-6 pt-20 md:pt-10 lg:p-5 space-y-1 md:overflow-y-auto h-full scrollbar-hide">
            
            <div className="flex flex-col gap-4 mb-4">

                <div className="w-full flex flex-col items-center text-center">
                    
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <button onClick={handleBack} className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 transition-all shadow-lg group">
                            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        </button>
                        <div onClick={resetDashboard} className="cursor-pointer group select-none">
                            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text group-hover:opacity-80 transition-opacity">
                                Crowdfunding 🚀
                            </h1>
                        </div>
                    </div>

                    <p className="text-slate-500 text-[10px] font-mono mt-1 uppercase tracking-widest">
                        Decentralized Fund v1.0
                    </p>

                    <a href="https://sepolia.etherscan.io/address/0x167be4137F6267f19aB865b32843385B70cf2D2e#code" target="_blank" rel="noopener noreferrer"
                        className="flex w-fit items-center gap-2 bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-2 hover:bg-emerald-900/40 hover:border-emerald-500/40 transition-all group cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] mt-3">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest group-hover:text-emerald-300 transition-colors">View on Etherscan</span>
                    </a>
                </div>
            </div>

            <div className={`bg-slate-900/50 p-8 rounded-[2.5rem] border relative overflow-hidden shadow-inner transition-colors ${!address ? 'border-indigo-500/50 bg-indigo-900/10' : 'border-slate-800'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${address ? 'bg-emerald-500' : 'bg-amber-500'}`}></span> 
                    {address ? 'Create Project' : 'Connect to Create'}
                </h2>

                <div className={`space-y-6 ${!address ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-wider uppercase">Project Title</label>
                        <input className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-indigo-500 text-base placeholder:text-slate-700 transition-all" 
                            placeholder="e.g. Future Tech" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-wider uppercase">Goal (ETH)</label>
                            <div className="relative">
                                <input type="number" placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none font-mono text-base pr-8 transition-all" 
                                    value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} />
                                <div className="absolute right-1 top-1 bottom-1 w-8 flex flex-col border-l border-slate-800">
                                    <button onClick={() => adjustGoal(0.5)} className="flex-1 hover:bg-slate-800 rounded-tr-xl flex items-center justify-center text-slate-500 hover:text-white"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path></svg></button>
                                    <button onClick={() => adjustGoal(-0.5)} className="flex-1 hover:bg-slate-800 rounded-br-xl flex items-center justify-center text-slate-500 hover:text-white border-t border-slate-800"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg></button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-wider uppercase">Duration</label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input type="number" min="0" placeholder="0" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none text-center font-mono text-base focus:border-indigo-500 placeholder:text-slate-800"
                                        value={duration.days} onChange={e => setDuration({...duration, days: e.target.value})} />
                                    <span className="absolute bottom-1 left-0 w-full text-center text-[8px] text-slate-600 font-bold uppercase">Days</span>
                                </div>
                                <div className="flex-1 relative">
                                    <input type="number" min="0" max="23" placeholder="0" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none text-center font-mono text-base focus:border-indigo-500 placeholder:text-slate-800"
                                        value={duration.hours} onChange={e => setDuration({...duration, hours: e.target.value})} />
                                    <span className="absolute bottom-1 left-0 w-full text-center text-[8px] text-slate-600 font-bold uppercase">Hrs</span>
                                </div>
                                <div className="flex-1 relative">
                                    <input type="number" min="0" max="59" placeholder="0" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none text-center font-mono text-base focus:border-indigo-500 placeholder:text-slate-800"
                                        value={duration.minutes} onChange={e => setDuration({...duration, minutes: e.target.value})} />
                                    <span className="absolute bottom-1 left-0 w-full text-center text-[8px] text-slate-600 font-bold uppercase">Mins</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-wider uppercase">Tag / Category</label>
                        <div className="relative">
                            <select className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none text-slate-300 text-base appearance-none pr-8 transition-all cursor-pointer hover:border-indigo-500/50" 
                                value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-auto sm:h-52">
                        <div className="space-y-2 h-40 sm:h-full flex flex-col">
                             <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-wider uppercase">Cover</label>
                             <div className="relative group flex-1 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-indigo-500 hover:bg-slate-900 transition-all cursor-pointer bg-slate-950/30">
                                <input type="file" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                {preview ? <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-80" /> : <div className="text-center"><div className="text-3xl mb-2">📸</div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Upload</p></div>}
                             </div>
                        </div>
                        <div className="space-y-2 h-40 sm:h-full flex flex-col">
                            <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-wider uppercase">Story</label>
                            <textarea className="w-full flex-1 bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none resize-none text-slate-300 text-sm transition-all leading-relaxed placeholder:text-slate-700" 
                                placeholder="Describe project..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
                        </div>
                    </div>

                    <button type="button" onClick={handlePublish} disabled={isPending || status !== '' || !imageFile || !address} 
                        className="w-full py-5 rounded-2xl font-bold text-base bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {status || (address ? 'Launch Campaign 🚀' : 'Connect Wallet to Launch')}
                    </button>
                </div>
                
                {!address && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                         <div className="bg-slate-950/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-indigo-500/50 shadow-2xl transform translate-y-12">
                             <p className="text-indigo-400 font-bold text-sm">🔒 Connect Wallet to Create Project</p>
                         </div>
                    </div>
                )}
            </div>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 bg-slate-950 h-screen overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="p-6 lg:p-12 pb-32 relative z-10">
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl py-6 -mx-6 px-6 lg:-mx-12 lg:px-12 border-b border-slate-900 mb-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <h3 className="text-3xl font-bold text-white tracking-tight">Explore Projects</h3>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">Discover and fund the future.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {filterList.map((cat) => (
                            <button key={cat} onClick={() => setCategoryFilter(cat)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${categoryFilter === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 justify-items-center xl:justify-items-stretch">
                {list.map((c, i) => (
                    <div key={i} className="w-full max-w-[450px] xl:max-w-none h-full">
                        <CampaignCard index={i} campaign={c} now={now} address={address} filter={categoryFilter} />
                    </div>
                ))}
            </div>

            {list.length === 0 && (
                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-900 rounded-[3rem] text-slate-600">
                    <p className="text-lg font-medium">No campaigns found.</p>
                </div>
            )}
        </div>
      </main>

      {hash && <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl text-xs z-50 animate-bounce font-mono flex items-center gap-3"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> TX Sent: {hash.substring(0, 10)}...</div>}
    </div>
  );
}
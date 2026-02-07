'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Crowdfunding } from '../components/Crowdfunding'; 
import { Hero } from '../components/Hero';

function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Leemos el parámetro 'view' de la URL para persistencia
  const view = searchParams?.get('view');
  const showApp = view === 'app';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Navegación suave hacia la App cambiando la URL
  const handleEnter = () => {
    router.push('/?view=app');
  };

  // Volver al Hero limpiando la URL
  const handleBack = () => {
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen w-full bg-slate-950">
      
      {/* Botón Wallet: Visible solo si el usuario decidió entrar a la App */}
      {showApp && (
        <div className="absolute top-6 right-6 z-50 animate-fade-in">
          <ConnectButton />
        </div>
      )}

      {/* Lógica de renderizado basada en la URL */}
      {!showApp ? (
        <Hero onEnter={handleEnter} />
      ) : (
        <div className="animate-fade-in h-full w-full">
           <button 
             onClick={handleBack} 
             className="fixed top-8 left-8 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] z-50 transition-all bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md"
           >
             ← Back to Home
           </button>
           <Crowdfunding />
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono uppercase tracking-widest">
        Loading System...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
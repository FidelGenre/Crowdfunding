'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Crowdfunding } from '../components/Crowdfunding'; 
import { Hero } from '../components/Hero';

/**
 * HomeContent Component
 * Manages the main logic for switching between the Hero (landing) 
 * and the Crowdfunding (application) views using URL parameters.
 */
function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Read the 'view' parameter from the URL for state persistence
  const view = searchParams?.get('view');
  const showApp = view === 'app';

  // Ensure the component is mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth navigation to the App by updating the URL
  const handleEnter = () => {
    router.push('/?view=app');
  };

  // Return to the Hero section by clearing the URL parameters
  const handleBack = () => {
    router.push('/');
  };

  // Prevent rendering until the client-side mounting is complete
  if (!mounted) return null;

  return (
    <main className="relative min-h-screen w-full bg-slate-950">
      
      {/* Wallet Button: Only visible if the user is inside the App view */}
      {showApp && (
        <div className="absolute top-6 right-6 z-50 animate-fade-in">
          <ConnectButton />
        </div>
      )}

      {/* Conditional rendering logic based on the URL 'view' param */}
      {!showApp ? (
        <Hero onEnter={handleEnter} />
      ) : (
        <div className="animate-fade-in h-full w-full">
           <Crowdfunding />
        </div>
      )}
    </main>
  );
}

/**
 * Main Page Component
 * Wrapped in Suspense to handle Next.js client-side search params correctly.
 */
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
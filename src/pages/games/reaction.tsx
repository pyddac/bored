import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ChevronLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

type GameState = 'waiting' | 'ready' | 'clicked' | 'too-early' | 'idle';

export default function Reaction() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useLocalStorage<number | null>("bored-games-reaction-score", null);
  const [attempts, setAttempts] = useState<number[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTest = () => {
    setGameState('waiting');
    setReactionTime(null);
    
    // Random delay between 2 and 5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'idle' || gameState === 'clicked' || gameState === 'too-early') {
      startTest();
      return;
    }

    if (gameState === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('too-early');
      return;
    }

    if (gameState === 'ready') {
      const endTime = Date.now();
      const time = endTime - startTimeRef.current;
      setReactionTime(time);
      setGameState('clicked');
      
      setAttempts(prev => [...prev, time]);
      
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const average = attempts.length > 0 
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) 
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-[#ff0055]/30 bg-card/50 backdrop-blur z-20 relative">
        <Link href="/" className="flex items-center text-[#ff0055] hover:text-[#ff0055]/80 transition-colors">
          <ChevronLeft className="w-6 h-6 mr-2" />
          <span className="font-mono uppercase font-bold tracking-wider">Back to Hub</span>
        </Link>
        <h1 className="text-2xl font-black uppercase text-[#ff0055] tracking-widest" style={{ textShadow: '0 0 10px rgba(255,0,85,0.5)' }}>Reaction</h1>
        <div className="w-32" />
      </header>

      <main className="flex-1 relative flex flex-col items-center">
        <div className="absolute top-8 w-full flex justify-center space-x-16 font-mono text-[#ff0055] z-20 pointer-events-none">
          <div className="text-center bg-background/80 px-4 py-2 rounded border border-[#ff0055]/30 backdrop-blur">
            <p className="text-xs opacity-70 uppercase tracking-widest">Average</p>
            <p className="text-2xl font-bold">{average ? `${average}ms` : '-'}</p>
          </div>
          <div className="text-center bg-background/80 px-4 py-2 rounded border border-[#ff0055]/30 backdrop-blur">
            <p className="text-xs opacity-70 uppercase tracking-widest">Best</p>
            <p className="text-2xl font-bold">{bestTime ? `${bestTime}ms` : '-'}</p>
          </div>
        </div>

        <div 
          onClick={handleClick}
          className={`
            absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors duration-100
            ${gameState === 'idle' ? 'bg-card' : ''}
            ${gameState === 'waiting' ? 'bg-[#ff0055]/20' : ''}
            ${gameState === 'ready' ? 'bg-[#00ff00]' : ''}
            ${gameState === 'too-early' ? 'bg-[#ff0055]' : ''}
            ${gameState === 'clicked' ? 'bg-card' : ''}
          `}
        >
          <div className="text-center pointer-events-none">
            {gameState === 'idle' && (
              <>
                <Zap className="w-24 h-24 text-[#ff0055] mx-auto mb-6 opacity-50" />
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#ff0055] mb-4">Click to Start</h2>
                <p className="text-muted-foreground font-mono">When the background turns green, click as fast as you can.</p>
              </>
            )}

            {gameState === 'waiting' && (
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-widest text-[#ff0055]" style={{ textShadow: '0 0 20px rgba(255,0,85,0.5)' }}>
                Wait for Green...
              </h2>
            )}

            {gameState === 'ready' && (
              <h2 className="text-6xl md:text-9xl font-black uppercase tracking-widest text-background">
                CLICK!
              </h2>
            )}

            {gameState === 'too-early' && (
              <>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-widest text-background mb-4">
                  Too Early!
                </h2>
                <p className="text-background/80 font-mono text-xl">Click anywhere to try again.</p>
              </>
            )}

            {gameState === 'clicked' && (
              <>
                <p className="text-xl font-mono text-[#ff0055] mb-2 uppercase tracking-widest">Your Time</p>
                <h2 className="text-6xl md:text-8xl font-black text-[#ff0055] mb-8" style={{ textShadow: '0 0 20px rgba(255,0,85,0.5)' }}>
                  {reactionTime}ms
                </h2>
                <p className="text-muted-foreground font-mono">Click anywhere to go again.</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

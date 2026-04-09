import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const CARD_SYMBOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Memory() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bestMoves, setBestMoves] = useLocalStorage("bored-games-memory-score", 0);

  const initGame = () => {
    const shuffled = [...CARD_SYMBOLS, ...CARD_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && matches < CARD_SYMBOLS.length) {
      timer = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, matches]);

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 || 
      cards[index].isFlipped || 
      cards[index].isMatched ||
      !isPlaying
    ) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      
      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        setTimeout(() => {
          setCards(prev => {
            const matched = [...prev];
            matched[firstIdx].isMatched = true;
            matched[secondIdx].isMatched = true;
            return matched;
          });
          setMatches(m => m + 1);
          setFlippedIndices([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const unflipped = [...prev];
            unflipped[firstIdx].isFlipped = false;
            unflipped[secondIdx].isFlipped = false;
            return unflipped;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const isGameOver = matches === CARD_SYMBOLS.length && cards.length > 0;

  useEffect(() => {
    if (isGameOver) {
      setIsPlaying(false);
      if (bestMoves === 0 || moves < bestMoves) {
        setBestMoves(moves);
      }
    }
  }, [isGameOver, moves, bestMoves, setBestMoves]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-[#00ff00]/30 bg-card/50 backdrop-blur">
        <Link href="/" className="flex items-center text-[#00ff00] hover:text-[#00ff00]/80 transition-colors">
          <ChevronLeft className="w-6 h-6 mr-2" />
          <span className="font-mono uppercase font-bold tracking-wider">Back to Hub</span>
        </Link>
        <h1 className="text-2xl font-black uppercase text-[#00ff00] tracking-widest" style={{ textShadow: '0 0 10px rgba(0,255,0,0.5)' }}>Memory Match</h1>
        <div className="w-32" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex space-x-12 font-mono text-[#00ff00]">
          <div className="text-center">
            <p className="text-sm opacity-70 uppercase tracking-widest">Moves</p>
            <p className="text-4xl font-bold">{moves}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-70 uppercase tracking-widest">Time</p>
            <p className="text-4xl font-bold">{time}s</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-sm opacity-70 uppercase tracking-widest">Best</p>
            <p className="text-4xl font-bold">{bestMoves || '-'}</p>
          </div>
        </div>

        <div className="relative">
          {!isPlaying && !isGameOver && cards.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center z-10 w-[320px] h-[320px]">
               <Button 
                 onClick={initGame}
                 className="bg-[#00ff00] text-background hover:bg-[#00ff00]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none"
               >
                 Start Game
               </Button>
             </div>
          )}

          <div className="grid grid-cols-4 gap-4" style={{ minWidth: '320px' }}>
            {cards.map((card, index) => (
              <div 
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`
                  w-16 h-24 sm:w-20 sm:h-28 cursor-pointer
                  perspective-1000
                `}
              >
                <div className={`
                  relative w-full h-full transition-transform duration-500 transform-style-3d
                  ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
                `}>
                  {/* Front (hidden side) */}
                  <div className="absolute w-full h-full backface-hidden bg-card border-2 border-[#00ff00]/50 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.1)] hover:border-[#00ff00] hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all">
                    <div className="w-8 h-8 rounded-full border-2 border-[#00ff00]/30" />
                  </div>
                  
                  {/* Back (revealed side) */}
                  <div className={`
                    absolute w-full h-full backface-hidden rotate-y-180 rounded-lg flex items-center justify-center text-3xl font-black
                    ${card.isMatched ? 'bg-[#00ff00]/20 border-2 border-[#00ff00]' : 'bg-[#00ff00] text-background'}
                  `}>
                    {card.symbol}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isGameOver && (
             <div className="absolute inset-0 -m-8 bg-background/90 flex flex-col items-center justify-center backdrop-blur-md z-10 border-4 border-[#00ff00] rounded-xl">
               <h2 className="text-4xl font-black text-[#00ff00] mb-4 uppercase tracking-widest" style={{ textShadow: '0 0 15px rgba(0,255,0,0.5)' }}>You Win!</h2>
               <p className="text-foreground font-mono mb-2">Moves: {moves}</p>
               <p className="text-foreground font-mono mb-8">Time: {time}s</p>
               <Button 
                 onClick={initGame}
                 className="bg-[#00ff00] text-background hover:bg-[#00ff00]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none flex items-center"
               >
                 <RotateCcw className="mr-2" /> Play Again
               </Button>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

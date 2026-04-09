import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WORDS = [
  "REACT", "JAVASCRIPT", "TYPESCRIPT", "PROGRAMMING", "DEVELOPER",
  "KEYBOARD", "MONITOR", "BROWSER", "INTERNET", "COMPUTER",
  "APPLICATION", "INTERFACE", "COMPONENT", "FRAMEWORK", "LIBRARY",
  "VARIABLE", "FUNCTION", "PROMISE", "ASYNC", "AWAIT",
  "ARCADE", "JOYSTICK", "CONSOLE", "GAMING", "CONTROLLER",
  "NEON", "RETRO", "VINTAGE", "CLASSIC", "PIXEL"
];

const scrambleWord = (word: string) => {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

export default function WordScramble() {
  const [currentWord, setCurrentWord] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useLocalStorage("bored-games-word-score", 0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const nextWord = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    let sc = scrambleWord(word);
    while (sc === word) sc = scrambleWord(word); // Ensure it's actually scrambled
    setScrambled(sc);
    setGuess("");
    if (inputRef.current) inputRef.current.focus();
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setGameOver(false);
    nextWord();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      setGameOver(true);
      if (score > highScore) setHighScore(score);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, highScore, setHighScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;

    if (guess.toUpperCase() === currentWord) {
      setScore(s => s + currentWord.length * 10);
      setTimeLeft(t => Math.min(t + 3, 60)); // Bonus time for correct answer
      nextWord();
    } else {
      // Shake animation effect could be added here
      setGuess("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-[#aa00ff]/30 bg-card/50 backdrop-blur">
        <Link href="/" className="flex items-center text-[#aa00ff] hover:text-[#aa00ff]/80 transition-colors">
          <ChevronLeft className="w-6 h-6 mr-2" />
          <span className="font-mono uppercase font-bold tracking-wider">Back to Hub</span>
        </Link>
        <h1 className="text-2xl font-black uppercase text-[#aa00ff] tracking-widest" style={{ textShadow: '0 0 10px rgba(170,0,255,0.5)' }}>Scramble</h1>
        <div className="w-32" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-12 w-full max-w-md flex justify-between font-mono text-[#aa00ff] bg-card p-6 rounded-xl border-2 border-[#aa00ff]/30">
          <div className="text-center">
            <p className="text-sm opacity-70 uppercase tracking-widest mb-1">Time</p>
            <p className={`text-4xl font-bold ${timeLeft <= 5 ? 'text-[#ff0055] animate-pulse' : ''}`}>{timeLeft}s</p>
          </div>
          <div className="text-center border-l border-r border-[#aa00ff]/20 px-8">
            <p className="text-sm opacity-70 uppercase tracking-widest mb-1">Score</p>
            <p className="text-4xl font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-70 uppercase tracking-widest mb-1">Best</p>
            <p className="text-4xl font-bold">{highScore}</p>
          </div>
        </div>

        <div className="w-full max-w-md relative min-h-[300px] flex flex-col items-center justify-center">
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground font-mono mb-8 max-w-xs">Unscramble the letters to form words. Correct answers grant bonus time!</p>
              <Button 
                onClick={startGame}
                className="bg-[#aa00ff] text-background hover:bg-[#aa00ff]/80 font-bold uppercase tracking-widest px-12 py-8 text-xl rounded-none w-full shadow-[0_0_20px_rgba(170,0,255,0.4)] hover:shadow-[0_0_30px_rgba(170,0,255,0.6)] transition-all"
              >
                Start Game
              </Button>
            </div>
          )}

          {isPlaying && (
            <div className="w-full flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {scrambled.split('').map((letter, i) => (
                  <div 
                    key={i} 
                    className="w-14 h-14 bg-card border-2 border-[#aa00ff] rounded flex items-center justify-center text-3xl font-black text-[#aa00ff] shadow-[0_0_15px_rgba(170,0,255,0.2)] transform hover:scale-110 transition-transform cursor-default"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="w-full relative">
                <Input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value.toUpperCase())}
                  placeholder="TYPE ANSWER HERE..."
                  className="w-full text-center text-2xl font-mono py-8 bg-background border-2 border-[#aa00ff]/50 focus-visible:border-[#aa00ff] focus-visible:ring-2 focus-visible:ring-[#aa00ff]/30 text-foreground uppercase"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                />
              </form>
              <div className="mt-6 flex space-x-4">
                <Button 
                  onClick={() => setGuess("")} 
                  variant="outline" 
                  className="border-[#aa00ff]/30 text-[#aa00ff] hover:bg-[#aa00ff]/10 font-mono"
                >
                  Clear
                </Button>
                <Button 
                  onClick={nextWord} 
                  variant="outline" 
                  className="border-[#aa00ff]/30 text-[#aa00ff] hover:bg-[#aa00ff]/10 font-mono"
                >
                  Skip (-10 pts)
                </Button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-background/80 backdrop-blur-sm border-2 border-[#aa00ff] rounded-xl">
              <h2 className="text-4xl font-black text-[#aa00ff] mb-2 uppercase tracking-widest" style={{ textShadow: '0 0 15px rgba(170,0,255,0.5)' }}>Time's Up!</h2>
              <p className="text-muted-foreground font-mono mb-2">The word was: <span className="text-foreground font-bold">{currentWord}</span></p>
              <p className="text-2xl font-mono text-[#aa00ff] mb-8 border-b-2 border-[#aa00ff]/30 pb-4 inline-block px-8">Final Score: {score}</p>
              <Button 
                onClick={startGame}
                className="bg-[#aa00ff] text-background hover:bg-[#aa00ff]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none flex items-center"
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

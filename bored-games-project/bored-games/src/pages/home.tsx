import { Link } from "wouter";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Gamepad2, BrainCircuit, Zap, Target, Hash, Shuffle } from "lucide-react";

export default function Home() {
  const [snakeScore] = useLocalStorage("bored-games-snake-score", 0);
  const [tetrisScore] = useLocalStorage("bored-games-tetris-score", 0);
  const [memoryScore] = useLocalStorage("bored-games-memory-score", 0);
  const [game2048Score] = useLocalStorage("bored-games-2048-score", 0);
  const [reactionScore] = useLocalStorage("bored-games-reaction-score", 0);
  const [wordScore] = useLocalStorage("bored-games-word-score", 0);

  const games = [
    {
      title: "Snake",
      path: "/games/snake",
      description: "Eat food, grow long, don't crash.",
      score: snakeScore,
      scoreLabel: "Best Score",
      icon: Gamepad2,
      colorClass: "text-[#00ffff] border-[#00ffff]",
      bgClass: "hover:bg-[#00ffff]/10",
      shadowClass: "hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]",
    },
    {
      title: "Tetris",
      path: "/games/tetris",
      description: "Stack blocks, clear lines.",
      score: tetrisScore,
      scoreLabel: "Best Score",
      icon: Hash,
      colorClass: "text-[#ff00ff] border-[#ff00ff]",
      bgClass: "hover:bg-[#ff00ff]/10",
      shadowClass: "hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]",
    },
    {
      title: "Memory Match",
      path: "/games/memory",
      description: "Flip cards and find pairs.",
      score: memoryScore,
      scoreLabel: "Best Moves",
      icon: BrainCircuit,
      colorClass: "text-[#00ff00] border-[#00ff00]",
      bgClass: "hover:bg-[#00ff00]/10",
      shadowClass: "hover:shadow-[0_0_20px_rgba(0,255,0,0.3)]",
    },
    {
      title: "2048",
      path: "/games/2048",
      description: "Slide and merge to 2048.",
      score: game2048Score,
      scoreLabel: "Best Score",
      icon: Target,
      colorClass: "text-[#ffaa00] border-[#ffaa00]",
      bgClass: "hover:bg-[#ffaa00]/10",
      shadowClass: "hover:shadow-[0_0_20px_rgba(255,170,0,0.3)]",
    },
    {
      title: "Reaction Time",
      path: "/games/reaction",
      description: "Click when the color changes.",
      score: reactionScore ? `${reactionScore}ms` : "-",
      scoreLabel: "Best Time",
      icon: Zap,
      colorClass: "text-[#ff0055] border-[#ff0055]",
      bgClass: "hover:bg-[#ff0055]/10",
      shadowClass: "hover:shadow-[0_0_20px_rgba(255,0,85,0.3)]",
    },
    {
      title: "Word Scramble",
      path: "/games/word-scramble",
      description: "Unscramble words quickly.",
      score: wordScore,
      scoreLabel: "Best Score",
      icon: Shuffle,
      colorClass: "text-[#aa00ff] border-[#aa00ff]",
      bgClass: "hover:bg-[#aa00ff]/10",
      shadowClass: "hover:shadow-[0_0_20px_rgba(170,0,255,0.3)]",
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#00ff00] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Bored? Play!
          </h1>
          <p className="text-xl text-muted-foreground font-mono">
            YOUR SECRET NEON ARCADE
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <Link key={index} href={game.path} className="block">
              <div 
                className={`
                  relative overflow-hidden rounded-xl border-2 p-6 h-full
                  transition-all duration-300 ease-out transform hover:-translate-y-2
                  bg-card/50 backdrop-blur-sm
                  ${game.colorClass} ${game.bgClass} ${game.shadowClass}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <game.icon className="w-10 h-10" />
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider opacity-70">{game.scoreLabel}</p>
                    <p className="text-2xl font-bold font-mono">{game.score || '-'}</p>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">{game.title}</h2>
                <p className="opacity-80 font-mono text-sm">{game.description}</p>
                
                {/* Decorative scanning line effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-current opacity-20 transform -translate-y-full group-hover:animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

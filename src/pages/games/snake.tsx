import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

export default function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useLocalStorage("bored-games-snake-score", 0);
  
  const directionRef = useRef(direction);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Make sure food isn't on the snake
      const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    generateFood();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) {
        if (e.code === 'Space' && gameOver) resetGame();
        return;
      }
      
      const currentDir = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          handleGameOver();
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          generateFood();
        } else {
          newSnake.pop();
        }

        setDirection(currentDir);
        return newSnake;
      });
    };

    const speed = Math.max(50, BASE_SPEED - Math.floor(score / 50) * 10);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, food, score, generateFood]);

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-[#00ffff]/30 bg-card/50 backdrop-blur">
        <Link href="/" className="flex items-center text-[#00ffff] hover:text-[#00ffff]/80 transition-colors">
          <ChevronLeft className="w-6 h-6 mr-2" />
          <span className="font-mono uppercase font-bold tracking-wider">Back to Hub</span>
        </Link>
        <h1 className="text-2xl font-black uppercase text-[#00ffff] tracking-widest" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>Snake</h1>
        <div className="w-32" /> {/* Spacer */}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex space-x-12 font-mono text-[#00ffff]">
          <div className="text-center">
            <p className="text-sm opacity-70 uppercase tracking-widest">Score</p>
            <p className="text-4xl font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-70 uppercase tracking-widest">Best</p>
            <p className="text-4xl font-bold">{highScore}</p>
          </div>
        </div>

        <div 
          className="relative bg-card border-4 border-[#00ffff] shadow-[0_0_30px_rgba(0,255,255,0.2)] rounded-lg overflow-hidden"
          style={{ 
            width: `${GRID_SIZE * 20}px`, 
            height: `${GRID_SIZE * 20}px`,
            backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* Food */}
          <div 
            className="absolute bg-[#ff00ff] rounded-full shadow-[0_0_10px_rgba(255,0,255,0.8)]"
            style={{
              width: '20px',
              height: '20px',
              left: `${food.x * 20}px`,
              top: `${food.y * 20}px`,
              transform: 'scale(0.8)'
            }}
          />

          {/* Snake */}
          {snake.map((segment, i) => (
            <div 
              key={i}
              className={`absolute ${i === 0 ? 'bg-[#00ffff]' : 'bg-[#00ffff]/80'} rounded-sm`}
              style={{
                width: '20px',
                height: '20px',
                left: `${segment.x * 20}px`,
                top: `${segment.y * 20}px`,
                transform: 'scale(0.9)',
                boxShadow: i === 0 ? '0 0 15px rgba(0,255,255,0.8)' : 'none'
              }}
            />
          ))}

          {/* Overlays */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
              <Button 
                onClick={resetGame}
                className="bg-[#00ffff] text-background hover:bg-[#00ffff]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center backdrop-blur-md">
              <h2 className="text-4xl font-black text-[#ff0055] mb-2 uppercase tracking-widest" style={{ textShadow: '0 0 15px rgba(255,0,85,0.5)' }}>Game Over</h2>
              <p className="text-[#00ffff] font-mono mb-8">Final Score: {score}</p>
              <Button 
                onClick={resetGame}
                className="bg-[#00ffff] text-background hover:bg-[#00ffff]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none flex items-center"
              >
                <RotateCcw className="mr-2" /> Play Again
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 text-muted-foreground font-mono text-sm text-center">
          <p>Use Arrow Keys or WASD to move.</p>
        </div>
      </main>
    </div>
  );
}

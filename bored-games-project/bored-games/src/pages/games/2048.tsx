import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Grid = number[][];

const GRID_SIZE = 4;

const getTileColor = (val: number) => {
  const colors: Record<number, { bg: string, text: string }> = {
    2: { bg: '#ffaa0022', text: '#ffaa00' },
    4: { bg: '#ffaa0044', text: '#ffaa00' },
    8: { bg: '#ffaa0066', text: '#ffaa00' },
    16: { bg: '#ffaa0088', text: '#fff' },
    32: { bg: '#ffaa00aa', text: '#fff' },
    64: { bg: '#ffaa00cc', text: '#fff' },
    128: { bg: '#ffaa00', text: '#000' },
    256: { bg: '#ff0055', text: '#fff' },
    512: { bg: '#ff00ff', text: '#fff' },
    1024: { bg: '#00ffff', text: '#000' },
    2048: { bg: '#00ff00', text: '#000' },
  };
  return colors[val] || { bg: '#ffffff', text: '#000' };
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useLocalStorage("bored-games-2048-score", 0);

  const addRandomTile = (currentGrid: Grid) => {
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentGrid;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const initGame = () => {
    let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setIsPlaying(true);
  };

  const checkGameOver = (currentGrid: Grid) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) return false;
        if (c < GRID_SIZE - 1 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
        if (r < GRID_SIZE - 1 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
      }
    }
    return true;
  };

  const slide = useCallback((direction: string) => {
    if (gameOver || won || !isPlaying) return;

    let newGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    let newScore = score;

    const rotate = (matrix: Grid) => {
      const N = matrix.length;
      const res = Array(N).fill(null).map(() => Array(N).fill(0));
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          res[c][N - 1 - r] = matrix[r][c];
        }
      }
      return res;
    };

    const slideRow = (row: number[]) => {
      let filtered = row.filter(val => val !== 0);
      let newRow = [];
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const mergedVal = filtered[i] * 2;
          newRow.push(mergedVal);
          newScore += mergedVal;
          if (mergedVal === 2048) setWon(true);
          i++;
        } else {
          newRow.push(filtered[i]);
        }
      }
      while (newRow.length < GRID_SIZE) {
        newRow.push(0);
      }
      return newRow;
    };

    if (direction === 'ArrowUp') {
      newGrid = rotate(rotate(rotate(newGrid)));
      for (let r = 0; r < GRID_SIZE; r++) {
        const row = newGrid[r];
        const slided = slideRow(row);
        if (row.join(',') !== slided.join(',')) moved = true;
        newGrid[r] = slided;
      }
      newGrid = rotate(newGrid);
    } else if (direction === 'ArrowDown') {
      newGrid = rotate(newGrid);
      for (let r = 0; r < GRID_SIZE; r++) {
        const row = newGrid[r];
        const slided = slideRow(row);
        if (row.join(',') !== slided.join(',')) moved = true;
        newGrid[r] = slided;
      }
      newGrid = rotate(rotate(rotate(newGrid)));
    } else if (direction === 'ArrowLeft') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const row = newGrid[r];
        const slided = slideRow(row);
        if (row.join(',') !== slided.join(',')) moved = true;
        newGrid[r] = slided;
      }
    } else if (direction === 'ArrowRight') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const row = newGrid[r].reverse();
        const slided = slideRow(row);
        slided.reverse();
        if (newGrid[r].reverse().join(',') !== slided.join(',')) moved = true;
        newGrid[r] = slided;
      }
    }

    if (moved) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      if (newScore > highScore) setHighScore(newScore);
      if (checkGameOver(newGrid)) setGameOver(true);
    }
  }, [grid, score, gameOver, won, isPlaying, highScore, setHighScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        slide(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slide]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-[#ffaa00]/30 bg-card/50 backdrop-blur">
        <Link href="/" className="flex items-center text-[#ffaa00] hover:text-[#ffaa00]/80 transition-colors">
          <ChevronLeft className="w-6 h-6 mr-2" />
          <span className="font-mono uppercase font-bold tracking-wider">Back to Hub</span>
        </Link>
        <h1 className="text-2xl font-black uppercase text-[#ffaa00] tracking-widest" style={{ textShadow: '0 0 10px rgba(255,170,0,0.5)' }}>2048</h1>
        <div className="w-32" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex space-x-12 font-mono text-[#ffaa00]">
          <div className="text-center">
            <p className="text-sm opacity-70 uppercase tracking-widest">Score</p>
            <p className="text-4xl font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-70 uppercase tracking-widest">Best</p>
            <p className="text-4xl font-bold">{highScore}</p>
          </div>
        </div>

        <div className="relative">
          <div className="bg-card p-3 rounded-lg border-4 border-[#ffaa00] shadow-[0_0_30px_rgba(255,170,0,0.2)]">
            <div className="grid grid-cols-4 gap-3 bg-background/50 p-3 rounded">
              {grid.map((row, rIdx) => 
                row.map((cell, cIdx) => {
                  const style = getTileColor(cell);
                  return (
                    <div 
                      key={`${rIdx}-${cIdx}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded font-black text-2xl sm:text-3xl transition-all duration-200"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        boxShadow: cell ? `0 0 10px ${style.bg}` : 'inset 0 0 10px rgba(0,0,0,0.5)'
                      }}
                    >
                      {cell !== 0 ? cell : ''}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {!isPlaying && !gameOver && !won && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm rounded-lg border-4 border-transparent z-10">
              <Button 
                onClick={initGame}
                className="bg-[#ffaa00] text-background hover:bg-[#ffaa00]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none"
              >
                Start Game
              </Button>
            </div>
          )}

          {(gameOver || won) && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center backdrop-blur-md rounded-lg border-4 border-[#ffaa00] z-10">
              <h2 className="text-4xl font-black text-[#ff0055] mb-2 uppercase tracking-widest" style={{ textShadow: '0 0 15px rgba(255,0,85,0.5)' }}>
                {won ? 'You Win!' : 'Game Over'}
              </h2>
              <p className="text-[#ffaa00] font-mono mb-8">Score: {score}</p>
              <Button 
                onClick={initGame}
                className="bg-[#ffaa00] text-background hover:bg-[#ffaa00]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none flex items-center"
              >
                <RotateCcw className="mr-2" /> Play Again
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-muted-foreground font-mono text-sm text-center">
          <p>Use Arrow Keys to merge tiles.</p>
        </div>
      </main>
    </div>
  );
}

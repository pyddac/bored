import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00ffff' }, // Cyan
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' }, // Blue
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffaa00' }, // Orange
  O: { shape: [[1, 1], [1, 1]], color: '#ffff00' }, // Yellow
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' }, // Green
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#aa00ff' }, // Purple
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0055' }, // Red
};

type TetrominoType = keyof typeof TETROMINOES;
type Grid = Array<Array<string | null>>;

const createEmptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOES) as TetrominoType[];
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOES[randKey];
};

export default function Tetris() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useLocalStorage("bored-games-tetris-score", 0);

  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: randomTetromino(),
    collided: false,
  });

  const updatePlayerPos = ({ x, y, collided }: { x: number, y: number, collided: boolean }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: COLS / 2 - 2, y: 0 },
      tetromino: randomTetromino(),
      collided: false,
    });
  }, []);

  const checkCollision = (playerData: any, targetGrid: Grid, moveX: number, moveY: number) => {
    for (let y = 0; y < playerData.tetromino.shape.length; y += 1) {
      for (let x = 0; x < playerData.tetromino.shape[y].length; x += 1) {
        if (playerData.tetromino.shape[y][x] !== 0) {
          if (
            !targetGrid[y + playerData.pos.y + moveY] ||
            !targetGrid[y + playerData.pos.y + moveY][x + playerData.pos.x + moveX] === undefined ||
            targetGrid[y + playerData.pos.y + moveY][x + playerData.pos.x + moveX] !== null
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const drop = () => {
    if (checkCollision(player, grid, 0, 1)) {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        if (score > highScore) setHighScore(score);
        return;
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    } else {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    }
  };

  const keyUp = ({ key }: { key: string }) => {
    if (!gameOver && (key === 'ArrowDown' || key === 's')) {
      setDropTime(1000 / (level + 1) + 200);
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const movePlayer = (dir: number) => {
    if (!checkCollision(player, grid, dir, 0)) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const playerRotate = (stage: Grid, dir: number) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    
    // Transpose
    const matrix = clonedPlayer.tetromino.shape;
    const rotated = matrix[0].map((_: any, i: number) => matrix.map((row: any) => row[i]));
    // Reverse
    if (dir > 0) clonedPlayer.tetromino.shape = rotated.map((row: any) => row.reverse());
    else clonedPlayer.tetromino.shape = rotated.reverse();

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, 0, 0)) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino.shape[0].length) {
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };

  const move = ({ key }: { key: string }) => {
    if (!gameOver) {
      if (key === 'ArrowLeft' || key === 'a') movePlayer(-1);
      else if (key === 'ArrowRight' || key === 'd') movePlayer(1);
      else if (key === 'ArrowDown' || key === 's') dropPlayer();
      else if (key === 'ArrowUp' || key === 'w') playerRotate(grid, 1);
    }
  };

  // Setup game loop
  useEffect(() => {
    if (dropTime !== null) {
      const interval = setInterval(() => {
        drop();
      }, dropTime);
      return () => clearInterval(interval);
    }
  }, [dropTime, drop, player]);

  useEffect(() => {
    if (!player.collided) return;

    // Merge player to grid
    const newGrid = [...grid];
    player.tetromino.shape.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0 && newGrid[y + player.pos.y]) {
          newGrid[y + player.pos.y][x + player.pos.x] = player.tetromino.color;
        }
      });
    });

    // Sweep rows
    let linesCleared = 0;
    const sweptGrid = newGrid.reduce((acc, row) => {
      if (row.findIndex(cell => cell === null) === -1) {
        linesCleared += 1;
        acc.unshift(Array(COLS).fill(null));
        return acc;
      }
      acc.push(row);
      return acc;
    }, [] as Grid);

    if (linesCleared > 0) {
      setScore(prev => prev + [0, 100, 300, 500, 800][linesCleared] * level);
      setLines(prev => prev + linesCleared);
      setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1);
    }

    setGrid(sweptGrid);
    resetPlayer();
  }, [player.collided, resetPlayer, grid, level, lines]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => move(e);
    const handleKeyUp = (e: KeyboardEvent) => keyUp(e);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [move, keyUp]);


  const startGame = () => {
    setGrid(createEmptyGrid());
    setDropTime(1000);
    resetPlayer();
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
  };

  // Render grid with player
  const displayGrid = grid.map(row => [...row]);
  if (!gameOver && dropTime !== null) {
    player.tetromino.shape.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0 && displayGrid[y + player.pos.y]) {
          displayGrid[y + player.pos.y][x + player.pos.x] = player.tetromino.color;
        }
      });
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-[#ff00ff]/30 bg-card/50 backdrop-blur">
        <Link href="/" className="flex items-center text-[#ff00ff] hover:text-[#ff00ff]/80 transition-colors">
          <ChevronLeft className="w-6 h-6 mr-2" />
          <span className="font-mono uppercase font-bold tracking-wider">Back to Hub</span>
        </Link>
        <h1 className="text-2xl font-black uppercase text-[#ff00ff] tracking-widest" style={{ textShadow: '0 0 10px rgba(255,0,255,0.5)' }}>Tetris</h1>
        <div className="w-32" />
      </header>

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-12">
        <div className="flex flex-col space-y-6 font-mono text-[#ff00ff]">
          <div className="text-center md:text-right">
            <p className="text-sm opacity-70 uppercase tracking-widest">Score</p>
            <p className="text-4xl font-bold">{score}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm opacity-70 uppercase tracking-widest">Level</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm opacity-70 uppercase tracking-widest">Lines</p>
            <p className="text-2xl font-bold">{lines}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm opacity-70 uppercase tracking-widest">Best</p>
            <p className="text-2xl font-bold">{highScore}</p>
          </div>
        </div>

        <div className="relative">
          <div 
            className="bg-card/80 border-4 border-[#ff00ff] shadow-[0_0_30px_rgba(255,0,255,0.2)] overflow-hidden"
            style={{ 
              width: `${COLS * BLOCK_SIZE}px`, 
              height: `${ROWS * BLOCK_SIZE}px`,
              display: 'grid',
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gap: '1px',
              backgroundColor: 'rgba(255,0,255,0.1)'
            }}
          >
            {displayGrid.map((row, y) => 
              row.map((cell, x) => (
                <div 
                  key={`${x}-${y}`}
                  style={{
                    backgroundColor: cell || 'rgba(0,0,0,0.5)',
                    boxShadow: cell ? `inset 0 0 10px rgba(255,255,255,0.3)` : 'none',
                    border: cell ? `1px solid ${cell}` : 'none'
                  }}
                />
              ))
            )}
          </div>

          {!dropTime && !gameOver && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10 border-4 border-transparent">
              <Button 
                onClick={startGame}
                className="bg-[#ff00ff] text-background hover:bg-[#ff00ff]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center backdrop-blur-md z-10 border-4 border-[#ff00ff]">
              <h2 className="text-4xl font-black text-[#ff0055] mb-2 uppercase tracking-widest" style={{ textShadow: '0 0 15px rgba(255,0,85,0.5)' }}>Game Over</h2>
              <p className="text-[#ff00ff] font-mono mb-8">Final Score: {score}</p>
              <Button 
                onClick={startGame}
                className="bg-[#ff00ff] text-background hover:bg-[#ff00ff]/80 font-bold uppercase tracking-widest px-8 py-6 text-lg rounded-none flex items-center"
              >
                <RotateCcw className="mr-2" /> Play Again
              </Button>
            </div>
          )}
        </div>
        
        <div className="md:w-32 text-muted-foreground font-mono text-sm text-center md:text-left">
          <p className="mb-2">Controls:</p>
          <p>↑/W: Rotate</p>
          <p>←/A: Left</p>
          <p>→/D: Right</p>
          <p>↓/S: Drop</p>
        </div>
      </main>
    </div>
  );
}

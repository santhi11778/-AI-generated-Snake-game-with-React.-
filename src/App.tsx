import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

const TRACKS = [
  {
    id: 1,
    title: "SIGNAL_INTERCEPT_01",
    artist: "UNKNOWN_ORIGIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "text-[#0ff]",
    bg: "bg-[#0ff]",
    border: "border-[#0ff]"
  },
  {
    id: 2,
    title: "MEMORY_DUMP",
    artist: "CORRUPTED_SECTOR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "text-[#f0f]",
    bg: "bg-[#f0f]",
    border: "border-[#f0f]"
  },
  {
    id: 3,
    title: "VOID_TRANSMISSION",
    artist: "DATA_GHOST_ENTITY",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "text-white",
    bg: "bg-white",
    border: "border-white"
  }
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState<{x: number, y: number}[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Music Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = TRACKS[currentTrackIndex];

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const onEnded = () => {
    handleSkip();
  };

  // --- Snake Game Logic ---
  const generateFood = useCallback(() => {
    let newFood;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = snake.some(segment => segment.x === newFood?.x && segment.y === newFood?.y);
    }
    return newFood as {x: number, y: number};
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault(); 
      }
      
      if (!gameStarted && e.key === ' ') {
        resetGame();
        return;
      }
      
      if (gameOver && e.key === ' ') {
        resetGame();
        return;
      }

      setDirection(prev => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return prev.y === 1 ? prev : { x: 0, y: -1 };
          case 'ArrowDown':
          case 's':
          case 'S':
            return prev.y === -1 ? prev : { x: 0, y: 1 };
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return prev.x === 1 ? prev : { x: -1, y: 0 };
          case 'ArrowRight':
          case 'd':
          case 'D':
            return prev.x === -1 ? prev : { x: 1, y: 0 };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, gameStarted]);

  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food eating
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, Math.max(INITIAL_SPEED - Math.floor(score / 50) * 10, 60));
    return () => clearInterval(intervalId);
  }, [direction, food, gameOver, gameStarted, score, highScore, generateFood]);

  return (
    <div className="min-h-screen bg-black text-[#0ff] font-mono flex flex-col md:flex-row items-center justify-center p-4 selection:bg-[#f0f] selection:text-black overflow-hidden relative crt-flicker">
      
      {/* Glitch & Noise Effects */}
      <div className="noise"></div>
      <div className="scanlines"></div>
      
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url}
        onEnded={onEnded}
      />

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_min-content] gap-8 relative z-10 screen-tear items-center justify-center">
        
        {/* Left Panel: Stats & Controls */}
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto md:ml-auto md:mr-0 z-20">
          
          <div className="border-b-4 border-[#0ff] pb-4 pr-10 relative">
            <h1 className="text-5xl font-black text-[#f0f] glitch mb-2" data-text="WORM_PTCL.EXE">
              WORM_PTCL.EXE
            </h1>
            <div className="bg-[#0ff] text-black text-sm inline-block px-2 py-1 font-bold blink">
              SYS_STATUS: CORRUPT
            </div>
            <div className="absolute top-0 right-0 p-2 bg-[#f0f] text-black text-xs font-black rotate-90 origin-top-right">
              V 0.9.8.4
            </div>
          </div>

          {/* AUDIO MODULE */}
          <div className={`border-[4px] ${currentTrack.border} bg-black p-4 relative`}>
            <div className={`absolute top-0 left-0 px-2 py-0.5 text-black font-bold uppercase text-xs sm:text-sm ${currentTrack.bg}`}>
              [ AUDIO_STREAM_ACTIVE ]
            </div>
            
            <div className="mt-8 mb-4 border-b-2 border-inherit pb-2">
              <h2 className={`text-2xl font-bold truncate ${currentTrack.color} glitch uppercase`} data-text={currentTrack.title}>
                {currentTrack.title}
              </h2>
              <p className="text-[#0ff] text-sm opacity-80 uppercase tracking-widest">{currentTrack.artist}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <button 
                onClick={handlePlayPause}
                className={`border-[3px] border-inherit bg-black hover:bg-white hover:text-black hover:border-white text-inherit p-3 text-lg font-bold uppercase transition-none`}
              >
                {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
              </button>
              <button 
                onClick={handleSkip}
                className={`border-[3px] border-inherit bg-black hover:bg-white hover:text-black hover:border-white text-inherit p-3 text-lg font-bold uppercase transition-none`}
              >
                [ SKIP {">>"} ]
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-inherit text-sm font-bold uppercase">
                <span>AMPLITUDE_CTRL</span>
                <span className="ml-auto">{(volume * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onChange={handleVolume}
                className={`w-full h-2 bg-black border-2 border-inherit appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none`}
              />
            </div>
          </div>

          {/* EXECUTION METRICS */}
          <div className="border-[4px] border-[#0ff] bg-black p-4 relative">
             <div className="absolute top-0 left-0 px-2 py-0.5 bg-[#0ff] text-black font-bold uppercase text-xs sm:text-sm">
              [ EXEC_METRICS ]
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="border-[3px] border-[#0ff] p-3 text-center bg-[#0ff] text-black shadow-[0_0_15px_#0ff]">
                <div className="text-xs font-bold mb-1">OP_SUCCESS</div>
                <div className="text-4xl font-black">
                  {score.toString().padStart(4, '0')}
                </div>
              </div>
              <div className="border-[3px] border-[#f0f] p-3 text-center bg-black text-[#f0f] shadow-[0_0_15px_#f0f]">
                <div className="text-xs font-bold mb-1">MAX_THROUGHPUT</div>
                <div className="text-4xl font-black">
                  {highScore.toString().padStart(4, '0')}
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-[#0ff] space-y-1 opacity-70 border-t border-[#0ff]/50 pt-2">
              <p>{">"} INPUT_EXPECTED: W/A/S/D OR ARROWS</p>
              <p>{">"} INIT_CMD: SPACEBAR</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Game Board */}
        <div className="flex items-center justify-center p-2 relative z-20 mx-auto">
          
          {/* Decorative Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[6px] border-l-[6px] border-[#f0f]"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[6px] border-r-[6px] border-[#0ff]"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[6px] border-l-[6px] border-[#0ff]"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[6px] border-r-[6px] border-[#f0f]"></div>

          <div className="relative border-8 border-[#0ff] p-[2px] bg-black shadow-[0_0_30px_rgba(0,255,255,0.3)]">
            
            <div 
              className="bg-[#050505] relative"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: 'min(100vw - 3rem, 500px)',
                aspectRatio: '1/1',
              }}
            >
              {/* Grid Lines */}
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                style={{
                  backgroundImage: 'linear-gradient(to right, #0ff 1px, transparent 1px), linear-gradient(to bottom, #0ff 1px, transparent 1px)',
                  backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
                }}
              ></div>

              {/* Snake and Food */}
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;

                return (
                  <div
                    key={i}
                    className="relative z-10 w-full h-full"
                  >
                    {isHead && (
                       <div className="absolute inset-[1px] bg-[#f0f] z-20" style={{boxShadow: "0 0 10px #f0f"}}></div>
                    )}
                    {isBody && (
                       <div className="absolute inset-[2px] bg-[repeating-linear-gradient(45deg,#f0f,#f0f_2px,transparent_2px,transparent_4px)] z-10 opacity-80"></div>
                    )}
                    {isFood && (
                      <div className="absolute inset-[2px] bg-[#0ff] z-10 shadow-[0_0_10px_#0ff]">
                        <div className="absolute inset-0 bg-white animate-ping opacity-50"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overlays */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-2 z-30 bg-black/80 flex flex-col items-center justify-center border-4 border-[#0ff] p-4 backdrop-blur-[2px]">
                <h2 className="text-3xl sm:text-5xl font-black text-[#0ff] mb-2 glitch uppercase text-center" data-text="INITIALIZE">INITIALIZE</h2>
                <button 
                  onClick={resetGame}
                  className="mt-8 px-6 py-3 bg-[#0ff] text-black font-black uppercase text-lg sm:text-xl hover:bg-white hover:text-black transition-none border-2 border-transparent hover:border-black"
                >
                  [ DEPLOY WORM ]
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-2 z-30 bg-black/90 flex flex-col items-center justify-center border-4 border-[#f0f] p-4 crt-flicker backdrop-blur-[2px]">
                <h2 className="text-3xl sm:text-5xl font-bold text-[#f0f] mb-4 text-center glitch uppercase drop-shadow-[0_0_10px_#f0f]" data-text="FATAL EXCEPTION">FATAL EXCEPTION</h2>
                <div className="bg-[#f0f] text-black px-4 py-1 mb-8 font-bold text-sm sm:text-base">ERR_CODE: 0x000F4</div>
                
                <button 
                  onClick={resetGame}
                  className="px-6 sm:px-8 py-3 bg-transparent border-[4px] border-[#f0f] text-[#f0f] font-black uppercase text-lg sm:text-xl hover:bg-[#f0f] hover:text-black transition-none screen-tear"
                >
                  <span className="blink">REBOOT SYSTEM</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

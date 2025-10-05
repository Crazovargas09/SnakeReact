// src/SnakeGame.jsx
import React, { useRef, useEffect, useState } from "react";
import "./snakestyles.css";

const WIDTH = 500;
const HEIGHT = 500;
const UNIT = 25;
const TICK = 120; // ms between frames

const getRandomPos = (max) => Math.floor(Math.random() * (max / UNIT + 1)) * UNIT;

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // estado "mutante" que no dispara renders
  const snakeRef = useRef([
    { x: UNIT * 4, y: 0 },
    { x: UNIT * 3, y: 0 },
    { x: UNIT * 2, y: 0 },
    { x: UNIT, y: 0 },
    { x: 0, y: 0 },
  ]);
  const dirRef = useRef({ x: UNIT, y: 0 });
  const foodRef = useRef({ x: getRandomPos(WIDTH - UNIT), y: getRandomPos(HEIGHT - UNIT) });
  const timerRef = useRef(null);
  const runningRef = useRef(false);

  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d");

    // teclado (flechas + WASD)
  const handleKey = (e) => {
  const key = e.key;

  // Evita que las flechas muevan la página
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
    e.preventDefault();
  }

  const vx = dirRef.current.x;
  const vy = dirRef.current.y;

  if ((key === "ArrowLeft" || key === "a") && vx !== UNIT) dirRef.current = { x: -UNIT, y: 0 };
  else if ((key === "ArrowRight" || key === "d") && vx !== -UNIT) dirRef.current = { x: UNIT, y: 0 };
  else if ((key === "ArrowUp" || key === "w") && vy !== UNIT) dirRef.current = { x: 0, y: -UNIT };
  else if ((key === "ArrowDown" || key === "s") && vy !== -UNIT) dirRef.current = { x: 0, y: UNIT };
};

    window.addEventListener("keydown", handleKey);

    // iniciar juego
    resetGame();

    return () => {
      window.removeEventListener("keydown", handleKey);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawAll() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    // fondo
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // comida
    ctx.fillStyle = "red";
    ctx.fillRect(foodRef.current.x, foodRef.current.y, UNIT, UNIT);

    // snake
    snakeRef.current.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? "green" : "lime";
      ctx.fillRect(p.x, p.y, UNIT, UNIT);
      ctx.strokeStyle = "black";
      ctx.strokeRect(p.x, p.y, UNIT, UNIT);
    });
  }

  function tick() {
    // avanzar cabeza
    const head = { x: snakeRef.current[0].x + dirRef.current.x, y: snakeRef.current[0].y + dirRef.current.y };
    snakeRef.current.unshift(head);

    // comer?
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((s) => s + 1);
      foodRef.current = { x: getRandomPos(WIDTH - UNIT), y: getRandomPos(HEIGHT - UNIT) };
    } else {
      snakeRef.current.pop();
    }

    // colisiones
    const hitWall = head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT;
    const hitSelf = snakeRef.current.slice(1).some((p) => p.x === head.x && p.y === head.y);

    if (hitWall || hitSelf) {
      return gameOver();
    }

    drawAll();
    timerRef.current = setTimeout(tick, TICK);
  }

  function startLoop() {
    if (timerRef.current) clearTimeout(timerRef.current);
    runningRef.current = true;
    setIsGameOver(false);
    timerRef.current = setTimeout(tick, TICK);
  }

  function stopLoop() {
    runningRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function gameOver() {
    stopLoop();
    setIsGameOver(true);
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, HEIGHT / 2 - 40, WIDTH, 80);
    ctx.fillStyle = "white";
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 2 + 10);
  }

  function resetGame() {
    stopLoop();
    snakeRef.current = [
      { x: UNIT * 4, y: 0 },
      { x: UNIT * 3, y: 0 },
      { x: UNIT * 2, y: 0 },
      { x: UNIT, y: 0 },
      { x: 0, y: 0 },
    ];
    dirRef.current = { x: UNIT, y: 0 };
    foodRef.current = { x: getRandomPos(WIDTH - UNIT), y: getRandomPos(HEIGHT - UNIT) };
    setScore(0);
    setIsGameOver(false);
    drawAll();
    startLoop();
  }

  return (
    <div id="gameContainer">
      <canvas ref={canvasRef} id="gameBoard" width={WIDTH} height={HEIGHT} />
      <div id="scoreText">Score: {score}</div>
      <div className="controls">
        <button id="resetButton" onClick={resetGame}>Reset</button>
        {isGameOver && <button onClick={resetGame}>Play again</button>}
      </div>
    </div>
  );
}

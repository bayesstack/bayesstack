import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  isCircle: boolean;
}

const CONFETTI_COLORS = [
  "#10b981", // Emerald
  "#0b6763", // BayesStack Teal
  "#f59e0b", // Warm Gold
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#38bdf8", // Sky Blue
];

export interface ConfettiCelebrationProps {
  durationMs?: number;
  particleCount?: number;
  onComplete?: () => void;
}

/**
 * Lightweight, zero-dependency HTML5 Canvas micro-confetti for celebratory feedback
 */
export function ConfettiCelebration({
  durationMs = 2500,
  particleCount = 65,
  onComplete,
}: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // In jsdom / test environments without canvas support, bail early
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) {
      onComplete?.();
      return;
    }

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      if (typeof canvas.getContext === "function") {
        ctx = canvas.getContext("2d");
      }
    } catch {
      return;
    }
    if (!ctx) return;

    // Resize canvas to client bounds
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
    const height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const originX = width / 2;
    const originY = Math.min(height * 0.75, height - 30);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI) / 1.2 + Math.PI / 10; // upward spread
      const speed = Math.random() * 8 + 4;

      particles.push({
        x: originX + (Math.random() - 0.5) * 80,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        isCircle: Math.random() > 0.6,
      });
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.vx *= 0.985; // Air drag
        p.rotation += p.rotationSpeed;

        // Fade out in final 35% of duration
        if (progress > 0.65) {
          p.opacity = Math.max(0, 1 - (progress - 0.65) / 0.35);
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        }
        ctx.restore();
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        onComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [durationMs, particleCount, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
}

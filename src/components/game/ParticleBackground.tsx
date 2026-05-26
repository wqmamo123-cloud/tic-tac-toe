'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { THEMES } from '@/lib/game/types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const theme = useGameStore((s) => s.theme);

  const initParticles = useCallback(
    (width: number, height: number) => {
      const particles: Particle[] = [];
      const count = Math.min(60, Math.floor((width * height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          life: Math.random() * 200,
          maxLife: 200 + Math.random() * 200,
        });
      }
      particlesRef.current = particles;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const themeConfig = THEMES[theme];
    const color = themeConfig.particle;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.opacity = Math.random() * 0.5 + 0.1;
        }

        const fadeIn = Math.min(p.life / 30, 1);
        const fadeOut = Math.max(0, 1 - (p.life - p.maxLife + 30) / 30);
        const alpha = p.opacity * fadeIn * (p.life > p.maxLife - 30 ? fadeOut : 1);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 120) * 0.15 * alpha;
            ctx.strokeStyle = color + Math.floor(lineAlpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [theme, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

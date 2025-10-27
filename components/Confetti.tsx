// Phase I Epic 4: Confetti celebration component
"use client";

import React, { useEffect, useState } from "react";

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
}

export default function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number; left: number; delay: number; color: string}>>([]);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Generate confetti particles
      const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 500,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      
      setParticles(newParticles);

      // Clean up after animation
      const timer = setTimeout(() => {
        setIsActive(false);
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${particle.left}%`,
            top: "-10px",
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}


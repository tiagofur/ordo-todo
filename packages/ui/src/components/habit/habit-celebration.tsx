'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

interface HabitCelebrationProps {
  show: boolean;
  onComplete?: () => void;
  xp?: number;
  streak?: number;
  labels?: {
    xpText?: string;
    streakText?: string;
  };
}

const COLORS = [
  '#10B981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export function HabitCelebration({
  show,
  onComplete,
  xp,
  streak,
  labels = {},
}: HabitCelebrationProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const newParticles: ConfettiParticle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: 50 + (Math.random() - 0.5) * 60, // Center spread
          y: 50,
          color: COLORS[Math.floor(Math.random() * COLORS.length)] || '#10B981',
          size: 6 + Math.random() * 8,
          rotation: Math.random() * 360,
          delay: Math.random() * 0.3,
        });
      }
      setParticles(newParticles);

      // Auto-dismiss after animation
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  const xpText = labels.xpText || 'XP';
  const streakText = labels.streakText || 'day streak!';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        >
          {/* Confetti particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: `${particle.x}vw`,
                y: '50vh',
                rotate: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${particle.x + (Math.random() - 0.5) * 40}vw`,
                y: '120vh',
                rotate: particle.rotation + Math.random() * 720,
                scale: [0, 1, 1, 0.5],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}

          {/* XP Badge */}
          {xp && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: [0, 1.2, 1], y: 0 }}
              exit={{ scale: 0, y: -20 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  +{xp} {xpText}
                </motion.div>
                {streak && streak > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-500 font-semibold"
                  >
                    🔥 {streak} {streakText}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

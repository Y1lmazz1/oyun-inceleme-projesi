'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BackgroundParticles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2, 
      duration: Math.random() * 10 + 10, 
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          
            backgroundColor: '#a855f7', 
            boxShadow: '0 0 8px 2px rgba(168, 85, 247, 0.4)',
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, 30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

const AuroraBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  // Deep, slow-moving aurora blobs using CSS and framer motion
  // We use 3 large blurred circles that orbit slowly
  
  const colors = isDark 
    ? ['#8B5CF6', '#22D3EE', '#4338ca'] 
    : ['#E0E7FF', '#C7D2FE', '#DDD6FE'];

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent -z-10 w-full h-full pointer-events-none">
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-1/4 w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"
        style={{ backgroundColor: colors[0] }}
      />
      <motion.div
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 150, -50, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        className="absolute bottom-0 right-1/4 w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[140px] opacity-60"
        style={{ backgroundColor: colors[1] }}
      />
      <motion.div
        animate={{
          x: [0, 200, -100, 0],
          y: [0, 50, -150, 0],
          scale: [1, 1.1, 1.4, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-1/3 w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-50"
        style={{ backgroundColor: colors[2] }}
      />
    </div>
  );
};

export default AuroraBackground;

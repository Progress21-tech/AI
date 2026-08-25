'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const ThinkingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-6 py-4 rounded-xl bg-surface border border-borderDark text-xs font-mono text-subtle mx-auto my-6"
    >
      <div className="flex gap-1 items-center">
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
          className="w-1.5 h-1.5 rounded-full bg-black"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
          className="w-1.5 h-1.5 rounded-full bg-black"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
          className="w-1.5 h-1.5 rounded-full bg-black"
        />
      </div>
      <span>Extracting facts & reasoning best next question...</span>
    </motion.div>
  );
};

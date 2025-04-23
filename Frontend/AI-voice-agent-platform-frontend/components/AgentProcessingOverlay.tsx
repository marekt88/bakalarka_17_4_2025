"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AgentProcessingOverlayProps {
  isProcessing: boolean;
}

export function AgentProcessingOverlay({ isProcessing }: AgentProcessingOverlayProps) {
  if (!isProcessing) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl"
    >
      <div className="flex flex-col items-center gap-6 p-8 max-w-md text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-opacity-75"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-purple-500"></div>
          </div>
        </div>
        
        <h3 className="text-xl font-medium text-white">Processing Agent Improvement</h3>
        
        <p className="text-white/70">
          ALICE is currently updating the Generated Agent with your feedback. This may take a moment.
        </p>
        
        <div className="bg-black/30 p-4 rounded-md mt-2">
          <p className="text-sm text-white/60 text-center">
            The assistant will be available again once the improvements are complete.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
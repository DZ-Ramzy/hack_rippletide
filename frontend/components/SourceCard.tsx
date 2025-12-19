'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface Source {
  title: string;
  snippet: string;
  url: string;
}

interface SourceCardProps {
  source: Source;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className="block bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <motion.div 
          className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {index + 1}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors underline decoration-transparent group-hover:decoration-purple-400 decoration-2 underline-offset-4">
              {source.title}
            </h3>
            <motion.div
              whileHover={{ scale: 1.2, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
            </motion.div>
          </div>
          
          <p className="text-gray-400 text-sm line-clamp-2 mb-2 group-hover:text-gray-300 transition-colors">
            {source.snippet}
          </p>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent group-hover:from-purple-500/50" />
            <p className="text-purple-400 text-xs truncate max-w-xs group-hover:text-purple-300 transition-colors">
              {source.url}
            </p>
          </div>
        </div>
      </div>
      
      {/* Click indicator */}
      <motion.div
        className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <ExternalLink className="w-4 h-4 text-purple-400" />
        <span className="text-xs text-purple-400 font-semibold">Click to open source</span>
      </motion.div>
    </motion.a>
  );
}


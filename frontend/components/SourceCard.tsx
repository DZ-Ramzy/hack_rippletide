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
      className="block bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
          {index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors">
              {source.title}
            </h3>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
          </div>
          
          <p className="text-gray-400 text-sm line-clamp-2 mb-2">
            {source.snippet}
          </p>
          
          <p className="text-purple-400 text-xs truncate">
            {source.url}
          </p>
        </div>
      </div>
    </motion.a>
  );
}


'use client';

import { motion } from 'framer-motion';

interface Source {
  title: string;
  snippet: string;
  url: string;
}

interface AnswerWithSourcesProps {
  answer: string;
  sources: Source[];
}

export default function AnswerWithSources({ answer, sources }: AnswerWithSourcesProps) {
  // Parse the answer text and convert [1], [2], etc. to clickable badges
  const parseAnswerWithReferences = () => {
    // Regex to match [1], [2], etc.
    const regex = /\[(\d+)\]/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(answer)) !== null) {
      const fullMatch = match[0];
      const sourceIndex = parseInt(match[1], 10) - 1; // Convert to 0-based index
      
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(answer.substring(lastIndex, match.index));
      }
      
      // Add the clickable source reference
      if (sourceIndex >= 0 && sourceIndex < sources.length) {
        const source = sources[sourceIndex];
        parts.push(
          <motion.a
            key={`source-${match.index}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-6 h-6 mx-0.5 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold rounded-md transition-all hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 cursor-pointer"
            title={source.title}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          >
            {match[1]}
          </motion.a>
        );
      } else {
        // If source doesn't exist, just show the number
        parts.push(
          <span
            key={`source-${match.index}`}
            className="inline-flex items-center justify-center w-6 h-6 mx-0.5 bg-gray-500/30 text-gray-400 text-xs font-bold rounded-md"
          >
            {match[1]}
          </span>
        );
      }
      
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining text after last match
    if (lastIndex < answer.length) {
      parts.push(answer.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [answer];
  };

  return (
    <p className="text-gray-200 leading-relaxed text-lg">
      {parseAnswerWithReferences()}
    </p>
  );
}


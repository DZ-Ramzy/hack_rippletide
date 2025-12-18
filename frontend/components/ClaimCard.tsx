'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, HelpCircle, XCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Claim {
  text: string;
  status: 'verified' | 'uncertain' | 'outdated' | 'unsupported' | 'contradicted';
  reason: string;
  sources?: string[];
}

interface ClaimCardProps {
  claim: Claim;
  index: number;
}

export default function ClaimCard({ claim, index }: ClaimCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusConfig = () => {
    switch (claim.status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/50',
          iconColor: 'text-green-400',
          label: 'Verified'
        };
      case 'uncertain':
        return {
          icon: AlertTriangle,
          color: 'from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/50',
          iconColor: 'text-yellow-400',
          label: 'Uncertain'
        };
      case 'outdated':
        return {
          icon: Clock,
          color: 'from-orange-500/20 to-amber-500/20',
          border: 'border-orange-500/50',
          iconColor: 'text-orange-400',
          label: 'Outdated'
        };
      case 'unsupported':
        return {
          icon: HelpCircle,
          color: 'from-purple-500/20 to-pink-500/20',
          border: 'border-purple-500/50',
          iconColor: 'text-purple-400',
          label: 'Unsupported'
        };
      case 'contradicted':
        return {
          icon: XCircle,
          color: 'from-red-500/20 to-pink-500/20',
          border: 'border-red-500/50',
          iconColor: 'text-red-400',
          label: 'Contradicted'
        };
      default:
        return {
          icon: HelpCircle,
          color: 'from-gray-500/20 to-slate-500/20',
          border: 'border-gray-500/50',
          iconColor: 'text-gray-400',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.02, x: -5 }}
      className={`bg-gradient-to-br ${config.color} backdrop-blur-lg border ${config.border} rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group`}
    >
      {/* Animated Background Glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${config.iconColor.replace('text-', 'rgba(').replace('-400', ', 0.1)')} 0%, transparent 70%)`
        }}
      />

      {/* Status Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.08 + 0.2, type: 'spring', stiffness: 300 }}
        className={`absolute top-3 right-3 px-3 py-1 rounded-full ${config.color} border ${config.border} backdrop-blur-sm`}
      >
        <span className={`text-xs font-bold ${config.iconColor} uppercase tracking-wider`}>
          {config.label}
        </span>
      </motion.div>

      <div className="flex items-start gap-4 relative z-10">
        {/* Icon with Pulse Animation */}
        <motion.div 
          className={`flex-shrink-0 ${config.iconColor} relative`}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <Icon className="w-7 h-7" />
          {/* Pulse Ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${config.border}`}
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.5, 0.2, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-400 text-sm font-medium">
              Claim #{index + 1}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.1 }}
            className="text-white text-lg mb-3 leading-relaxed font-medium"
          >
            "{claim.text}"
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.08 + 0.2 }}
            className="flex items-start gap-2 mb-4"
          >
            <div className="w-1 h-full bg-gradient-to-b from-purple-500/50 to-transparent rounded-full mt-1" />
            <p className="text-gray-300 text-sm italic leading-relaxed">
              {claim.reason}
            </p>
          </motion.div>

          {/* Sources Toggle */}
          {claim.sources && claim.sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.3 }}
            >
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors group/btn"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center group-hover/btn:bg-purple-500/30 transition-colors">
                    {claim.sources.length}
                  </span>
                  {expanded ? 'Hide' : 'Show'} sources
                </span>
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: expanded ? 'auto' : 0,
                  opacity: expanded ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2 pl-4 border-l-2 border-purple-500/40">
                  {claim.sources.map((source, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2 text-gray-400 text-sm hover:text-gray-300 transition-colors"
                    >
                      <span className="text-purple-400 font-bold mt-0.5">•</span>
                      <span>{source}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Accent Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.08 + 0.4, duration: 0.5 }}
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.color.replace('/20', '/60')} origin-left`}
      />
    </motion.div>
  );
}

